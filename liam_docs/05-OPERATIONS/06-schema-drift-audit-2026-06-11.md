---
phase: operations
status: done
last-updated: 2026-06-11
---

# Schema Drift Audit — Production (2026-06-11)

> Audit menyeluruh skema production project `phdbbiydrjwxlehdfubh` versus
> niat di file migration. Mendokumentasi setiap drift yang ditemukan, keputusan
> diapain (fix vs biarkan), dan SQL final yang diterapkan.

---

## Konteks

Saat menguji deployment Edge Function `generate-plan` end-to-end, ditemukan bahwa
`DELETE auth/v1/admin/users/{id}` selalu balikin HTTP 500 dengan error
`23503: violates foreign key constraint "profiles_id_fkey"`. Investigasi
menyingkap drift skema yang lebih luas.

**Dugaan akar masalah:** tabel-tabel utama di prod kemungkinan dibikin manual /
via dashboard sebelum migration di-jalankan. Ketika migration berjalan, klausa
`create table if not exists` skip pembuatan ulang sehingga klausa
`on delete cascade`, default value, dan constraint baru tidak ikut terterapan.

**Bukti:** `select version, name from supabase_migrations.schema_migrations`
hanya mengembalikan 3 entri:

```
20260602093752 initial_schema
20260602093804 generate_order_id_function
20260607114054 create_preregistrations
```

Sedangkan repo punya 9 file migration. Skema di prod jelas tidak dibangun via
`supabase db push` dengan baseline kosong.

---

## Tabel & Constraint yang Diperiksa

Query audit (read-only):

```sql
select c1.relname as child_table, con.conname,
       case con.confdeltype
         when 'a' then 'NO ACTION' when 'r' then 'RESTRICT'
         when 'c' then 'CASCADE'   when 'n' then 'SET NULL'
       end as on_delete
from pg_constraint con
join pg_class c1 on c1.oid = con.conrelid
join pg_class c2 on c2.oid = con.confrelid
join pg_namespace ns on ns.oid = c1.relnamespace
where con.contype = 'f'
  and (ns.nspname = 'public' or c2.relname = 'users')
order by child_table, conname;
```

---

## Temuan FK

### Sebelum Fix

| Child Table | Constraint | Parent | On Delete (prod) | On Delete (niat) | Status |
|---|---|---|---|---|---|
| `profiles` | `profiles_id_fkey` | `auth.users` | NO ACTION | CASCADE | ❌ |
| `orders` | `orders_user_id_fkey` | `profiles` | NO ACTION | SET NULL | ❌ |
| `meal_entries` | `meal_entries_recipe_id_fkey` | `recipes` | NO ACTION | SET NULL | ❌ |
| `subscriptions` | `subscriptions_user_id_fkey` | `profiles` | NO ACTION | (drift) | ❌ |
| `generated_plans` | `generated_plans_user_id_fkey` | `profiles` | CASCADE | CASCADE | ✅ |
| `weekly_plans` | `weekly_plans_user_id_fkey` | `profiles` | CASCADE | CASCADE | ✅ |
| `meal_entries` | `meal_entries_plan_id_fkey` | `weekly_plans` | CASCADE | CASCADE | ✅ |
| `order_items` | `order_items_order_id_fkey` | `orders` | CASCADE | CASCADE | ✅ |
| `recipe_ingredients` | `recipe_ingredients_recipe_id_fkey` | `recipes` | CASCADE | CASCADE | ✅ |
| `ai_usage_log` | `ai_usage_log_user_id_fkey` | `profiles` | SET NULL | SET NULL | ✅ |
| `ai_usage_log` | `ai_usage_log_provider_id_fkey` | `ai_providers` | SET NULL | SET NULL | ✅ |
| `generated_plans` | `generated_plans_provider_id_fkey` | `ai_providers` | SET NULL | SET NULL | ✅ |
| `orders` | `orders_plan_id_fkey` | `generated_plans` | SET NULL | SET NULL | ✅ |

### Setelah Fix

Semua entri di kolom **On Delete (prod)** sekarang sama dengan **On Delete (niat)**.

---

## Temuan Skema (`orders` & `order_items`)

### `orders` — drift di prod

```
extra columns yang tidak ada di migration:
  - service_fee   integer DEFAULT 15000  nullable
  - payment_status text  DEFAULT 'pending' nullable  CHECK (pending|completed|failed)
  - order_status   text  DEFAULT 'received' nullable CHECK (received|processed|shipped|delivered)

masalah breaking:
  - id text NOT NULL TANPA default (mestinya: default generate_order_id())
  - delivery_address NOT NULL (mestinya: nullable)
  - payment_method check: ('transfer_bank','qris') (mestinya: + 'cod')
```

### `order_items` — drift di prod

```
missing columns:
  - category    text nullable
  - created_at  timestamptz NOT NULL DEFAULT now()

drift constraint:
  - order_id nullable (mestinya: NOT NULL)
```

---

## Temuan Lain (tidak fatal)

| Item | Detail | Keputusan |
|---|---|---|
| Tabel `subscriptions` | Ada di prod, tidak ada file migration di repo | Dibikinkan migration `if not exists` untuk legalisasi (0 baris). Skema dipertahankan |
| Kolom `profiles.gender` | Ada di prod, tidak ada di migration | Dibiarkan (tidak dipakai code) |
| Policy duplikat: `weekly_plans` punya `plans_owner` + `weekly_plans_owner` | Efek sama persis | Dibiarkan kosmetik |
| Policy duplikat: `recipes` punya `recipes_read` + `recipes_read_public` | Efek sama persis | Dibiarkan kosmetik |
| Policy duplikat: `recipe_ingredients` punya `ingredients_read` + `recipe_ingredients_read_public` | Efek sama persis | Dibiarkan kosmetik |
| `prevent_role_change()` ACL: `{=X/postgres,postgres=X,anon=X,authenticated=X,service_role=X}` | SECURITY DEFINER bisa dipanggil via RPC dari role API | Revoke EXECUTE dari `public, anon, authenticated` (trigger jalan tanpa cek EXECUTE) |
| Migration history mismatch | Prod 3 entri vs repo 9 file | Tidak dipaksa sync. Migration baru tetap di-apply lewat raw SQL ke prod, tidak via `db push` |

---

## SQL yang Diterapkan

### Migration 1: `20260611150000_fix_fk_drift_and_legalize_subs.sql`

Inti perubahan (lihat file untuk versi lengkap dengan komentar):

```sql
-- Fix profiles FK → cascade
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- Fix orders user_id FK → set null
alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders add constraint orders_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete set null;

-- Fix meal_entries recipe_id FK → set null
alter table public.meal_entries drop constraint if exists meal_entries_recipe_id_fkey;
alter table public.meal_entries add constraint meal_entries_recipe_id_fkey
  foreign key (recipe_id) references public.recipes (id) on delete set null;

-- Hardening: revoke prevent_role_change EXECUTE
revoke execute on function public.prevent_role_change() from public, anon, authenticated;

-- Legalize subscriptions
create table if not exists public.subscriptions ( ... );
alter table public.subscriptions drop constraint if exists subscriptions_user_id_fkey;
alter table public.subscriptions add constraint subscriptions_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
alter table public.subscriptions enable row level security;
drop policy if exists "subs_owner" on public.subscriptions;
create policy "subs_owner" on public.subscriptions for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
```

### Migration 2: `20260611150100_fix_orders_drift.sql`

```sql
-- Restore default generate_order_id() ke orders.id
alter table public.orders alter column id set default public.generate_order_id();

-- Drop NOT NULL pada delivery_address
alter table public.orders alter column delivery_address drop not null;

-- Tambah 'cod' ke check payment_method
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method is null
         or payment_method in ('transfer_bank','qris','cod'));

-- order_items: NOT NULL order_id + tambah kolom missing
alter table public.order_items alter column order_id set not null;
alter table public.order_items add column if not exists category text;
alter table public.order_items
  add column if not exists created_at timestamptz not null default now();
```

---

## Verifikasi Pasca-Fix

Query yang dijalankan:

```sql
select conname,
       case confdeltype when 'a' then 'NO ACTION' when 'c' then 'CASCADE'
            when 'n' then 'SET NULL' end as on_delete
from pg_constraint
where conname in (
  'profiles_id_fkey','orders_user_id_fkey',
  'meal_entries_recipe_id_fkey','subscriptions_user_id_fkey'
);
```

Hasil:

| conname | on_delete |
|---|---|
| `profiles_id_fkey` | CASCADE |
| `orders_user_id_fkey` | SET NULL |
| `meal_entries_recipe_id_fkey` | SET NULL |
| `subscriptions_user_id_fkey` | CASCADE |

---

## Test End-to-End (Pasca-Fix)

| Skenario | Hasil |
|---|---|
| Hapus user uji yang sebelumnya stuck (Case A) | HTTP 200 ✅ |
| Bikin user baru + insert child rows + delete user | semua child terhapus / set null sesuai FK ✅ |
| Insert order via REST mimicking frontend | ID `CP-20260611-0001` ter-generate, semua kolom terisi ✅ |
| ACL `prevent_role_change` | proacl tinggal `{postgres=X, service_role=X}` ✅ |

---

## Pelajaran untuk Tim

1. **Selalu cek `pg_constraint.confdeltype` setelah `db push` ke prod yang skemanya
   sudah ada.** `create table if not exists` adalah jebakan: dia tidak melaporkan
   bahwa definisi cascade-nya dilewat.

2. **Migration drift bisa terjadi diam-diam.** Tabel ada, query jalan, RLS
   melindungi — tapi behavior FK nggak match niat. Audit periodik
   `confdeltype` & `column_default` worth it.

3. **Idempotent migrations matter.** Pakai `drop constraint if exists` lalu
   re-add, bukan asumsi state. Ini bikin bisa di-apply ulang ke env mana pun
   tanpa khawatir.

4. **Kalau project punya owner berbeda, prefer minimal patch + dokumentasi
   lengkap di atas full schema sync.** Risiko kerusakan > manfaat keseragaman.

---

*Tanggal audit:* 2026-06-11
*Eksekutor:* sesi remediation pasca-deploy phase 1.

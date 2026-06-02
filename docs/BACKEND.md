# 🔌 BACKEND.md — Panduan Memulai Pengembangan Backend CookPlan

Dokumen ini adalah **titik awal kerja backend** CookPlan (PKM-K 2026). Tujuannya: membawa aplikasi dari kondisi sekarang (frontend-only, data mock + `localStorage`) menjadi aplikasi dengan backend nyata berbasis **Supabase (PostgreSQL + Auth)**, sesuai cakupan MVP di [`PRD_PKM.md`](./PRD_PKM.md) dan timeline [`ROADMAP.md`](./ROADMAP.md).

> [!IMPORTANT]
> Dokumen ini **menyempurnakan** sketsa skema di [`ARCHITECTURE.md`](./ARCHITECTURE.md). Beberapa kolom di sana belum cocok dengan struktur data frontend yang sebenarnya (lihat [Skema Database Terkoreksi](#4-skema-database-terkoreksi)). Gunakan skema di dokumen ini sebagai acuan.

---

## Daftar Isi

1. [Tujuan & Ruang Lingkup](#1-tujuan--ruang-lingkup)
2. [Status Saat Ini → Target](#2-status-saat-ini--target)
3. [Fase 0 — Setup Awal (Mulai di Sini)](#3-fase-0--setup-awal-mulai-di-sini)
4. [Skema Database (Terkoreksi)](#4-skema-database-terkoreksi)
5. [Arsitektur Integrasi (Service Layer)](#5-arsitektur-integrasi-service-layer)
6. [Rencana Kerja Bertahap (Fase 1–6)](#6-rencana-kerja-bertahap-fase-16)
7. [Keamanan: RLS & Kredensial](#7-keamanan-rls--kredensial)
8. [Branch & Alur Kerja Git](#8-branch--alur-kerja-git)
9. [Verifikasi / Definition of Done](#9-verifikasi--definition-of-done)
10. [Referensi](#10-referensi)

---

## 1. Tujuan & Ruang Lingkup

**Target MVP backend (wajib selesai untuk Monev):**

1. **Autentikasi** pengguna (Supabase Auth — email & password).
2. **Katalog resep** dibaca dari database (bukan lagi `mockRecipes.js`).
3. **Rencana mingguan** tersimpan per-user di database (bukan lagi `localStorage`).
4. **Checkout → Order → Redirect WhatsApp** dengan **ID Pesanan unik** (`CP-YYYYMMDD-XXXX`).
5. **Keamanan** dengan Row Level Security (RLS).

**Di luar ruang lingkup MVP (pasca-Monev / opsional):** integrasi kurir nyata, Google Maps nyata, pembayaran live, PWA & notifikasi. Pembayaran cukup **disimulasikan** (Midtrans Sandbox bersifat opsional, hanya untuk kesan profesional di hadapan juri).

**Stack:** React 19 (Vite) + Tailwind v4 (frontend, sudah ada) · Supabase (backend) · Vercel (deploy, sudah ada `vercel.json`).

---

## 2. Status Saat Ini → Target

Saat ini aplikasi **100% frontend**: tidak ada backend, `@supabase/supabase-js` belum terpasang, dan halaman profil/checkout masih hardcoded.

| Domain | Kondisi Sekarang (kode) | Target Supabase |
|---|---|---|
| Resep | `src/utils/mockRecipes.js` (6 resep statis) | Tabel `recipes` + `recipe_ingredients` |
| Rencana mingguan | State `weeklyPlan` di `src/App.jsx`, disimpan ke `localStorage` (key `weeklyPlan`) | Tabel `weekly_plans` + `meal_entries` |
| Daftar belanja | Dihitung *on-the-fly* di `src/pages/ShoppingList.jsx` dari rencana + resep | Tetap dihitung di klien; hasilnya disimpan sebagai `order_items` saat checkout |
| Profil & auth | Hardcoded ("Brokoli") di `src/pages/UserProfile.jsx` & header `App.jsx` | Supabase Auth + tabel `profiles` |
| Pesanan / checkout | Tombol "Bayar & Antar" hanya menampilkan toast (stub) | Tabel `orders` + `order_items` → redirect WhatsApp |
| Langganan ("Paket Pro") | Hardcoded di `UserProfile.jsx` | Tabel `subscriptions` (prioritas rendah) |

> [!NOTE]
> `src/utils/recipes.js` (`initialRecipes`) hanya dipakai untuk kartu "Resep Unggulan" di landing page dan bentuknya berbeda. **Biarkan saja** — yang dimigrasikan ke database adalah `mockRecipes.js`.
>
> `src/context/PlanContext.jsx` (`addedRecipes`) adalah konsep "resep yang ditandai" yang terpisah dari `weeklyPlan`. Tidak perlu diubah pada tahap awal.

---

## 3. Fase 0 — Setup Awal (Mulai di Sini)

Selesaikan langkah-langkah ini lebih dulu agar bisa mulai memanggil Supabase.

### 3.1 Buat Proyek Supabase
- [x] Daftar/masuk ke [supabase.com](https://supabase.com) → **New Project**. (Proyek "CookPlan", ref `phdbbiydrjwxlehdfubh`, region ap-northeast-1.)
- [x] Catat **Project URL** dan **anon public key** dari **Project Settings → API**.

### 3.2 Konfigurasi Environment
- [x] Duplikat `.env.example` menjadi `.env`:
  ```bash
  cp .env.example .env
  ```
- [x] Isi nilai berikut di `.env` (dipakai **publishable key** `sb_publishable_...`, praktik modern yang disarankan):
  ```env
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
  ```

### 3.3 ⚠️ Perbaiki `.gitignore` (Penting!)
Saat ini `.gitignore` hanya berisi `*.local`, sehingga file `.env` polos **TIDAK terabaikan** — padahal `CONTRIBUTING.md` mengklaim sudah diabaikan.
- [x] Tambahkan baris berikut ke `.gitignore` agar kredensial tidak ikut ter-commit:
  ```gitignore
  # Environment
  .env
  .env.*
  !.env.example
  ```
- [x] Pastikan `git status` **tidak** menampilkan `.env` sebagai file baru.

### 3.4 Pasang Library Supabase
- [x] Install client resmi:
  ```bash
  npm install @supabase/supabase-js
  ```

### 3.5 Buat Klien Supabase
- [x] Buat folder & file `src/lib/supabaseClient.js`:
  ```js
  import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Konfigurasi Supabase belum lengkap. Cek file .env (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).'
    );
  }

  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  ```

✅ **Selesai Fase 0** ketika `import { supabase } from '../lib/supabaseClient'` berhasil tanpa error dan `npm run dev` tetap jalan.

---

## 4. Skema Database (Terkoreksi)

Jalankan SQL ini di **Supabase → SQL Editor**. Skema ini sudah disesuaikan dengan bentuk data frontend yang **sebenarnya**.

> **Tiga koreksi penting dari `ARCHITECTURE.md`:**
> 1. `meal_entries` menambahkan kolom **`meal_type`** (breakfast/lunch/dinner) — UI memakai slot Sarapan/Makan Siang/Makan Malam, bukan sekadar hari.
> 2. `recipe_ingredients` menambahkan **`price_idr`** — dipakai `ShoppingList.jsx` untuk estimasi biaya.
> 3. `recipes` menambahkan **`description`, `calories`, `badges`, `instructions`** — semuanya dipakai di kartu & modal detail resep.

```sql
-- profiles (perluasan dari auth.users)
create table profiles (
  id uuid references auth.users primary key,
  username text unique,
  full_name text,
  avatar_url text,
  gender text check (gender in ('male','female')),
  created_at timestamptz default now()
);

-- recipes
create table recipes (
  id serial primary key,
  title text not null,
  description text,
  ready_in_minutes integer,
  calories integer,
  price_idr integer,
  image_url text,
  difficulty text check (difficulty in ('easy','medium','hard')),
  badges text[] default '{}',
  instructions text[] default '{}',
  created_at timestamptz default now()
);

-- recipe_ingredients (+ price_idr)
create table recipe_ingredients (
  id serial primary key,
  recipe_id integer references recipes(id) on delete cascade,
  name text not null,
  amount numeric,
  unit text,
  category text check (category in ('vegetables','meat','dairy','spices','dry_goods')),
  price_idr integer
);

-- weekly_plans (satu rencana per user per minggu)
create table weekly_plans (
  id serial primary key,
  user_id uuid references profiles(id) on delete cascade,
  week_start_date date not null,
  created_at timestamptz default now(),
  unique (user_id, week_start_date)
);

-- meal_entries (+ meal_type, cocok dengan slot UI)
create table meal_entries (
  id serial primary key,
  plan_id integer references weekly_plans(id) on delete cascade,
  recipe_id integer references recipes(id),
  day_of_week text check (day_of_week in ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu')),
  meal_type text check (meal_type in ('breakfast','lunch','dinner')),
  servings integer default 2,
  unique (plan_id, day_of_week, meal_type)
);

-- orders (ID unik kustom: CP-YYYYMMDD-XXXX)
create table orders (
  id text primary key,
  user_id uuid references profiles(id),
  total_price integer not null,
  service_fee integer default 15000,   -- selaras DELIVERY_FEE di ShoppingList.jsx
  delivery_address text not null,
  payment_method text check (payment_method in ('transfer_bank','qris')),
  payment_status text check (payment_status in ('pending','completed','failed')) default 'pending',
  order_status text check (order_status in ('received','processed','shipped','delivered')) default 'received',
  created_at timestamptz default now()
);

-- order_items (rincian bahan per pesanan)
create table order_items (
  id serial primary key,
  order_id text references orders(id) on delete cascade,
  name text not null,
  amount numeric not null,
  unit text not null,
  price_idr integer not null
);

-- subscriptions (Paket Pro — prioritas rendah)
create table subscriptions (
  id serial primary key,
  user_id uuid references profiles(id) unique,
  tier text check (tier in ('basic','monthly_pass')),
  status text check (status in ('active','expired')),
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now()
);
```

### 4.1 Pembuatan ID Pesanan (`CP-YYYYMMDD-XXXX`)

**Opsi A (disarankan) — fungsi Postgres**, lebih rapi dan terpusat:

```sql
create or replace function generate_order_id()
returns text as $$
declare
  today text := to_char(now(), 'YYYYMMDD');
  seq integer;
begin
  select count(*) + 1 into seq
  from orders
  where id like 'CP-' || today || '-%';
  return 'CP-' || today || '-' || lpad(seq::text, 4, '0');
end;
$$ language plpgsql;
```
> Catatan: pendekatan `count(*)+1` cukup untuk skala MVP PKM. Jika nanti volume tinggi, ganti dengan `sequence` agar bebas dari potensi tabrakan saat order bersamaan.

**Opsi B (paling sederhana) — generate di klien** lalu insert:
`CP-${YYYYMMDD}-${4 digit acak}`. Pakai ini jika ingin menghindari PL/pgSQL.

---

## 5. Arsitektur Integrasi (Service Layer)

Agar perubahan di komponen minimal, **jangan panggil Supabase langsung dari komponen**. Buat lapisan service; komponen cukup mengganti `import { mockRecipes }` menjadi pemanggilan fungsi service async.

| File baru | Tanggung jawab | Menggantikan |
|---|---|---|
| `src/lib/supabaseClient.js` | Membuat & meng-export klien Supabase | — |
| `src/services/recipeService.js` | `getRecipes()`, `getRecipeById(id)` | `mockRecipes.js` |
| `src/services/planService.js` | `getCurrentPlan()`, `setSlot()`, `removeSlot()` | `localStorage` di `App.jsx` |
| `src/services/orderService.js` | `createOrder(payload)`, `buildWhatsappUrl(order)` | stub tombol di `ShoppingList.jsx` |
| `src/context/AuthContext.jsx` + `src/hooks/useAuth.js` | State sesi (`supabase.auth`) | profil hardcoded |
| `src/pages/Login.jsx`, `src/pages/Register.jsx`, `ProtectedRoute` | UI auth & proteksi rute | — |

> Pola `AuthContext` + `useAuth` mengikuti pola yang sudah ada di repo: `src/context/PlanContext.jsx` + `src/hooks/usePlan.js`.

### 5.1 Trik penting: alias kolom snake_case → camelCase

Frontend memakai `imageUrl`, `priceIdr`, `readyInMinutes` (camelCase), sedangkan Postgres memakai snake_case. **Beri alias langsung di query** agar bentuk objek persis sama dengan `mockRecipes` — komponen hampir tidak perlu diubah:

```js
// src/services/recipeService.js
import { supabase } from '../lib/supabaseClient';

export async function getRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id, title, description, calories, difficulty, badges, instructions,
      imageUrl:image_url,
      priceIdr:price_idr,
      readyInMinutes:ready_in_minutes,
      ingredients:recipe_ingredients ( name, amount, unit, category, priceIdr:price_idr )
    `)
    .order('id');

  if (error) throw error;
  return data; // bentuknya == mockRecipes
}
```

---

## 6. Rencana Kerja Bertahap (Fase 1–6)

Kerjakan berurutan. Tiap fase = satu branch + satu PR (lihat [§8](#8-branch--alur-kerja-git)).

### Fase 1 — Autentikasi 🔴
**Tujuan:** pengguna bisa daftar, login, logout; sesi persisten; rute aplikasi terlindungi.
- [ ] Aktifkan Email Auth di Supabase (Authentication → Providers).
- [x] Buat `src/context/AuthContext.jsx` (+ `src/context/auth-context.js`) + `src/hooks/useAuth.js` (pakai `supabase.auth.getSession()` & `onAuthStateChange`).
- [x] Bungkus aplikasi dengan `AuthProvider` di `src/main.jsx`.
- [x] Buat `src/pages/Login.jsx` & `src/pages/Register.jsx`.
- [x] Buat `ProtectedRoute` (`src/components/ProtectedRoute.jsx`) untuk `/catalog`, `/planner`, `/shopping`, `/profile`.
- [x] Saat register sukses, buat baris di `profiles` (di-`ensure` otomatis saat sesi aktif, lolos RLS).
- [x] Ganti data hardcoded di header `App.jsx` & `UserProfile.jsx` dengan data sesi. Tambah tombol **Logout**.
- [x] Landing page "Mulai Rencanakan" → rute terproteksi otomatis mengalihkan ke `/login` saat belum login (dan ke halaman tujuan saat sudah login).

**Tabel:** `profiles`. **Selesai jika:** bisa register → logout → login, lalu refresh halaman tetap login.

### Fase 2 — Migrasi Katalog Resep 🔴
**Tujuan:** resep dibaca dari database.
- [ ] Seed 6 resep dari `mockRecipes.js` ke `recipes` + `recipe_ingredients` (lewat SQL Editor, atau script `node` sekali jalan).
- [ ] Buat `src/services/recipeService.js` (`getRecipes`, `getRecipeById`) — pakai alias kolom (§5.1).
- [ ] Ganti `import { mockRecipes }` di `RecipeCatalog.jsx`, `ShoppingList.jsx`, `UserProfile.jsx` dengan fetch via service.
- [ ] Tambahkan **loading state** & **error state** saat fetch.

**Tabel:** `recipes`, `recipe_ingredients`. **Selesai jika:** katalog, modal detail, dan estimasi harga di shopping list identik dengan versi mock.

### Fase 3 — Persistensi Rencana Mingguan 🔴
**Tujuan:** `weeklyPlan` tersimpan per-user di database, bukan `localStorage`.
- [ ] Buat `src/services/planService.js`: ambil/utamakan rencana minggu berjalan (`week_start_date`), `setSlot(day, mealType, recipe, servings)`, `removeSlot(day, mealType)`.
- [ ] Di `App.jsx`, ganti baca/tulis `localStorage` (`handleSetSlot`/`handleRemoveSlot`) dengan pemanggilan service yang terikat `user_id`.
- [ ] Muat rencana dari DB saat login; pertahankan bentuk state `{ [day]: { breakfast|lunch|dinner } }` untuk komponen.
- [ ] (Opsional) migrasikan data `localStorage` lama milik pengguna sekali saat pertama login.

**Tabel:** `weekly_plans`, `meal_entries`. **Selesai jika:** tambah/hapus menu tersimpan dan tetap ada setelah login di perangkat lain.

### Fase 4 — Checkout + Order + Redirect WhatsApp 🔴 (Inti MVP)
**Tujuan:** dari daftar belanja → buat pesanan → dapat ID unik → buka WhatsApp Admin dengan pesan terformat.
- [ ] Tambah form alamat & metode pembayaran pada alur "Bayar & Antar" di `ShoppingList.jsx`.
- [ ] Buat `src/services/orderService.js`:
  - `createOrder()` → insert `orders` (pakai `generate_order_id()`) + `order_items` (hasil `buildShoppingList`).
  - `buildWhatsappUrl(order)` → `https://wa.me/<no-admin>?text=<pesan terformat + ID pesanan>`.
- [ ] Setelah order tersimpan, `window.open` URL WhatsApp.

**Tabel:** `orders`, `order_items`. **Selesai jika:** baris baru muncul di `orders` dengan ID `CP-...`, dan WhatsApp terbuka berisi ID + rincian.

### Fase 5 — Langganan (Paket Pro) 🟠 (Prioritas rendah)
- [ ] Tabel `subscriptions`; tampilkan status nyata di `UserProfile.jsx`.

### Fase 6 — RLS & Hardening 🔴
- [x] Aktifkan RLS + policy untuk semua tabel (lihat [§7](#7-keamanan-rls--kredensial)). ✅ 8 policy live + advisor dibersihkan (2026-06-02).
- [ ] Pastikan loading/error state konsisten; tambah validasi input form.

### Opsional — Midtrans Sandbox
- [ ] Hanya demo visual pembayaran. **Server key TIDAK boleh** memakai prefiks `VITE_` (jangan terekspos ke browser).

---

## 7. Keamanan: RLS & Kredensial

### 7.1 Row Level Security

> [!NOTE]
> **Status (per 2026-06-02): RLS aktif + 8 policy sudah terpasang di proyek live** (`phdbbiydrjwxlehdfubh`).
> Versi yang diterapkan sedikit lebih ketat dari snippet di bawah, mengikuti praktik terbaik Supabase:
> - `TO authenticated` eksplisit untuk semua policy kepemilikan (anon tak punya akses ke data user);
> - `recipes`/`recipe_ingredients` dibaca oleh `anon, authenticated`;
> - `auth.uid()` dibungkus `(select auth.uid())` agar dievaluasi sekali (lebih cepat).
> Selain itu `generate_order_id()` dikunci `search_path` & `rls_auto_enable()` dicabut `EXECUTE`-nya dari publik. Sisa advisor: *leaked password protection* (opsional, aktifkan di dashboard Auth).

Aktifkan RLS lalu pasang policy. Resep boleh dibaca publik; data milik pengguna hanya boleh diakses pemiliknya.

```sql
alter table profiles            enable row level security;
alter table recipes             enable row level security;
alter table recipe_ingredients  enable row level security;
alter table weekly_plans        enable row level security;
alter table meal_entries        enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table subscriptions       enable row level security;

-- Resep: baca publik
create policy "recipes_read"     on recipes            for select using (true);
create policy "ingredients_read" on recipe_ingredients for select using (true);

-- Profil: hanya pemilik
create policy "profiles_self" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Rencana mingguan: hanya pemilik
create policy "plans_owner" on weekly_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Meal entries: ikut kepemilikan plan induk
create policy "meal_entries_owner" on meal_entries
  for all using (exists (
    select 1 from weekly_plans p where p.id = meal_entries.plan_id and p.user_id = auth.uid()
  )) with check (exists (
    select 1 from weekly_plans p where p.id = meal_entries.plan_id and p.user_id = auth.uid()
  ));

-- Orders & items: hanya pemilik
create policy "orders_owner" on orders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "order_items_owner" on order_items
  for all using (exists (
    select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid()
  )) with check (exists (
    select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid()
  ));

-- Langganan: hanya pemilik
create policy "subs_owner" on subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### 7.2 Kredensial
- **`.env` tidak pernah di-commit** (lihat Fase 0 §3.3).
- **`VITE_SUPABASE_ANON_KEY` aman** ada di bundle browser **selama RLS aktif** — itu memang kunci publik.
- **JANGAN PERNAH** menaruh `service_role` key atau Midtrans **server key** pada variabel berprefiks `VITE_`. Semua variabel `VITE_` ikut terbundel ke browser.

---

## 8. Branch & Alur Kerja Git

Ikuti [`CONTRIBUTING.md`](../CONTRIBUTING.md):
- Branch per fase, mis. `feature/auth-supabase`, `feature/migrasi-resep`, `feature/order-whatsapp`.
- Commit: `feat:`, `fix:`, `chore:`, `docs:`.
- Sebelum push: `npm run lint && npm run build` (CI menjalankan keduanya pada PR ke `main`).
- Buka PR → review rekan → CI hijau → merge ke `main`.

Branch kerja backend saat ini: `backend-al` (dari `backend`).

---

## 9. Verifikasi / Definition of Done

| Fase | Cara menguji (end-to-end) |
|---|---|
| 0 | `npm run dev` jalan; import `supabaseClient` tanpa error; `.env` tidak muncul di `git status`. |
| 1 | Register → logout → login berhasil; refresh halaman tetap login; rute terproteksi menolak akses tanpa login. |
| 2 | Katalog & modal detail tampil dari DB; estimasi harga shopping list sama seperti versi mock. |
| 3 | Tambah/hapus menu tersimpan; login di sesi/perangkat lain memunculkan rencana yang sama. |
| 4 | Checkout membuat baris `orders` (ID `CP-...`) + `order_items`; WhatsApp terbuka berisi ID & rincian. |
| 6 | Pengguna A tidak bisa membaca/mengubah data pengguna B (uji via dua akun). |

Pengujian pengguna (Alpha/Beta/SUS) mengikuti [`PRD_PKM.md` §5.3](./PRD_PKM.md) dan [`ROADMAP.md` Fase 2.4](./ROADMAP.md).

---

## 10. Referensi

- [`PRD_PKM.md`](./PRD_PKM.md) — cakupan MVP & model bisnis.
- [`ROADMAP.md`](./ROADMAP.md) — timeline & prioritas.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — arsitektur (skema lama; gunakan skema di dokumen ini).
- [`FEATURES.md`](./FEATURES.md) — spesifikasi fitur.
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — alur Git & konvensi.
- Supabase: [Auth](https://supabase.com/docs/guides/auth) · [Database](https://supabase.com/docs/guides/database) · [RLS](https://supabase.com/docs/guides/auth/row-level-security) · [JS Client](https://supabase.com/docs/reference/javascript)

---

*Dokumen ini dinamis — perbarui checklist & skema setiap ada perubahan backend yang signifikan.*

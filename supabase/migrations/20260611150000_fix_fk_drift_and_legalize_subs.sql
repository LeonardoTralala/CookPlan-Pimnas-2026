-- =============================================================================
-- Migrasi: FIX drift FK + legalize subscriptions table
-- -----------------------------------------------------------------------------
-- KONTEKS: audit prod menemukan beberapa FK constraint di database TIDAK punya
-- klausa ON DELETE yang dideklarasikan migration sebelumnya (kemungkinan tabel
-- sudah ada saat migration `create table if not exists` dijalankan, sehingga
-- definisi cascade tidak ikut keterapan). Akibat fatal: SEMUA upaya menghapus
-- akun user gagal dengan error 23503 karena profiles_id_fkey NO ACTION.
--
-- Migrasi ini idempoten (aman dijalankan berulang) dan TIDAK menyentuh data.
-- =============================================================================

-- 1) profiles.id → auth.users.id : NO ACTION → CASCADE  (KRITIS) -----------------
-- Tanpa ini, hapus akun user gagal total. Dengan cascade, hapus auth.users akan
-- otomatis menghapus baris profiles, lalu cascade berlanjut ke generated_plans,
-- weekly_plans, meal_entries, order_items (sesuai FK masing-masing).
alter table public.profiles
  drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- 2) orders.user_id → profiles.id : NO ACTION → SET NULL ------------------------
-- Riwayat pesanan tetap dipertahankan (untuk admin/akuntansi) walau user dihapus.
alter table public.orders
  drop constraint if exists orders_user_id_fkey;
alter table public.orders
  add constraint orders_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete set null;

-- 3) meal_entries.recipe_id → recipes.id : NO ACTION → SET NULL -----------------
-- Slot menu sudah snapshot title/image/price, jadi aman set null kalau resep
-- dihapus dari bank. Sesuai niat migrasi 20260611000001_create_weekly_plans.
alter table public.meal_entries
  drop constraint if exists meal_entries_recipe_id_fkey;
alter table public.meal_entries
  add constraint meal_entries_recipe_id_fkey
  foreign key (recipe_id) references public.recipes (id) on delete set null;

-- 4) Hardening: revoke EXECUTE prevent_role_change() dari role API --------------
-- Fungsi ini SECURITY DEFINER (bypass RLS). Saat ini bisa dipanggil oleh
-- anon/authenticated lewat /rest/v1/rpc/prevent_role_change → permukaan serangan.
-- Fungsi ini hanya dipakai sebagai trigger; trigger berjalan tanpa cek EXECUTE.
revoke execute on function public.prevent_role_change() from public, anon, authenticated;

-- 5) Legalize subscriptions table ----------------------------------------------
-- Tabel ini sudah ada di prod tapi belum punya file migration → drift. Migrasi
-- ini mendefinisikan ulang dengan IF NOT EXISTS sehingga JADI sumber kebenaran
-- repo TANPA mengubah skema yang sudah berjalan. RLS + policy juga sudah ada di
-- prod (subs_owner), tetap di-drop & re-create agar konsisten.
create table if not exists public.subscriptions (
  id         serial primary key,
  user_id    uuid references public.profiles (id) on delete cascade,
  tier       text,
  status     text,
  start_date date not null,
  end_date   date not null,
  created_at timestamptz default now()
);

comment on table public.subscriptions is
  'Langganan user (paket berlangganan). Cascade delete bersama profile.';

-- Pastikan FK subscriptions.user_id juga cascade (saat ini NO ACTION di prod).
alter table public.subscriptions
  drop constraint if exists subscriptions_user_id_fkey;
alter table public.subscriptions
  add constraint subscriptions_user_id_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.subscriptions enable row level security;

drop policy if exists "subs_owner" on public.subscriptions;
create policy "subs_owner"
  on public.subscriptions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- =============================================================================
-- Verifikasi pasca-apply (run manual di SQL editor):
--   select conname, confdeltype from pg_constraint
--    where conname in ('profiles_id_fkey','orders_user_id_fkey',
--                      'meal_entries_recipe_id_fkey','subscriptions_user_id_fkey');
-- Ekspektasi: confdeltype semua = 'c' (CASCADE) atau 'n' (SET NULL), tidak 'a'.
-- =============================================================================

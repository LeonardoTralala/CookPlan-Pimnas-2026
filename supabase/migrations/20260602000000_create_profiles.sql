-- =============================================================================
-- Migrasi: Tabel profiles + RLS + trigger auto-create saat registrasi
-- -----------------------------------------------------------------------------
-- Tujuan: menyimpan nama yang diisi user saat daftar ke database. Saat akun
-- baru dibuat lewat Supabase Auth (email/password atau Google), trigger akan
-- otomatis membuat satu baris di public.profiles dari user metadata.
--
-- Catatan RLS: tabel baru di Supabase otomatis deny-all setelah RLS aktif,
-- jadi policy SELECT/INSERT/UPDATE WAJIB dibuat agar bisa diakses dari klien.
-- Fungsi trigger memakai SECURITY DEFINER sehingga insert profil bypass RLS.
-- =============================================================================

-- 1) Tabel profiles --------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,                 -- nama tampilan yang diisi user saat daftar
  username   text unique,          -- handle unik (diturunkan dari email)
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil pengguna, 1:1 dengan auth.users.';

-- 2) Aktifkan Row Level Security -------------------------------------------------
alter table public.profiles enable row level security;

-- 3) Policies --------------------------------------------------------------------
-- Pengguna hanya bisa membaca profilnya sendiri. (Longgarkan ke `using (true)`
-- bila nanti perlu menampilkan profil publik antar pengguna.)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Pengguna hanya bisa menyisipkan baris untuk dirinya sendiri (mis. upsert dari
-- klien). Trigger di bawah pakai SECURITY DEFINER, jadi tidak bergantung ke sini.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Pengguna hanya bisa memperbarui profilnya sendiri.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4) Auto-update kolom updated_at ------------------------------------------------
-- search_path dikunci ('') agar fungsi tidak rentan search_path hijacking
-- (advisor 0011_function_search_path_mutable). now() tetap resolve dari pg_catalog.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 5) Auto-create profil saat user baru registrasi -------------------------------
-- Membaca nama dari raw_user_meta_data (diisi options.data saat signUp, atau
-- dari profil Google saat OAuth). username diturunkan dari bagian sebelum '@'
-- pada email + potongan UUID agar unik dan tidak bentrok antar pengguna.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'username',
      ''
    ),
    split_part(coalesce(new.email, ''), '@', 1) || '_' || substr(new.id::text, 1, 8)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Hardening: cabut EXECUTE handle_new_user dari role API -----------------------
-- Tanpa ini, fungsi SECURITY DEFINER bisa dipanggil anon/authenticated lewat
-- /rest/v1/rpc/handle_new_user (advisor 0028/0029). Trigger tetap berjalan saat
-- registrasi karena PostgreSQL tidak mengecek hak EXECUTE untuk pemanggilan trigger.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

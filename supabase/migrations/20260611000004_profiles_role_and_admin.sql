-- =============================================================================
-- Migrasi: profiles.role + admin policies
-- -----------------------------------------------------------------------------
-- Menambah kolom role ('user'|'admin') ke profiles (ADR-007). Admin dipakai untuk:
--   - Mengelola bank resep (write recipes & recipe_ingredients)
--   - Mengakses Admin UI provider AI (lewat Edge Function service_role)
-- Helper function public.is_admin() dipakai di policy agar ringkas & cepat.
-- =============================================================================

-- 1) Kolom role -----------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user','admin'));

comment on column public.profiles.role is 'Peran user: user | admin. Default user.';

-- 2) Helper: cek apakah caller adalah admin -------------------------------------
-- SECURITY DEFINER + search_path terkunci. Dipakai di RLS policy tabel lain.
-- Tidak rentan rekursi RLS karena membaca profiles via definer (bypass RLS).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Hanya boleh dipanggil internal (policy), bukan RPC publik sembarangan.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 3) Admin write policies untuk recipes -----------------------------------------
-- Read sudah publik (migrasi recipes). Tambahkan write khusus admin.
drop policy if exists "recipes_admin_write" on public.recipes;
create policy "recipes_admin_write"
  on public.recipes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "recipe_ingredients_admin_write" on public.recipe_ingredients;
create policy "recipe_ingredients_admin_write"
  on public.recipe_ingredients for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Catatan: ai_providers tetap LOCKDOWN dari semua role API (anon/authenticated).
-- Akses admin ke ai_providers dilakukan lewat Edge Function ber-service_role yang
-- memvalidasi is_admin() di dalam function (lihat Phase 6), bukan policy langsung.

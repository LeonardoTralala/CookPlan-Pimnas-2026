-- =============================================================================
-- Migrasi: HARDENING role — cegah user mengubah role sendiri (privilege escalation)
-- -----------------------------------------------------------------------------
-- MASALAH (audit C1): policy profiles_update_own mengizinkan user update SEMUA
-- kolom barisnya sendiri, termasuk kolom `role` yang ditambah di migrasi 000004.
-- RLS itu row-level (bukan column-level), jadi user bisa:
--     update profiles set role='admin' where id = auth.uid();
-- → eskalasi jadi admin. WITH CHECK tidak bisa membandingkan ke nilai OLD,
-- jadi solusinya pakai TRIGGER yang memaksa role tidak berubah kecuali pemanggil
-- adalah service_role (atau current role superuser/postgres saat migrasi).
-- =============================================================================

-- Trigger: tahan perubahan kolom role dari klien biasa (anon/authenticated).
-- Fungsi ini SECURITY DEFINER, jadi `current_user` selalu = owner fungsi
-- (misalnya postgres) dan tidak bisa dipakai untuk membedakan caller.
-- Pakai `session_user` (invoker asli) + whitelist role yang boleh ubah role:
-- service_role (Edge Function), postgres (migration via SQL editor),
-- supabase_admin (Supabase internal).
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Bila role berubah DAN pemanggil bukan whitelist → tolak (paksa nilai lama).
  if new.role is distinct from old.role
     and session_user not in ('service_role', 'postgres', 'supabase_admin')
  then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Lapis kedua (defense in depth): cabut hak UPDATE kolom role dari role API.
-- Grant UPDATE per-kolom selain `role` ke authenticated. Dengan begini, percobaan
-- update kolom role langsung ditolak di level privilege (sebelum trigger).
revoke update on public.profiles from authenticated;
grant update (full_name, username, avatar_url, updated_at) on public.profiles to authenticated;

-- =============================================================================
-- Migrasi: Tabel preregistrations (daftar tunggu / pre-register) + RLS
-- -----------------------------------------------------------------------------
-- Tujuan: menyimpan pendaftar daftar tunggu CookPlan dari halaman /register.
-- Form ini PUBLIK, jadi pengunjung ANONIM harus boleh INSERT, tetapi TIDAK
-- boleh membaca daftarnya (email/no. HP pendaftar lain). Karena itu hanya
-- policy INSERT yang dibuat; SELECT/UPDATE/DELETE tetap tertutup untuk anon &
-- authenticated — hanya service_role (dashboard) yang bisa membaca data.
--
-- Catatan RLS: tabel baru di Supabase otomatis deny-all setelah RLS aktif,
-- jadi policy INSERT WAJIB ada agar form bisa menyimpan data dari klien.
-- =============================================================================

-- 1) Tabel ----------------------------------------------------------------------
create table if not exists public.preregistrations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  city       text not null,
  kecamatan  text,
  user_type  text,
  created_at timestamptz not null default now()
);

comment on table public.preregistrations is
  'Daftar tunggu calon pengguna dari halaman pre-register. Publik insert-only untuk anon.';

-- Satu email hanya bisa daftar sekali (case-insensitive). Pelanggaran unik akan
-- mengembalikan error code 23505 yang ditangani klien sebagai "sudah terdaftar".
create unique index if not exists preregistrations_email_unique
  on public.preregistrations (lower(email));

-- 2) Row Level Security ---------------------------------------------------------
alter table public.preregistrations enable row level security;

-- 3) Policy: siapa pun boleh mendaftar (INSERT), dengan validasi format sisi-server
--    agar anon tidak bisa mengirim data sampah. Tidak ada policy SELECT/UPDATE/
--    DELETE, sehingga isi daftar tunggu tidak terbaca/terubah dari klien.
drop policy if exists "preregistrations_insert_public" on public.preregistrations;
create policy "preregistrations_insert_public"
  on public.preregistrations for insert
  to anon, authenticated
  with check (
    char_length(name) between 1 and 120
    and char_length(email) <= 200
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(city) between 1 and 120
    and (phone is null or char_length(phone) <= 25)
    and (kecamatan is null or char_length(kecamatan) <= 120)
    and (user_type is null or char_length(user_type) <= 80)
  );

-- 4) Hak Data API: cukup INSERT (bukan SELECT) untuk anon/authenticated, supaya
--    data daftar tunggu tidak terbaca dari klien. RLS di atas tetap berlaku.
grant insert on public.preregistrations to anon, authenticated;

# Supabase — Migrasi Database

Folder ini menyimpan migrasi SQL untuk skema database CookPlan. Migrasi pertama
(`migrations/20260602000000_create_profiles.sql`) membuat tabel `profiles`,
mengaktifkan Row Level Security (RLS) beserta policy-nya, dan memasang trigger
yang otomatis membuat baris profil setiap kali ada user baru registrasi.

## Cara menerapkan

### Opsi A — SQL Editor (paling cepat, tanpa CLI)

1. Buka **dashboard Supabase → SQL Editor → New query**.
2. Salin seluruh isi `migrations/20260602000000_create_profiles.sql`, tempel, **Run**.
3. Cek **Table Editor → `profiles`** dan **Authentication → Policies** untuk verifikasi.

### Opsi B — Supabase CLI (untuk alur migrasi berkelanjutan)

```bash
npm install -g supabase          # sekali saja
supabase link --project-ref phdbbiydrjwxlehdfubh
supabase db push                 # menerapkan semua migrasi di folder ini
```

## Verifikasi cepat (setelah migrasi diterapkan)

1. Daftar akun baru lewat halaman `/auth` aplikasi.
2. Di SQL Editor jalankan:
   ```sql
   select id, full_name, username, created_at from public.profiles order by created_at desc limit 5;
   ```
   Baris baru dengan `full_name` sesuai nama yang diisi akan muncul.

## Catatan

- **Email confirmation:** bila diaktifkan, baris `auth.users` (dan profil) tetap
  dibuat saat signUp; user hanya belum bisa login sampai email dikonfirmasi.
- **SELECT policy** saat ini hanya mengizinkan pemilik membaca profilnya sendiri
  (`auth.uid() = id`). Bila nanti perlu menampilkan profil antar pengguna,
  ganti `using (auth.uid() = id)` pada policy `profiles_select_own` menjadi `using (true)`.
- **`username`** diturunkan otomatis dari email + potongan UUID agar unik. Ganti
  logika di fungsi `handle_new_user()` bila ingin handle pilihan user sendiri.

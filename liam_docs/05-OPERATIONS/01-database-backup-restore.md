---
phase: operations
status: done
last-updated: 2026-06-11
---

# Backup & Restore Database (Lokal)

Catatan cara nge-backup dan restore database lokal CookPlan. Semua nunjuk ke
DB lokal:

```
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

> Ini DB lokal, bukan prod. Aman buat eksperimen. Tapi tetep biasain backup
> sebelum ngoprek migration besar, biar ngga buang waktu re-seed manual.

## Kenapa perlu backup manual?

`supabase db reset` selalu ngebalikin DB ke kondisi migration + `seed.sql`.
Tapi `seed.sql` cuma punya **6 resep + 2 ai_providers** — ngga termasuk:

- Test user / auth users (selalu kehapus pas reset).
- Data plan / order yang kamu bikin manual pas testing.

Jadi kalau kamu udah ngumpulin data testing yang berharga, backup dulu.

## Backup penuh (schema + data)

Cara paling gampang pakai Supabase CLI:

```bash
supabase db dump -f backup.sql
```

`backup.sql` isinya schema + data, siap di-restore.

### Dump terpisah: schema-only vs data-only

Kadang kamu cuma butuh salah satu.

**Schema doang** (struktur tabel, function, policy — tanpa baris data):

```bash
supabase db dump -f schema.sql
```

> `supabase db dump` default-nya nge-dump **schema** (DDL). Buat data, pakai flag
> `--data-only`.

**Data doang** (cuma isi baris, tanpa struktur):

```bash
supabase db dump --data-only -f data.sql
```

Berguna kalau kamu mau pindahin data testing ke DB yang struktur-nya udah sama.

### Alternatif pakai `pg_dump` langsung

Kalau mau kontrol lebih, tembak Postgres lokal langsung:

```bash
# Full
pg_dump "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f backup.sql

# Schema only
pg_dump "postgresql://postgres:postgres@127.0.0.1:54322/postgres" --schema-only -f schema.sql

# Data only
pg_dump "postgresql://postgres:postgres@127.0.0.1:54322/postgres" --data-only -f data.sql
```

## Restore

Restore pakai `psql` nembak ke DB lokal:

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f backup.sql
```

Untuk data-only (struktur udah ada, tinggal isi):

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f data.sql
```

> Kalau restore full ke DB yang udah ada isinya, bisa bentrok (duplicate key).
> Aman-nya: `supabase db reset` dulu (DB bersih sesuai migration), baru restore
> data-only.

## Soal auth users (PENTING)

**`supabase db reset` ngehapus auth users.** Tabel `auth.users` dikelola Supabase
Auth, dan reset ngebersihin semuanya. Efeknya:

- Test user yang kamu pake login → ilang.
- `profiles` (yang nyambung ke `auth.users` lewat FK) juga kehapus.

### Recreate test user setelah reset

Pilihan paling gampang: daftar ulang lewat UI di `/auth` (halaman AuthPage),
karena flow signup bakal otomatis bikin row `profiles`.

Kalau perlu test user jadi admin, set role-nya lewat SQL di Studio
(`http://127.0.0.1:54323`):

```sql
-- jadiin admin (setelah user signup)
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'test@example.com');
```

> Detail role & `is_admin()` ada di `liam_docs/01-ARCHITECTURE/05-security-model.md`.

## Ringkasan

| Tujuan | Perintah |
|--------|----------|
| Backup full | `supabase db dump -f backup.sql` |
| Backup schema | `supabase db dump -f schema.sql` |
| Backup data | `supabase db dump --data-only -f data.sql` |
| Restore | `psql "$DB_URL" -f backup.sql` |
| Reset ke migration+seed | `supabase db reset` (hapus auth users!) |

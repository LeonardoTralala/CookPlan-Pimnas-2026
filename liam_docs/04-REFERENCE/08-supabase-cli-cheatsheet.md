---
phase: reference
status: done
last-updated: 2026-06-11
---

# Cheatsheet Supabase CLI

Command Supabase CLI yang sering dipakai pas develop CookPlan (lokal + deploy). Jalankan dari root project (yang ada folder `supabase/`).

---

## Stack lokal

| Command | Fungsi |
|---|---|
| `supabase start` | Nyalain stack lokal (Postgres, Auth, Storage, Studio, dll) via Docker |
| `supabase stop` | Matiin stack lokal (data tetap aman) |
| `supabase stop --no-backup` | Matiin + hapus data lokal (reset bersih) |
| `supabase status` | Lihat URL & key lokal (API URL, anon key, service_role key, DB URL, Studio) |

`supabase status` ngeluarin info penting buat `.env`:

```
API URL:        http://127.0.0.1:54321
Studio URL:     http://127.0.0.1:54323
DB URL:         postgresql://postgres:postgres@127.0.0.1:54322/postgres
anon key:       eyJ...
service_role:   eyJ...
```

---

## Migration & Database

| Command | Fungsi |
|---|---|
| `supabase migration new <nama>` | Bikin file migration baru di `supabase/migrations/` (timestamped) |
| `supabase db reset` | Drop DB lokal, jalanin ulang SEMUA migration dari awal + seed |
| `supabase db diff -f <nama>` | Generate migration dari perubahan schema (bandingin DB vs migration) |
| `supabase db diff` | Lihat diff schema tanpa nulis file |
| `supabase db push` | Apply migration lokal ke project remote (linked) |
| `supabase db pull` | Tarik schema remote jadi migration lokal |

> `supabase db reset` itu cara paling cepat verifikasi semua migration CookPlan jalan urut tanpa error. Hati-hati: ini **hapus semua data lokal**.

---

## Edge Functions

| Command | Fungsi |
|---|---|
| `supabase functions serve` | Jalanin semua Edge Function lokal (hot reload) |
| `supabase functions serve generate-plan` | Jalanin satu function aja |
| `supabase functions serve --env-file ./supabase/.env` | Serve dengan env vars (API key dll) |
| `supabase functions deploy generate-plan` | Deploy `generate-plan` ke remote |
| `supabase functions deploy admin-providers` | Deploy `admin-providers` ke remote |
| `supabase functions deploy` | Deploy semua function |
| `supabase secrets set KEY=value` | Set env var (secret) buat function di remote |
| `supabase secrets list` | Lihat daftar secret (nama aja) |

Env var yang dipakai Edge Function CookPlan: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (biasanya udah otomatis di-inject di runtime Supabase).

### Test function lokal (curl)

```bash
curl -i --request POST 'http://127.0.0.1:54321/functions/v1/generate-plan' \
  --header 'Authorization: Bearer <user-jwt>' \
  --header 'Content-Type: application/json' \
  --data '{"periode":7,"porsi":2,"diet":["halal"],"budget":300000,"pantry":[],"outputType":"full"}'
```

---

## Link project & auth

| Command | Fungsi |
|---|---|
| `supabase login` | Login ke akun Supabase (sekali aja) |
| `supabase link --project-ref <ref>` | Hubungin folder lokal ke project remote |
| `supabase projects list` | Lihat daftar project |

---

## Koneksi psql (DB lokal)

Connection string default stack lokal:

```
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Connect via psql:

```bash
psql 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
```

Atau lewat CLI:

```bash
supabase db reset    # reset + apply migration
```

Contoh query cepat cek tabel:

```sql
\dt public.*                          -- list semua tabel
select id, label, is_active, is_fallback from ai_providers;
select * from generated_plans order by created_at desc limit 5;
```

> Port default: API `54321`, DB `54322`, Studio `54323`. Bisa beda kalau dikonfigurasi di `supabase/config.toml`.

---

## Alur kerja umum CookPlan

```bash
# 1. Nyalain stack
supabase start

# 2. Bikin migration baru
supabase migration new add_something

# 3. Edit file SQL-nya, lalu apply
supabase db reset

# 4. Develop & test Edge Function
supabase functions serve --env-file ./supabase/.env

# 5. Deploy ke remote
supabase db push
supabase functions deploy
```

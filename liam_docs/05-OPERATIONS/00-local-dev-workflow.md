---
phase: operations
status: done
last-updated: 2026-06-11
---

# Workflow Dev Harian (100% Lokal)

Dokumen ini ngejelasin rutinitas ngoding CookPlan sehari-hari. Semua jalan
**100% lokal** pakai Supabase CLI. **Project produksi (ref `phdbbiydrjwxlehdfubh`)
belum disentuh sama sekali**, jadi santai aja, ngga bakal ada yang kena ke prod.

## Git branch

Kita kerja di branch `liam-cookplan`. Cek dulu sebelum mulai:

```bash
git branch --show-current   # harus: liam-cookplan
```

Kalau bukan di branch itu, pindah dulu:

```bash
git switch liam-cookplan
```

## Urutan nyalain (pagi-pagi sebelum ngoding)

Ini urutan baku biar semua nyambung. Jangan lompat-lompat.

| # | Langkah | Perintah | Kapan perlu |
|---|---------|----------|-------------|
| 1 | Nyalain Docker | buka **Docker Desktop**, tunggu sampe ijo | wajib, Supabase lokal butuh Docker |
| 2 | Start Supabase | `supabase start` | sekali per sesi kerja |
| 3 | Start frontend | `npm run dev` | tiap mau lihat UI |
| 4 | Serve Edge Function | `supabase functions serve` | cuma kalau lagi ngoprek fitur AI |

### 1. Docker dulu

Supabase lokal jalan di atas container Docker (Postgres, Auth, Storage, dll).
Kalau Docker belum nyala, `supabase start` bakal gagal. Buka Docker Desktop,
tunggu statusnya hijau.

### 2. `supabase start`

```bash
supabase start
```

Outputnya bakal kasih kredensial lokal. Yang penting diinget:

```
API URL:     http://127.0.0.1:54321
DB URL:      postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:  http://127.0.0.1:54323
anon key:    eyJhbG... (dipake di .env frontend)
```

Buka **Studio** di `http://127.0.0.1:54323` buat lihat tabel/data secara visual.

### 3. `npm run dev`

```bash
npm run dev
```

Vite nyala di `http://localhost:5173` (default). Frontend baca `.env` lokal yang
nunjuk ke `http://127.0.0.1:54321`.

### 4. `supabase functions serve` (khusus AI)

Cuma perlu kalau lagi garap fitur generate foodplan / admin providers:

```bash
supabase functions serve
```

Ini nyajiin Edge Function `generate-plan` sama `admin-providers` secara lokal,
plus nampilin **log realtime** di terminal (penting buat debug, lihat
`03-incident-runbook.md`).

## Pas lagi ngoding

- Edit kode di `src/` → Vite auto-reload, ngga perlu restart.
- Edit Edge Function di `supabase/functions/` → `functions serve` auto-reload.
- **Ubah file migration di `supabase/migrations/`** → DB ngga auto-update.
  Kamu HARUS reset (lihat bawah).

## Reset DB pas ubah migration

Kalau kamu nambah/ngedit file di `supabase/migrations/`, database lokal ngga
otomatis ikut berubah. Jalanin:

```bash
supabase db reset
```

Apa yang terjadi:

1. Drop semua schema lokal.
2. Jalanin ulang **semua migration** dari awal (urut tanggal).
3. Jalanin `supabase/seed.sql` → 6 resep + 2 ai_providers masuk lagi.

> ⚠️ **`supabase db reset` juga ngehapus auth users.** Test user yang kamu bikin
> bakal ilang. Kamu perlu daftar / bikin ulang test user. Detail di
> `01-database-backup-restore.md`.

## Sebelum commit (WAJIB)

Jangan pernah commit tanpa lolos dua perintah ini:

```bash
npm run lint && npm run build
```

- `npm run lint` → ESLint, nangkep error gaya & potensi bug.
- `npm run build` → Vite build, mastiin ngga ada error compile.

Kalau dua-duanya ijo, baru:

```bash
git add -p          # review per-hunk, jangan asal git add .
git commit -m "..."
```

## Matiin (kelar kerja)

```bash
# Ctrl+C di terminal npm run dev dan functions serve
supabase stop       # matiin container, hemat resource
```

`supabase stop` ngga ngehapus data — pas `supabase start` lagi, data lokal masih ada.
Yang ngehapus data cuma `supabase db reset`.

## Cheat sheet ringkas

```bash
# Mulai kerja
supabase start
npm run dev
supabase functions serve     # kalau garap AI

# Pas ubah migration
supabase db reset

# Sebelum commit
npm run lint && npm run build

# Kelar
supabase stop
```

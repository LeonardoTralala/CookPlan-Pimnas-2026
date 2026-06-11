---
phase: operations
status: done
last-updated: 2026-06-11
---

# Incident Runbook

Panduan cepat kalau ada yang error. Cari gejalanya di tabel bawah, langsung
loncat ke seksi penanganannya.

| Gejala | Seksi |
|--------|-------|
| Generate foodplan gagal / error | (a) Edge Function error |
| AI ngaco / timeout / provider mati | (b) AI provider down |
| "Batas 20 generate per hari tercapai" | (c) Rate limit kena |
| DB lokal aneh / data rusak | (d) DB corrupt lokal |
| Hasil generate ngga update padahal input beda | (e) Cache stale |

---

## (a) Edge Function error

**Gejala:** Generate foodplan balik error, atau plan ngga kebikin.

**Langkah diagnosa:**

1. **Cek log `functions serve`.** Terminal tempat kamu jalanin
   `supabase functions serve` nampilin log realtime tiap request. Liat stack
   trace / pesan error di situ.

2. **Cek tabel `generated_plans`.** Tiap percobaan generate ke-log, termasuk yang
   gagal:

   ```sql
   select id, status, error_message, created_at
   from public.generated_plans
   where status = 'failed'
   order by created_at desc
   limit 10;
   ```

   `error_message` biasanya nunjukin akar masalah (parse gagal, provider error,
   validasi semantik gagal, dll).

**Penanganan:** Sesuaikan sama `error_message`. Kalau parse JSON gagal → lihat
seksi (b) soal provider. Kalau validasi semantik gagal → cek resep yang
ke-retrieve emang ada / cukup.

---

## (b) AI provider down

**Gejala:** AI timeout, balikin error, atau output ngga valid terus.

**Yang udah otomatis:** Edge Function `generate-plan` punya **fallback chain**.
Dia coba **primary** dulu, kalau gagal otomatis lompat ke **fallback (Gemini)**.
Jadi sekali provider primary ngadat, harusnya masih jalan via Gemini.

**Penanganan manual:**

1. Buka **`/admin/ai`** (login sebagai admin).
2. Cek provider mana yang aktif (`is_active`) dan mana fallback (`is_fallback`).
3. Kalau primary bermasalah, bisa **switch** provider aktif dari sini —
   **tanpa redeploy**, karena config baca dari tabel `ai_providers`.
4. Pastiin `base_url`, `api_key`, `model` provider bener.

> Primary = Sonnet 4.5 thinking via 9router/enowxlabs (OpenAI-compat).
> Fallback = Gemini. Detail desain di
> `liam_docs/01-ARCHITECTURE/04-ai-integration-design.md`.

---

## (c) Rate limit kena

**Gejala:**

```
Batas 20 generate per hari tercapai. Coba lagi besok.
```

**Kenapa:** Tiap user dibatasi **20 generate/hari**, dihitung dari tabel
`ai_usage_log`. Ini proteksi biaya AI.

**Penanganan:**

- **Cara santai:** tunggu reset harian (hitungan per hari).
- **Cara dev (kalau lagi testing intens):** naikin limit di
  `supabase/functions/generate-plan/index.ts`:

  ```ts
  const RATE_LIMIT_PER_DAY = 20; // generate per user per hari
  ```

  Ubah angkanya, terus `functions serve` auto-reload. **Inget balikin ke 20
  sebelum commit/deploy.**

- **Cara reset cepat di lokal:** hapus log usage hari ini di Studio:

  ```sql
  delete from public.ai_usage_log
  where user_id = '<user-id>' and created_at::date = current_date;
  ```

---

## (d) DB corrupt lokal

**Gejala:** DB lokal aneh, migration setengah jalan, data inkonsisten.

**Penanganan:** Reset bersih:

```bash
supabase db reset
```

Ini drop semua, jalanin ulang migration + `seed.sql`. Balik ke kondisi bersih
(6 resep + 2 ai_providers).

> ⚠️ Ngehapus auth users juga — recreate test user setelahnya. Lihat
> `01-database-backup-restore.md`. Kalau ada data testing berharga, backup dulu.

---

## (e) Cache stale

**Gejala:** "Kok hasilnya sama terus?" — curiga cache.

**Penjelasan:** Ini **bukan bug**, ini fitur. `generate-plan` nge-cache hasil
pakai `input_hash` di tabel `generated_plans`. Kalau input (form generate) sama
persis → hash sama → balikin hasil cache (hemat biaya AI).

**Penanganan:** Kalau input **beda** (ubah preferensi, porsi, constraint), hash
otomatis beda → bikin plan baru. Jadi ngga ada yang perlu dibersihin.

Kalau emang mau paksa regenerate dengan input sama (buat testing), hapus cache
row-nya:

```sql
delete from public.generated_plans
where input_hash = '<hash>';
```

> Cara cache jalan: lihat `liam_docs/01-ARCHITECTURE/04-ai-integration-design.md`.

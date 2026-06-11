---
phase: operations
status: done
last-updated: 2026-06-11
---

# Monitoring Biaya AI

Generate foodplan manggil AI berbayar (token-based). Dokumen ini cara mantau
biaya biar ngga jebol, plus strategi hematnya.

## Sumber data biaya

Dua tabel utama:

### `ai_usage_log`

Tiap panggilan AI (atau cache hit) ke-log di sini.

| Kolom | Arti |
|-------|------|
| `user_id` | siapa yang generate |
| `endpoint` | `generate-plan` |
| `tokens_input` | jumlah token prompt yang dikirim |
| `tokens_output` | jumlah token jawaban AI |
| `cost_usd` | estimasi biaya USD panggilan itu |
| `cache_hit` | `true` = ngambil dari cache (biaya ~0), `false` = beneran call AI |
| `model` | model yang dipake |
| `created_at` | kapan |

### `generated_plans`

Nyimpen plan hasil generate + `input_hash` (kunci caching) + `status`.

## Query agregasi biaya

### Total biaya per user

```sql
select
  user_id,
  count(*)                                  as total_calls,
  count(*) filter (where cache_hit)         as cache_hits,
  sum(tokens_input)                         as total_in,
  sum(tokens_output)                        as total_out,
  round(sum(cost_usd)::numeric, 4)          as total_usd
from public.ai_usage_log
group by user_id
order by total_usd desc;
```

### Biaya per hari

```sql
select
  created_at::date                          as tanggal,
  count(*)                                  as calls,
  count(*) filter (where cache_hit)         as cache_hits,
  round(sum(cost_usd)::numeric, 4)          as biaya_usd
from public.ai_usage_log
group by created_at::date
order by tanggal desc;
```

### Cache hit rate (makin tinggi makin hemat)

```sql
select
  round(100.0 * count(*) filter (where cache_hit) / count(*), 1) as cache_hit_pct,
  round(sum(cost_usd)::numeric, 4)                                as total_usd
from public.ai_usage_log;
```

### Sisa kuota user hari ini (kaitannya sama rate limit 20/hari)

```sql
select count(*) as calls_today
from public.ai_usage_log
where user_id = '<user-id>'
  and created_at::date = current_date;
```

## Gimana biaya dihitung

Fungsi `estimateCost` di `supabase/functions/_shared/aiAdapter.ts`:

```ts
export function estimateCost(tokensIn: number | null, tokensOut: number | null): number {
  const inRate  = 0.000003;   // $3 / 1M token input (asumsi Sonnet)
  const outRate = 0.000015;   // $15 / 1M token output
  // ...
}
```

Jadi asumsinya tarif **Sonnet**: **$3 per 1 juta token input**, **$15 per 1 juta
token output**. Ini **estimasi** — kalau ganti model (mis. Gemini fallback), tarif
aslinya beda, tapi angka ini ngasih gambaran kasar yang cukup buat mantau tren.

## Strategi hemat biaya

1. **Caching agresif (`input_hash`).** Input form sama → ngga call AI, ambil
   cache. `cache_hit = true` artinya biaya ~$0. Makin tinggi cache hit rate,
   makin hemat. Ini lini pertahanan biaya nomor satu.

2. **Rate limit 20/hari per user.** Plafon atas biaya per user. Diatur di
   `RATE_LIMIT_PER_DAY` (`generate-plan/index.ts`).

3. **`ingredients_text` ringkas.** Resep kirim ringkasan bahan (bukan tabel
   `recipe_ingredients` penuh) ke prompt → hemat token input.

4. **Model murah buat testing.** Pas dev/QA, set provider ke model murah lewat
   `/admin/ai` (ganti tanpa redeploy). Simpen model mahal (Sonnet thinking) buat
   produksi / hasil final.

## Rutinitas mantau

- Cek query "biaya per hari" tiap habis sesi testing intens.
- Pantau **cache hit rate** — kalau drop, ada yang generate ulang terus dengan
  input beda-beda tipis (kandidat optimasi prompt/input).
- Bandingin `tokens_output` antar model kalau lagi tuning prompt.

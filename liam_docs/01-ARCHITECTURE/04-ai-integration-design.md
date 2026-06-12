---
phase: architecture
status: done
last-updated: 2026-06-11
---

# Desain Integrasi AI (Provider-Agnostic)

CookPlan didesain biar **ngga ngunci ke satu vendor AI**. Provider bisa diganti
kapan aja tanpa ubah kode / redeploy. Dokumen ini ngejelasin keputusan
desainnya.

## Prinsip inti: provider-agnostic

Semua provider diakses lewat **OpenAI-compatible chat completions API**. Selama
vendor nyediain endpoint format `chat/completions`, dia bisa dipasang.

Config provider disimpen di tabel **`ai_providers`**:

| Kolom | Isi |
|-------|-----|
| `base_url` | endpoint API provider |
| `api_key` | kunci API (server-side only) |
| `model` | nama model |
| `is_active` | provider primary aktif |
| `is_fallback` | provider cadangan |

> **Ganti provider tanpa redeploy.** Karena config ada di DB (bukan hardcode),
> admin tinggal edit di `/admin/ai` dan Edge Function langsung baca config baru
> di request berikutnya.

### Setup saat ini

- **Primary:** Sonnet 4.5 thinking via `9router/enowxlabs` (OpenAI-compat).
- **Fallback:** Gemini.
- Key masih **placeholder** — diisi lewat `/admin/ai` atau SQL.

## Schema-in-prompt strategy

Daripada ngandelin "tool calling" / "function calling" yang beda-beda per
vendor, CookPlan **naro schema output langsung di dalam prompt**. AI diminta
balikin JSON sesuai schema yang ditulis eksplisit di prompt.

Keuntungan: portable lintas provider (Sonnet, Gemini, dll sama-sama bisa diminta
"balikin JSON bentuk ini"). Prompt disusun di
`supabase/functions/_shared/prompt.ts`.

## Defensive JSON parsing (3 tingkat)

AI ngga selalu balikin JSON bersih (kadang ada teks pembungkus, markdown fence,
dll). Parsing dibikin tahan banting:

```
Tingkat 1: parse JSON langsung dari output AI
              │ gagal?
              ▼
Tingkat 2: safeJsonExtract() – ekstrak blok JSON dari teks campur
              │ masih gagal?
              ▼
Tingkat 3: retry call AI 1x, lalu ekstrak ulang
              │ tetap gagal?
              ▼
           tandai status='failed' + error_message di generated_plans
```

Setelah keparse, masih ada **validasi semantik** (`validateOutput`): cek id
resep yang dipilih AI emang valid / ada di katalog.

Titik kode: `generate-plan/index.ts:164` (parse + retry),
`_shared/validate.ts` (`validateOutput`).

## Reasoning model support

Model "thinking" (kayak Sonnet 4.5 thinking) balikin **reasoning** terpisah dari
jawaban. CookPlan nyimpen ini di kolom `reasoning_content` (tabel
`generated_plans`) dan ngebaliknya ke frontend (`meta.reasoning`) — berguna buat
transparansi "kenapa AI milih menu ini".

## Fallback chain

```
call primary (is_active) ──gagal──▶ call fallback (is_fallback / Gemini) ──gagal──▶ error
```

Edge Function nyoba primary dulu; kalau error/timeout, otomatis lompat ke
fallback. Jadi satu provider ngadat ngga langsung matiin fitur.

Titik kode: `generate-plan/index.ts:140` (`tryProviders = [primary, fallback]`).

## Caching (`input_hash`)

Sebelum manggil AI, Edge Function ngitung hash dari input form (`input_hash`) dan
ngecek `generated_plans`. Kalau hash sama udah pernah ada → **return cache,
skip AI** (`cache_hit = true`, biaya ~$0).

Input beda → hash beda → generate baru. Sederhana tapi ngirit biaya signifikan.

## Keamanan

- **API key cuma server-side.** Key ada di `ai_providers`, dibaca cuma sama Edge
  Function pakai `service_role` (bypass RLS lockdown). **Ngga pernah ke browser.**
- **Tabel `ai_providers` di-lockdown** RLS — user biasa ngga bisa baca. Admin UI
  (`/admin/ai`) ngakses lewat Edge Function `admin-providers`, dan key di-mask di
  tampilan.
- **Edge Function sebagai proxy.** Frontend ngga pernah manggil API AI langsung —
  selalu lewat Edge Function. Ini yang nutup kebocoran key + tempat naro rate
  limit & validasi.

> Detail keamanan menyeluruh: `05-security-model.md`.

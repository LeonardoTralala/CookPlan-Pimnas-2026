---
phase: 3
status: done
last-updated: 2026-06-11
estimated-effort: 5-7 hari
dependencies: [phase-1, phase-2]
---

# Phase 3 — Edge Function & AI Integration

## Goal
Membangun inti fitur AI: Edge Function `generate-plan` yang provider-agnostic,
dengan retrieval resep, prompt engineering, parsing defensive, validasi, caching,
rate limit, pantry subtraction, dan fallback.

## Deliverables
- ✅ Edge Function `generate-plan` (orchestrator 12 langkah)
- ✅ Shared module: `prompt.ts`, `aiAdapter.ts`, `validate.ts`
- ✅ Provider-agnostic (OpenAI-compat) + fallback Gemini
- ✅ Caching via input_hash, rate limit 20/hari
- ✅ Pantry subtraction server-side
- ✅ Config `verify_jwt = false` (function handle auth sendiri)
- ✅ Tested: auth 401, validasi 400, pipeline 502 graceful, failed record logged

## File yang Dibuat
| File | Fungsi |
|------|--------|
| `supabase/functions/generate-plan/index.ts` | Orchestrator utama (12 langkah) |
| `supabase/functions/_shared/prompt.ts` | System prompt + schema-as-text + user message |
| `supabase/functions/_shared/aiAdapter.ts` | callProvider, safeJsonExtract, estimateCost |
| `supabase/functions/_shared/validate.ts` | validateInput, validateOutput, subtractPantry |
| `supabase/config.toml` | `[functions.generate-plan] verify_jwt = false` |

## Flow 12 Langkah
Lihat [function-anatomy.md](./function-anatomy.md).

## Detail
- [prompt-engineering.md](./prompt-engineering.md) — strategi prompt + schema
- [provider-adapter.md](./provider-adapter.md) — OpenAI-compat + fallback
- [caching-strategy.md](./caching-strategy.md) — input_hash
- [rate-limit-strategy.md](./rate-limit-strategy.md) — 20/hari
- [error-handling.md](./error-handling.md) — provider down, JSON rusak, validasi gagal

## ⚠️ Cara Mengisi API Key Asli (WAJIB sebelum generate beneran)

Provider di-seed dengan key PLACEHOLDER. Ganti dulu:

```sql
-- Via Supabase Studio (http://127.0.0.1:54323) → SQL Editor, atau psql:

-- Primary (Sonnet 4.5 thinking via 9router/enowxlabs)
update public.ai_providers
set base_url = 'https://<endpoint-9router-kamu>/v1',
    api_key  = '<API_KEY_ASLI>',
    model    = '<model-id-yang-bener>'
where is_active = true;

-- Fallback (Gemini)
update public.ai_providers
set api_key = '<GEMINI_API_KEY_ASLI>'
where is_fallback = true;
```

Nanti di Phase 6 ini bisa lewat Admin UI `/admin/ai` (lebih nyaman).

## Definition of Done
- Function serve lokal jalan ✅
- Auth/validasi/pipeline/fallback terverifikasi ✅
- (Pending key asli) generate sukses end-to-end → diuji setelah key diisi

Lihat [verification.md](./verification.md).

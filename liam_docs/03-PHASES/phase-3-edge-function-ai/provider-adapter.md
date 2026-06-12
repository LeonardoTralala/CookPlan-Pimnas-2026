---
phase: 3
status: done
last-updated: 2026-06-11
---

# Phase 3 — Provider Adapter (Provider-Agnostic)

## Format Universal: OpenAI-Compatible
`callProvider()` di `aiAdapter.ts` ngomong format chat completions:
```
POST {base_url}/chat/completions
Authorization: Bearer {api_key}
{ model, messages, temperature, max_tokens, response_format? }
```
Jalan untuk: 9router, enowxlabs, OpenRouter, DeepSeek, Groq, Gemini (OpenAI-compat
endpoint), LM Studio lokal — tanpa adapter khusus.

## Reasoning Model Support
Ekstrak `reasoning_content` (atau `reasoning`) terpisah dari `content`:
```ts
const content = msg.content;
const reasoning = msg.reasoning_content ?? msg.reasoning ?? null;
```
`reasoning` disimpan di `generated_plans.reasoning_content` dan ditampilkan ke user
(ADR keputusan: show reasoning).

## Timeout
Default 90 detik (AbortController). Cukup untuk reasoning model (Sonnet thinking
~20s via proxy). Edge Function Supabase limit 150s.

## Fallback Chain
```
[primary, fallback].filter(Boolean)
for prov of providers:
  try callProvider(prov) → break on success
  catch → simpan lastError, lanjut provider berikut
kalau semua gagal → 502 + simpan generated_plans status=failed
```

## Defensive JSON Parsing (`safeJsonExtract`)
3 tingkat:
1. `JSON.parse(raw)` langsung
2. Strip markdown fence ` ```json ... ``` `
3. Ambil blok `{ ... }` terluas (indexOf `{` → lastIndexOf `}`)

Mengatasi model yang kadang bungkus JSON dalam teks/markdown.

## Cost Estimation
`estimateCost()` placeholder: $3/1M input, $15/1M output (asumsi Sonnet). Di-tune
per model nanti. Disimpan di `generated_plans.cost_usd` + `ai_usage_log`.

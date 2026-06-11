---
phase: 3
status: done
last-updated: 2026-06-11
---

# Phase 3 — Function Anatomy (12 Langkah)

Orchestrator `generate-plan/index.ts` menjalankan 12 langkah berurutan:

| # | Langkah | Detail | Error → |
|---|---------|--------|---------|
| 1 | **Auth** | `userClient.auth.getUser()` dari JWT header | 401 |
| 2 | **Rate limit** | Hitung `ai_usage_log` user hari ini vs 20 | 429 |
| 3 | **Validate input** | `validateInput()` periode/porsi/budget/diet/pantry | 400 |
| 4 | **Cache check** | sha256(input) → cari `generated_plans` status=success | return cache |
| 5 | **Retrieve resep** | filter `tags overlaps diet`, fallback semua aktif, limit 40 | 422 jika kosong |
| 6 | **Ambil provider** | service_role baca `ai_providers` (active + fallback) | 503 jika tdk ada |
| 7 | **Build messages** | system + user (schema-as-text + bank resep + pantry) | — |
| 8 | **Call AI** | coba primary → fallback bila gagal | 502 jika semua gagal |
| 9 | **Parse + validate** | safeJsonExtract → retry 1x → validateOutput | 502 jika invalid |
| 10 | **Pantry subtract** | kurangi bahan rumah dari shopping_list (server-side) | — |
| 11 | **Persist** | insert `generated_plans` (success + tokens + cost) | — |
| 12 | **Log usage** | insert `ai_usage_log` | — |

## Dua Supabase Client
- **userClient** (anon key + JWT user): verifikasi identitas user.
- **admin** (service_role): baca `ai_providers` (lockdown), tulis `generated_plans`
  & `ai_usage_log`. Bypass RLS.

## Kenapa service_role untuk ai_providers?
Tabel `ai_providers` di-`revoke all from anon, authenticated` (Phase 1). Hanya
service_role yang bisa baca API key. Edge Function aman karena key tidak pernah
keluar dari server.

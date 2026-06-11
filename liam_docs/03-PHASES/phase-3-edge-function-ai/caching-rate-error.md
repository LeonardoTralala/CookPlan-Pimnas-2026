---
phase: 3
status: done
last-updated: 2026-06-11
---

# Phase 3 — Caching, Rate Limit, Error Handling

## Caching (input_hash) — ADR-009
- `sha256(JSON.stringify(input))` jadi `input_hash`.
- Sebelum call AI, cek `generated_plans` (user_id + input_hash + status=success).
- Hit → return hasil cache instan, log `ai_usage_log.cache_hit = true`, TANPA call AI.
- Hemat biaya 100% untuk input identik + respon <100ms.

## Rate Limit
- Hitung `ai_usage_log` user hari ini (>= startOfDay).
- Limit `RATE_LIMIT_PER_DAY = 20`. Lewat → 429.
- Cache hit tetap kena hitung (tapi tidak call AI), bisa di-tune nanti.

## Error Handling (graceful di tiap langkah)
| Kondisi | HTTP | Pesan |
|---------|------|-------|
| Tidak login | 401 | "Tidak terautentikasi." |
| Rate limit | 429 | "Batas 20 generate per hari tercapai..." |
| Input invalid | 400 | Pesan spesifik (periode/porsi/budget) |
| Bank resep kosong | 422 | "Bank resep kosong. Tambahkan resep dulu." |
| Tidak ada provider | 503 | "Belum ada AI provider aktif." |
| Semua provider gagal | 502 | "Semua provider AI gagal: ..." |
| JSON rusak setelah retry | 502 | "AI menghasilkan output tidak valid." |
| Output gagal validasi | 502 | "Output AI tidak lolos validasi: ..." |

Semua kegagalan AI disimpan ke `generated_plans` status=failed + error_message
untuk debug (terbukti di test: record Gemini 400 tersimpan rapi).

## Pantry Subtraction (server-side)
Setelah AI menghasilkan shopping_list, server mengurangi bahan yang sudah dimiliki
user (`subtractPantry`):
- Pencocokan nama longgar (case-insensitive substring)
- Punya amount → kurangi; sisa <=0 → buang item; tanpa amount → anggap cukup, buang
- Recompute `total_estimated_cost`
Logika ini di server (bukan AI) karena AI sering salah hitung aritmatika.

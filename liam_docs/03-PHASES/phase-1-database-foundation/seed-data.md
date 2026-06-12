---
phase: 1
status: done
last-updated: 2026-06-11
---

# Phase 1 — Seed Data Strategy

## Sumber
6 resep awal diambil dari `src/utils/mockRecipes.js` (frontend mock) dan dikonversi
ke tabel `recipes` + `recipe_ingredients`. Harga & takaran mengikuti porsi dasar 2.

## Resep Ter-seed
| ID | Title | Difficulty | Cuisine | Harga (porsi 2) | Tags |
|----|-------|------------|---------|-----------------|------|
| 1 | Gado-Gado Segar | easy | nusantara | 30.000 | vegetarian, halal, hemat |
| 2 | Soto Ayam Kampung | medium | nusantara | 40.000 | halal, bahan-lokal |
| 3 | Tempe Bowl Sehat | easy | asia | 25.000 | vegetarian, halal, cepat, tinggi-protein |
| 4 | Mie Goreng Jawa | easy | nusantara | 28.000 | halal, cepat |
| 5 | Ikan Bakar Bali | medium | nusantara | 48.000 | halal, bahan-lokal, tinggi-protein |
| 6 | Tumis Sayur Pelangi | easy | nusantara | 22.000 | vegetarian, vegan, halal, cepat, hemat, bahan-lokal |

Total: 6 resep, 52 ingredients.

## Config AI Provider Ter-seed
| Label | Model | Active | Fallback | Reasoning |
|-------|-------|--------|----------|-----------|
| Sonnet 4.5 Thinking (9router) | anthropic/claude-sonnet-4.5 | ✅ | — | ✅ |
| Gemini Fallback | gemini-2.0-flash | — | ✅ | — |

> **API key di-seed PLACEHOLDER** (`REPLACE_ME_*`). Diganti via Admin UI (Phase 6)
> atau update manual sebelum generate. Key asli TIDAK pernah masuk git.

## Cara Mengganti Key (Local Dev)
```sql
-- Via psql atau Supabase Studio (http://127.0.0.1:54323)
update public.ai_providers
set base_url = 'https://<endpoint-9router>/v1', api_key = '<key-asli>'
where is_active = true;

update public.ai_providers
set api_key = '<gemini-key>'
where is_fallback = true;
```

## Ekspansi ke 30-50 Resep (Rencana)
Strategi untuk menambah resep:
1. **Manual curate** — tambah blok insert di `seed.sql` (paling terkontrol).
2. **AI bootstrap** — kasih daftar 50 nama menu nusantara ke AI → generate struktur
   JSON (title, ingredients, instructions, tags) → manusia review → insert.
3. **Admin UI** (Phase 6) — form tambah resep langsung dari aplikasi.

Untuk MVP, 6 resep cukup untuk test flow. Ekspansi dilakukan sebelum demo Monev.

## Idempotency
Seed pakai `truncate ... restart identity cascade` di awal, jadi `supabase db reset`
selalu menghasilkan state bersih & konsisten. `setval` di akhir reset sequence id.

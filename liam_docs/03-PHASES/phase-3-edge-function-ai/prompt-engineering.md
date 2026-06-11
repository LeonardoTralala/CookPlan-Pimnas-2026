---
phase: 3
status: done
last-updated: 2026-06-11
---

# Phase 3 — Prompt Engineering

## Strategi: Schema-in-Prompt (ADR-005)
JSON schema dikirim sebagai **teks di dalam prompt**, bukan parameter API. Alasan:
provider-agnostic — jalan di semua provider tanpa peduli native `response_format`
support. `response_format: json_object` tetap di-set bila `supports_json_mode=true`
(bonus, bukan andalan).

## 3 Lapisan Pesan

### 1. System Prompt (statis, `prompt.ts`)
Mendefinisikan peran CookPlan AI + aturan wajib:
- HANYA pakai resep dari bank (recipe_id valid) — anti-halusinasi
- Diet & alergi = hard constraint
- Variasi antar hari
- Budget toleransi 10% + warnings bila kurang
- Output JSON valid SAJA, tanpa markdown

### 2. User Message (dinamis, `buildUserMessage()`)
Berisi:
- Permintaan user (periode, porsi, diet, budget, output type)
- Pantry (bahan di rumah)
- **Bank resep** (recipe_id, title, kalori, harga, tags, bahan ringkas)
- Schema output (teks)

### 3. Schema Output (teks, `OUTPUT_SCHEMA_TEXT`)
Struktur JSON lengkap: plan_summary, days[].meals[], shopping_list[],
prep_instructions[], total_estimated_cost, warnings[].

## Optimasi Token
- Bank resep pakai `ingredients_text` (denormalisasi 1 string) bukan nested object
  → hemat token signifikan.
- Hanya kirim field yang AI butuh untuk memilih (bukan instructions lengkap;
  resep detail di-fetch ulang dari DB saat render).

## Retry Korektif
Bila output bukan JSON valid, retry sekali dengan menambahkan:
- assistant message (output rusak, dipotong 2000 char)
- user message: "Output sebelumnya bukan JSON valid. Kirim ULANG sebagai JSON..."

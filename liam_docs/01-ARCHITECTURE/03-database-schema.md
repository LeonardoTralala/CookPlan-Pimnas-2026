---
phase: architecture
status: done
last-updated: 2026-06-11
---

# Database Schema (Tingkat Arsitektur)

Ini ringkasan ERD tingkat tinggi — gambaran 11 tabel dan relasinya. **Detail
kolom penuh** (tipe data, constraint, index) ada di
`liam_docs/04-REFERENCE/00-database-schema-full.md`.

## 11 Tabel

| # | Tabel | Peran |
|---|-------|-------|
| 1 | `profiles` | Profil user, FK ke `auth.users`. Punya kolom `role` (admin/user) |
| 2 | `preregistrations` | Pendaftar awal (pra-launch) |
| 3 | `recipes` | Bank resep. Sumber katalog + konteks AI |
| 4 | `recipe_ingredients` | Bahan per resep (normalized) |
| 5 | `weekly_plans` | Rencana mingguan, 1 baris/user/minggu |
| 6 | `meal_entries` | Slot makan per hari, FK ke `weekly_plans` |
| 7 | `ai_providers` | Config provider AI (base_url, api_key, model) — ke-lockdown |
| 8 | `generated_plans` | Hasil generate AI + `input_hash` (cache) + status |
| 9 | `ai_usage_log` | Log tiap call AI (token, cost, cache_hit) |
| 10 | `orders` | Pesanan, id `CP-YYYYMMDD-XXXX` |
| 11 | `order_items` | Item per pesanan, FK ke `orders` |

## Diagram relasi (ERD ringkas)

```
                          ┌──────────────┐
                          │ auth.users   │ (dikelola Supabase Auth)
                          └──────┬───────┘
                                 │ 1:1
                          ┌──────▼───────┐
                          │ profiles     │ (role: admin/user)
                          └──────┬───────┘
                                 │ owner (user_id)
        ┌────────────────────────┼────────────────────────┐
        │                        │                         │
┌───────▼────────┐      ┌────────▼─────────┐      ┌────────▼────────┐
│ weekly_plans   │      │ generated_plans  │      │ orders          │
│                │      │ (input_hash,     │      │ id=CP-...        │
│                │      │  status)         │      │                  │
└───────┬────────┘      └──────────────────┘      └────────┬────────┘
        │ 1:N                                              │ 1:N
┌───────▼────────┐                                ┌────────▼────────┐
│ meal_entries   │ ──┐                            │ order_items     │
└────────────────┘   │ ref recipe                 └────────┬────────┘
                     │                                     │ ref recipe
                     ▼                                     ▼
              ┌──────────────┐  1:N    ┌────────────────────────┐
              │ recipes      │ ──────▶ │ recipe_ingredients     │
              └──────────────┘         └────────────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
│ preregistrations │    │ ai_providers     │    │ ai_usage_log         │
│ (standalone)     │    │ (lockdown RLS)   │    │ (per user, per call) │
└──────────────────┘    └──────────────────┘    └──────────────────────┘
```

## Relasi inti

- `profiles.id` → `auth.users.id` (1:1).
- `weekly_plans.user_id` & `meal_entries` → owner per user.
- `meal_entries` & `order_items` & `generated_plans` ngacu ke `recipes`.
- `orders` punya banyak `order_items`.
- `recipes` punya banyak `recipe_ingredients`.
- `ai_providers`, `ai_usage_log`, `preregistrations` relatif standalone (ngga
  ke-FK-rapat ke rantai utama).

## Kolom AI khusus di `recipes`

Tiga kolom ini ada khusus buat dukung generate AI (bukan cuma katalog):

| Kolom | Tipe | Fungsi |
|-------|------|--------|
| `tags` | `text[]` | Constraint diet buat AI (halal, vegan, low-carb). Beda dari `badges` yang cuma label tampilan |
| `ingredients_text` | `text` | Ringkasan bahan jadi satu string. Dikirim ke prompt AI biar **hemat token** (ngga perlu kirim seluruh `recipe_ingredients`) |
| `base_servings` | `integer` (default 2) | Porsi acuan takaran bahan. Dipake scaling porsi di shopping list |

> Pisahnya `tags` (logika AI) vs `badges` (tampilan), dan adanya
> `ingredients_text` (token-efficient), itu keputusan desain biar AI murah &
> akurat. Lihat `04-ai-integration-design.md`.

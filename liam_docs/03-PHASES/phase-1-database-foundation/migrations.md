---
phase: 1
status: done
last-updated: 2026-06-11
---

# Phase 1 — Skema Migrasi (Detail)

## ERD Ringkas

```
auth.users ──1:1──> profiles (id, role, full_name, username, ...)
                       │
                       ├──1:N──> weekly_plans (user_id, week_start_date)
                       │            └──1:N──> meal_entries (plan_id, recipe_id, day, meal_type, servings, snapshot)
                       │
                       ├──1:N──> generated_plans (user_id, input_hash, output_json, provider_id)
                       │
                       ├──1:N──> orders (id=CP-..., user_id, plan_id) ──1:N──> order_items
                       │
                       └──1:N──> ai_usage_log (user_id, provider_id, tokens, cost)

recipes (id, title, tags[], badges[], cuisine, ingredients_text, base_servings)
   └──1:N──> recipe_ingredients (recipe_id, name, amount, unit, category, price_idr)

ai_providers (id, base_url, api_key, model, is_active, is_fallback)  [LOCKDOWN]
```

## Tabel & Kolom Kunci

### recipes
Bank resep. Kolom khusus untuk AI:
- `tags[]` — constraint diet (vegetarian, halal, vegan, low-carb, dll) untuk filter AI
- `badges[]` — label tampilan UI (Vegetarian, Cepat, Hemat Budget)
- `cuisine` — nusantara/asia/western
- `ingredients_text` — denormalisasi bahan jadi 1 string (hemat token saat prompt)
- `base_servings` — porsi acuan takaran (default 2), untuk scaling shopping list
- `is_active` — soft hide tanpa delete

### recipe_ingredients
- `category` — enum: vegetables/meat/dairy/spices/dry_goods (untuk grouping shopping list)
- `price_idr` — estimasi harga komponen (porsi dasar), dijumlah jadi estimasi total

### weekly_plans + meal_entries
- Menggantikan `localStorage`. Satu plan per user per minggu (`week_start_date`).
- `meal_entries` unik per (plan, day_of_week, meal_type) → mencegah slot dobel.
- Kolom snapshot (`title`, `image_url`, dll) agar kartu tetap tampil walau resep diubah.

### orders + order_items
- `id` = `CP-YYYYMMDD-XXXX` via `generate_order_id()` (default value kolom).
- `plan_id` → link ke `generated_plans` (tracable balik ke hasil AI).
- `delivery_fee` default 15000 (selaras `DELIVERY_FEE` di ShoppingList.jsx).

### ai_providers (provider-agnostic core)
- Simpan base_url, api_key, model, temperature, max_tokens per provider.
- `is_active` & `is_fallback` masing-masing unik (partial unique index).
- **LOCKDOWN**: `revoke all from anon, authenticated`. Hanya service_role baca.

### generated_plans
- `input_hash` (sha256 input) → caching (ADR-009).
- `output_json` → hasil AI. `reasoning_content` → chain-of-thought (ditampilkan).
- Tracking: `tokens_input/output`, `cost_usd`, `latency_ms`, `status`.

### ai_usage_log
- Log per request untuk rate limit + monitoring biaya.

## Functions

| Function | Tujuan | Keamanan |
|----------|--------|----------|
| `set_updated_at()` | Trigger auto-update updated_at | `search_path=''` |
| `generate_order_id()` | Generate ID CP-YYYYMMDD-XXXX | SECURITY DEFINER, revoke dari API |
| `is_admin()` | Cek caller admin (untuk RLS) | SECURITY DEFINER, grant authenticated |
| `handle_new_user()` | Auto-create profile saat signup (existing) | SECURITY DEFINER |

## Catatan Teknis
- `auth.uid()` dibungkus `(select auth.uid())` di policy agar dievaluasi sekali
  (optimasi Supabase advisor).
- `overriding system value` dipakai di seed agar id resep eksplisit (1-6), lalu
  `setval` reset sequence supaya insert manual berikutnya tidak bentrok.

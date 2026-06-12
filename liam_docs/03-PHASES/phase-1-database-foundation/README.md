---
phase: 1
status: done
last-updated: 2026-06-11
estimated-effort: 3-5 hari
dependencies: [phase-0]
---

# Phase 1 — Database Foundation

## Goal
Membangun skema database lengkap untuk seluruh fitur MVP: bank resep, rencana
mingguan, order, dan tabel AI (provider config, generated plans, usage log).
Lengkap dengan RLS dan seed data awal.

## Deliverables
- ✅ 5 migration baru (recipes, weekly_plans, ai_tables, orders, profiles.role)
- ✅ 11 tabel total di DB local
- ✅ Function `generate_order_id()`, `is_admin()`, `set_updated_at()`
- ✅ RLS policy semua tabel
- ✅ Seed 6 resep + 52 ingredients + 2 provider config

## File yang Dibuat

### Migrations (`supabase/migrations/`)
| File | Isi |
|------|-----|
| `20260611000000_create_recipes.sql` | recipes + recipe_ingredients + RLS read publik |
| `20260611000001_create_weekly_plans.sql` | weekly_plans + meal_entries + RLS owner |
| `20260611000002_create_ai_tables.sql` | ai_providers + generated_plans + ai_usage_log |
| `20260611000003_create_orders.sql` | orders + order_items + generate_order_id() |
| `20260611000004_profiles_role_and_admin.sql` | profiles.role + is_admin() + admin policies |

> Urutan penting: ai_tables (000002) sebelum orders (000003) karena
> `orders.plan_id` mereferensi `generated_plans`.

### Seed (`supabase/seed.sql`)
- 6 resep dari `mockRecipes.js` → tabel recipes + recipe_ingredients
- 2 config provider AI (Sonnet primary + Gemini fallback) dengan key placeholder

## Keputusan Penting
- Lihat [migrations.md](./migrations.md) untuk detail skema.
- Lihat [rls-policies.md](./rls-policies.md) untuk reasoning policy.
- Lihat [seed-data.md](./seed-data.md) untuk strategi seed.

## Definition of Done
- `supabase db reset` sukses tanpa error ✅
- 11 tabel terverifikasi via `\dt` ✅
- 6 resep + provider config ter-seed ✅

Lihat [verification.md](./verification.md).

---
phase: architecture
status: done
last-updated: 2026-06-11
---

# Security Model

Keamanan CookPlan dibangun berlapis (**defense in depth**) — ngga ngandelin satu
mekanisme doang. Kalau satu lapis bocor, masih ada lapis lain.

## Lapisan keamanan

```
┌─────────────────────────────────────────────────────────┐
│ 1. Supabase Auth (JWT)        – siapa user ini?           │
├─────────────────────────────────────────────────────────┤
│ 2. RLS per tabel             – user cuma akses datanya    │
├─────────────────────────────────────────────────────────┤
│ 3. Admin role (is_admin())   – fitur admin terbatas       │
├─────────────────────────────────────────────────────────┤
│ 4. Edge Function proxy       – AI key ngga ke browser     │
├─────────────────────────────────────────────────────────┤
│ 5. Function grant hardening  – cabut akses default        │
├─────────────────────────────────────────────────────────┤
│ 6. Secrets management        – Vault/env buat prod        │
└─────────────────────────────────────────────────────────┘
```

## 1. Supabase Auth (JWT)

Autentikasi pakai Supabase Auth. Tiap request bawa **JWT** yang diverifikasi
server. Edge Function `generate-plan` langkah pertamanya verifikasi JWT (auth)
sebelum ngapa-ngapain.

## 2. Row Level Security (RLS) per tabel

RLS aktif di tiap tabel, dengan pola sesuai sensitivitas data:

| Tabel | Policy |
|-------|--------|
| `weekly_plans`, `meal_entries`, `orders`, `order_items`, `generated_plans`, `ai_usage_log` | **owner-only** — user cuma bisa baca/tulis baris miliknya (`user_id = auth.uid()`) |
| `recipes`, `recipe_ingredients` | **read publik** — semua orang boleh lihat katalog |
| `ai_providers` | **lockdown** — user biasa ngga bisa baca sama sekali (ada api_key di dalemnya) |

> Detail policy lengkap: `liam_docs/04-REFERENCE/01-rls-policies-full.md`.

## 3. Admin role

- Role disimpen di `profiles.role` (`admin` / `user`).
- Helper function **`is_admin()`** dipake di policy biar ringkas & cepat.
- `is_admin()` di-`revoke` dari `public`/`anon`, di-`grant` cuma ke
  `authenticated` (migration `20260611000004`).
- Fitur admin (mis. kelola `ai_providers`) divalidasi `is_admin()` lewat Edge
  Function `admin-providers`.

## 4. API key AI ngga pernah ke browser

Ini lapis krusial:

- Key AI ada di `ai_providers`, dibaca cuma sama Edge Function via
  `service_role`.
- Di admin UI (`/admin/ai`), key **di-mask** — admin ngga lihat key utuh.
- Frontend manggil AI selalu **lewat Edge Function** (proxy), ngga pernah hit
  API vendor langsung.

> Lihat `04-ai-integration-design.md` seksi keamanan.

## 5. Function grant hardening

Fungsi DB sensitif dicabut akses default-nya, di-grant selektif:

- `generate_order_id()` — awalnya di-`revoke` dari `public/anon/authenticated`,
  lalu di-fix (`20260611000005`) jadi `grant execute ... to authenticated`
  (revoke tetap dari `anon`, karena order butuh login).
- `is_admin()` — grant cuma ke `authenticated`.

Prinsipnya **least privilege**: kasih akses seminimal yang dibutuhin.

## 6. Secrets management

- **Lokal (dev):** kredensial dari `supabase start`, key AI placeholder di
  `seed.sql` / diisi via `/admin/ai`.
- **Prod (nanti):** AI key & secret lewat **Vault / env (dashboard)**, BUKAN di
  git. Lihat `liam_docs/05-OPERATIONS/02-future-production-deploy.md`.
- **Anon key** boleh di frontend (dibatasi RLS). **service_role key** ngga boleh
  ada di frontend sama sekali.

## Defense in depth — ringkasan

Bahkan kalau anon key bocor (yang emang public), penyerang tetep dibatasi RLS
(cuma bisa baca katalog publik). AI key dilindungi di server. Order ID ngga bisa
ditebak/generate sembarangan karena grant dibatasi. Tiap lapis nutup celah yang
beda.

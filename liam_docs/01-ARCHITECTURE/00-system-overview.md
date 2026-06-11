---
phase: architecture
status: in-progress
last-updated: 2026-06-11
---

# 🏛️ System Overview

## Diagram Arsitektur Penuh

```
┌──────────────────────────────────────────────────────────────────────┐
│                       REACT CLIENT (Vite SPA)                          │
│                          Deploy: Vercel                                │
│                                                                        │
│  Pages (public)          Pages (protected)        Admin                │
│  ┌──────────────┐       ┌──────────────────┐    ┌──────────────┐      │
│  │ Landing      │       │ AuthPage         │    │ /admin/ai    │      │
│  │ PreRegister  │       │ RecipeCatalog    │    │ providers    │      │
│  │ Privacy/Terms│       │ WeeklyPlanner    │    │ mgmt         │      │
│  │ Help/About   │       │ ShoppingList     │    └──────────────┘      │
│  └──────────────┘       │ UserProfile      │                          │
│                         │ GeneratePlan ★   │  ★ = fitur baru          │
│                         │ GenerateResult ★ │                          │
│                         └──────────────────┘                          │
│                                                                        │
│  Service Layer (src/services/)                                         │
│  ┌────────────┬────────────┬─────────────┬──────────────┐             │
│  │ recipe     │ plan       │ order       │ ai           │             │
│  │ Service    │ Service    │ Service     │ Service ★    │             │
│  └────────────┴────────────┴─────────────┴──────────────┘             │
└─────────┬──────────────────────────────────────┬───────────────────────┘
          │ supabase-js (CRUD + Auth)             │ functions.invoke()
          ▼                                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        SUPABASE (local / prod)                         │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐   │
│  │ Auth         │  │ PostgreSQL   │  │ Edge Functions (Deno)      │   │
│  │ (JWT)        │  │              │  │                            │   │
│  │              │  │ profiles     │  │ ┌────────────────────────┐ │   │
│  │              │  │ recipes      │  │ │ generate-plan ★        │ │   │
│  │              │  │ recipe_ingr  │  │ │  1. auth + rate limit  │ │   │
│  │              │  │ weekly_plans │  │ │  2. validate input     │ │   │
│  │              │  │ meal_entries │◀─┼─┤  3. retrieve recipes   │ │   │
│  │              │  │ orders       │  │ │  4. build prompt       │ │   │
│  │              │  │ order_items  │  │ │  5. call AI ───────────┼─┼───┼──▶ AI Provider
│  │              │  │ ai_providers │◀─┼─┤  6. parse + validate   │ │   │   (9router/
│  │              │  │ generated_   │  │ │  7. save + return      │ │   │    enowxlabs/
│  │              │  │   plans      │  │ └────────────────────────┘ │   │    Gemini)
│  │              │  │ ai_usage_log │  │                            │   │
│  │              │  │ subscriptions│  │ ┌────────────────────────┐ │   │
│  │              │  │              │  │ │ create-order ★ (opt)   │ │   │
│  │              │  │ + RLS semua  │  │ └────────────────────────┘ │   │
│  │              │  │ + Vault      │  │                            │   │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ (Fitur 3: Order)
                          ┌──────────────┐
                          │  WhatsApp    │  wa.me/62xxx?text=...
                          │  Admin       │  + order_id unik
                          └──────────────┘
```

## Komponen Utama

### 1. React Client
- SPA dengan React Router. Public routes (landing, pre-register) + protected routes
  (aplikasi penuh) + admin routes.
- Service layer abstraksi semua komunikasi ke Supabase.

### 2. Supabase
- **Auth**: email/password + Google OAuth (sudah ada di AuthContext).
- **PostgreSQL**: semua data + RLS.
- **Edge Functions**: proxy AI (provider-agnostic), order creation.
- **Vault**: simpan secret AI key.

### 3. AI Provider (eksternal)
- Diakses lewat Edge Function. Config dari tabel `ai_providers`.
- Primary: Sonnet 4.5 thinking. Fallback: Gemini.

### 4. WhatsApp (eksternal)
- Bukan integrasi API, tapi deep link `wa.me` dengan teks terformat + order ID.

## Boundary Keamanan

- **AI API key**: hanya di Edge Function env/Vault, tidak pernah ke browser.
- **`ai_providers` table**: revoke dari anon/authenticated, hanya service_role.
- **User data**: RLS `auth.uid() = user_id`.
- **Anon key**: aman di browser karena RLS aktif.

## Mode Lingkungan

| Lingkungan | DB | Edge Func | Dipakai untuk |
|------------|-----|-----------|---------------|
| **Local** | `localhost:54322` | `localhost:54321/functions/v1` | Development (sekarang) |
| **Production** | `phdbbiydrjwxlehdfubh` | Supabase cloud | Future (belum disentuh) |

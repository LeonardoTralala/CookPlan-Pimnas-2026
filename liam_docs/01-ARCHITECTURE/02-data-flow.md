---
phase: architecture
status: done
last-updated: 2026-06-11
---

# Data Flow

Dokumen ini ngegambarin alur data CookPlan dari ujung ke ujung. Ada tiga flow
utama: **Generate**, **Plan Persistence**, dan **Order**.

---

## (A) Generate Flow

Dari user isi form sampe hasil foodplan tampil. Inti logikanya ada di Edge
Function `generate-plan` (server-side, supaya AI key & rate limit aman).

```
┌──────────────┐   form     ┌──────────────────┐  invoke   ┌─────────────────────────┐
│ GeneratePlan │ ─────────▶ │ aiService        │ ────────▶ │ Edge Function            │
│ (wizard UI)  │            │ .generatePlan()  │           │ generate-plan            │
└──────────────┘            └──────────────────┘           └───────────┬─────────────┘
                                                                        │
      ┌─────────────────────────────────────────────────────────────────┘
      │ 12 langkah (server)
      ▼
  1. Auth            – verifikasi JWT user
  2. Rate limit      – cek ai_usage_log, max 20/hari
  3. Validate input  – validateInput()
  4. Cache check     – cari input_hash di generated_plans → kalau ada, return cache
  5. Retrieve recipes– query SQL ke recipes (filter tag diet bila cocok)
  6. Get provider    – ambil ai_providers aktif + fallback (service_role)
  7. Build prompt    – susun messages (schema-in-prompt)
  8. Call AI         – coba primary, gagal → fallback Gemini
  9. Parse defensive – safeJsonExtract, retry 1x bila JSON rusak
 10. Validate semantic – validateOutput() vs id resep valid
 11. Pantry subtract – subtractPantry() kurangi bahan yg user udah punya
 12. Persist + log   – simpan generated_plans, tulis ai_usage_log
      │
      ▼
┌──────────────────┐  return plan + reasoning + meta
│ GenerateResult   │ ◀──────────────────────────────
│ (render hasil)   │
└──────────────────┘
```

> Catatan urutan asli di kode: cache check (langkah 4) ada **sebelum** retrieve
> recipes & call AI. Kalau cache hit, langsung return tanpa manggil AI sama
> sekali — itulah kunci hemat biaya. Lihat
> `04-ai-integration-design.md` buat detail caching & fallback.

Titik kode kunci:

- UI wizard: `src/pages/GeneratePlan.jsx`
- Client call: `src/services/aiService.js:26` (`generatePlan`)
- Server: `supabase/functions/generate-plan/index.ts`
- Validasi & pantry: `supabase/functions/_shared/validate.ts`
- Render hasil: `src/pages/GenerateResult.jsx`

---

## (B) Plan Persistence Flow

Nyimpen & baca rencana mingguan. State di frontend dijaga `PlanContext`, yang
ngobrol ke DB lewat `planService`.

```
┌─────────────┐        ┌──────────────┐         ┌────────────────────────┐
│ Komponen UI │ ◀────▶ │ PlanContext  │ ◀─────▶ │ planService            │
│ (Planner..) │  hook  │ (state plan) │  async  │ getCurrentPlan/setSlot │
└─────────────┘        └──────────────┘         └───────────┬────────────┘
                                                            │
                                                            ▼
                                          ┌──────────────────────────────┐
                                          │ weekly_plans (1/user/minggu)  │
                                          │ meal_entries (slot per hari+  │
                                          │   meal, FK ke weekly_plans)   │
                                          └──────────────────────────────┘
```

- `weekly_plans`: satu baris per user per minggu (`getCurrentWeekStart`).
- `meal_entries`: satu baris per slot (hari × tipe makan), FK ke `weekly_plans`.
- `entriesToPlanShape()` ngubah baris DB jadi shape state frontend.

Titik kode kunci:

- Context: `src/context/PlanContext.jsx`
- Service: `src/services/planService.js` (`getCurrentPlan:47`, `setSlot:84`)

---

## (C) Order Flow

Dari hasil generate ke pemesanan via WhatsApp.

```
┌────────────────┐         ┌────────────┐        ┌──────────────────────┐
│ GenerateResult │ ──────▶ │ OrderPage  │ ─────▶ │ orderService         │
│  (tombol order)│         │            │        │ .createOrder()       │
└────────────────┘         └────────────┘        └──────────┬───────────┘
                                                            │ insert
                                                            ▼
                                              ┌──────────────────────────┐
                                              │ orders                    │
                                              │  id = CP-YYYYMMDD-XXXX     │
                                              │  (generate_order_id())     │
                                              │ order_items (per item)     │
                                              └──────────┬─────────────────┘
                                                         │ build text + url
                                                         ▼
                                              ┌──────────────────────────┐
                                              │ WhatsApp deep link        │
                                              │ wa.me/<WA_ADMIN_NUMBER>   │
                                              │ ?text=<order terformat>   │
                                              └──────────────────────────┘
```

- ID order otomatis `CP-YYYYMMDD-XXXX` dari fungsi DB `generate_order_id()`.
- `buildWhatsappText()` nyusun teks order, `buildWhatsappUrl()` bikin deep link
  ke nomor admin (`WA_ADMIN_NUMBER`).

Titik kode kunci:

- Service: `src/services/orderService.js` (`createOrder:22`, `buildWhatsappUrl:89`)
- Halaman: `src/pages/OrderPage.jsx`
- Fungsi ID: migration `20260611000003_create_orders.sql`

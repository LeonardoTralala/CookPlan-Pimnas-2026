---
phase: 2
status: done
last-updated: 2026-06-11
---

# Phase 2 — Routing Changes

## Sebelum (mode pre-register)
`App.jsx` hanya 6 route publik. Semua route lain → redirect ke `/`.
Auth & fitur aplikasi di-disable.

```
/           → LandingPage
/register   → PreRegister
/privacy    → PrivacyPolicy
/help       → HelpCenter
/terms      → TermsOfService
/about      → TeamProfile
*           → Navigate("/")
```

## Sesudah (aplikasi penuh)
```
PUBLIK:
/           → LandingPage
/register   → PreRegister
/privacy    → PrivacyPolicy
/help       → HelpCenter
/terms      → TermsOfService
/about      → TeamProfile
/auth       → AuthPage  (login/register/forgot/reset)

TERPROTEKSI (di balik <ProtectedRoute> + <AppShell>):
/generate         → GeneratePlan   (Phase 4)
/generate/:planId → GenerateResult (Phase 4)
/catalog          → CatalogPage    (RecipeCatalog)
/planner          → PlannerPage    (WeeklyPlanner)
/shopping         → ShoppingPage   (ShoppingList)
/profile          → UserProfile

*           → Navigate("/")
```

## ProtectedRoute
Komponen existing (`src/components/ProtectedRoute.jsx`). Saat sesi sedang dipulihkan
tampilkan loader; bila belum login redirect ke `/auth` dengan state `from` (agar
setelah login balik ke halaman tujuan).

## AppShell (baru)
Layout pembungkus halaman terproteksi:
- **Desktop**: top-nav dengan 5 item + tombol Keluar.
- **Mobile**: bottom-nav 5 item (Generate, Katalog, Rencana, Belanja, Profil) +
  logout di header. Mengikuti rule `bottom-nav-limit` (maks 5) dari UI/UX review.
- Badge jumlah slot terisi di item Belanja (dari `plannedCount`).
- `<main id="main-content" tabIndex={-1}>` untuk fokus a11y saat route change
  (dipakai ScrollToTop existing).

## Navigasi `onNavigate`
LandingPage & halaman publik tetap pakai `handleNavigate(path)`. CTA landing yang
dulu mengarah ke `/register` (pre-register) tetap berlaku — keputusan flow funnel
landing tidak diubah di fase ini.

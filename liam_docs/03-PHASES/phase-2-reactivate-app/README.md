---
phase: 2
status: done
last-updated: 2026-06-11
estimated-effort: 2-3 hari
dependencies: [phase-1]
---

# Phase 2 — Reactivate App + Service Layer

## Goal
Menghidupkan kembali aplikasi penuh (auth + katalog + planner + belanja + profil)
yang sebelumnya di-disable saat fase pre-register, dengan data dari Supabase
(bukan mock/localStorage).

## Deliverables
- ✅ Service layer: recipeService, planService, orderService, aiService
- ✅ RecipeCatalog, WeeklyPlanner, ShoppingList, UserProfile pakai data DB
- ✅ PlanContext sinkron ke DB saat login (fallback localStorage saat belum login)
- ✅ Routing aplikasi aktif kembali (ProtectedRoute + AppShell)
- ✅ AuthPage self-register diaktifkan
- ✅ Lint + build pass, RLS terverifikasi

## File yang Dibuat / Diubah

### Baru
| File | Fungsi |
|------|--------|
| `src/services/recipeService.js` | getRecipes, getRecipeById, getRecipesByIds (alias camelCase) |
| `src/services/planService.js` | getCurrentPlan, setSlot, removeSlot (per-user DB) |
| `src/services/orderService.js` | createOrder, buildWhatsappUrl/Text |
| `src/services/aiService.js` | generatePlan (invoke Edge Func), history, usage |
| `src/components/AppShell.jsx` | Layout app: top-nav (desktop) + bottom-nav (mobile) |
| `src/pages/CatalogPage.jsx` | Wrapper RecipeCatalog ↔ PlanContext |
| `src/pages/PlannerPage.jsx` | Wrapper WeeklyPlanner ↔ PlanContext |
| `src/pages/ShoppingPage.jsx` | Wrapper ShoppingList ↔ PlanContext |
| `src/pages/GeneratePlan.jsx` | Placeholder (diisi Phase 4) |
| `src/pages/GenerateResult.jsx` | Placeholder (diisi Phase 4) |

### Diubah
| File | Perubahan |
|------|-----------|
| `src/App.jsx` | Routing penuh: public + protected (AppShell) |
| `src/pages/AuthPage.jsx` | `ALLOW_SELF_REGISTER = true` |
| `src/context/PlanContext.jsx` | Sinkron DB via planService + migrasi localStorage |
| `src/pages/RecipeCatalog.jsx` | Fetch getRecipes + loading/error state |
| `src/pages/WeeklyPlanner.jsx` | Picker & rekomendasi dari getRecipes |
| `src/pages/ShoppingList.jsx` | buildShoppingList pakai recipe index dari DB |
| `src/pages/UserProfile.jsx` | Saved recipes dari getRecipes |

## Detail Penting
- Lihat [service-layer.md](./service-layer.md) untuk API tiap service.
- Lihat [routing-changes.md](./routing-changes.md) untuk diff App.jsx.

## Catatan ESLint 10
Rule baru `react-hooks/set-state-in-effect` melarang setState sinkron di body
effect. Solusi: hapus `setLoading(true)` redundan (init sudah true) & bungkus
reset state logout dengan `queueMicrotask`.

## Definition of Done
- `npm run lint` bersih ✅
- `npm run build` sukses ✅
- REST API recipes return data + nested ingredients ✅
- ai_providers ditolak untuk anon (permission denied) ✅

Lihat [verification.md](./verification.md).

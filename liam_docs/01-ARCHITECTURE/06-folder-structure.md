---
phase: architecture
status: done
last-updated: 2026-06-11
---

# Struktur Folder

Peta folder proyek CookPlan biar gampang nyari "ini ngurusin apa, taronya di
mana". Tiga area besar: `src/` (frontend), `supabase/` (backend), `liam_docs/`
(dokumentasi).

## Pohon ringkas

```
CookPlan/
├── src/                      # frontend React 19 + Vite
│   ├── components/           # komponen UI reusable
│   ├── context/              # React Context (state global)
│   ├── hooks/                # custom hooks
│   ├── lib/                  # setup library (client Supabase)
│   ├── pages/                # halaman per-route
│   │   └── admin/            # halaman khusus admin
│   ├── services/             # lapisan akses data (panggil Supabase)
│   └── utils/                # helper murni / data statis
│
├── supabase/                 # backend (DB + Edge Functions)
│   ├── migrations/           # 7 file migration (DDL, urut tanggal)
│   ├── functions/
│   │   ├── generate-plan/    # Edge Function generate foodplan AI
│   │   ├── admin-providers/  # Edge Function kelola ai_providers
│   │   └── _shared/          # kode dipakai bareng antar function
│   └── seed.sql              # data awal (6 resep + 2 ai_providers)
│
└── liam_docs/                # dokumentasi proyek (markdown)
```

## `src/` — Frontend

| Folder | Peran | Contoh isi |
|--------|-------|-----------|
| `components/` | Komponen UI reusable, ngga terikat satu route | `Navbar.jsx`, `RecipeCard.jsx`, `Modal.jsx` |
| `context/` | State global via React Context | `AuthContext.jsx`, `PlanContext.jsx` |
| `hooks/` | Custom hooks pembungkus context | `useAuth.js`, `usePlan.js` |
| `lib/` | Inisialisasi library pihak ketiga | `supabase.js` (client Supabase) |
| `pages/` | Satu file = satu halaman/route | `GeneratePlan.jsx`, `GenerateResult.jsx`, `OrderPage.jsx` |
| `pages/admin/` | Halaman khusus admin (di-protect) | `AIProviders.jsx` |
| `services/` | Lapisan akses data — semua call ke Supabase/Edge Function lewat sini | `aiService.js`, `planService.js`, `orderService.js`, `recipeService.js`, `adminService.js` |
| `utils/` | Helper murni & data statis | `scroll.js`, `userConfig.js`, `recipes.js` |

> Pola penting: **komponen/halaman ngga manggil Supabase langsung**. Mereka lewat
> `services/`. Ini misahin UI dari logika data, gampang dites & diganti.

## `supabase/` — Backend

| Folder/File | Peran |
|-------------|-------|
| `migrations/` | Definisi skema DB (tabel, function, RLS) dalam SQL, urut by tanggal. 7 file (20260602–20260611) |
| `functions/generate-plan/` | Edge Function inti: generate foodplan AI (auth, rate limit, cache, call AI, validasi, persist) |
| `functions/admin-providers/` | Edge Function buat admin kelola `ai_providers` (cek `is_admin()`) |
| `functions/_shared/` | Kode dipakai bareng: `aiAdapter.ts` (call AI + estimateCost), `prompt.ts` (susun prompt), `validate.ts` (validasi input/output + pantry) |
| `seed.sql` | Data awal yang dimuat pas `supabase db reset`: 6 resep + 2 ai_providers |

## `liam_docs/` — Dokumentasi

Dokumentasi proyek per-fase, dikelompokin per folder bernomor:

| Folder | Isi |
|--------|-----|
| `00-OVERVIEW/` | Gambaran umum proyek |
| `01-ARCHITECTURE/` | Desain sistem (termasuk dokumen ini) |
| `02-SETUP/` | Cara setup awal |
| `03-PHASES/` | Catatan per fase pengembangan |
| `04-REFERENCE/` | Referensi detail (schema penuh, RLS, API, dll) |
| `05-OPERATIONS/` | Operasional: workflow harian, backup, deploy, runbook, biaya |

## Alur baca yang disaranin

Mau ngerti **gimana data ngalir** → `02-data-flow.md`. Mau **struktur DB** →
`03-database-schema.md` (ringkas) atau `04-REFERENCE/00-database-schema-full.md`
(penuh). Mau **operasional sehari-hari** → `05-OPERATIONS/00-local-dev-workflow.md`.

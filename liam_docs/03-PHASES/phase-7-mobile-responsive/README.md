---
phase: 7
status: done
last-updated: 2026-06-11
estimated-effort: 5-7 hari
dependencies: [phase-2, phase-4, phase-5, phase-6]
---

# Phase 7 — Mobile Responsive (Fokus Utama)

## Goal
Memastikan seluruh aplikasi nyaman & maksimal di mobile (target user mayoritas HP).

## Prinsip Desain Mobile yang Diterapkan
Mengacu pada 3 dokumen review existing (`docs/UI_UX_REVIEW*.md`):
- **Bottom navigation** (maks 5 item) di mobile, top-nav di desktop → AppShell.
- **Touch target ≥ 44px** — semua tombol baru pakai `w-11 h-11` / `py-3`.
- **Viewport `dvh`** (bukan `vh`) — hindari konten terpotong address bar.
- **Fluid typography** — token `clamp()` di `index.css` (sudah ada).
- **Safe-area iOS** — utilitas `pb-safe-*` & `bottom-above-nav`.
- **Bottom sheet** di mobile untuk modal (ModalSheet existing).
- **Input ≥ 16px** (`text-base`) — hindari auto-zoom Safari iOS.

## Komponen Baru = Mobile-First by Design
Semua halaman fase ini dibangun mobile-first sejak awal:
| Halaman | Pola Mobile |
|---------|-------------|
| AppShell | Bottom-nav 5 item + safe-area, top-nav desktop |
| GeneratePlan | Wizard 1 kolom, chip wrap, stepper 44px, input text-base |
| GenerateResult | Kartu menu stack vertikal, accordion reasoning, ModalSheet detail |
| OrderPage | Form 1 kolom, input text-base, tombol full-width |
| AIProviders | List stack, form bottom-sheet di mobile |

## Fix yang Dilakukan
| Isu | Lokasi | Fix |
|-----|--------|-----|
| Sticky total bar ShoppingList nabrak bottom-nav | ShoppingList.jsx:371 | `bottom-0` → `bottom-above-nav md:bottom-0` |
| Clearance konten ShoppingList kurang | ShoppingList.jsx:172 | `pb-28` → `pb-44` (ruang total bar + nav) |
| AppShell main clearance untuk bottom-nav | AppShell.jsx | `pb-20 md:pb-0` |

## Yang Sudah Baik (existing, dipertahankan)
- WeeklyPlanner generate button sudah `bottom-above-nav`.
- Semua page utama `min-h-dvh`.
- RecipeCatalog `pb-24` + ModalSheet bottom sheet + input search text-base.
- `index.css`: touch-action manipulation, prefers-reduced-motion, fluid type clamp().

## Breakpoint Strategy
- Mobile: < 768px (default, 1 kolom, bottom-nav)
- Tablet/Desktop: md (768px+) — top-nav, multi kolom
- Container max: `--spacing-container-max` (1280px)

## Definition of Done
- Tidak ada bar/nav yang tumpang tindih di mobile ✅
- Touch target ≥ 44px di komponen baru ✅
- Lint + build bersih ✅
- Routes render 200 (landing, auth) ✅

## Catatan untuk Phase 8
Pengujian device fisik (375px iPhone SE, 360px Android, 414px) + screen reader
dilakukan di Phase 8. Audit visual real perlu mata manusia di device asli.

Lihat [verification.md](./verification.md).

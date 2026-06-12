---
phase: reference
status: done
last-updated: 2026-06-11
---

# Design Tokens (Tailwind)

Semua design token CookPlan didefinisikan di `src/index.css` lewat blok `@theme` (Tailwind v4). Token-token ini otomatis jadi utility class (mis. `--color-primary` → `bg-primary`/`text-primary`). Palet warnanya tema hijau dari desain Stitch.

---

## Warna

### Primary (hijau)

| Token | Hex | Utility |
|---|---|---|
| `--color-primary` | `#375219` | `bg-primary`, `text-primary` |
| `--color-primary-container` | `#4e6b2f` | `bg-primary-container` |
| `--color-on-primary` | `#ffffff` | `text-on-primary` |
| `--color-on-primary-container` | `#c8eaa0` | `text-on-primary-container` |

### Secondary

| Token | Hex |
|---|---|
| `--color-secondary` | `#546527` |
| `--color-secondary-container` | `#d4e89c` |
| `--color-on-secondary-container` | `#58692b` |

### Surface

| Token | Hex |
|---|---|
| `--color-surface` | `#efffd9` |
| `--color-surface-cream` | `#d9dfb0` |
| `--color-surface-variant` | `#d7e9c0` |
| `--color-surface-container-lowest` | `#ffffff` |
| `--color-surface-container-low` | `#e8fad1` |
| `--color-surface-container` | `#e2f4cb` |
| `--color-surface-container-high` | `#ddeec6` |
| `--color-surface-container-highest` | `#d7e9c0` |

### Teks & outline

| Token | Hex |
|---|---|
| `--color-on-surface` | `#121f06` |
| `--color-on-surface-variant` | `#44483d` |
| `--color-canvas-white` | `#fbfaf9` |
| `--color-outline` | `#74796c` |
| `--color-outline-variant` | `#c4c8b9` |
| `--color-inverse-surface` | `#273419` |
| `--color-inverse-primary` | `#afd189` |
| `--color-surface-tint` | `#4a672b` |

### Semantik (status)

| Token | Hex | Pemakaian |
|---|---|---|
| `--color-success-green` | `#34c759` | sukses |
| `--color-error` | `#ba1a1a` | error |
| `--color-warning` | `#f59e0b` | amber-500, state medium |
| `--color-error-light` | `#fca5a5` | rose-300, teks error di bg gelap |

---

## Font

| Token | Value |
|---|---|
| `--font-sans` | `"Plus Jakarta Sans", "Inter", sans-serif` |
| `--font-headline-xl/lg/md` | `"Plus Jakarta Sans", sans-serif` |
| `--font-body-lg/md` | `"Inter", sans-serif` |
| `--font-label-md/sm` | `"Inter", sans-serif` |

Aturan praktis: **Plus Jakarta Sans** buat heading, **Inter** buat body & label. `body` default ke Inter.

---

## Tipografi Fluid (clamp)

Ukuran font headline & body pakai `clamp()` biar responsif tanpa breakpoint.

| Token | clamp() | line-height | weight |
|---|---|---|---|
| `--text-headline-xl` | `clamp(1.875rem, 1.2rem + 3.4vw, 3rem)` | 1.1 | 700 |
| `--text-headline-lg` | `clamp(1.5rem, 1.1rem + 2vw, 2.25rem)` | 1.2 | 700 |
| `--text-headline-md` | `clamp(1.25rem, 1rem + 1.2vw, 1.5rem)` | 1.3 | 600 |
| `--text-body-lg` | `clamp(1rem, 0.9rem + 0.5vw, 1.125rem)` | 1.6 | — |
| `--text-body-md` | `clamp(0.875rem, 0.8rem + 0.375vw, 1rem)` | 1.6 | — |
| `--text-label-md` | `0.875rem` (fixed) | 1.4 | — |
| `--text-label-sm` | `0.75rem` (fixed) | 1.4 | — |

Pakai sebagai `text-headline-xl`, `text-body-md`, dst.

---

## Radius

| Token | Value | Pemakaian |
|---|---|---|
| `--radius-panel` | `2rem` (32px) | modal, sidebar panel, featured card |

---

## Spacing / Layout

| Token | Value | Pemakaian |
|---|---|---|
| `--spacing-container-max` | `1280px` | lebar maksimal kontainer |
| `--spacing-margin-mobile` | `20px` | margin tepi mobile |
| `--spacing-margin-desktop` | `40px` | margin tepi desktop |
| `--spacing-gutter` | `24px` | jarak antar kolom |

---

## Animasi

| Token | Value |
|---|---|
| `--animate-fade-in` | `fade-in 0.3s ease-out` |
| `--animate-slide-up` | `slide-up 0.32s cubic-bezier(0.16, 1, 0.3, 1)` |

Keyframes:
- `fade-in`: opacity 0→1 + translateY 8px→0.
- `slide-up`: translateY 100%→0 (buat bottom sheet/modal).

Keduanya dihormati `prefers-reduced-motion: reduce` — durasi dipangkas ke `0.01ms` dan `fade-in` langsung muncul di state akhir.

---

## Custom Utilities (`@utility`)

| Utility | Efek |
|---|---|
| `hide-scrollbar` | sembunyikan scrollbar (Firefox, IE, WebKit) |
| `recipe-card-shadow` | shadow hijau halus + transition; lebih dalam saat hover |
| `pb-safe-2` | `padding-bottom: calc(0.5rem + safe-area-inset-bottom)` |
| `pb-safe-4` | `calc(1rem + safe-area-inset-bottom)` |
| `pb-safe-6` | `calc(1.5rem + safe-area-inset-bottom)` |
| `bottom-above-nav` | `bottom: calc(3.5rem + safe-area-inset-bottom)` (FAB di atas bottom nav) |
| `section-padding` | `padding-block: clamp(3.5rem, 1.5rem + 10vw, 6rem)` |

> `pb-safe-*` & `bottom-above-nav` butuh `viewport-fit=cover` di meta viewport buat iOS safe area.

---

## Class biasa (bukan @theme/@utility)

| Class | Efek |
|---|---|
| `.hero-gradient` | linear-gradient `#fbfaf9 → #efffd9` (135deg) |
| `.image-reveal` | transition transform 0.8s; `scale(1.02)` saat hover (dimatikan di reduced-motion) |
| `.material-symbols-outlined` | setting font Material Symbols (FILL 0); varian `.fill` → FILL 1 |

---

## Catatan tap behavior

`body` dan elemen interaktif (`button, a, [role="button"], input, select, textarea, label`) di-set `touch-action: manipulation` buat ngilangin delay tap ~300ms dan cegah double-tap zoom gak sengaja.

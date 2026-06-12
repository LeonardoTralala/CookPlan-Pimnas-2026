---
phase: 9
status: done
last-updated: 2026-06-11
estimated-effort: 0.5 hari
dependencies: [phase-7]
---

# Phase 9 — PWA (Add to Home Screen / Installable App)

## Goal
CookPlan bisa di-"Tambah ke Layar Utama" di HP dan kebuka seperti aplikasi native
(fullscreen, ada ikon di home, tanpa address bar) — seperti Frappe.

## Apa Itu PWA?
Progressive Web App = web yang bisa di-install ke HP/desktop. Setelah di-install:
- Punya ikon sendiri di home screen
- Buka fullscreen (mode `standalone`, tanpa UI browser)
- Splash screen otomatis (dari manifest)
- Caching ringan (shell tetap kebuka walau offline sebentar)

## Deliverables
- ✅ `public/manifest.webmanifest` — metadata app (nama, ikon, warna, shortcuts)
- ✅ Icon PNG: 192, 512, maskable-512, apple-touch-180 (digenerate dari logo via sips)
- ✅ `public/sw.js` — service worker (cache-first aset, network-first navigasi)
- ✅ Registrasi SW di `main.jsx` (production only)
- ✅ Meta PWA di `index.html` (theme-color, apple-mobile-web-app-*)
- ✅ `src/components/InstallPrompt.jsx` — banner ajakan install (Android + iOS)

## File yang Dibuat/Diubah
| File | Isi |
|------|-----|
| `public/manifest.webmanifest` | Manifest PWA: standalone, theme #375219, 3 ikon, 3 shortcut |
| `public/icon-192.png` `icon-512.png` `icon-maskable-512.png` `apple-touch-icon.png` | Ikon app (dari logo, background cream #EFFFD9) |
| `public/sw.js` | Service worker caching |
| `index.html` | Link manifest + meta PWA + apple-touch-icon |
| `src/main.jsx` | Register service worker (PROD only) |
| `src/components/InstallPrompt.jsx` | Banner install |
| `src/App.jsx` | Render `<InstallPrompt />` |

## Strategi Service Worker
- **Aset statis same-origin** → cache-first + update background (cepat).
- **Navigasi (SPA)** → network-first, fallback shell "/" saat offline.
- **Request lintas origin** (Supabase, AI proxy, Google Fonts) → TIDAK di-cache
  (selalu butuh data fresh; cache hanya UI shell).
- Registrasi hanya di production (`import.meta.env.PROD`) — dev server tidak
  ter-cache (hindari bug stale saat development).

## Install Prompt
- **Android/Chrome**: tangkap `beforeinstallprompt` → tombol "Pasang".
- **iOS Safari**: tidak ada API install → tampilkan instruksi manual
  (Share → "Tambah ke Layar Utama") setelah 2.5 detik.
- Sembunyi otomatis bila sudah `standalone` (terpasang) atau user dismiss
  (disimpan di localStorage `pwa_install_dismissed`).

## Cara Test
PWA hanya jalan penuh di **production build** (SW tidak aktif di `npm run dev`):
```
npm run build && npm run preview
# buka http://localhost:4173
```
Verifikasi:
- `manifest.webmanifest`, `sw.js`, `icon-192.png` → HTTP 200 ✅
- Chrome DevTools → Application → Manifest: terbaca, installable
- Di HP: buka via HTTPS (atau localhost), muncul prompt / menu "Add to Home Screen"

> Catatan: install prompt Android & iOS hanya muncul di konteks **HTTPS** (atau
> localhost). Saat deploy ke Vercel (HTTPS otomatis), langsung berfungsi.

## Status: ✅ PHASE 9 DONE

Build bersih, semua aset PWA ter-serve (manifest/sw/icon HTTP 200), manifest valid
(standalone, 3 ikon). Siap di-install begitu di-deploy ke HTTPS.

## Catatan untuk Produksi
- Pastikan deploy di HTTPS (Vercel otomatis) — PWA wajib HTTPS.
- Kalau update SW (`sw.js`), naikkan versi `CACHE` (mis. `cookplan-v2`) agar cache
  lama dibersihkan.

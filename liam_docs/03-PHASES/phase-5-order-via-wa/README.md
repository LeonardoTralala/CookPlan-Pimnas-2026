---
phase: 5
status: done
last-updated: 2026-06-11
estimated-effort: 1-2 hari
dependencies: [phase-1, phase-4]
---

# Phase 5 — Order via WhatsApp

## Goal
Fitur 3 dari MVP: user pesan paket belanja → buat order (ID unik CP-...) →
buka WhatsApp dengan teks terformat untuk admin.

## Deliverables
- ✅ `OrderPage.jsx` — form alamat/kontak + ringkasan biaya + tombol WA
- ✅ Route `/order/:planId` (di balik ProtectedRoute + AppShell)
- ✅ `orderService.createOrder()` insert orders + order_items
- ✅ `buildWhatsappUrl()` — teks terformat + ID pesanan
- ✅ Lint + build pass

## Flow
```
GenerateResult (foodprep/full) → tombol "Pesan Paket Belanja"
  → /order/:planId
  → OrderPage: muat plan (sessionStorage / DB)
  → form: nama, WA, alamat, metode bayar, catatan
  → submit → createOrder() → orders.id = CP-YYYYMMDD-XXXX (via generate_order_id())
  → buildWhatsappUrl(order, items)
  → window.open(wa.me/<admin>?text=...)
  → redirect ke /profile
```

## Format Teks WhatsApp
```
Halo Cookplan! 👋

Aku mau pesan Paket *CP-20260611-0001*

📋 *Detail Pesanan:*
• Jenis: full
• Total: Rp 215.000
• Alamat: <alamat>
• Nama: <nama>

🛒 *Daftar Belanja:*
• Telur ayam 14 butir
• Beras merah 2 kg
...

Mohon konfirmasi kapan pesananku siap diantar 🙏
```

## ID Pesanan Unik
`orders.id` default `generate_order_id()` (PL/pgSQL, Phase 1):
- Format `CP-YYYYMMDD-XXXX` (XXXX = urutan hari itu, 4 digit).
- Digenerate server-side saat insert, tracable di dashboard admin.

## ⚠️ Konfigurasi Nomor WA Admin
`WA_ADMIN_NUMBER` di `src/services/orderService.js` masih placeholder
(`6281234567890`). Ganti dengan nomor WA admin CookPlan asli sebelum produksi.

## Definition of Done
- Form order + validasi jalan ✅
- createOrder insert + WA URL terbentuk ✅
- Lint + build bersih ✅
- Pengujian interaktif (order nyata → WA terbuka) di Phase 8

## Catatan
Template pre-text multi-tier (paket default / custom / konsultasi) seperti di brief
("Halo Cookplan! aku mau pesan Paket 1!") bisa ditambah di Phase 8 sebagai variasi.
Implementasi saat ini = template detail dari hasil generate (paling informatif).

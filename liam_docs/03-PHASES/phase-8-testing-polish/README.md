---
phase: 8
status: done
last-updated: 2026-06-11
estimated-effort: 3-5 hari
dependencies: [phase-1, phase-2, phase-3, phase-4, phase-5, phase-6, phase-7]
---

# Phase 8 — Testing & Polish

## Goal
Verifikasi end-to-end, uji keamanan (RLS isolasi), polish, dan finalisasi
dokumentasi lengkap.

## Deliverables
- ✅ E2E verification: RLS isolasi 2 user, order ID generation
- ✅ Fix: grant EXECUTE generate_order_id() ke authenticated (migration 000005)
- ✅ Dokumentasi lengkap: SETUP (5), REFERENCE (9), OPERATIONS (5), ARCHITECTURE (7)
- ✅ Progress tracker final

## E2E Tests Dijalankan

### RLS Isolasi (kritikal keamanan)
```
User A buat weekly_plan (dgn user_id) → OK plan id:2
User A baca plan → lihat 1 plan
User B baca plan → lihat 0 plan  ✅ ISOLASI TERBUKTI
```
Insert tanpa user_id ditolak RLS (42501) — sesuai desain (service set user_id eksplisit).

### Order ID Generation
```
Order 1 → CP-20260611-0001
Order 2 → CP-20260611-0002  ✅ sekuensial per hari
```

### Bug ditemukan & diperbaiki
`generate_order_id()` di-revoke total → insert order authenticated gagal
(permission denied). Fix: migration `20260611000005_fix_order_id_grant.sql`
grant EXECUTE ke authenticated (revoke dari anon). Fungsi hanya hasilkan string
ID, tidak sensitif.

## Pengujian yang Direncanakan untuk Tim (Manual, Device Asli)
Sesuai PRD_PKM §5.3 & ROADMAP Fase 2.4:
- [ ] Alpha test internal (5 anggota tim): semua tombol, alur DB, WA redirect
- [ ] Beta test 10-15 mahasiswa kos (1-2 minggu)
- [ ] SUS survey (target skor ≥ 78)
- [ ] Mobile device test: 375px iPhone SE, 360px Android, 414px
- [ ] Screen reader: VoiceOver/TalkBack
- [ ] Generate AI nyata setelah isi API key 9router/enowxlabs + Gemini

## Checklist Pre-Produksi
- [ ] Isi API key asli di ai_providers (via /admin/ai)
- [ ] Ganti WA_ADMIN_NUMBER di orderService.js
- [ ] Set min 1 user jadi admin
- [ ] Ekspansi seed resep 6 → 30-50
- [ ] Koordinasi deploy ke prod dengan tim (Tiara)

Lihat [verification.md](./verification.md).

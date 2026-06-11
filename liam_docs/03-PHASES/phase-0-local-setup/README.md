---
phase: 0
status: done
last-updated: 2026-06-11
estimated-effort: 1 hari
dependencies: []
---

# Phase 0 — Local Setup

## Goal
Menyiapkan environment development lokal penuh: Supabase CLI + Docker stack +
frontend connect ke DB local. Production tidak disentuh.

## Deliverables
- ✅ Prerequisites terverifikasi (Node, npm, Docker, Supabase CLI)
- ✅ `npm install` sukses
- ✅ Supabase local stack jalan (9 container)
- ✅ Migrasi existing ter-apply ke local (profiles + preregistrations)
- ✅ `.env.local` connect frontend ke DB local
- ✅ `npm run dev` jalan (HTTP 200)
- ✅ Skeleton `liam_docs/`

## Definition of Done
- `supabase status` menampilkan stack aktif ✅
- DB local punya tabel `profiles` & `preregistrations` ✅
- `npm run dev` return HTTP 200 di localhost:5173 ✅

## Hasil
Lihat [verification.md](./verification.md).

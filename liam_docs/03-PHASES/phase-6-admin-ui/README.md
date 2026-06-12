---
phase: 6
status: done
last-updated: 2026-06-11
estimated-effort: 1-2 hari
dependencies: [phase-1, phase-3]
---

# Phase 6 — Admin UI + Role System

## Goal
Admin bisa mengelola AI provider (ganti model/key/base_url sesuka hati) lewat UI
`/admin/ai`, tanpa SQL Editor & tanpa redeploy.

## Deliverables
- ✅ Edge Function `admin-providers` (CRUD via service_role + cek admin)
- ✅ `adminService.js` (list/create/update/setActive/setFallback/delete/checkIsAdmin)
- ✅ Halaman `/admin/ai` (AIProviders.jsx) dengan gating role
- ✅ API key MASK saat list (tidak pernah balik plaintext)
- ✅ Tested: admin list (masked), update key, non-admin 403

## Arsitektur Keamanan
Tabel `ai_providers` di-lockdown (revoke dari anon/authenticated). Klien TIDAK bisa
query langsung. Semua akses lewat Edge Function `admin-providers`:
1. Verifikasi JWT user.
2. Cek `profiles.role = 'admin'` (pakai service_role).
3. Operasi DB dengan service_role (bypass RLS lockdown).
4. API key di-mask saat dikirim balik ke browser (`REPL••••_KEY`).

## Actions (admin-providers)
| action | Fungsi |
|--------|--------|
| `list` | Daftar provider, api_key ter-mask + `_has_key` |
| `create` | Tambah provider baru |
| `update` | Update provider (api_key hanya diganti bila dikirim & bukan mask) |
| `set_active` | Set 1 provider aktif (matikan yang lain) |
| `set_fallback` | Set 1 provider fallback |
| `delete` | Hapus provider |

## Role System (ADR-007)
- Kolom `profiles.role` ('user'|'admin'), default 'user'.
- Function `is_admin()` untuk RLS (recipes write).
- Admin UI gating: `checkIsAdmin()` di frontend + cek ulang di Edge Function
  (defense in depth — frontend gating bisa di-bypass, server tidak).

## Cara Jadikan User Admin (Local)
```sql
update public.profiles set role='admin' where id='<user-uuid>';
```

## UI Features (/admin/ai)
- List provider dengan badge (Aktif/Fallback/Thinking).
- Tombol: Jadikan Aktif, Jadikan Fallback, Edit, Hapus.
- Form tambah/edit: label, base_url, model, api_key, temperature, max_tokens,
  reasoning, json_mode.
- Edit: api_key kosong = tidak diubah (biar tidak menimpa key asli dengan mask).

## Definition of Done
- Admin bisa list/create/update/activate provider ✅
- Key ter-mask ke browser ✅
- Non-admin ditolak 403 ✅
- Lint + build bersih ✅

Lihat [verification.md](./verification.md).

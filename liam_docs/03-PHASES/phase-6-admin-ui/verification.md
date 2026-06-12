---
phase: 6
status: done
last-updated: 2026-06-11
---

# Phase 6 — Verification

## Setup
```sql
update profiles set role='admin' where id='738d1483-...';  -- test user → admin
```

## Test Matrix

### 1. Admin list (key ter-mask)
```
POST /admin-providers { action:"list" }  (admin token)
→ providers: [
    { label:"Sonnet 4.5 Thinking", api_key:"REPL••••_KEY", _has_key:true, is_active:true },
    { label:"Gemini Fallback", api_key:"REPL••••_KEY", is_fallback:true }
  ] ✅
```
API key tidak pernah balik plaintext ke browser ✅.

### 2. Update key
```
POST { action:"update", id, provider:{ ..., api_key:"sk-real-test-key-12345" } }
→ { ok:true }
DB: select api_key → "sk-real-test-key-12345" ✅
```
Key asli tersimpan di DB (hanya service_role bisa baca).

### 3. Non-admin ditolak
```
user@cookplan.local (role=user) → POST { action:"list" }
→ 403 { "error":"Khusus admin." } ✅
```

## Lint & Build
```
npm run lint  → bersih
npm run build → sukses
```

## Status: ✅ PHASE 6 DONE

Admin bisa ganti provider AI sesuka hati lewat UI `/admin/ai`. Keamanan
berlapis: lockdown tabel + Edge Function + role check + key masking.

## Catatan untuk Produksi
- Ganti API key placeholder via UI `/admin/ai` (atau update DB) dengan key asli
  9router/enowxlabs + Gemini.
- Set minimal 1 user jadi admin lewat SQL.

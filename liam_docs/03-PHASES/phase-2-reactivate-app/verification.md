---
phase: 2
status: done
last-updated: 2026-06-11
---

# Phase 2 — Verification

## Lint & Build
```
npm run lint  → bersih (0 problems)
npm run build → sukses (107 modules, 573KB js / 158KB gzip)
```

## REST API (RLS read publik)
```
GET /rest/v1/recipes?select=id,title&order=id
→ 6 resep (Gado-Gado ... Tumis Sayur) ✅
```

## Nested Query + Alias camelCase
```
GET /rest/v1/recipes?select=id,title,priceIdr:price_idr,
    ingredients:recipe_ingredients(name,priceIdr:price_idr)&id=eq.1
→ { id:1, title:"Gado-Gado Segar", priceIdr:30000,
    ingredients:[{name:"Kacang Tanah", priceIdr:8000}, ...] } ✅
```
Shape persis sama dengan mockRecipes → komponen tidak perlu diubah strukturnya.

## RLS Lockdown ai_providers
```
GET /rest/v1/ai_providers?select=id  (anon key)
→ 42501 permission denied for table ai_providers ✅
```
API key AI tidak bisa kebaca dari klien. Sesuai desain keamanan.

## Status: ✅ PHASE 2 DONE

Catatan: pengujian E2E interaktif penuh (register → login → catalog → planner →
shopping) dilakukan di Phase 8 dengan akun dummy. Fondasi data & routing sudah
terbukti jalan via REST + build.

## Belum diuji di fase ini (akan di Phase 8)
- [ ] Register → login → refresh tetap login (UI manual)
- [ ] Tambah menu planner → tersimpan di DB → muncul di shopping list
- [ ] 2 akun: data tidak bocor antar user

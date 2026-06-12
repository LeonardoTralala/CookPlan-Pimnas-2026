---
phase: 1
status: done
last-updated: 2026-06-11
---

# Phase 1 — RLS Policies (Reasoning & Test)

Prinsip: tabel baru Supabase default deny-all setelah RLS aktif. Policy WAJIB dibuat
agar bisa diakses dari klien.

## Matriks Akses

| Tabel | anon | authenticated | service_role |
|-------|------|---------------|--------------|
| recipes | read (active) | read + write(admin) | full |
| recipe_ingredients | read | read + write(admin) | full |
| weekly_plans | ❌ | own only (CRUD) | full |
| meal_entries | ❌ | via plan ownership | full |
| orders | ❌ | own only (CRUD) | full |
| order_items | ❌ | via order ownership | full |
| generated_plans | ❌ | read own only | full (write) |
| ai_usage_log | ❌ | read own only | full (write) |
| **ai_providers** | ❌ | ❌ (revoked) | full only |

## Reasoning per Tabel

### recipes / recipe_ingredients
- **Read publik** (anon + authenticated): katalog harus bisa dilihat siapa saja,
  termasuk di landing sebelum login. Filter `is_active = true`.
- **Write admin-only**: `public.is_admin()`. Mencegah user biasa ngubah bank resep.

### weekly_plans / meal_entries / orders / order_items
- **Owner-only**: `(select auth.uid()) = user_id`. User A tidak bisa lihat data User B.
- meal_entries & order_items pakai `exists(...)` cek kepemilikan parent.

### generated_plans / ai_usage_log
- **Read own**: user bisa lihat history & kuota miliknya.
- **Write via service_role**: Edge Function yang insert (bukan klien langsung),
  supaya data AI/usage tidak bisa dimanipulasi user.

### ai_providers (paling sensitif)
- **LOCKDOWN total**: `revoke all from anon, authenticated`.
- Berisi API key → tidak boleh kebaca klien sama sekali.
- service_role (Edge Function) bypass RLS otomatis.
- Admin UI akses lewat Edge Function ber-service_role yang validasi `is_admin()`
  di dalam function (Phase 6), bukan query langsung dari browser.

## Test Plan (dijalankan di Phase 2/6)
- [ ] Login User A, buat weekly_plan → User B tidak bisa SELECT plan A
- [ ] anon SELECT recipes → sukses (read publik)
- [ ] authenticated non-admin INSERT recipes → ditolak
- [ ] authenticated SELECT ai_providers → ditolak (permission denied)
- [ ] User SELECT generated_plans milik orang lain → 0 rows

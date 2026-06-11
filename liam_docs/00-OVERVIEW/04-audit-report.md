---
phase: audit
status: done
last-updated: 2026-06-11
---

# 🔍 Security & Code Audit Report

Audit menyeluruh frontend + backend dijalankan, lalu semua temuan penting
diperbaiki & diverifikasi. Dokumen ini mencatat temuan + status fix.

---

## Masalah `.env` Kepush ke Git (RESOLVED)

**Akar masalah:** `.env` ke-commit di commit `4ffd257 "login and register"`
**SEBELUM** `.gitignore` dikasih aturan `.env`. Gitignore tidak berlaku untuk file
yang sudah ter-track.

**Tingkat bahaya:** RENDAH. Isinya cuma `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
(publishable key) — key ini memang didesain publik & aman di browser SELAMA RLS aktif
(RLS sudah aktif + terverifikasi). Bukan service_role key.

**Fix:** `git rm --cached .env` (file lokal tetap ada, dilepas dari tracking).
`.gitignore` sudah benar (`.env`, `.env.*`, `!.env.example`).

---

## Temuan & Fix

### CRITICAL
| ID | Temuan | Fix | Status |
|----|--------|-----|--------|
| C1 | Privilege escalation: user bisa `update profiles set role='admin'` sendiri (RLS row-level, bukan column-level) | Migration `000006`: trigger `prevent_role_change()` + `revoke update` → grant per-kolom (selain role) | ✅ TESTED — attack ditolak `permission denied`, legit update jalan |

### HIGH
| ID | Temuan | Fix | Status |
|----|--------|-----|--------|
| H1 | SSRF via `ai_providers.base_url` (admin bisa arahkan fetch ke internal) | `validateBaseUrl()` di admin-providers: wajib https, tolak loopback/privat/link-local IP | ✅ |
| H2 | Rate limit bypass: generate gagal tidak tercatat di ai_usage_log padahal call AI berbayar | Log ai_usage_log di SEMUA jalur gagal (provider fail, JSON rusak, validasi gagal) | ✅ |

### MEDIUM
| ID | Temuan | Fix | Status |
|----|--------|-----|--------|
| M2 | `subtractPantry` substring match → "ayam" hapus "bayam" | Ganti ke token/word matching (min 3 char) | ✅ TESTED — bawang putih dikurangi, item lain aman |
| M3 | SSE parser unbounded buffer → OOM risk | Cap 2MB + `reader.cancel()` di finally | ✅ |
| FE5 | Side-effect DB di dalam setState updater → double write di StrictMode | Pindah persist ke luar updater + queue pending sebelum planId siap | ✅ |
| FE9 | IDOR: aiService query by id tanpa user_id filter | Tambah `.eq('user_id', user.id)` defense-in-depth | ✅ |

### LOW / CLEANUP
| ID | Temuan | Fix | Status |
|----|--------|-----|--------|
| FE1 | `addedRecipes` dead store — RecipeCard "Tambah ke Rencana" tidak nyambung ke mana-mana | Hapus addedRecipes; RecipeCard landing → funnel ke /register; isInPlan pakai weeklyPlan | ✅ |
| FE3/14 | Null access `badges`/`ingredients`/`instructions` | Guard `?? []` di RecipeCatalog & ShoppingList | ✅ |
| FE4 | UserProfile hardcode "Brokoli"/email | Pakai `useAuth().user` (full_name, email, created_at) | ✅ |
| FE8 | AuthContext getSession tanpa .catch → loading nggantung | Tambah `.catch(() => setLoading(false))` | ✅ |
| FE10 | Filter "Semua" tetap exclude resep > 120 menit | Skip filter waktu saat maxTime = 120 | ✅ |
| FE16 | Toast timer pakai message → 2 pesan sama tidak reset timer | Toast pakai counter id | ✅ |
| — | PlanContext value tidak di-memoize | Bungkus `useMemo` | ✅ |

---

## Temuan yang DITERIMA (tidak difix, by design / low priority)

| ID | Temuan | Alasan |
|----|--------|--------|
| M1 | Client-controlled order pricing (total_price dari klien) | MVP: order cuma redirect WA + dikonfirmasi admin manual. Recompute server-side = enhancement pasca-MVP |
| L1 | handle_new_user search_path=public (bukan '') | Identifier sudah schema-qualified, exploit risk rendah |
| L4 | CORS `*` di endpoint authenticated | Acceptable (bearer token, no cookie). Restrict origin = enhancement |
| L6 | preregistrations anon insert tanpa captcha | Ada unique email index; captcha = enhancement |
| FE pantry partial price | Item partial tidak proporsional harganya | Minor, estimasi saja |

---

## Verifikasi Akhir
```
npm run lint  → bersih (0 problems)
npm run build → sukses
C1 attack test → permission denied (blocked) ✅
C1 legit update → berhasil ✅
Generate AI (apc/claude-opus-4.6) → 3 hari, 18 item, Rp139k, pantry dikurangi ✅
```

## Catatan Keamanan untuk Produksi
- Rotate API key 9router (sempat terekspos saat development).
- Pertimbangkan recompute order total server-side (M1) sebelum ada pembayaran nyata.
- Set CORS origin spesifik saat domain produksi final.

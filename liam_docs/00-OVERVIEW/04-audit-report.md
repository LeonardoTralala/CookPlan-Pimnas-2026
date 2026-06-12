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

---

## Production Schema Drift Audit (2026-06-11)

Saat deploy phase 1 backend ke prod (`phdbbiydrjwxlehdfubh`), audit menemukan
drift tambahan yang **tidak terlihat saat audit lokal** karena skema lokal di-built
dari migration yang sama, sedangkan prod kemungkinan dibikin manual / via dashboard
sebelum migration di-jalankan. Detail lengkap:
`liam_docs/05-OPERATIONS/06-schema-drift-audit-2026-06-11.md`.

### Temuan Tambahan (CRITICAL — fixed)
| ID | Temuan | Fix | Status |
|---|---|---|---|
| P1 | `profiles_id_fkey → auth.users` = NO ACTION (mestinya CASCADE) → SEMUA hapus akun gagal `23503` | Migration `20260611150000`: alter constraint cascade | ✅ verified delete user end-to-end |
| P2 | `orders.id` text NOT NULL tanpa default → insert order gagal `23502` | Migration `20260611150100`: `set default generate_order_id()` | ✅ verified ID `CP-20260611-0001` |
| P3 | `orders.delivery_address` NOT NULL → frontend kirim null gagal | Migration `20260611150100`: drop NOT NULL | ✅ |
| P4 | `orders.payment_method` check tidak include `'cod'` | Migration `20260611150100`: re-create constraint dengan whitelist 3 nilai | ✅ |

### Temuan Tambahan (HIGH — fixed)
| ID | Temuan | Fix | Status |
|---|---|---|---|
| P5 | `orders.user_id → profiles` = NO ACTION (mestinya SET NULL) | alter constraint set null | ✅ |
| P6 | `meal_entries.recipe_id → recipes` = NO ACTION (mestinya SET NULL) | alter constraint set null | ✅ |
| P7 | `subscriptions.user_id → profiles` = NO ACTION → orphan saat hapus user | alter constraint cascade | ✅ |
| P8 | `prevent_role_change()` SECURITY DEFINER bisa dipanggil via RPC dari `anon`/`authenticated` | revoke EXECUTE dari role API (trigger jalan tanpa cek EXECUTE) | ✅ |

### Temuan Tambahan (MEDIUM — fixed)
| ID | Temuan | Fix | Status |
|---|---|---|---|
| P9 | `order_items.order_id` nullable (mestinya NOT NULL) → bisa orphan | alter set NOT NULL (tabel kosong saat patch) | ✅ |
| P10 | `order_items` missing kolom `category` & `created_at` | add column if not exists | ✅ |

### Temuan Diterima (tidak difix)
| ID | Temuan | Alasan |
|---|---|---|
| P11 | Kolom extra di `orders`: `service_fee`, `payment_status`, `order_status` | Nullable & tidak dipakai code; project punya owner lain → konservatif jangan drop |
| P12 | Kolom `profiles.gender` tidak ada di migration | Tidak dipakai code, harmless |
| P13 | Tabel `subscriptions` tanpa migration awal | Dibikinkan migration `if not exists` untuk legalisasi (tidak ubah skema yang ada) |
| P14 | Policy duplikat di `weekly_plans`, `recipes`, `recipe_ingredients` | Efek sama persis, kosmetik |
| P15 | Migration history mismatch (prod 3 entri vs repo 9 file) | Memaksakan sync = risiko ke project orang lain |

### Verifikasi Pasca-Fix
```
end-to-end generate-plan        → 200 ✓ plan valid + cache hit + pantry subtract
delete user via admin API       → 200 ✓ cascade ke profiles, weekly_plans, generated_plans
delete user dengan child data   → 200 ✓ orders/ai_usage_log preserve user_id=null
insert order via REST           → 201 ✓ ID CP-20260611-0001 ter-generate
prevent_role_change ACL         → {postgres,service_role} only ✓
preregistrations data integrity → 31/31 baris utuh ✓
```

---
phase: overview
status: in-progress
last-updated: 2026-06-11
---

# 📋 Decisions Log (Architecture Decision Records)

> Catatan setiap keputusan teknis penting: kapan, apa, kenapa, dan alternatif yang
> dipertimbangkan. Format ADR ringkas. Append-only (jangan hapus, tandai superseded).

---

## ADR-001 — Backend: Supabase Edge Functions (bukan backend terpisah)

**Tanggal:** 2026-06-11
**Status:** Accepted

**Konteks:** Butuh server-side untuk call AI API (API key tidak boleh ke browser).
Pertimbangan: React+Vite langsung (tidak aman), Edge Functions, ElysiaJS terpisah, Next.js.

**Keputusan:** Pakai **Supabase Edge Functions** (Deno runtime).

**Alasan:**
- Hanya 1 dari 6 operasi MVP yang butuh server (generate AI). Bikin backend penuh = overkill.
- Satu vendor (Supabase), satu dashboard, satu billing.
- Edge Function otomatis dapat JWT user, gampang RLS-aware.
- Deploy 1 perintah, free tier 500K invocations/bulan.

**Alternatif ditolak:**
- ElysiaJS terpisah → tambah vendor hosting, CORS, JWT verify manual. Overkill untuk PKM.
- Next.js → migrasi besar dari Vite, risiko di tengah PKM.

---

## ADR-002 — AI Provider-Agnostic via OpenAI-Compatible Format

**Tanggal:** 2026-06-11
**Status:** Accepted

**Konteks:** User mau ganti-ganti model AI sesuka hati (Sonnet 4.5 thinking, DeepSeek, dll)
lewat proxy 9router & enowxlabs.

**Keputusan:** Edge Function jadi **proxy universal** yang ngomong format
**OpenAI-compatible chat completions** (`POST {base_url}/chat/completions`). Config
(base_url, api_key, model, dll) disimpan di tabel `ai_providers`, bisa diganti tanpa redeploy.

**Alasan:**
- >90% provider modern support format ini (termasuk Sonnet via proxy, DeepSeek native).
- Tidak perlu adapter per provider.

**Alternatif ditolak:**
- Adapter Claude Messages API khusus → tidak perlu karena pakai proxy OpenAI-compat.

---

## ADR-003 — AI Fallback ke Gemini

**Tanggal:** 2026-06-11
**Status:** Accepted

**Keputusan:** Kalau provider primary error/timeout, fallback ke Gemini.

**Catatan keamanan:** API key disimpan via Supabase secrets / Vault, BUKAN plaintext di
tabel atau git.

---

## ADR-004 — Recipe Context: SQL Pre-filter (bukan vector embedding)

**Tanggal:** 2026-06-11
**Status:** Accepted

**Keputusan:** Untuk RAG, pakai **SQL filter** (diet/budget/waktu) → kirim 20-30 kandidat
resep ke AI. Bukan vector embedding.

**Alasan:** Cepat, deterministik, gampang debug. Vector embedding overkill untuk katalog
< 200 resep. Disimpan untuk v2.

---

## ADR-005 — Structured Output: Schema-in-Prompt + Defensive Parsing

**Tanggal:** 2026-06-11
**Status:** Accepted

**Keputusan:** JSON schema dikirim sebagai **teks di dalam prompt** (bukan param API),
lalu parse defensive di server + validasi Zod.

**Alasan:** Jalan di semua provider tanpa peduli mereka native support `response_format`
atau tidak. Provider-agnostic.

---

## ADR-006 — 100% Local Development

**Tanggal:** 2026-06-11
**Status:** Accepted

**Keputusan:** Semua dev pakai Supabase CLI local. Production tidak disentuh.

**Alasan:** User mau build sampai benar-benar selesai dulu sebelum ke prod. Tidak perlu
nunggu approval/akses. Zero risk ke data production.

**Konsekuensi:** Data pre-register production tidak ada di local. Perlu fase "deploy ke
prod" terpisah nanti.

---

## ADR-007 — Admin Role via `profiles.role` Column

**Tanggal:** 2026-06-11
**Status:** Accepted

**Keputusan:** Otorisasi admin pakai kolom `profiles.role` enum ('user', 'admin'). RLS
cek `(select role from profiles where id = auth.uid()) = 'admin'`.

**Alasan:** Dynamic (ganti admin tanpa redeploy), clean, gampang debug.

---

## ADR-008 — Edit Manual Setelah Generate Masuk MVP

**Tanggal:** 2026-06-11
**Status:** Accepted

**Keputusan:** User bisa swap menu individual setelah AI generate (drag/drop atau picker).
Edit mengubah `output_json`, tidak re-generate (hemat biaya AI).

**Alasan:** AI tidak selalu pas, user pasti mau tweak.

---

## ADR-009 — Caching via input_hash

**Tanggal:** 2026-06-11
**Status:** Accepted

**Keputusan:** Hash deterministik dari input user → kalau sama persis, return hasil cache
dari `generated_plans`, tidak call AI lagi.

**Alasan:** Hemat biaya AI signifikan + respon instan untuk input identik.

---

## ADR-010 — Dokumentasi di `liam_docs/`

**Tanggal:** 2026-06-11
**Status:** Accepted

**Keputusan:** Semua dokumentasi pengembangan AI di folder `liam_docs/` (terpisah dari
`docs/` lama). Bahasa Indonesia santai. ~50 file MD, parallel doc + code.

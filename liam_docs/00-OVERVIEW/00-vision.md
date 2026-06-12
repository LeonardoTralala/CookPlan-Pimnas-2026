---
phase: overview
status: in-progress
last-updated: 2026-06-11
---

# 🎯 Vision — CookPlan AI

## Apa itu CookPlan?

CookPlan adalah aplikasi web untuk **merencanakan menu masak mingguan**, menghasilkan
**daftar belanja otomatis**, dan menghubungkan pengguna dengan **produsen/supplier bahan
lokal**. Dijalankan di bawah skema **PKM-Kewirausahaan (PKM-K) 2026**.

**Target pengguna:** mahasiswa kos & pekerja kantoran yang sering bingung "masak apa hari
ini", mau hemat budget, dan mengurangi food waste.

## Status Sebelum Pengerjaan Ini

- Frontend React 19 + Vite + Tailwind v4 — sudah matang.
- Fase **pre-register** (daftar tunggu) sudah live: landing page + form pre-register
  tersimpan ke Supabase.
- Fitur aplikasi penuh (katalog, planner, shopping list, profil, auth) **sudah ditulis**
  di `src/pages/` tapi **di-disable** dari routing (`App.jsx` hanya expose 6 route publik).
- Backend Supabase: baru ada tabel `profiles` + `preregistrations`.
- Data resep masih **mock** (`src/utils/mockRecipes.js`, 6 resep).
- **Belum ada AI sama sekali.**

## Goal Pengerjaan Ini (MVP Target)

Sesuai brief MVP, ada **3 fitur utama**:

### Fitur 1 — Generate Foodplan & Foodprep (Core Magic, berbasis AI)
Input parameter dari user:
- Periode plan (3/7/14 hari)
- Jumlah porsi
- Jenis diet
- Budget tersedia
- Bahan tersedia di rumah (pantry)
- Jenis output yang diharapkan

Output (3 mode):
- **Foodplan** — daftar menu + resep
- **Foodprep** — daftar menu + resep, plan belanja + estimasi harga
- **Foodplan & prep + layanan belanja** — semua di atas + keterangan layanan belanja
  (**Core Offer**)

Pelengkap: **resep detail per menu** yang tampil di hasil generate.

### Fitur 2 — Database Resep
Bank resep di Supabase (bukan lagi mock file). Jadi context tambahan untuk AI sebelum
generate (RAG ringan via SQL filter).

### Fitur 3 — Menu Order via WhatsApp
Tombol WA + template pre-text sesuai pesanan. Contoh:
> "Halo Cookplan! aku mau pesan Paket 1!"

Dengan **ID pesanan unik** (`CP-YYYYMMDD-XXXX`) tersimpan di DB untuk dilacak admin.

## Prinsip Teknis Kunci

1. **AI provider-agnostic** — base URL + API key + model disimpan di DB (`ai_providers`),
   bisa diganti sesuka hati tanpa redeploy. Format OpenAI-compatible chat completions.
   Primary: Sonnet 4.5 thinking (via 9router/enowxlabs). Fallback: Gemini.
2. **Edge Function sebagai proxy** — API key tidak pernah ke browser. Semua call AI lewat
   Supabase Edge Function.
3. **100% local development** — pakai Supabase CLI. Production tidak disentuh.
4. **Mobile-first / responsive maksimal** — fokus besar setelah core selesai (Phase 7).
5. **Reuse komponen existing** — `WeeklyPlanner`, `ShoppingList`, `RecipeCatalog` sudah
   jadi; output AI di-map ke shape mereka.

## Definition of "Selesai" (MVP)

- [ ] User bisa register/login (auth diaktifkan kembali)
- [ ] User isi form → AI generate foodplan/foodprep real-time
- [ ] Hasil generate tampil rapi + resep detail per menu
- [ ] User bisa edit manual hasil (swap menu)
- [ ] Shopping list + estimasi harga otomatis
- [ ] Tombol order → WhatsApp dengan ID pesanan unik
- [ ] Admin bisa ganti AI provider lewat UI
- [ ] Semua halaman responsive maksimal di mobile
- [ ] Dokumentasi lengkap di `liam_docs/`

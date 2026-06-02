# Review UI/UX CookPlan — Lanjutan (Fokus Mobile-First)

> Rekomendasi tambahan agar website nyaman dibuka & dipakai di HP.
> Tanggal review: 31 Mei 2026 · Branch: `fix-tampilan2`
> **Pelengkap** dari [`UI_UX_REVIEW.md`](./UI_UX_REVIEW.md) — semua temuan di sini **baru** (tidak menduplikasi 11 temuan + P2 sebelumnya).

**Stack:** React 19 + Vite + Tailwind v4 + react-router-dom
**Catatan:** ini rekomendasi, belum diimplementasikan.

---

## Ringkasan

Sebagian besar item berikut **murni membuat situs ramah di HP**; sisanya manfaatnya lebih luas (konsistensi/UX umum) tapi tetap terasa di HP. Tidak ada item yang khusus desktop.

| Kategori | Item |
|----------|------|
| Murni ramah-HP | M1, M2, M3, M4, M7, M8, M9 |
| Manfaat luas (kena di HP juga) | M5, M6, M10 |

---

## 🔴 Mobile-critical

### M1. Link navigasi landing **hilang total** di mobile (tanpa hamburger)
- **Lokasi:** `src/components/Navbar.jsx:32` → `<div className="hidden md:flex ...">`
- **Masalah:** Berbeda dari temuan #1 di `UI_UX_REVIEW.md` (yang soal *App.jsx* horizontal-scroll). Di sini, pada landing page mobile, link **Katalog / Rencana Masak / Daftar Belanja sepenuhnya disembunyikan** dan **tidak ada pengganti** (hamburger/menu). Pengunjung HP hanya melihat logo + avatar → tidak bisa masuk ke fitur apa pun dari landing.
- **Rekomendasi:** tambahkan tombol hamburger + drawer/menu sheet di mobile, atau samakan dengan bottom-nav aplikasi.

### M2. Auto-zoom iOS karena input < 16px
- **Lokasi:** `WeeklyPlanner.jsx:359` (search picker `text-sm`), `RecipeCatalog.jsx:584` & `:602` (dua `<select>` `text-sm`)
- **Masalah:** Safari iOS otomatis melakukan zoom saat field dengan font < 16px difokus → layout "melompat" dan terasa tidak rapi. (rule `readable-font-size`)
- **Rekomendasi:** gunakan `text-base` (16px) untuk seluruh input/select di mobile. Sekalian tambah semantik keyboard mobile: `type="search"`, `inputMode`, `enterKeyHint="search"`, `autocomplete` pada field pencarian.

### M3. Modal sebaiknya jadi **bottom sheet** di mobile
- **Lokasi:** modal di `RecipeCatalog.jsx:393, :547` & `WeeklyPlanner.jsx:313` (semua `items-center` — dialog tengah)
- **Masalah:** dialog di tengah layar sulit dijangkau ibu jari di HP, dan tombol tutup ada di pojok atas (zona terjauh). (rule `modal-motion`, `modal-escape`)
- **Rekomendasi:** di mobile, render sebagai **bottom sheet** (muncul dari bawah, ada drag-handle, bisa swipe-down untuk tutup); tetap dialog tengah di desktop. *Catatan: melengkapi #6 di `UI_UX_REVIEW.md` (focus-trap), bukan menggantikan.*

### M4. `100vh` / `min-h-screen` & `max-h-[85vh]` → pakai `dvh`
- **Lokasi:** `min-h-screen` di semua page; modal `max-h-[85vh]` (`RecipeCatalog.jsx:397`, `WeeklyPlanner.jsx:320`)
- **Masalah:** address-bar mobile membuat `vh` salah hitung → konten/modal terpotong atau ada celah. (rule `viewport-units`)
- **Rekomendasi:** ganti ke `min-h-dvh` dan `max-h-[85dvh]`.

---

## 🟠 Penting

### M5. Emoji dipakai sebagai ikon (kontradiksi dengan klaim "ikon vektor")
- **Lokasi:** `src/components/RecipeCard.jsx:45` → `"Ditambahkan ✓"`
- **Masalah:** karakter ✓ literal dipakai sebagai ikon sukses, padahal seluruh app pakai Material Symbols. Render emoji bergantung font/OS dan tidak bisa di-tokenkan. (rule `no-emoji-icons`)
- **Rekomendasi:** ganti dengan `<span className="material-symbols-outlined">check</span> Ditambahkan`.

### M6. Tidak ada scroll-reset / fokus saat pindah halaman
- **Lokasi:** `src/main.jsx` (`BrowserRouter` tanpa `ScrollRestoration`), `App.jsx:157` (`<Routes>` polos)
- **Masalah:** pindah Katalog → Planner mempertahankan posisi scroll lama → user HP mendarat di tengah halaman; screen-reader tidak dipindah ke konten utama. (rule `focus-on-route-change`)
- **Rekomendasi:** tambah komponen scroll-to-top pada perubahan route + pindahkan fokus ke `<main>`.

### M7. Ringkasan & tombol checkout "terkubur" di bawah daftar (mobile)
- **Lokasi:** `src/pages/ShoppingList.jsx:168-355` — di mobile (`grid-cols-1`) daftar bahan (`lg:col-span-8`) muncul lebih dulu, ringkasan + "Bayar & Antar" (`lg:col-span-4`) baru setelah semua item.
- **Masalah:** user HP harus scroll melewati seluruh bahan untuk melihat total/checkout — friksi konversi tinggi. (rule `content-priority`)
- **Rekomendasi:** di mobile tampilkan **bar total + CTA sticky** di bawah (atau ringkasan ringkas di atas daftar).

---

## 🟡 Penyempurnaan

### M8. `touch-action: manipulation` belum diset
- **Lokasi:** `src/index.css` (base)
- **Masalah:** delay tap ~300ms + double-tap zoom tak sengaja pada tombol. (rule `tap-delay`)
- **Rekomendasi:** set `touch-action: manipulation` global pada elemen interaktif/body.

### M9. Slider `range` sulit dipakai dengan jari
- **Lokasi:** `RecipeCatalog.jsx:254-262` — `type="range"` track `h-1.5`, thumb default kecil.
- **Masalah:** butuh presisi tinggi di layar sentuh. (rule `no-precision-required`)
- **Rekomendasi:** perbesar thumb (≥24px) & area sentuh, atau ganti ke chip rentang waktu bertingkat (mis. ≤15/30/45/60+ mnt).

### M10. CTA "Buat Daftar Belanja" aktif walau rencana kosong
- **Lokasi:** `WeeklyPlanner.jsx:299` (fixed bottom bar)
- **Masalah:** dengan 0 slot terisi tetap bisa diklik → mendarat di shopping list kosong; menempati zona ibu jari utama tanpa guna.
- **Rekomendasi:** disable + ubah teks/state saat `stats.filled === 0`.

---

## Urutan Eksekusi yang Diusulkan

| Fase | Item | Alasan |
|------|------|--------|
| **A — Navigasi & viewport mobile** | M1, M4, M6 | Pemblokir utama akses fitur di HP |
| **B — Input & interaksi sentuh** | M2, M3, M8, M9 | Ergonomi form & modal di jari |
| **C — Konversi & konsistensi** | M5, M7, M10 | Checkout, ikon, state CTA |

> Jika tujuannya "yang penting enak di HP dulu", kerjakan **M1 → M4 → M2 → M3** lebih dulu — paling langsung terasa saat dibuka di HP.

---

## Checklist Verifikasi (Mobile)

- [ ] Semua fitur dapat diakses dari landing page di layar 375px (ada hamburger/menu)
- [ ] Tidak ada auto-zoom saat fokus input di iOS (semua input ≥ 16px)
- [ ] Modal nyaman dijangkau ibu jari (bottom sheet di mobile)
- [ ] Tidak ada konten/modal terpotong oleh address bar (`dvh`)
- [ ] Total & checkout mudah dijangkau tanpa scroll panjang
- [ ] Tap responsif tanpa delay/zoom dobel
- [ ] Slider/kontrol dapat dioperasikan dengan jari tanpa presisi tinggi

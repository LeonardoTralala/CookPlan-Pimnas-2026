# Review UI/UX CookPlan — Right-Sizing untuk Mobile

> Diagnosis & plan untuk masalah "tampilan terlalu besar-besar saat dibuka di HP".
> Tanggal review: 31 Mei 2026 · Branch: `fix-tampilan2`
> **Dokumen ke-3**, melengkapi [`UI_UX_REVIEW.md`](./UI_UX_REVIEW.md) & [`UI_UX_REVIEW_MOBILE.md`](./UI_UX_REVIEW_MOBILE.md). Semua temuan di sini **baru** — fokus pada **skala visual (ukuran font, spacing, gambar)**, bukan navigasi/touch-target/modal yang sudah dibahas.

**Stack:** React 19 + Vite + Tailwind v4
**Target utama:** konsumen mayoritas pakai HP.
**Catatan:** ini rekomendasi, belum diimplementasikan.

---

## Diagnosis: Kenapa Terlihat "Besar-Besar" di HP

Viewport meta **sudah benar** (`width=device-width, initial-scale=1`), jadi ini **bukan** bug zoom. Akar masalahnya: **desain di-port langsung dari mockup desktop (Stitch) tanpa menurunkan skala untuk mobile.** Ukuran font heading, padding antar-section, tinggi gambar, dan padding kartu semuanya **nilai tetap berukuran desktop** yang tidak mengecil di layar kecil.

Website lain terasa "pas" karena mereka **mengecilkan heading + spacing ~30–40% di mobile**. CookPlan tidak — jadi satu layar HP hanya memuat sedikit konten dan semuanya terasa membesar.

### Bukti konkret (semua **tidak punya** versi mobile lebih kecil)

| Elemen | Lokasi | Nilai sekarang | Masalah di HP |
|--------|--------|----------------|---------------|
| Heading Hero | `index.css` `--text-headline-xl: 3rem` + `Hero.jsx` | **48px tetap** di semua layar | Judul 48px di lebar 375px = sangat dominan |
| Padding section landing | `HowItWorks.jsx`, `FeaturedRecipes.jsx` | `py-24` (**96px**) tetap | 96px atas+bawah per section → 1 section ≈ 1 layar penuh |
| Hero spacing | `Hero.jsx` | `pt-20 pb-32` (80/**128px**), `gap-12`, `space-y-8` | Jarak vertikal raksasa |
| Gambar kartu resep | `RecipeCard.jsx`, `RecipeCatalog.jsx` | `h-64` (**256px**) tetap | 1 kartu makan setengah layar HP |
| Padding kartu | `HowItWorks.jsx` `p-8`, kartu resep `p-6` | tetap | Boros ruang di HP |
| Ikon/box | `HowItWorks.jsx` `w-16 h-16`, empty state `text-6xl` (60px) | tetap | Ikon terlalu besar |
| Token mobile tak dipakai | `DESIGN.md` punya `headline-lg-mobile: 28px` | **tidak pernah di-wire** ke CSS | Mobile tak pernah dapat ukuran kecil |

> **Beda dengan temuan #8 di `UI_UX_REVIEW.md`:** itu soal *token tidak konsisten / tak terpakai antar halaman*. **Ini soal skala tidak mengecil di mobile** — masalah & solusinya berbeda (meski perbaikannya saling melengkapi).

---

## Plan Perbaikan — "Right-Sizing"

### D1. (Leverage tertinggi) Ubah token tipografi jadi **fluid** dengan `clamp()`
Daripada menambah `text-* md:text-*` di puluhan tempat, perbaiki **sekali** di `src/index.css` `@theme` supaya heading otomatis mengecil di HP & membesar di desktop:

```css
/* sekarang: --text-headline-xl: 3rem;  (48px tetap) */
--text-headline-xl: clamp(1.875rem, 1.2rem + 3.4vw, 3rem);  /* 30px HP → 48px desktop */
--text-headline-lg: clamp(1.5rem, 1.1rem + 2vw, 2.25rem);   /* 24px → 36px */
--text-headline-md: clamp(1.25rem, 1rem + 1.2vw, 1.5rem);   /* 20px → 24px */
```

Satu perubahan ini langsung memperbaiki Hero, HowItWorks, FeaturedRecipes, dan semua heading yang pakai token `text-headline-*`. **Ini fix paling terasa untuk keluhan "besar-besar".**

> Catatan: heading yang masih pakai utility mentah (mis. `RecipeCatalog.jsx` `text-4xl md:text-[40px]`, `WeeklyPlanner.jsx`/`ShoppingList.jsx`/`UserProfile.jsx` `text-3xl md:text-[40px]`) sebaiknya diarahkan memakai token `text-headline-*` agar ikut fluid (sekaligus menuntaskan temuan #8 lama).

### D2. Turunkan padding/spacing section di mobile (mobile-first)
Pola: nilai kecil dulu, lalu `md:` membesar.
- `Hero.jsx`: `pt-20 pb-32` → `pt-12 pb-16 md:pt-20 md:pb-32`; `gap-12` → `gap-8 md:gap-12`; `space-y-8` → `space-y-6 md:space-y-8`
- `HowItWorks.jsx` & `FeaturedRecipes.jsx`: `py-24` → `py-14 md:py-24`; `mb-16` / `mb-12` → `mb-10 md:mb-16`; `gap-8` → `gap-6 md:gap-8`

### D3. Kecilkan gambar & kartu di mobile
- `RecipeCard.jsx` / `RecipeCatalog.jsx`: image `h-64` → `h-40 sm:h-52 md:h-64`
- Padding konten kartu `p-6` → `p-4 md:p-6`
- `HowItWorks.jsx`: kartu `p-8` → `p-6 md:p-8`; box ikon `w-16 h-16` → `w-12 h-12 md:w-16 md:h-16`

### D4. Right-size elemen besar lain di mobile
- Empty state icon `text-6xl` → `text-5xl md:text-6xl` (Catalog & ShoppingList)
- Tombol Hero `px-8 py-4` → `px-6 py-3 md:px-8 md:py-4`
- Body Hero `text-body-lg` (18px) → pertimbangkan `text-base md:text-lg` agar 16px di HP
- Hero image `h-[320px]` → `h-[240px] sm:h-[400px] md:h-[500px]`

### D5. (Fondasi / altitude) Bikin skala konsisten agar tidak "tambal-sulam"
Definisikan **type scale + spacing rhythm responsif** sekali sebagai sumber kebenaran (lewat token `clamp()` di D1 + util section-padding), supaya komponen baru otomatis ikut. Ini mencegah masalah yang sama muncul lagi di halaman berikutnya.

---

## Urutan Eksekusi

| Fase | Item | Dampak |
|------|------|--------|
| **1 — Skala global** | **D1** (fluid type) + D2 (spacing section) | ~80% keluhan "besar-besar" hilang dari sini |
| **2 — Komponen** | D3 (gambar/kartu) + D4 (elemen besar) | Densitas konten naik, mirip web umum |
| **3 — Fondasi** | D5 (sistem skala konsisten) | Anti-regresi ke depan |

---

## Cara Uji

- Buka **DevTools → device 375px (iPhone SE)** sebelum & sesudah D1+D2 — perbedaan paling kentara di sana.
- Bandingkan jumlah konten yang muat dalam 1 layar HP sebelum vs sesudah.
- Cek juga di 360px (Android umum) dan 414px (HP besar).

## Checklist Verifikasi (Skala Mobile)

- [ ] Heading Hero ≤ ~32px di layar 375px
- [ ] Tiap section landing tidak menghabiskan 1 layar penuh hanya untuk padding
- [ ] Kartu resep menampilkan minimal sebagian kartu kedua di layar HP (tidak 1 kartu = 1 layar)
- [ ] Body text 16px di HP (tidak 18px)
- [ ] Skala terasa setara dengan website umum saat dibuka di HP
- [ ] Desktop tetap tampil seperti sebelumnya (clamp batas atas tidak berubah)

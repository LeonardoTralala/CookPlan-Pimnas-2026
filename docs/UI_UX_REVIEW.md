# Review UI/UX CookPlan

> Dokumen hasil telaah antarmuka & pengalaman pengguna CookPlan.
> Tanggal review: 31 Mei 2026 · Branch: `fix-tampilan2`

**Stack:** React 19 + Vite + Tailwind v4 + react-router-dom
**Design language:** "Organic Minimalism" — palet olive/cream, ikon Material Symbols, bentuk rounded/pill
**Catatan:** data masih mock, persistensi via `localStorage`.

---

## Ringkasan

CookPlan sudah punya fondasi desain yang rapi (design token semantik, ikon vektor, empty state, toast). Masalah terbesar ada pada **pengalaman mobile** dan **aksesibilitas keyboard**, ditambah beberapa **inkonsistensi arsitektur UI** (dua navbar, dua sumber data, token tipografi tak terpakai). Dokumen ini memprioritaskan temuan menjadi P0 (kritikal), P1 (penting), dan P2 (penyempurnaan), lalu menutup dengan rencana eksekusi bertahap.

---

## Yang Sudah Bagus

- **Design token semantik** di `src/index.css` `@theme` (primary / surface / on-surface dll) — fondasi yang benar.
- **Ikon vektor** (Material Symbols), bukan emoji.
- **Aksesibilitas dasar** sudah dirintis: `role="dialog"`, `aria-modal`, `aria-label` pada tombol ikon, handler tombol Escape, `aria-live` pada stepper porsi.
- **Empty state** tersedia (katalog & daftar belanja) dengan CTA jelas.
- **Toast** auto-dismiss 3 detik, format Rupiah pakai `Intl`, `line-clamp`, validasi bentuk data `localStorage`.

---

## Temuan & Rekomendasi

### 🔴 P0 — Kritikal (harus diperbaiki)

#### 1. Navigasi mobile menyembunyikan menu
- **Lokasi:** `src/App.jsx:97`
- **Masalah:** nav memakai `overflow-x-auto whitespace-nowrap`. Di HP, menu (Katalog / Rencana Masak / Daftar Belanja / Profil) ter-scroll horizontal tanpa indikator sehingga item terpotong & tak terlihat. Tidak ada bottom-nav maupun hamburger.
- **Rekomendasi:** untuk aplikasi dapur yang mobile-first, gunakan **bottom navigation bar** (maks 5 item, ikon + label — rule `bottom-nav-limit`). Desktop tetap top-nav.

#### 2. Recipe card tidak dapat diakses keyboard
- **Lokasi:** `src/pages/RecipeCatalog.jsx:318`, `src/pages/UserProfile.jsx:188`
- **Masalah:** kartu resep adalah `<div onClick>` — tidak bisa di-Tab/Enter dan tidak punya focus ring (pelanggaran `keyboard-nav`).
- **Rekomendasi:** jadikan `<button>`/`<a>`, atau tambahkan `role="button"` + `tabIndex={0}` + handler `onKeyDown` (Enter/Space) + `focus-visible:ring`.

#### 3. Tombol hapus di planner hanya muncul saat hover
- **Lokasi:** `src/pages/WeeklyPlanner.jsx:204`
- **Masalah:** `opacity-0 group-hover:opacity-100`. Di layar sentuh tidak ada hover → user **tidak bisa menghapus menu sama sekali** di HP (pelanggaran `gesture-alternative` / `hover-vs-tap`).
- **Rekomendasi:** tampilkan tombol secara permanen (atau toggle via tap) pada breakpoint sentuh.

#### 4. Grid planner memaksa horizontal-scroll tersembunyi di mobile
- **Lokasi:** `src/pages/WeeklyPlanner.jsx:143-144`
- **Masalah:** `min-w-[1000px]` + `hide-scrollbar`. 7 hari × 3 makan dipaksa selebar 1000px; scrollbar disembunyikan sehingga user tak tahu konten bisa di-scroll.
- **Rekomendasi:** reflow ke **layout vertikal per-hari (accordion/stack)** di mobile; pertahankan grid hanya di desktop.

#### 5. Touch target di bawah 44px
- **Lokasi:** stepper porsi `w-9 h-9` (36px), tombol add kartu `w-10 h-10` (40px), close `w-9 h-9`, delete `w-8 h-8` (32px), link nav teks `text-sm pb-1`.
- **Masalah:** semua < 44×44 (pelanggaran `touch-target-size`).
- **Rekomendasi:** minimal 44×44px, atau perluas area sentuh via padding / `hitSlop`.

#### 6. Modal: tanpa focus trap, scroll-lock & return focus
- **Lokasi:** modal di `RecipeCatalog` & `WeeklyPlanner`
- **Masalah:** Tab bisa "lolos" ke latar, body tetap bisa di-scroll saat modal terbuka, dan fokus tidak kembali ke pemicu saat ditutup.
- **Rekomendasi:** kunci scroll body saat modal terbuka, perangkap fokus di dalam dialog, kembalikan fokus ke trigger. Pertimbangkan satu komponen `<Modal>` reusable.

---

### 🟠 P1 — Penting (kualitas & konsistensi)

#### 7. Dua sumber data & dua navbar yang tidak sinkron
- **Lokasi:** `src/components/Navbar.jsx` (landing) vs header di `src/App.jsx`; `src/context/PlanContext.jsx`
- **Masalah:**
  - `Navbar.jsx` memakai `addedRecipes` / `toggleRecipeInPlan` (field `recipe.name`), sedangkan app memakai `weeklyPlan` (field `recipe.title`) di `localStorage`. Badge "Daftar Belanja" di `Navbar.jsx:50` **tak pernah terisi** karena flow app pakai state berbeda.
  - `App.jsx` punya header sendiri (berbasis `Link`) yang **menduplikasi** `Navbar.jsx` (berbasis `button`), dengan styling berbeda (solid vs `backdrop-blur`) dan URL avatar di-hardcode di 3 tempat.
- **Rekomendasi:** satukan jadi satu komponen navigasi + satu sumber kebenaran data (`weeklyPlan`). Hapus state `addedRecipes` yang usang atau hubungkan ke planner.

#### 8. Type scale tidak konsisten — token headline tak terpakai
- **Lokasi:** `src/index.css` (token `--font-headline-*`), `index.html`, heading di tiap halaman (mis. `RecipeCatalog.jsx:137`, `WeeklyPlanner.jsx:135`)
- **Masalah:** token `--font-headline-*` dipetakan ke **Poppins**, tapi `DESIGN.md` & `index.html` memuat **Plus Jakarta Sans**; mayoritas heading malah pakai utility mentah (`text-3xl md:text-[40px] font-extrabold`) alih-alih token `text-headline-*`. Akibatnya ukuran/berat judul beda-beda antar halaman, dan 3 font (Poppins + Jakarta + Inter) ter-load semua.
- **Rekomendasi:** pilih satu font headline (Plus Jakarta Sans sesuai DESIGN.md), perbaiki token, lalu pakai token di semua heading. Hapus Poppins jika tak terpakai (hemat load).

#### 9. Hex hardcoded & radius tidak konsisten (token discipline)
- **Lokasi:** tersebar — `bg-[#FBFAF9]`, `bg-[#e2f4cb]`, `bg-slate-950/60`, `text-red-600`, `text-amber-300` / `text-red-300` (`WeeklyPlanner.jsx:88-90`)
- **Masalah:** memakai hex/utility mentah padahal token `error` / `success-green` sudah ada. Radius campur: `rounded-3xl`, `rounded-[32px]`, `rounded-[2rem]`, `rounded-2xl`.
- **Rekomendasi:** ganti ke token semantik; standarkan skala radius (mis. `--radius-card`, `--radius-pill`).

#### 10. Gambar: URL placeholder rapuh + tidak lazy + potensi CLS
- **Lokasi:** avatar & gambar grid (`lh3.googleusercontent.com/aida-public/...`)
- **Masalah:** URL placeholder Stitch bisa kedaluwarsa; gambar grid tanpa `loading="lazy"` dan tanpa `width/height` / `aspect-ratio` eksplisit.
- **Rekomendasi:** host aset sendiri, tambahkan `loading="lazy"` + reservasi rasio aspek (`image-optimization`, `image-dimension`).

#### 11. Toast tak terbaca screen reader & aksi destruktif tanpa undo
- **Lokasi:** `src/components/Toast.jsx`; hapus menu di `WeeklyPlanner.jsx`
- **Masalah:** Toast tanpa `role="status"` / `aria-live="polite"` → tak diumumkan. Hapus menu planner hanya menampilkan toast tanpa **Undo** (`undo-support`).
- **Rekomendasi:** tambah `aria-live` pada toast; tambahkan aksi "Urungkan" pada toast hapus.

---

### 🟡 P2 — Penyempurnaan

| Item | Lokasi | Catatan |
|------|--------|---------|
| Kontras teks kecil | `WeeklyPlanner.jsx:255`, `UserProfile.jsx:204` | `text-outline` (#74796c) di atas canvas putih ≈ 4.0:1 untuk teks <14px — di bawah 4.5:1. Gelapkan atau perbesar. |
| Safe-area iOS | bottom action bar planner & bottom-nav baru | Tambah `env(safe-area-inset-bottom)`. |
| Overwrite slot diam-diam | `RecipeCatalog` / `WeeklyPlanner` | Menambah resep ke slot terisi langsung menimpa tanpa konfirmasi. |
| Konsistensi `max-width` | app vs landing | Campur `max-w-6xl` (app) vs `max-w-container-max` (landing). Standarkan. |
| `prefers-reduced-motion` | `index.css` | Belum ada media query untuk `image-reveal`, `fade-in`, hover-scale. |
| Material Symbols berat | `index.html:22` | Memuat seluruh axis (`100..700, 0..1`); batasi sumbu yang dipakai. |

---

## Rencana Eksekusi Bertahap

| Fase | Fokus | Item |
|------|-------|------|
| **Fase 1 — Mobile & A11y kritikal** | P0 | #1 bottom-nav, #3 tombol hapus, #4 reflow planner, #5 touch target, #2 keyboard card, #6 modal focus/scroll-lock |
| **Fase 2 — Konsolidasi arsitektur UI** | P1 | #7 satukan navbar + data, #8 token tipografi, #9 token warna/radius, komponen `<Modal>` & `<RecipeCard>` reusable |
| **Fase 3 — Polish** | P1/P2 | #10 gambar, #11 toast a11y + undo, kontras, safe-area, reduced-motion |

---

## Checklist Verifikasi Pra-Rilis

- [ ] Diuji pada layar 375px (HP kecil) dan orientasi landscape
- [ ] Semua touch target ≥ 44×44px
- [ ] Seluruh elemen interaktif dapat dijangkau & diaktifkan via keyboard, dengan focus ring terlihat
- [ ] Kontras teks ≥ 4.5:1 (teks normal)
- [ ] Modal: scroll-lock, focus trap, return focus berfungsi
- [ ] Tidak ada horizontal-scroll tak disengaja di mobile
- [ ] `prefers-reduced-motion` dihormati
- [ ] Navigasi konsisten di semua halaman, satu sumber data

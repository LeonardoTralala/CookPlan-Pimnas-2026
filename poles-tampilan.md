Saya sudah menelusuri seluruh kode aplikasinya (live site-nya SPA jadi di-render dari React). Berikut masukan UI/UX yang lengkap dan jujur.

---

## 🎨 Kesan Umum

CookPlan punya **fondasi desain yang solid** — design system Material 3 dengan palet hijau natural yang sangat cocok untuk tema makanan sehat & produk lokal. Komponennya rapi (rounded card, shadow lembut, hover animation, gradient overlay). Tapi ada **beberapa masalah yang membuatnya terasa "belum jadi"**, dan untuk konteks PIMNAS/PKM beberapa hal ini bisa langsung dilihat juri. Saya urutkan dari yang paling penting.

---

## 🔴 Kritis — Perbaiki Sebelum Demo Juri

**1. Banner & badge "mode developer" masih tampil ke user**
Di halaman overview/features/tech ada banner:
> 🚀 *"Mode Rebuild: Arsitektur React + Vite + Tailwind v4 + Supabase Sedang Di-setup"* dan badge *"Status: v0.0 (Greenfield)"*

Ini catatan internal developer yang **bocor ke user**. Bagi juri kesannya produk belum selesai. **Hapus seluruhnya** (`App.jsx:158-162` dan `:276-278`).

**2. Dua bahasa desain yang bertabrakan**
Halaman landing/overview/features/tech pakai **tema gelap (slate-950)**, sedangkan aplikasi inti (Catalog/Planner/Shopping/Profile) pakai **tema hijau terang**. Transisi antar keduanya terasa seperti dua aplikasi berbeda. Pilih **satu** identitas — saya sarankan buang tab "Overview/Fitur Utama/Tech Stack" yang gelap itu (itu lebih cocok jadi slide pitch, bukan bagian produk), dan jadikan landing page hijau terang sebagai satu-satunya pintu masuk.

**3. Terlalu banyak `alert()` native**
Tombol search di header, "Bayar & Antar", daftar supplier, "Add to Plan", fitur profil — semua pakai `alert()` browser. Ini memutus estetika yang sudah bagus dan terasa amatir. **Kamu sudah punya komponen `Toast`** — pakai itu secara konsisten. Untuk konfirmasi sukses tambah resep, ganti alert dengan toast.

**4. Tombol search di header aplikasi palsu**
`App.jsx:222` — klik ikon search hanya memunculkan alert *"Gunakan bar pencarian di halaman..."*. Kontrol mati yang membingungkan. **Hubungkan ke fungsi nyata atau hapus.**

**5. Tombol non-fungsional**
- "Load More Recipes" (`RecipeCatalog.jsx:350`) tidak ada `onClick` — tombol mati.
- Link footer "Support / Privacy Policy / Terms" → `href="#"` kosong.

---

## 🟡 Sedang — Pengaruh Besar ke Pengalaman

**6. Bahasa campur aduk Indonesia–Inggris**
Sangat tidak konsisten: planner pakai "Breakfast/Lunch/Dinner" tapi modal katalog pakai "Sarapan/Makan Siang/Makan Malam". Lalu "Weekly Progress", "Recommended for you", "Budget Impact", "Load More", "Settings", "Order History" semua Inggris di tengah teks Indonesia. Untuk audiens PKM Indonesia, **konsistenkan ke Bahasa Indonesia**.

**7. Persona target tidak konsisten**
- Hero & "Why CookPlan" bicara ke **keluarga** ("nutrisi keluarga Anda").
- Tab Features bilang target **"mahasiswa dan pekerja kantoran"**, kirim "ke pintu kos".

Juri PKM akan menyorot value proposition yang kabur. **Pilih satu persona utama** dan samakan semua copy. (Anak kos hemat vs keluarga sehat adalah dua produk berbeda.)

**8. Navigasi berbasis state, bukan URL/routing**
Tidak ada perubahan URL, **tombol Back browser keluar dari aplikasi**, refresh balik ke awal, tidak bisa share link halaman. Saat demo, juri pencet back → langsung keluar. Pertimbangkan `react-router` agar tiap halaman punya URL sendiri.

**9. Klaim & data palsu yang riskan**
- *"Bergabunglah dengan 5,000+ keluarga"* (`FinalCTA.jsx:19`) — social proof fiktif.
- Rekomendasi planner berlabel *"Berdasarkan pesananmu sebelumnya"* padahal hanya `mockRecipes.slice(0,3)` tanpa riwayat pesanan apa pun.

Untuk prototipe wajar pakai dummy, tapi **jangan klaim angka spesifik atau "berdasarkan riwayatmu"** — juri sering menggali ini. Ganti dengan label netral ("Populer", "Rekomendasi").

**10. Planner sulit dipakai di mobile**
Grid 7 kolom dipaksa `min-w-[1000px]` + `hide-scrollbar`, jadi harus scroll horizontal **tanpa indikator scroll**. Di HP banyak user tidak sadar bisa digeser. Pertimbangkan layout **per-hari vertikal/accordion** di mobile.

**11. Dua pintu "Profile" yang berbeda**
`Navbar.jsx` membuka `ProfileModal`, tapi header aplikasi (`App.jsx`) mengarah ke halaman `UserProfile`. Dan avatarnya beda: header pakai foto Google hardcoded, halaman profil pakai placeholder `account_circle` kosong. **Satukan jadi satu alur identitas.**

---

## 🟢 Kecil — Poles Akhir

- **Bug kondisi Reset filter** (`RecipeCatalog.jsx`): default `maxTime=60`/`maxPrice=50000`, tapi reset mengembalikan ke `120`/`60000` dan kondisi tampil tombol Reset adalah `maxTime<120`. Akibatnya tombol "Reset" **muncul terus sejak awal** walau user belum menyentuh apa pun. Samakan nilai default, reset, dan kondisinya.
- **Alt text kontradiktif**: hero `alt="Mediterranean salad"` padahal brand-nya masakan Indonesia. Sesuaikan.
- **Aksesibilitas**: tombol ikon-saja (search/close/delete) belum punya `aria-label`/`sr-only`; modal belum punya `role="dialog"`, focus-trap, tutup via **Escape** atau klik backdrop (sekarang wajib klik X). Label uppercase warna `text-outline` di atas krem berisiko gagal kontras WCAG AA.
- **SEO/share**: `index.html` belum ada `<meta name="description">` maupun Open Graph — saat link dibagikan tidak ada preview. (Font & Material Symbols sudah benar di-load ✅.)

---

## ✅ Yang Sudah Bagus (Pertahankan)

- Design token & type scale di `index.css` rapi dan konsisten.
- Empty state bagus (Shopping List kosong, "Resep tidak ditemukan").
- Micro-interaction halus (`active:scale-95`, hover translate, image zoom).
- Persistensi `localStorage` untuk rencana mingguan — UX nyata, bukan sekadar mockup.
- Auto-agregasi bahan per kategori + scaling porsi di Shopping List = fitur inti yang benar-benar jalan. Ini **nilai jual terkuatmu** — tonjolkan saat demo.

---

**3 prioritas kalau waktu terbatas:** (1) hapus banner/badge developer, (2) satukan tema jadi satu (buang tab gelap), (3) ganti semua `alert()` jadi Toast. Tiga ini saja sudah menaikkan kesan "produk jadi" secara drastis.

Mau saya **langsung kerjakan perbaikannya**? Saya bisa mulai dari 3 prioritas itu atau sesuai yang kamu pilih.
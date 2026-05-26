# 🗺️ ROADMAP.md — Rencana Pengembangan Masakin

Dokumen ini mendefinisikan tahapan pengembangan Masakin dari purwarupa (*prototype*) menjadi produk siap produksi.

---

## Status Saat Ini: Prototype (v0.5)

Aplikasi saat ini berjalan sepenuhnya di sisi klien tanpa backend, database, atau autentikasi nyata. Fungsionalitas inti (katalog resep, meal planning, daftar belanja) sudah berjalan sebagai demo interaktif.

---

## Fase Pengembangan

### ✅ Phase 0 — Prototype (Selesai)
> **Target:** Validasi konsep & desain antarmuka

- [x] Landing page komersial (`Home page.html`)
- [x] UI prototype dengan Tailwind CSS
- [x] Aplikasi fungsional client-side (`deepsek.html`)
- [x] Mock authentication (login/register)
- [x] Katalog resep dengan filter (bahan, waktu, harga)
- [x] Weekly planner (tambah, hapus, regenerate)
- [x] Auto shopping list dengan kategorisasi
- [x] Estimasi biaya belanja

---

### 🔧 Phase 1 — Foundation (v1.0)
> **Target:** Aplikasi siap digunakan dengan data nyata dan persistence
> **Estimasi:** 4–6 minggu

#### 1.1 Perbaikan Bug & Code Quality
- [ ] Fix bug di fungsi `searchRecipes()` (missing closing parenthesis)
- [ ] Refactor kode menjadi modular (pisahkan HTML, CSS, JS)
- [ ] Tambahkan error handling dan validasi input yang lebih baik
- [ ] Standardisasi penamaan variabel dan fungsi

#### 1.2 Backend & Database
- [ ] Setup Supabase project (atau Firebase)
- [ ] Skema database:
  - Tabel `users` — profil pengguna
  - Tabel `recipes` — koleksi resep
  - Tabel `weekly_plans` — rencana mingguan per user
  - Tabel `shopping_lists` — daftar belanja tersimpan
- [ ] Migrasi mock data resep ke database
- [ ] Setup Row Level Security (RLS) di Supabase

#### 1.3 Autentikasi Nyata
- [ ] Integrasi Supabase Auth (email/password)
- [ ] Login dengan Google OAuth
- [ ] Persistent session (tidak logout saat refresh)
- [ ] Reset password via email

#### 1.4 Persistensi Data
- [ ] Weekly plan tersimpan di database (tidak hilang saat refresh)
- [ ] Shopping list bisa disimpan dan diakses kembali
- [ ] Sinkronisasi antar perangkat

---

### 📚 Phase 2 — Recipe Expansion (v1.1)
> **Target:** Katalog resep yang kaya dan komprehensif
> **Estimasi:** 3–4 minggu

#### 2.1 Integrasi Recipe API
- [ ] Evaluasi dan pilih API: Spoonacular vs. Edamam vs. custom database
- [ ] Integrasi API untuk pencarian resep
- [ ] Cache hasil API untuk mengurangi quota usage
- [ ] Tampilkan informasi nutrisi (kalori, protein, karbohidrat, lemak)

#### 2.2 Fitur Resep Lanjutan
- [ ] Filter berdasarkan preferensi diet (vegetarian, vegan, bebas gluten, halal)
- [ ] Filter berdasarkan tingkat kesulitan (Mudah / Sedang / Sulit)
- [ ] Simpan resep ke favorit
- [ ] Rating dan ulasan resep oleh pengguna
- [ ] Halaman detail resep dengan langkah-langkah memasak

#### 2.3 Personalisasi
- [ ] Rekomendasi resep berdasarkan riwayat pilihan
- [ ] Filter resep berdasarkan bahan yang sudah ada di rumah (pantry)
- [ ] Preferensi masakan per pengguna (simpan di profil)

---

### 🏪 Phase 3 — Local Supplier Integration (v1.2)
> **Target:** Menghubungkan daftar belanja dengan mitra lokal
> **Estimasi:** 6–8 minggu

#### 3.1 Database Supplier
- [ ] Tabel `suppliers` — profil mitra produsen/distributor
- [ ] Tabel `supplier_categories` — kategori produk yang dijual
- [ ] Tabel `supplier_products` — daftar produk + harga + stok
- [ ] Panel admin untuk onboarding mitra baru

#### 3.2 Tampilan Pengguna
- [ ] Setiap item di shopping list menampilkan supplier yang tersedia
- [ ] Filter supplier: jarak, harga, rating, ketersediaan stok
- [ ] Halaman profil supplier dengan informasi lengkap
- [ ] Badge "✓ Terverifikasi" untuk mitra resmi

#### 3.3 Geolocation
- [ ] Integrasi Google Maps API / Mapbox
- [ ] Tampilkan supplier terdekat berdasarkan lokasi pengguna
- [ ] Estimasi jarak dan waktu pengambilan

---

### 🚚 Phase 4 — Delivery Service (v1.3)
> **Target:** Pesan bahan masakan dan terima di rumah
> **Estimasi:** 8–10 minggu

#### 4.1 Sistem Order
- [ ] Alur pemesanan: Shopping List → Supplier → Checkout → Konfirmasi
- [ ] Multi-supplier order dalam satu transaksi
- [ ] Penjadwalan pengiriman (same-day / next-day / pilih tanggal)
- [ ] Manajemen alamat pengiriman pengguna

#### 4.2 Pembayaran
- [ ] Integrasi payment gateway (Midtrans atau Xendit)
- [ ] Metode pembayaran: transfer bank, e-wallet (GoPay, OVO, Dana), kartu kredit
- [ ] Invoice digital via email
- [ ] Riwayat transaksi

#### 4.3 Tracking & Notifikasi
- [ ] Real-time status tracking pengiriman
- [ ] Notifikasi WhatsApp / SMS (via Twilio atau Fonnte)
- [ ] Push notification browser saat status berubah
- [ ] Rating pengalaman pengiriman

---

### 🔔 Phase 5 — Smart Pantry & Reminder (v2.0)
> **Target:** Manajemen stok bahan cerdas dengan pengingat
> **Estimasi:** 4–6 minggu

#### 5.1 Digital Pantry
- [ ] Fitur input stok bahan yang sudah dibeli (nama, jumlah, tanggal beli)
- [ ] Database ketahanan bahan berdasarkan kondisi penyimpanan
- [ ] Dashboard "Apa yang ada di kulkasmu?" — lihat stok saat ini

#### 5.2 Pengingat & Notifikasi
- [ ] Notifikasi H-2 sebelum bahan mendekati expired
- [ ] Pengingat stok hampir habis
- [ ] Notifikasi pagi hari "Menu hari ini: [resep]"
- [ ] Alert jika ada rencana masak tapi belum belanja bahan

#### 5.3 Integrasi dengan Planner
- [ ] Shopping list otomatis dikurangi dengan stok yang sudah ada
- [ ] Saran resep berdasarkan bahan yang hampir expired (supaya tidak terbuang)

#### 5.4 Progressive Web App (PWA)
- [ ] Service Worker untuk offline access
- [ ] App manifest (installable di Android & iOS)
- [ ] Push notification via Firebase Cloud Messaging (FCM)

---

## Prioritas Berdasarkan Dampak

```
High Impact, Low Effort  →  Kerjakan Pertama
High Impact, High Effort →  Rencanakan dengan Matang
Low Impact, Low Effort   →  Isi Celah
Low Impact, High Effort  →  Tunda / Evaluasi Ulang
```

| Fitur | Impact | Effort | Prioritas |
|-------|--------|--------|-----------|
| Fix bug searchRecipes | Medium | Low | 🔴 Segera |
| Supabase Auth | High | Medium | 🔴 Segera |
| Persistensi data | High | Medium | 🔴 Segera |
| Recipe API integration | High | Medium | 🟠 Berikutnya |
| Local supplier | High | High | 🟡 Phase 3 |
| Delivery system | High | Very High | 🟡 Phase 4 |
| Pantry & reminder | Medium | Medium | 🟢 Phase 5 |
| PWA | Medium | Medium | 🟢 Phase 5 |

---

## Teknologi yang Direkomendasikan

### Backend
```
Supabase (PostgreSQL + Auth + Realtime + Storage)
  └── Cocok untuk projek ini karena:
      - Open-source & generous free tier
      - Built-in auth, realtime, dan storage
      - REST & GraphQL API otomatis
      - Mudah di-migrate ke self-hosted jika diperlukan
```

### Frontend (jika dimigrasi ke framework)
```
Next.js (React)
  └── Cocok karena:
      - SSR untuk SEO landing page
      - SPA behavior untuk app section
      - File-based routing
      - Ekosistem besar
```

### Notifications
```
Firebase Cloud Messaging (FCM)
  └── Untuk push notification browser & mobile
```

### Payment
```
Midtrans
  └── Payment gateway lokal Indonesia terpercaya
      - Mendukung semua e-wallet populer Indonesia
      - Snap UI yang mudah diintegrasikan
```

---

*Roadmap ini bersifat dinamis dan dapat berubah berdasarkan feedback pengguna dan prioritas bisnis.*

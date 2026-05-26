# 🍳 Masakin — Rencana Masak Mingguan & Belanja Otomatis

> **Cookplan** adalah aplikasi web yang membantu pengguna merencanakan menu masakan mingguan, menghasilkan daftar belanja otomatis, dan menghubungkan mereka dengan produsen bahan makanan lokal.

---

## 📋 Daftar Isi

- [Tentang Projek](#tentang-projek)
- [Fitur Utama](#fitur-utama)
- [Status Fitur](#status-fitur)
- [Struktur Berkas](#struktur-berkas)
- [Tech Stack](#tech-stack)
- [Menjalankan Projek](#menjalankan-projek)
- [Alur Pengguna](#alur-pengguna)
- [Dokumentasi Lanjutan](#dokumentasi-lanjutan)
- [Roadmap](#roadmap)

---

## Tentang Projek

**Masakin** (sebelumnya dikenal sebagai *Kukplen*) adalah aplikasi berbasis web yang dirancang untuk menyederhanakan proses perencanaan masakan dan belanja bahan makanan. Target utama pengguna adalah **mahasiswa kos** dan **pekerja kantoran** yang ingin memasak sendiri tanpa harus repot berpikir tiap hari.

> [!NOTE]
> **Status Kode Sekarang:** Projek ini sedang ditulis ulang dari awal (*code rebuild*). Oleh karena itu, belum ada fitur fungsional yang terimplementasi di kode utama baru. Berkas-berkas HTML yang ada (`Home page.html`, `deepsek.html`, `Untitled-2.html`, dan `Untitled-1.html`) adalah berkas purwarupa (*prototype reference*) dari tahap sebelumnya dan dipertahankan hanya sebagai acuan visual, fungsionalitas mock, dan alur antarmuka.

---

## Fitur Utama

| # | Fitur | Status |
|---|-------|--------|
| 1 | 📚 Katalog Inspirasi Menu | 🔄 Planned |
| 2 | 📅 Perencanaan Menu Mingguan | 🔄 Planned |
| 3 | 🛒 Daftar Belanja Otomatis | 🔄 Planned |
| 4 | 🏪 Integrasi Produsen & Distributor Lokal | 🔄 Planned |
| 5 | 🚚 Pengiriman Bahan Masakan | 🔄 Planned |
| 6 | 🔔 Pengingat Ketahanan Bahan | 🔄 Planned |

> **Catatan:** Semua fitur saat ini berstatus **Planned (Direncanakan)** karena projek sedang dalam proses penulisan ulang kode dari awal (*code rebuild*). Berkas HTML lama (`Home page.html`, `deepsek.html`, dll.) digunakan sebagai acuan/referensi purwarupa saja. Lihat [`FEATURES.md`](./FEATURES.md) untuk rincian spesifikasi.

---

## Struktur Berkas

```
Cookplan/
├── Home page.html       # Landing Page utama (Masakin)
├── deepsek.html         # Aplikasi utama fungsional (Kukplen core)
├── Untitled-2.html      # UI Prototype / desain komponen
├── Untitled-1.html      # Draft awal (pure CSS + Spoonacular API plan)
├── README.md            # Dokumen ini
├── FEATURES.md          # Dokumentasi detail fitur
├── ROADMAP.md           # Rencana pengembangan
└── ARCHITECTURE.md      # Dokumentasi arsitektur teknis
```

### Deskripsi Berkas Utama

#### `Home page.html` — Landing Page
Halaman depan komersial berisi:
- Hero section dengan CTA
- Daftar fitur unggulan (3 kartu fitur)
- Cara Kerja (3 langkah: Pilih resep → Atur jadwal → Dapatkan daftar belanja)
- Testimoni pengguna
- FAQ interaktif (accordion)
- Footer dengan informasi kontak

#### `deepsek.html` — Aplikasi Utama
Aplikasi fungsional client-side berisi:
- Modul autentikasi (Login / Register)
- Katalog resep dengan pencarian & filter
- Weekly Planner (kalender mingguan Senin–Minggu)
- Auto Shopping List dengan kategorisasi dan kalkulasi biaya

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Markup | HTML5 (Semantic) |
| Styling | Tailwind CSS (via CDN) |
| Icons | Font Awesome v6.4.0 |
| Typography | Google Fonts — Poppins |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | In-memory state (no persistence) |
| API | Mock data (no external API calls yet) |

**Color Palette:**

| Variabel | Nilai | Digunakan di |
|----------|-------|--------------|
| `--primary` | `#4CAF50` (Green) | Landing Page |
| `--primary` | `#FF6B6B` (Coral) | App (deepsek.html) |
| `--secondary` | `#FF9800` (Orange) | Landing Page |
| `--secondary` | `#4ECDC4` (Teal) | App (deepsek.html) |

---

## Menjalankan Projek

Karena proyek ini sedang dibangun ulang dari awal (*rebuild*), belum ada kode aplikasi utama yang berjalan. Namun, Anda dapat melihat dan menjalankan berkas purwarupa (*prototype*) HTML yang digunakan sebagai referensi desain dan alur:

### Menjalankan Purwarupa Referensi (Prototype Reference)

1. **Clone atau download** repositori ini ke komputer lokal.
2. Pastikan terhubung ke **internet** (dibutuhkan oleh berkas purwarupa untuk memuat Tailwind CSS, Font Awesome, dan gambar dari Unsplash via CDN).
3. Buka berkas `Home page.html` di browser (Klik ganda berkas atau klik kanan → *Open with* → Chrome/Firefox/Edge).
4. Dari Landing Page purwarupa tersebut, Anda dapat mengklik **"Mulai Rencanakan Sekarang"** untuk membuka `deepsek.html` yang mensimulasikan alur aplikasi.
5. Gunakan kredensial mock berikut untuk demo login cepat pada purwarupa:

```
Username : user1
Password : password1
```

> [!WARNING]
> Berkas-berkas HTML di atas hanyalah referensi purwarupa statis. Pembangunan ulang kode dari awal akan menggunakan struktur proyek baru yang bersih dan terorganisir.

---

## Alur Pengguna

```mermaid
graph TD
    A[Landing Page] -->|Klik Mulai| B{Login / Register}
    B -->|Belum punya akun| C[Register]
    C -->|Sukses| D[Katalog Resep]
    B -->|Login| D
    D -->|Filter & cari| E[Kartu Resep]
    E -->|Add to Plan| F[Pilih Hari & Porsi]
    F --> G[Weekly Planner]
    G -->|Generate| H[Shopping List]
    H -->|Tandai dibeli| I[✅ Selesai]
    G -->|Regenerate| G
```

---

## Dokumentasi Lanjutan

| Dokumen | Deskripsi |
|---------|-----------|
| [`FEATURES.md`](./FEATURES.md) | Spesifikasi lengkap setiap fitur (implementasi & rencana) |
| [`ROADMAP.md`](./ROADMAP.md) | Prioritas pengembangan dari prototype ke production |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Struktur kode, state management, dan panduan integrasi |

---

## Roadmap

Ringkasan singkat tahapan pengembangan selanjutnya:

1. **v1.0 — Production Ready**: Integrasi Supabase/Firebase untuk auth & storage nyata
2. **v1.1 — Recipe API**: Integrasi Spoonacular/Edamam untuk ribuan resep
3. **v1.2 — Local Supplier**: Dashboard mitra produsen & distributor lokal
4. **v1.3 — Delivery**: Layanan kurir bahan masakan ke rumah
5. **v2.0 — PWA**: Aplikasi mobile-installable dengan notifikasi ketahanan bahan

> Lihat [`ROADMAP.md`](./ROADMAP.md) untuk detail lengkap.

---

*Masakin © 2025 — Dibuat dengan ❤️ untuk para pejuang dapur kos dan kantoran.*

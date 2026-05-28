# 🤝 Panduan Kontribusi (CONTRIBUTING.md)

Terima kasih telah berkontribusi di **CookPlan**! Dokumen ini membantu menyelaraskan alur kerja pengembangan agar kolaborasi kita berjalan dengan rapi, minim konflik (*merge conflict*), dan menyenangkan.

---

## 🚀 Alur Kerja Kolaborasi (GitHub Flow)

Kita menggunakan pendekatan Git Branching & Pull Request sederhana untuk mengelola perubahan kode.

### 1. Persiapan Lokal
Sebelum memulai fitur baru, selalu pastikan repositori lokal Anda mutakhir dengan branch utama (`main`):
```bash
git checkout main
git pull origin main
npm install
```

### 2. Penamaan Branch
Buatlah branch baru untuk setiap pekerjaan spesifik. Jangan langsung melakukan commit di branch `main`. Gunakan format penamaan berikut:
- **Fitur baru**: `feature/nama-fitur` (contoh: `feature/auth-supabase` atau `feature/katalog-resep`)
- **Perbaikan bug**: `bugfix/deskripsi-bug` (contoh: `bugfix/responsive-navbar`)
- **Dokumentasi/Konfigurasi**: `chore/deskripsi` (contoh: `chore/update-dependencies`)

Buat branch baru dengan perintah:
```bash
git checkout -b feature/nama-fitur
```

### 3. Konvensi Commit Message
Gunakan pesan commit yang deskriptif dan terstruktur (mengikuti standar *Conventional Commits* semi-formal):
- `feat: [deskripsi]` — Untuk menambahkan fitur baru.
- `fix: [deskripsi]` — Untuk memperbaiki bug.
- `chore: [deskripsi]` — Untuk perubahan konfigurasi, build tool, dependency, dll.
- `docs: [deskripsi]` — Untuk perubahan dokumentasi (README, ARCHITECTURE, dll.).
- `style: [deskripsi]` — Untuk formatting, missing semi-colons, dll. (bukan perubahan fungsional).

*Contoh:*
```bash
git commit -m "feat: implementasi login page dengan supabase auth"
```

### 4. Pushing & Membuka Pull Request (PR)
Setelah selesai bekerja, push branch Anda ke GitHub:
```bash
git push origin feature/nama-fitur
```
Setelah di-push:
1. Buka repositori GitHub CookPlan.
2. Klik tombol **Compare & pull request**.
3. Isi deskripsi PR dengan menjelaskan apa yang diubah, fitur apa yang selesai, dan screenshot/video jika ada perubahan UI.
4. Minta rekan tim untuk me-review kode Anda.
5. Setelah disetujui dan CI build aman (hijau), silakan di-merge ke branch `main`.

---

## 🎨 Panduan Pengembangan & Kode

### 📁 Struktur Folder
Untuk menghindari file yang bertumpuk dalam satu folder, silakan letakkan kode sesuai dengan fungsinya di folder `src/`:
- `src/components/`: Komponen UI yang dapat digunakan kembali (contoh: `Button.jsx`, `RecipeCard.jsx`).
- `src/pages/`: Tampilan halaman utama/tab (contoh: `Dashboard.jsx`, `WeeklyPlanner.jsx`).
- `src/hooks/`: Custom React hooks (contoh: `useAuth.js`).
- `src/context/`: React Context untuk global state (contoh: `PlanContext.jsx`).
- `src/utils/`: Helper functions (contoh: `formatCurrency.js`).
- `src/assets/`: File gambar, ikon, atau font lokal.

### 🛡️ Keamanan & Kredensial
- **JANGAN PERNAH** menyimpan credential nyata (Supabase API Key, private keys, dll.) ke dalam Git.
- Duplikat `.env.example` menjadi `.env` di komputer lokal Anda, lalu isi credential di sana. `.env` sudah diabaikan di `.gitignore`.

### 🚨 Linter & Build Check
Sebelum melakukan push atau membuka PR, biasakan untuk menjalankan perintah linter dan build lokal guna meminimalisir error di GitHub Actions:
```bash
# Cek apakah kode memiliki error linter
npm run lint

# Cek apakah aplikasi berhasil dibuild untuk production tanpa error
npm run build
```
Jika ada error, perbaiki terlebih dahulu sebelum di-push.

---

*Mari kita bangun CookPlan bersama-sama dengan standar kode terbaik! 🍳*

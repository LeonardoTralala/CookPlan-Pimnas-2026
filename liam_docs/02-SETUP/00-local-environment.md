---
phase: setup
status: done
last-updated: 2026-06-11
---

# 🛠️ Local Environment — Install Prerequisites

Sebelum jalanin CookPlan di lokal, kamu butuh 4 tool ini. Semua udah diverifikasi jalan di mesin dev.

## Yang Wajib Diinstall

| Tool | Versi minimal | Versi terverifikasi | Fungsi |
|------|---------------|---------------------|--------|
| Node.js | 18+ | v25.9.0 | Runtime JS (jalanin Vite + build) |
| npm | — (ikut Node) | 11.12.1 | Install dependency |
| Docker Desktop | — | 29.2.1 | Container buat Supabase local |
| Supabase CLI | — | 2.105.0 | Local stack + migration |

> Catatan: project ini cuma butuh Node 18+, tapi mesin dev pakai v25. Aman selama 18 ke atas.

## 1. Node.js + npm

Cara paling gampang di macOS pakai Homebrew:

```bash
brew install node
```

Atau pakai [nvm](https://github.com/nvm-sh/nvm) kalau mau gampang ganti-ganti versi:

```bash
nvm install 18
nvm use 18
```

npm otomatis ikut keinstall bareng Node.

## 2. Docker Desktop

Download dari [docker.com](https://www.docker.com/products/docker-desktop/) lalu install.

> ⚠️ **PENTING (macOS):** Docker Desktop **HARUS sudah running** sebelum kamu jalanin `supabase start`. Supabase local itu jalan di atas Docker (9 container). Kalau Docker mati, `supabase start` bakal error.
>
> Cek icon Docker di menu bar atas — kalau ikon paus-nya stabil (gak animasi loading), berarti udah siap.

## 3. Supabase CLI

Install via Homebrew tap:

```bash
brew install supabase/tap/supabase
```

## Cek Versi Tiap Tool

Habis install semua, pastikan kebaca dengan ngecek versinya:

```bash
node --version       # harusnya v18+ (kita v25.9.0)
npm --version        # 11.12.1
docker --version     # 29.2.1
supabase --version   # 2.105.0
```

Kalau salah satu command "not found", berarti tool itu belum keinstall atau belum masuk PATH. Cek lagi langkah install-nya.

## Catatan Khusus macOS

- **Docker Desktop wajib nyala** dulu sebelum `supabase start`. Ini error paling sering kejadian.
- macOS **tidak punya** command `timeout` bawaan (itu cuma ada di Linux). Buat jalanin proses di background (misal Edge Functions), pakai `nohup ... &` (dijelasin di file lain).

Kalau 4 tool di atas udah kebaca versinya, lanjut ke `01-supabase-local-init.md`.

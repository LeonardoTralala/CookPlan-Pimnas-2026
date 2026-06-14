---
phase: 10
status: proposed
last-updated: 2026-06-14
estimated-effort: TBD (tergantung keputusan strategi tagging)
dependencies: [phase-1, phase-6]
author: diskusi tim (draft)
---

# Phase 10 — Taksonomi Diet & Skala Katalog Resep (PROPOSAL)

> **Status: PROPOSAL — belum dikerjakan.** Dokumen ini untuk didiskusikan tim dulu.
> Setelah disepakati, pecah jadi sub-task + migration, dan catat keputusannya sebagai
> ADR baru di [`00-OVERVIEW/01-decisions-log.md`](../../00-OVERVIEW/01-decisions-log.md).

## Goal

Jadikan **preferensi diet** pada fitur Generate Plan:
1. **Dikelola tim operasional** (non-dev) lewat panel admin — tambah/edit/nonaktifkan
   tanpa deploy.
2. **Scalable & production-grade** untuk katalog ~14.000+ resep (gabungan hasil scrape
   + menu yang diinput sendiri oleh tim ops).
3. **Benar-benar memfilter resep**, bukan sekadar hint ke prompt AI.

## Latar Belakang & Masalah (terverifikasi dari DB)

Per 2026-06-14, kondisi nyata di project `phdbbiydrjwxlehdfubh`:

- **Baru 166 resep** di DB (14k belum di-push — masih di luar, status & cara tagging
  diet-nya *belum diputuskan*).
- Opsi diet di wizard **hardcoded** di `src/pages/GeneratePlan.jsx` (`DIET_OPTIONS`),
  difilter di Edge Function via `recipes.tags && input.diet` (`generate-plan/index.ts`).
- **Kolom `tags` mencampur dua concern** — diet + bahan/kategori jadi satu array:

  | Diet (controlled) | Bahan/kategori (BUKAN diet) |
  |---|---|
  | halal 166, vegetarian 43, bahan-lokal 3, cepat 3, hemat 2, tinggi-protein 2, vegan 1 | daging 40, seafood 40, ayam/udang/kambing/telur/tempe/sapi/ikan/tahu (~20 tiap) |

- **Konsekuensi sekarang:**
  - Kalau opsi diet pernah di-*derive* dari `DISTINCT tags`, `ayam`/`daging`/`udang`
    akan ikut muncul sebagai "filter diet" → **anti-pattern**.
  - Tag diet **timpang**: `vegan` (1), `tinggi-protein` (2), `hemat` (2). Karena Edge
    Function fallback ke semua resep aktif saat hasil filter `< 3`, beberapa opsi diet
    **praktis no-op** hari ini.
  - Di 14k resep hasil scrape, hampir pasti **tidak** membawa vocabulary diet yang rapi
    → filter diet jadi sia-sia tanpa langkah normalisasi.

**Insight inti:** Memindahkan opsi diet ke DB hanya mengurus *sisi opsi*. Yang
menentukan filter diet berfungsi adalah **apakah 14k resep ditandai diet-nya dengan
benar**. Panel admin tidak berguna kalau data resep tidak ter-tag.

## Requirement

| # | Requirement | Catatan |
|---|---|---|
| R1 | Tim ops bisa CRUD daftar diet via admin | tanpa deploy |
| R2 | Tim ops bisa input menu sendiri + set diet-nya | bukan hanya hasil scrape |
| R3 | Diet = controlled vocabulary, terpisah dari tag bahan | satu sumber kebenaran |
| R4 | Filter diet cepat di 14k+ baris | butuh index |
| R5 | Migrasi data 166 lama tanpa kehilangan info | backfill aman |
| R6 | Konsisten dgn pola proyek: RLS per tabel, Edge Function provider-agnostic | — |

## Arsitektur yang Diusulkan

Tiga lapis, dengan **slug sebagai kunci permanen** yang menghubungkan opsi UI ↔ data resep:

```
┌─────────────────────┐     slug (key)      ┌──────────────────────┐
│   diet_tags (master)│◀───────────────────▶│ recipes.diet text[]  │
│  value/label/urutan │                     │  array of slug diet  │
│  dikelola admin ops │                     │  + GIN index         │
└─────────────────────┘                     └──────────────────────┘
          │                                            ▲
          ▼ fetch opsi                                 │ filter overlaps()
   Wizard Generate Plan                        Edge Function generate-plan
```

### Tabel master `diet_tags`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid / bigint | PK |
| `value` | text UNIQUE | **slug permanen** (mis. `vegetarian`), JANGAN diubah setelah dipakai |
| `label` | text | teks tampilan (mis. "Vegetarian") — boleh diubah admin |
| `description` | text NULL | tooltip opsional |
| `icon` | text NULL | nama material-symbol opsional |
| `sort_order` | int | urutan tampil |
| `is_active` | boolean | sembunyikan tanpa hapus |
| `created_at` / `updated_at` | timestamptz | audit |

**Prinsip:** `value` (slug) itu *key data*, immutable. Admin mengubah `label`/urutan/aktif,
**bukan** slug. Ini yang membuat array slug di `recipes` tetap valid walau label berubah.

### Penyimpanan diet pada resep — 2 opsi (perlu keputusan tim)

**Opsi 1 — Kolom array `recipes.diet text[]` (REKOMENDASI).**
- Isi = array slug diet. + `CREATE INDEX ... USING GIN (diet)`.
- Edge Function tetap pakai `overlaps()` → perubahan query minimal.
- Karena slug immutable, rename label tidak menyentuh data resep.
- ➕ paling simpel, cepat, sedikit churn. ➖ integritas slug→master bersifat *soft*
  (dijaga di UI input + check berkala / trigger opsional).

**Opsi 2 — Join table `recipe_diet_tags (recipe_id, diet_tag_id)`.**
- Normalisasi penuh, FK ke `diet_tags.id`, integritas keras.
- ➕ paling "textbook" production. ➖ query filter butuh join/`EXISTS`, bulk-tagging 14k
  lebih ribet, ubah Edge Function lebih banyak.

> **Rekomendasi penulis:** Opsi 1. Untuk facet bertipe tag, array slug + GIN sudah pola
> production yang umum, dan slug immutable sudah memberi 90% manfaat integritas tanpa
> biaya join. Naik ke Opsi 2 hanya bila tim butuh FK keras + relasi diet yang kaya.

### `tags` lama tetap dipertahankan
Kolom `tags` **tidak dihapus** — biarkan untuk bahan/kategori/cuisine. Diet pindah ke
kolom/relasi sendiri supaya dua concern tidak saling mengotori.

## Bagian Tersulit: Strategi Tagging Diet untuk 14k (BELUM DIPUTUSKAN)

Ini blocker sebenarnya. Manual 14k = tidak realistis. Tiga pendekatan:

| Pendekatan | Cara | Plus | Minus |
|---|---|---|---|
| **Rule/keyword** | Deteksi dari `ingredients_text`/`title` (mis. ada "ayam/sapi/ikan" → bukan vegetarian; tanpa daging/seafood → kandidat vegetarian) | murah, cepat, deterministik | kasar, banyak false negative untuk diet kompleks |
| **Klasifikasi AI batch** | Kirim resep ke model (reuse adapter `_shared/aiAdapter.ts`), minta label diet dari vocabulary | akurat, paham konteks | ada biaya token (sekali jalan), perlu QC |
| **Hybrid (REKOMENDASI)** | Rules untuk yang gampang/jelas, AI untuk yang ambigu, sisanya `is_active=false` sampai diverifikasi | seimbang biaya vs akurasi | pipeline 2 tahap |

**Catatan penting:** Tagging diet ini idealnya **digabung ke pipeline import katalog
14k yang sama**, bukan job terpisah. Ini bersinggungan dengan blocker katalog yang sudah
ada (data scrape Cookpad: price/image hilang + risiko IP — lihat catatan strategi
katalog). Keputusan import 14k dan tagging diet sebaiknya diambil bersamaan.

## Perubahan Kode (ringkas)

- **Migration baru** (`supabase/migrations/`):
  - `create_diet_tags` (tabel master + RLS: SELECT publik untuk `is_active`, ALL untuk admin via `is_admin()`).
  - `recipes_add_diet` (kolom `recipes.diet text[]` default `'{}'` + GIN index).
  - Backfill: pindahkan 7 slug diet dari `recipes.tags` → `recipes.diet`, seed `diet_tags`.
  - **Wajib**: setiap migration yang bikin tabel HARUS sekaligus pasang RLS policy
    (tabel baru = deny-all default).
- **Admin** (`supabase/functions/admin-providers` pola serupa + `src/pages/admin/`):
  CRUD `diet_tags`. Pertimbangkan juga form input/edit resep + setter diet (R2).
- **Wizard** (`GeneratePlan.jsx`): ganti konstanta `DIET_OPTIONS` → fetch dari service
  baru `dietService.getActiveDietTags()` (cache, dengan loading state).
- **Edge Function** (`generate-plan/index.ts`): filter `recipes.diet` (bukan `tags`);
  pertimbangkan revisi aturan fallback `< 3` agar diet sparse tidak diam-diam diabaikan.

## RLS (sketsa)

- `diet_tags`: `SELECT` publik hanya baris `is_active=true`; `INSERT/UPDATE/DELETE` hanya admin (`is_admin()`), selaras pola Phase 6.
- `recipes.diet`: ikut policy `recipes` yang sudah ada (read publik untuk aktif, tulis admin).

## Urutan Rollout yang Disarankan

```
1. Bekuin vocabulary slug diet (keputusan produk)        ← sebelum DB apa pun
2. Putuskan strategi tagging 14k (rules / AI / hybrid)   ← blocker asli
3. Putuskan Opsi 1 vs Opsi 2 (array vs join table)
4. Migration: diet_tags + recipes.diet + GIN + RLS + seed/backfill 7 slug
5. Backfill recipes.diet untuk 14k (jalankan tagging job, gabung ke import katalog)
6. Admin UI CRUD diet_tags + setter diet di form resep
7. Wizard fetch dinamis + Edge Function filter ke recipes.diet
```

Langkah 6–7 (yang paling kelihatan) justru **paling akhir & paling mudah**. Sukses-gagal
ditentukan langkah 1–3.

## Open Questions (untuk diskusi tim)

1. **Vocabulary final:** mana yang benar-benar "diet/preferensi" vs yang seharusnya
   kategori bahan/cuisine? (`hemat`/`cepat` itu preferensi atau facet lain?)
2. **Strategi tagging 14k:** rules, AI, atau hybrid? Berapa budget token kalau pakai AI?
3. **Opsi 1 vs Opsi 2** penyimpanan diet di resep?
4. **Import 14k:** kapan & gimana, mengingat blocker price/image/IP yang sudah ada?
5. **Multi-pilih diet:** apakah AND (resep harus penuhi semua) atau OR/overlap (seperti
   sekarang)? Mempengaruhi UX & query.

## Risiko

- **Tanpa langkah 2 (tagging), fitur diet tetap no-op di skala 14k** — panel admin jadi
  kosmetik. Ini risiko terbesar.
- `overlaps()` tanpa GIN index di 14k = full scan tiap generate (latensi + biaya).
- Slug diubah setelah dipakai = data resep yatim. Mitigasi: perlakukan slug sebagai
  immutable; admin hanya ubah label.

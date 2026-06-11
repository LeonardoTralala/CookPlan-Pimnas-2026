---
phase: reference
status: done
last-updated: 2026-06-11
---

# Prompt Library

Semua prompt engineering buat fitur AI ada di `supabase/functions/_shared/prompt.ts`. Strategi intinya: **schema-in-prompt** — schema output dikirim sebagai teks di dalam prompt, bukan pakai native JSON-mode/function-calling tiap provider. Tujuannya biar provider-agnostic (ADR-005): jalan di provider mana pun tanpa peduli dukungan JSON-mode bawaannya.

> Catatan: `supports_json_mode` di `ai_providers` cuma nge-set `response_format: { type: "json_object" }` di level HTTP (lihat `aiAdapter.ts`). Tapi schema tetap ditempel di prompt sebagai sumber kebenaran, jadi provider tanpa JSON-mode pun tetap dapet instruksi schema yang sama.

---

## `SYSTEM_PROMPT`

Mendefinisikan peran, tugas, dan aturan wajib AI. Persona: "CookPlan AI", meal planner buat pengguna Indonesia (mahasiswa kos & pekerja kantoran).

Aturan wajib yang ditanamkan:

1. **HANYA** pakai resep dari bank resep yang dikasih (pakai `recipe_id` valid). Gak boleh ngarang resep.
2. Hormati preferensi diet & alergi sebagai **hard constraint**.
3. Variasikan menu antar hari (hindari menu sama berturut-turut).
4. Sesuaikan jumlah porsi dengan input user.
5. Total estimasi biaya jangan lebih dari budget + 10%. Kasih peringatan di `warnings` kalau budget kekecilan.
6. Isi tiap slot makan sesuai periode (3/7/14 hari).
7. Bahasa Indonesia santai & ramah buat field teks.

Output: **WAJIB JSON valid SAJA**, tanpa penjelasan tambahan, tanpa markdown code fence.

---

## `OUTPUT_SCHEMA_TEXT`

Schema output dalam bentuk teks JSON yang ditempel ke pesan user. Ini "kontrak" yang harus diikuti AI:

```jsonc
{
  "plan_summary": "string - ringkasan singkat plan",
  "days": [
    {
      "day": "string - nama hari (Hari 1, ... atau Senin, ...)",
      "meals": [
        {
          "meal_type": "breakfast | lunch | dinner",
          "recipe_id": "number - WAJIB ada di bank resep",
          "servings": "number",
          "notes": "string - tip singkat (opsional)"
        }
      ]
    }
  ],
  "shopping_list": [
    {
      "ingredient": "string",
      "total_amount": "number",
      "unit": "string",
      "category": "vegetables | meat | dairy | spices | dry_goods",
      "estimated_price_idr": "number"
    }
  ],
  "prep_instructions": ["string - langkah batch cooking / persiapan"],
  "total_estimated_cost": "number",
  "warnings": ["string - peringatan, mis. budget kurang, diet tidak terpenuhi"]
}
```

---

## `buildUserMessage(input, candidates)`

Nyusun pesan user dari input form + bank resep + pantry. Strukturnya:

1. **Permintaan user** — periode (hari), porsi per menu, preferensi diet (atau "tidak ada preferensi khusus"), budget total (format `Rp ...` lokal id-ID), jenis output.
2. **Bahan tersedia di rumah (pantry)** — list `- nama amount unit`, atau "(tidak ada bahan di rumah)".
3. **Bank resep tersedia** — array JSON ringkas. Tiap resep dipetakan ke field hemat token:

   ```jsonc
   {
     "recipe_id": 12,
     "title": "...",
     "kalori": 450,
     "harga_per_resep_idr": 25000,
     "porsi_dasar": 2,
     "waktu_menit": 30,
     "tags": ["halal"],
     "bahan": "<ingredients_text>"   // ringkasan string, hemat token
   }
   ```

4. **Schema output** — `OUTPUT_SCHEMA_TEXT` ditempel di sini.
5. **Instruksi penutup** — "Buatkan plan untuk N hari. Tiap hari isi minimal makan siang & malam (sarapan opsional). Output JSON saja."

### Kenapa pakai `ingredients_text`?

Bahan resep di-denormalisasi jadi satu string (`ingredients_text` di tabel `recipes`) supaya hemat token saat dikirim ke AI, dibanding ngirim array `recipe_ingredients` lengkap. Bank resep dibatasi 40 kandidat (lihat `generate-plan/index.ts`) biar prompt gak kebanyakan.

---

## Strategi schema-in-prompt: ringkasan

| Aspek | Pendekatan |
|---|---|
| Lokasi schema | Teks di dalam prompt (`OUTPUT_SCHEMA_TEXT`) |
| Provider-agnostic | Ya — gak gantung native JSON-mode |
| JSON-mode HTTP | Opsional, di-set kalau `supports_json_mode` true |
| Parsing | Defensive (`safeJsonExtract`): parse langsung → strip code fence → ambil blok `{...}` |
| Recovery | Retry 1x dengan pesan korektif kalau JSON rusak |
| Validasi | Semantik post-parse (`validateOutput`): cek `recipe_id` valid, struktur `days`/`shopping_list` |

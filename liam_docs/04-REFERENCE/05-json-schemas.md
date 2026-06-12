---
phase: reference
status: done
last-updated: 2026-06-11
---

# JSON Schema

Dokumen ini ngerangkum dua schema penting di fitur AI: **input** yang dikirim ke `generate-plan` (`GenerateInput`) dan **output** yang dihasilkan AI. Sumbernya `_shared/validate.ts` dan `_shared/prompt.ts`.

---

## Input: `GenerateInput`

Didefinisikan di `validate.ts` dan dinormalisasi oleh `validateInput(raw)`.

```ts
interface GenerateInput {
  periode: number;        // 3 | 7 | 14
  porsi: number;          // >= 1
  diet: string[];
  budget: number;         // IDR
  pantry: { name: string; amount?: number; unit?: string }[];
  outputType: "foodplan" | "foodprep" | "full";
}
```

### Aturan validasi & normalisasi

| Field | Aturan | Error kalau gagal |
|---|---|---|
| `periode` | harus salah satu dari `[3, 7, 14]` | `Periode harus 3, 7, atau 14 hari.` |
| `porsi` | finite, `1 <= porsi <= 20` | `Jumlah porsi harus antara 1 dan 20.` |
| `budget` | finite, `>= 0` | `Budget tidak valid.` |
| `outputType` | default `"foodplan"`, harus in `[foodplan, foodprep, full]` | `Jenis output tidak valid.` |
| `diet` | array → lowercase + trim + buang kosong, max 10 item | (di-normalisasi, gak throw) |
| `pantry` | array, max 50 item; tiap item `name` (max 80 char), `amount` (number/undefined), `unit` (max 20 char); buang item tanpa name | (di-normalisasi, gak throw) |

Kalau `raw` bukan objek → throw `Input tidak valid.`

---

## Output AI (`plan`)

Schema yang diminta dari AI (lihat `OUTPUT_SCHEMA_TEXT` di prompt.ts). Disimpan di `generated_plans.output_json` dan dikembalikan ke klien sebagai `plan`.

```jsonc
{
  "plan_summary": "string",
  "days": [
    {
      "day": "string",            // "Hari 1" atau "Senin"
      "meals": [
        {
          "meal_type": "breakfast | lunch | dinner",
          "recipe_id": 12,         // WAJIB ada di bank resep
          "servings": 2,
          "notes": "string"        // opsional
        }
      ]
    }
  ],
  "shopping_list": [
    {
      "ingredient": "string",
      "total_amount": 500,
      "unit": "string",
      "category": "vegetables | meat | dairy | spices | dry_goods",
      "estimated_price_idr": 8000
    }
  ],
  "prep_instructions": ["string"],
  "total_estimated_cost": 285000,
  "warnings": ["string"]
}
```

### Validasi output (`validateOutput`)

Dilakukan secara semantik setelah JSON di-parse. Return `{ ok, errors }`.

| Cek | Kondisi gagal | Pesan error |
|---|---|---|
| Tipe root | bukan objek | `Output bukan objek.` |
| `days` | bukan array / kosong | `Field 'days' kosong atau bukan array.` |
| `days[].meals` | bukan array | `Sebuah hari tidak punya 'meals'.` |
| `meals[].recipe_id` | gak ada di `validRecipeIds` | `recipe_id <id> tidak ada di bank resep.` |
| `shopping_list` | bukan array | `Field 'shopping_list' bukan array.` |
| budget | `total > budget * 1.1` | **bukan hard error** — cuma warning (AI harusnya udah isi `warnings`) |

`ok = true` cuma kalau `errors` kosong. `validRecipeIds` itu Set dari id resep kandidat (max 40 resep aktif).

### Post-processing: `subtractPantry`

Setelah lolos validasi, server ngurangin pantry user dari `shopping_list` (bukan didelegasikan ke AI):

- Pencocokan nama **longgar**: case-insensitive + substring (dua arah).
- Item pantry **tanpa amount** → dianggap cukup, item dibuang dari list.
- Item pantry **dengan amount** → `total_amount` dikurangi; kalau sisa `<= 0` dibuang, kalau `> 0` di-update + tambah flag `_note: "dikurangi stok rumah"`.
- `total_estimated_cost` dihitung ulang dari sisa item (jumlah `estimated_price_idr`).

---

## Catatan kategori

`category` di `shopping_list` dan `recipe_ingredients` pakai enum yang sama:

```
vegetables | meat | dairy | spices | dry_goods
```

`meal_type` konsisten di seluruh sistem (`meal_entries`, output AI):

```
breakfast | lunch | dinner
```

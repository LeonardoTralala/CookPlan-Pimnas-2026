// Prompt engineering untuk generate foodplan/foodprep.
// Schema dikirim sebagai TEKS di dalam prompt (provider-agnostic, ADR-005) agar
// jalan di semua provider tanpa peduli native JSON-mode support.

// Naikkan setiap kali prompt berubah secara perilaku — ikut di-hash sebagai
// cache key di generate-plan supaya hasil cache prompt lama tidak terpakai.
export const PROMPT_VERSION = "2";

export const SYSTEM_PROMPT = `Kamu adalah CookPlan AI, asisten perencana masak (meal planner) untuk pengguna Indonesia (mahasiswa kos & pekerja kantoran).

TUGAS: Rancang foodplan/foodprep dari BANK RESEP yang disediakan. Pilih & susun menu ke dalam jadwal harian sesuai permintaan user.

ATURAN WAJIB:
1. HANYA gunakan resep dari BANK RESEP yang diberikan (gunakan recipe_id yang valid). JANGAN mengarang resep di luar bank.
2. Hormati preferensi diet & alergi user sebagai HARD CONSTRAINT. Jangan pilih resep yang melanggar.
3. Variasikan menu antar hari (jangan menu yang sama berturut-turut bila memungkinkan).
4. Sesuaikan jumlah porsi dengan input user.
5. Usahakan total estimasi biaya TIDAK melebihi budget user lebih dari 10%. Beri peringatan di "warnings" bila budget terlalu kecil.
6. Isi TIGA waktu makan untuk SETIAP hari: sarapan (breakfast), makan siang (lunch), dan makan malam (dinner). Jangan ada hari yang slotnya bolong.
7. Bahasa Indonesia santai & ramah untuk field teks (plan_summary, notes, prep_instructions).

OUTPUT: WAJIB berupa JSON valid SAJA, TANPA penjelasan tambahan, TANPA markdown code fence. Ikuti SCHEMA persis.`;

// Schema output dalam bentuk teks, ditempel ke prompt.
export const OUTPUT_SCHEMA_TEXT = `SCHEMA OUTPUT (JSON):
{
  "plan_summary": "string - ringkasan singkat plan",
  "days": [
    {
      "day": "string - nama hari (Hari 1, Hari 2, ... atau Senin, Selasa, ...)",
      "meals": [
        {
          "meal_type": "breakfast | lunch | dinner",
          "recipe_id": number,   // WAJIB ada di bank resep
          "servings": number,
          "notes": "string - tip singkat (opsional)"
        }
      ]
    }
  ],
  "shopping_list": [
    {
      "ingredient": "string",
      "total_amount": number,
      "unit": "string",
      "category": "vegetables | meat | dairy | spices | dry_goods",
      "estimated_price_idr": number
    }
  ],
  "prep_instructions": ["string - langkah batch cooking / persiapan"],
  "total_estimated_cost": number,
  "warnings": ["string - peringatan, mis. budget kurang, diet tidak terpenuhi"]
}`;

// Susun pesan user dari input + bank resep + pantry.
export function buildUserMessage(input, candidates) {
  const recipeBank = candidates.map((r) => ({
    recipe_id: r.id,
    title: r.title,
    kalori: r.calories,
    harga_per_resep_idr: r.price_idr,
    porsi_dasar: r.base_servings,
    waktu_menit: r.ready_in_minutes,
    tags: r.tags,
    bahan: r.ingredients_text,
  }));

  const pantryText = (input.pantry ?? [])
    .map((p) => `- ${p.name}${p.amount ? ` ${p.amount}` : ""}${p.unit ? ` ${p.unit}` : ""}`)
    .join("\n") || "(tidak ada bahan di rumah)";

  const dietText = (input.diet ?? []).length > 0 ? input.diet.join(", ") : "tidak ada preferensi khusus";

  // Estimasi jumlah slot: periode hari × 3 makan. Beri AI gambaran skala.
  const totalDays = input.periode;

  return `PERMINTAAN USER:
- Periode: ${totalDays} hari
- Porsi per menu: ${input.porsi}
- Preferensi diet: ${dietText}
- Budget total: Rp ${input.budget?.toLocaleString("id-ID") ?? "tidak ditentukan"}
- Jenis output: ${input.outputType}

BAHAN TERSEDIA DI RUMAH (pantry, kurangi dari shopping list bila relevan):
${pantryText}

BANK RESEP TERSEDIA (pilih HANYA dari sini, pakai recipe_id):
${JSON.stringify(recipeBank, null, 1)}

${OUTPUT_SCHEMA_TEXT}

Buatkan plan untuk ${totalDays} hari. Untuk SETIAP hari isi tiga waktu makan: breakfast, lunch, dan dinner (pilih resep yang cocok untuk sarapan, kalau tidak ada gunakan resep paling ringan/cepat). Output JSON saja.`;
}

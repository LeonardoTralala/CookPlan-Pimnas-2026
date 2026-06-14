// Validasi input & output AI, plus post-processing pantry subtraction.

export interface GenerateInput {
  periode: number;        // 3 | 7 | 14
  porsi: number;          // >=1
  diet: string[];
  budget: number;         // IDR
  pantry: { name: string; amount?: number; unit?: string }[];
  outputType: "foodplan" | "foodprep" | "full";
  meals: string[];        // subset dari ["breakfast","lunch","dinner"], minimal 1
  notes: string;          // catatan khusus user (opsional, preferensi tambahan), max 300
}

const NOTES_MAX = 300;

// Periode bebas 1..7 hari (maksimal selaras kapasitas planner mingguan).
const PERIODE_MIN = 1;
const PERIODE_MAX = 7;
const VALID_OUTPUT = ["foodplan", "foodprep", "full"];
// Urutan kanonik waktu makan — dipakai untuk normalisasi & tampilan konsisten.
const VALID_MEALS = ["breakfast", "lunch", "dinner"];

// Validasi & normalisasi input dari klien. Throw Error dengan pesan ramah.
export function validateInput(raw: unknown): GenerateInput {
  if (!raw || typeof raw !== "object") throw new Error("Input tidak valid.");
  const r = raw as Record<string, unknown>;

  const periode = Math.floor(Number(r.periode));
  if (!Number.isFinite(periode) || periode < PERIODE_MIN || periode > PERIODE_MAX) {
    throw new Error(`Periode harus antara ${PERIODE_MIN} dan ${PERIODE_MAX} hari.`);
  }

  const porsi = Number(r.porsi);
  if (!Number.isFinite(porsi) || porsi < 1 || porsi > 20) {
    throw new Error("Jumlah porsi harus antara 1 dan 20.");
  }

  const budget = Number(r.budget);
  if (!Number.isFinite(budget) || budget < 0) {
    throw new Error("Budget tidak valid.");
  }

  const outputType = String(r.outputType ?? "foodplan");
  if (!VALID_OUTPUT.includes(outputType)) {
    throw new Error("Jenis output tidak valid.");
  }

  const diet = Array.isArray(r.diet)
    ? r.diet.map((d) => String(d).toLowerCase().trim()).filter(Boolean).slice(0, 10)
    : [];

  const pantryRaw = Array.isArray(r.pantry) ? r.pantry : [];
  const pantry = pantryRaw.slice(0, 50).map((p) => {
    const item = p as Record<string, unknown>;
    return {
      name: String(item.name ?? "").trim().slice(0, 80),
      amount: item.amount != null ? Number(item.amount) : undefined,
      unit: item.unit != null ? String(item.unit).trim().slice(0, 20) : undefined,
    };
  }).filter((p) => p.name);

  // Waktu makan yang diminta. Normalisasi ke urutan kanonik + dedup; kosong/
  // tidak valid → default semua tiga (kompatibel dengan klien lama tanpa field ini).
  const mealsRaw = Array.isArray(r.meals)
    ? r.meals.map((m) => String(m).toLowerCase().trim())
    : [];
  const mealsSet = new Set(mealsRaw.filter((m) => VALID_MEALS.includes(m)));
  const meals = VALID_MEALS.filter((m) => mealsSet.has(m));
  if (meals.length === 0) meals.push(...VALID_MEALS);

  // Catatan khusus opsional. Trim + cap panjang (hemat token + batasi abuse).
  const notes = String(r.notes ?? "").trim().slice(0, NOTES_MAX);

  return { periode, porsi, diet, budget, pantry, meals, notes, outputType: outputType as GenerateInput["outputType"] };
}

// Validasi output AI secara semantik. Return { ok, errors }.
export function validateOutput(
  output: unknown,
  validRecipeIds: Set<number>,
  input: GenerateInput,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!output || typeof output !== "object") {
    return { ok: false, errors: ["Output bukan objek."] };
  }
  const o = output as Record<string, unknown>;

  if (!Array.isArray(o.days) || o.days.length === 0) {
    errors.push("Field 'days' kosong atau bukan array.");
  } else {
    for (const day of o.days as Record<string, unknown>[]) {
      const meals = day.meals;
      if (!Array.isArray(meals)) { errors.push("Sebuah hari tidak punya 'meals'."); continue; }
      for (const m of meals as Record<string, unknown>[]) {
        const rid = Number(m.recipe_id);
        if (!validRecipeIds.has(rid)) {
          errors.push(`recipe_id ${m.recipe_id} tidak ada di bank resep.`);
        }
      }
    }
  }

  if (!Array.isArray(o.shopping_list)) {
    errors.push("Field 'shopping_list' bukan array.");
  }

  // Budget check (toleransi 10%)
  const total = Number(o.total_estimated_cost ?? 0);
  if (input.budget > 0 && total > input.budget * 1.1) {
    // bukan hard error — hanya warning, AI seharusnya sudah kasih warnings
  }

  return { ok: errors.length === 0, errors };
}

// Buang slot makan yang tidak diminta user (safety net post-process: prompt sudah
// menginstruksikan, tapi jangan percaya penuh ke AI — sama filosofinya dgn subtractPantry).
// Tidak menyentuh shopping_list/total karena harga dihitung per resep, dan resep yang
// sama bisa dipakai ulang di slot lain; pengurangan biaya diserahkan ke subtractPantry.
export function filterMeals(output: Record<string, unknown>, meals: string[]) {
  if (!Array.isArray(output.days) || meals.length >= VALID_MEALS.length) return output;
  const allowed = new Set(meals);
  const days = (output.days as Record<string, unknown>[]).map((day) => {
    if (!Array.isArray(day.meals)) return day;
    const kept = (day.meals as Record<string, unknown>[]).filter(
      (m) => allowed.has(String(m.meal_type)),
    );
    return { ...day, meals: kept };
  });
  return { ...output, days };
}

// Kurangi pantry user dari shopping list. Pencocokan nama longgar (case-insensitive,
// substring). Untuk bahan dengan amount, kurangi; kalau habis, buang dari list.
export function subtractPantry(output: Record<string, unknown>, pantry: GenerateInput["pantry"]) {
  if (!Array.isArray(output.shopping_list) || pantry.length === 0) return output;

  // Pencocokan berbasis kata (token), bukan substring mentah. Mencegah false
  // positive seperti pantry "ayam" menghapus item "bayam" (audit M2).
  const tokenize = (s: string) =>
    new Set(s.toLowerCase().split(/[^a-z0-9]+/i).filter((t) => t.length >= 3));

  const pantryEntries = pantry
    .map((p) => ({ tokens: tokenize(p.name), amount: p.amount, name: p.name.toLowerCase().trim() }))
    .filter((p) => p.name.length > 0);

  const list = output.shopping_list as Record<string, unknown>[];
  const filtered: Record<string, unknown>[] = [];

  for (const item of list) {
    const rawName = String(item.ingredient ?? "").trim();
    if (!rawName) { filtered.push(item); continue; }
    const itemTokens = tokenize(rawName);
    let matchedAmount: number | undefined;
    let matched = false;

    for (const p of pantryEntries) {
      // Cocok bila ada token yang sama persis di kedua sisi, atau nama sama persis.
      const shared = [...p.tokens].some((t) => itemTokens.has(t));
      if (shared || p.name === rawName.toLowerCase()) {
        matched = true;
        matchedAmount = p.amount;
        break;
      }
    }

    if (!matched) {
      filtered.push(item);
      continue;
    }

    // Punya jumlah pantry → kurangi. Tanpa jumlah → anggap cukup, buang item.
    if (matchedAmount == null) {
      // skip item (sudah punya di rumah)
      continue;
    }
    const need = Number(item.total_amount ?? 0);
    const remaining = need - matchedAmount;
    if (remaining > 0) {
      // Skala harga proporsional terhadap sisa kebutuhan supaya
      // total_estimated_cost setelah recompute mencerminkan jumlah yang
      // benar-benar perlu dibeli (audit Copilot: jangan biarin harga penuh
      // padahal jumlah sudah dikurangi).
      const price = Number(item.estimated_price_idr ?? 0);
      const newPrice = need > 0 ? price * (remaining / need) : price;
      filtered.push({
        ...item,
        total_amount: remaining,
        estimated_price_idr: Math.round(newPrice),
        _note: "dikurangi stok rumah",
      });
    }
    // kalau <= 0, buang (sudah tercukupi)
  }

  // Recompute total dari sisa item
  const newTotal = filtered.reduce((sum, it) => sum + Number(it.estimated_price_idr ?? 0), 0);
  return { ...output, shopping_list: filtered, total_estimated_cost: newTotal };
}

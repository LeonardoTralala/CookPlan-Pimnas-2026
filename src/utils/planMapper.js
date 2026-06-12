// Mapper hasil generate AI → slot Rencana Masak Mingguan (planner).
// Output AI: plan.days[].day bisa "Senin"/"Selasa"/... atau "Hari 1"/"Hari 2"/...
// Planner: key hari Indonesia (Senin..Minggu) × meal_type (breakfast/lunch/dinner).
// Konstanta sengaja didefinisikan lokal agar util ini pure (tidak menarik supabase).

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

// Tentukan nama hari planner dari label hari AI. Prioritas:
// 1) mengandung nama hari Indonesia, 2) mengandung angka ("Hari 3" → Rabu),
// 3) fallback urutan index entri.
function resolveDayName(raw, idx) {
  const text = String(raw ?? "").toLowerCase();
  const named = DAYS.find((d) => text.includes(d.toLowerCase()));
  if (named) return named;
  const num = text.match(/(\d+)/);
  if (num) {
    const i = Number(num[1]) - 1;
    if (i >= 0 && i < DAYS.length) return DAYS[i];
  }
  return DAYS[idx];
}

// Ubah plan hasil AI menjadi daftar slot siap masuk planner.
// recipeIndex: Map<recipe_id, recipe> (shape camelCase dari recipeService).
// Return { slots: [{ recipe, day, mealType, servings }], skippedDays, skippedMeals }.
// Plan > 7 hari: hanya 7 entri pertama yang muat di planner mingguan.
export function mapGeneratedPlanToWeek(plan, recipeIndex) {
  const slots = [];
  let skippedDays = 0;
  let skippedMeals = 0;

  (plan?.days ?? []).forEach((dayEntry, idx) => {
    if (idx >= DAYS.length) {
      skippedDays += 1;
      return;
    }
    const day = resolveDayName(dayEntry.day, idx);
    for (const meal of dayEntry.meals ?? []) {
      const recipe = recipeIndex.get(meal.recipe_id);
      if (!recipe || !MEAL_TYPES.includes(meal.meal_type)) {
        skippedMeals += 1;
        continue;
      }
      const servings = Number(meal.servings);
      slots.push({
        recipe,
        day,
        mealType: meal.meal_type,
        servings: Number.isFinite(servings) && servings >= 1 ? Math.min(Math.round(servings), 20) : 2,
      });
    }
  });

  return { slots, skippedDays, skippedMeals };
}

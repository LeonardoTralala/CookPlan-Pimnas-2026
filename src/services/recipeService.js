import { supabase } from "../lib/supabase.js";

// Service layer untuk bank resep. Mengganti import langsung dari mockRecipes.js.
// Kolom DB (snake_case) di-alias ke camelCase agar bentuk objek persis sama dengan
// mockRecipes lama — komponen (RecipeCatalog, WeeklyPlanner, ShoppingList) hampir
// tidak perlu diubah.

const RECIPE_SELECT = `
  id, title, description, calories, difficulty, cuisine, badges, tags, instructions,
  imageUrl:image_url,
  priceIdr:price_idr,
  readyInMinutes:ready_in_minutes,
  baseServings:base_servings,
  ingredientsText:ingredients_text,
  ingredients:recipe_ingredients (
    name, amount, unit, category, priceIdr:price_idr
  )
`;

// Ambil semua resep aktif (dengan bahan-bahannya), terurut id.
export async function getRecipes() {
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("is_active", true)
    .order("id");

  if (error) throw error;
  return data ?? [];
}

// Ambil satu resep berdasarkan id (untuk modal detail / resep per menu).
export async function getRecipeById(id) {
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Ambil beberapa resep sekaligus by id (dipakai render hasil generate AI).
export async function getRecipesByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .in("id", ids);

  if (error) throw error;
  return data ?? [];
}

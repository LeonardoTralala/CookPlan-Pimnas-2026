import { RecipeCard } from "./RecipeCard.jsx";
import { usePlan } from "../hooks/usePlan.js";
import { initialRecipes } from "../utils/recipes.js";

export function FeaturedRecipes({ onNavigate }) {
  const { showToast } = usePlan();

  const seeAll = () =>
    onNavigate ? onNavigate("catalog") : showToast("Katalog lengkap resep sedang disiapkan!");

  return (
    <section id="recipes" className="py-14 md:py-24 bg-canvas-white px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-end mb-10 md:mb-12 gap-6">
        <div className="max-w-xl">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-4">
            Resep Unggulan Minggu Ini
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Inspirasi menu sehat yang paling banyak dipilih oleh komunitas CookPlan.
          </p>
        </div>
        <button
          onClick={seeAll}
          className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all cursor-pointer"
        >
          <span>Lihat Semua Resep</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      <div className="max-w-container-max mx-auto grid md:grid-cols-3 gap-6 md:gap-8">
        {initialRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}

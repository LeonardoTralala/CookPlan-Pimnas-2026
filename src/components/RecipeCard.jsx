export function RecipeCard({ recipe, onAdd }) {
  return (
    <div className="bg-surface-cream rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
      <div>
        <div className="h-40 sm:h-52 md:h-64 overflow-hidden relative">
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            alt={recipe.name}
            src={recipe.image}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/img/recipe-placeholder.svg'; }}
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-surface-container-low/90 backdrop-blur-sm text-on-surface text-label-sm font-label-sm rounded-full font-semibold">
              {recipe.tag}
            </span>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <h3 className="font-headline-md text-headline-md text-primary mb-2">{recipe.name}</h3>
          <div className="flex items-center gap-4 text-on-surface-variant text-label-sm mb-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">outdoor_grill</span> {recipe.time}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mb-2">{recipe.desc}</p>
        </div>
      </div>
      <div className="p-4 pt-0 md:p-6 md:pt-0">
        <button
          onClick={() => onAdd?.(recipe)}
          className="w-full py-3 rounded-full font-label-md text-label-md active:scale-[0.98] transition cursor-pointer border font-semibold flex items-center justify-center gap-1.5 border-primary text-primary hover:bg-primary hover:text-white"
        >
          Lihat Resep Lengkap
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

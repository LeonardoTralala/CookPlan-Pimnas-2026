import { useState, useMemo } from 'react';
import { mockRecipes } from '../utils/mockRecipes';

function RecipeCatalog({ onAddToPlan }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [maxTime, setMaxTime] = useState(60); // default max 60 minutes
  const [maxPrice, setMaxPrice] = useState(50000); // default max 50,000 IDR
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState(null);
  const [selectedRecipeForPlan, setSelectedRecipeForPlan] = useState(null);
  
  // State for Add to Plan form
  const [planDay, setPlanDay] = useState('Senin');
  const [planMeal, setPlanMeal] = useState('breakfast');
  const [planServings, setPlanServings] = useState(2);

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const mealOptions = [
    { value: 'breakfast', label: 'Sarapan' },
    { value: 'lunch', label: 'Makan Siang' },
    { value: 'dinner', label: 'Makan Malam' }
  ];

  // Toggle quick filter tag
  const handleToggleFilter = (filterName) => {
    if (activeFilters.includes(filterName)) {
      setActiveFilters(activeFilters.filter((f) => f !== filterName));
    } else {
      setActiveFilters([...activeFilters, filterName]);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilters([]);
    setMaxTime(120);
    setMaxPrice(60000);
  };

  // Filter recipes based on search query, quick filters, and advanced criteria
  const filteredRecipes = useMemo(() => {
    return mockRecipes.filter((recipe) => {
      // 1. Search Query Filter (matches title or ingredients)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(query);
        const matchesIngredients = recipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesIngredients) return false;
      }

      // 2. Quick Filter Chips
      if (activeFilters.length > 0) {
        const matchesAllActive = activeFilters.every((filter) => {
          if (filter === 'Vegetarian') {
            return recipe.badges.includes('Vegetarian');
          }
          if (filter === 'Quick') {
            return recipe.readyInMinutes <= 30 || recipe.badges.includes('Quick');
          }
          if (filter === 'Local') {
            return recipe.badges.includes('Local Ingredients');
          }
          if (filter === 'Budget') {
            return recipe.priceIdr <= 30000 || recipe.badges.includes('Budget Friendly');
          }
          return true;
        });
        if (!matchesAllActive) return false;
      }

      // 3. Max Cooking Time
      if (recipe.readyInMinutes > maxTime) return false;

      // 4. Max Price
      if (recipe.priceIdr > maxPrice) return false;

      return true;
    });
  }, [searchQuery, activeFilters, maxTime, maxPrice]);

  // Handle confirming "Add to Plan"
  const handleConfirmAddToPlan = () => {
    if (!selectedRecipeForPlan) return;

    if (onAddToPlan) {
      onAddToPlan(selectedRecipeForPlan, planDay, planMeal, planServings);
    }

    // Simpan info untuk pesan sebelum reset
    const mealLabel = mealOptions.find((m) => m.value === planMeal)?.label || '';
    const recipeTitle = selectedRecipeForPlan.title;

    // Reset and close
    setSelectedRecipeForPlan(null);
    setPlanDay('Senin');
    setPlanMeal('breakfast');
    setPlanServings(2);

    // Show alert
    alert(`Berhasil menambahkan "${recipeTitle}" (${planServings} porsi) ke ${mealLabel} hari ${planDay}!`);
  };

  // Utility to format price to Rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="bg-[#FBFAF9] min-h-screen font-sans text-on-surface pb-24">
      {/* Hero header */}
      <section className="pt-16 pb-8 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-[40px] font-extrabold text-primary tracking-tight mb-8">
          Inspirasi Masakan Hari Ini
        </h2>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto relative group mb-8">
          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant text-2xl group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            type="text"
            className="w-full pl-14 pr-6 py-4 rounded-full border border-outline-variant bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm transition-all text-base font-medium"
            placeholder="Cari resep sehat untuk keluarga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Quick Filter Tag Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <button
            onClick={() => handleToggleFilter('Vegetarian')}
            className={`px-6 py-2 rounded-full font-semibold text-xs md:text-sm border transition-all cursor-pointer ${
              activeFilters.includes('Vegetarian')
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface-cream/50 text-primary border-outline-variant hover:bg-primary-container hover:text-white'
            }`}
          >
            Vegetarian
          </button>
          <button
            onClick={() => handleToggleFilter('Quick')}
            className={`px-6 py-2 rounded-full font-semibold text-xs md:text-sm border transition-all cursor-pointer ${
              activeFilters.includes('Quick')
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface-cream/50 text-primary border-outline-variant hover:bg-primary-container hover:text-white'
            }`}
          >
            Quick (&lt; 30 min)
          </button>
          <button
            onClick={() => handleToggleFilter('Local')}
            className={`px-6 py-2 rounded-full font-semibold text-xs md:text-sm border transition-all cursor-pointer ${
              activeFilters.includes('Local')
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface-cream/50 text-primary border-outline-variant hover:bg-primary-container hover:text-white'
            }`}
          >
            Local Ingredients
          </button>
          <button
            onClick={() => handleToggleFilter('Budget')}
            className={`px-6 py-2 rounded-full font-semibold text-xs md:text-sm border transition-all cursor-pointer ${
              activeFilters.includes('Budget')
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface-cream/50 text-primary border-outline-variant hover:bg-primary-container hover:text-white'
            }`}
          >
            Budget Friendly
          </button>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-full font-semibold text-xs md:text-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
              showAdvancedFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-on-surface-variant border-outline-variant hover:bg-secondary-container/20'
            }`}
          >
            <span className="material-symbols-outlined text-lg">tune</span>
            Filters
          </button>

          {(searchQuery || activeFilters.length > 0 || maxTime < 120 || maxPrice < 60000) && (
            <button
              onClick={handleResetFilters}
              className="text-xs md:text-sm font-bold text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 cursor-pointer pl-2"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              Reset
            </button>
          )}
        </div>

        {/* Sliding Panel / Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="max-w-2xl mx-auto mt-6 p-6 bg-white border border-outline-variant rounded-3xl shadow-sm animate-fade-in text-left">
            <h4 className="font-bold text-primary mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xl">tune</span>
              Batasan Memasak & Budget
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Cooking Time Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                  <span>Waktu Masak Maksimal</span>
                  <span className="text-primary font-bold">{maxTime} menit</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  className="w-full h-1.5 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary"
                  value={maxTime}
                  onChange={(e) => setMaxTime(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>15 mnt</span>
                  <span>120 mnt</span>
                </div>
              </div>

              {/* Max Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                  <span>Harga Bahan Maksimal</span>
                  <span className="text-primary font-bold">{formatRupiah(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="60000"
                  step="1000"
                  className="w-full h-1.5 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant">
                  <span>Rp 15k</span>
                  <span>Rp 60k</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Catalog Grid */}
      <section className="px-6 max-w-6xl mx-auto">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-outline-variant p-8">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">
              sentiment_dissatisfied
            </span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Resep Tidak Ditemukan</h3>
            <p className="text-on-surface-variant text-sm max-w-md mx-auto">
              Maaf, kami tidak dapat menemukan resep yang sesuai dengan kriteria pencarian dan filter Anda. Silakan coba atur ulang filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary-container transition-all cursor-pointer shadow-md"
            >
              Atur Ulang Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="recipe-card-shadow bg-[#e2f4cb] rounded-[32px] overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col"
                onClick={() => setSelectedRecipeForDetail(recipe)}
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/95 text-primary font-bold text-[10px] shadow-sm tracking-wide">
                      {recipe.badges[0]}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center gap-3 mb-4">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-lg md:text-xl hover:text-primary transition-colors leading-tight line-clamp-2">
                      {recipe.title}
                    </h3>
                    {/* Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent opening detail modal
                        setSelectedRecipeForPlan(recipe);
                      }}
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                      title="Tambah ke Rencana Mingguan"
                    >
                      <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-on-surface-variant text-xs md:text-sm font-semibold">
                    {/* Cooking Time */}
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span>{recipe.readyInMinutes} min</span>
                    </div>

                    {/* Calories */}
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">whatshot</span>
                      <span>{recipe.calories} kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredRecipes.length > 0 && (
          <div className="mt-16 text-center">
            <button className="px-8 py-3 rounded-full border border-secondary text-secondary font-bold hover:bg-secondary-container/20 transition-all cursor-pointer">
              Load More Recipes
            </button>
          </div>
        )}
      </section>

      {/* -------------------- DETAIL RESEP MODAL -------------------- */}
      {selectedRecipeForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-outline-variant relative">
            {/* Header Close button */}
            <button
              onClick={() => setSelectedRecipeForDetail(null)}
              className="absolute right-4 top-4 z-10 w-9 h-9 rounded-full bg-slate-950/60 text-white flex items-center justify-center hover:bg-slate-950 transition-colors shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {/* Header Image */}
              <div className="relative h-64 md:h-72">
                <img
                  src={selectedRecipeForDetail.imageUrl}
                  alt={selectedRecipeForDetail.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white pr-10">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedRecipeForDetail.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-bold text-[9px] uppercase tracking-wider"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold">{selectedRecipeForDetail.title}</h3>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-6 md:p-8 space-y-6">
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed italic">
                  "{selectedRecipeForDetail.description}"
                </p>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-secondary-container/20 rounded-2xl border border-outline-variant/60 text-center">
                  <div>
                    <span className="material-symbols-outlined text-primary text-2xl mb-1 block">
                      schedule
                    </span>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">
                      Waktu Masak
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {selectedRecipeForDetail.readyInMinutes} mnt
                    </span>
                  </div>
                  <div>
                    <span className="material-symbols-outlined text-primary text-2xl mb-1 block">
                      whatshot
                    </span>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">
                      Kalori
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {selectedRecipeForDetail.calories} kcal
                    </span>
                  </div>
                  <div>
                    <span className="material-symbols-outlined text-primary text-2xl mb-1 block">
                      payments
                    </span>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">
                      Estimasi Harga
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {formatRupiah(selectedRecipeForDetail.priceIdr)}
                    </span>
                  </div>
                </div>

                {/* Ingredients Section */}
                <div>
                  <h4 className="text-lg font-bold text-primary border-b border-outline-variant pb-2 mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xl">restaurant_menu</span>
                    Bahan-Bahan yang Dibutuhkan
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {selectedRecipeForDetail.ingredients.map((ing, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center py-1.5 border-b border-outline-variant/30 text-xs md:text-sm"
                      >
                        <span className="font-medium text-on-surface">{ing.name}</span>
                        <span className="text-on-surface-variant font-bold bg-white px-2 py-0.5 rounded border border-outline-variant/40">
                          {ing.amount} {ing.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions Section */}
                <div>
                  <h4 className="text-lg font-bold text-primary border-b border-outline-variant pb-2 mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xl">local_cafe</span>
                    Langkah-Langkah Memasak
                  </h4>
                  <ol className="space-y-4">
                    {selectedRecipeForDetail.instructions.map((step, idx) => (
                      <li key={idx} className="flex gap-4 items-start text-xs md:text-sm leading-relaxed">
                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-on-surface-variant">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-canvas-white border-t border-outline-variant flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedRecipeForDetail(null)}
                className="px-5 py-2.5 border border-outline-variant text-on-surface-variant hover:bg-secondary-container/20 rounded-full font-bold text-sm cursor-pointer transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedRecipeForPlan(selectedRecipeForDetail);
                  setSelectedRecipeForDetail(null);
                }}
                className="px-6 py-2.5 bg-primary text-white hover:bg-primary-container rounded-full font-bold text-sm cursor-pointer flex items-center gap-1.5 transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add to Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ADD TO PLAN MODAL -------------------- */}
      {selectedRecipeForPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-outline-variant relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedRecipeForPlan(null)}
              className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-bold text-primary mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-2xl">calendar_today</span>
              Atur Menu Mingguan
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              Tambahkan hidangan <strong>{selectedRecipeForPlan.title}</strong> ke dalam agenda rencana masak mingguan Anda.
            </p>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Meal Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Pilih Jenis Makan
                </label>
                <select
                  value={planMeal}
                  onChange={(e) => setPlanMeal(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-semibold text-on-surface"
                >
                  {mealOptions.map((meal) => (
                    <option key={meal.value} value={meal.value}>
                      {meal.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Pilih Hari Memasak
                </label>
                <select
                  value={planDay}
                  onChange={(e) => setPlanDay(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-semibold text-on-surface"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servings Stepper */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Jumlah Porsi (Servings)
                </label>
                <div className="flex items-center gap-4 bg-secondary-container/20 border border-outline-variant p-2 rounded-2xl justify-between">
                  <button
                    onClick={() => setPlanServings(Math.max(1, planServings - 1))}
                    className="w-9 h-9 rounded-xl bg-white border border-outline-variant flex items-center justify-center hover:bg-secondary-container/30 active:scale-95 transition-all text-primary font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <span className="font-extrabold text-lg text-primary">{planServings} Porsi</span>
                  <button
                    onClick={() => setPlanServings(planServings + 1)}
                    className="w-9 h-9 rounded-xl bg-white border border-outline-variant flex items-center justify-center hover:bg-secondary-container/30 active:scale-95 transition-all text-primary font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setSelectedRecipeForPlan(null)}
                className="flex-1 py-3 border border-outline-variant text-on-surface-variant hover:bg-secondary-container/20 rounded-full font-bold text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAddToPlan}
                className="flex-1 py-3 bg-primary text-white hover:bg-primary-container rounded-full font-bold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-lg">check</span>
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeCatalog;

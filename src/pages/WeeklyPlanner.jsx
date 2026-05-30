import { useState, useMemo } from 'react';
import { mockRecipes } from '../utils/mockRecipes';

// Hari (key data) + label singkat untuk header kolom
const DAYS = [
  { key: 'Senin', short: 'Sen' },
  { key: 'Selasa', short: 'Sel' },
  { key: 'Rabu', short: 'Rab' },
  { key: 'Kamis', short: 'Kam' },
  { key: 'Jumat', short: 'Jum' },
  { key: 'Sabtu', short: 'Sab' },
  { key: 'Minggu', short: 'Min' }
];

const MEALS = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' }
];

const TOTAL_SLOTS = DAYS.length * MEALS.length; // 21

// Tanggal Senin–Minggu pada minggu berjalan (berdasarkan tanggal hari ini)
function getWeekDates() {
  const today = new Date();
  const dow = today.getDay(); // 0 = Minggu ... 6 = Sabtu
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

function WeeklyPlanner({ weeklyPlan, onSetSlot, onRemoveSlot, onGoToCatalog }) {
  // Slot yang sedang diisi: { day, meal } | null
  const [pickerTarget, setPickerTarget] = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSelectedRecipe, setPickerSelectedRecipe] = useState(null);
  const [pickerServings, setPickerServings] = useState(2);

  const weekDates = useMemo(() => getWeekDates(), []);

  // Statistik untuk kartu Weekly Progress
  const stats = useMemo(() => {
    let filled = 0;
    let totalCalories = 0;
    let totalPrice = 0;
    DAYS.forEach(({ key }) => {
      MEALS.forEach(({ key: meal }) => {
        const slot = weeklyPlan?.[key]?.[meal];
        if (slot) {
          filled += 1;
          totalCalories += slot.calories || 0;
          totalPrice += slot.priceIdr || 0;
        }
      });
    });
    const avgCalories = filled > 0 ? Math.round(totalCalories / filled) : 0;
    let budgetImpact = 'Low';
    if (totalPrice >= 500000) budgetImpact = 'High';
    else if (totalPrice >= 200000) budgetImpact = 'Medium';
    return { filled, avgCalories, totalPrice, budgetImpact };
  }, [weeklyPlan]);

  const progressPct = Math.round((stats.filled / TOTAL_SLOTS) * 100);

  const budgetColor = {
    Low: 'text-success-green',
    Medium: 'text-amber-300',
    High: 'text-red-300'
  }[stats.budgetImpact];

  // Resep untuk picker (difilter pencarian)
  const pickerResults = useMemo(() => {
    if (pickerSearch.trim() === '') return mockRecipes;
    const q = pickerSearch.toLowerCase();
    return mockRecipes.filter((r) => r.title.toLowerCase().includes(q));
  }, [pickerSearch]);

  const recommended = mockRecipes.slice(0, 3);
  const recommendCaptions = ['Terpopuler minggu ini', 'Berdasarkan pesananmu sebelumnya', 'Favorit di wilayahmu'];

  const handlePickRecipe = (recipe) => {
    setPickerSelectedRecipe(recipe);
    setPickerServings(2);
  };

  const handleConfirmAdd = () => {
    if (!pickerTarget || !pickerSelectedRecipe) return;
    onSetSlot(pickerSelectedRecipe, pickerTarget.day, pickerTarget.meal, pickerServings);
    setPickerTarget(null);
    setPickerSearch('');
    setPickerSelectedRecipe(null);
  };

  const handleCancelPick = () => {
    setPickerSelectedRecipe(null);
  };

  return (
    <div className="bg-[#FBFAF9] min-h-screen text-on-surface pb-28">
      <main className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ---------------- Planner Grid ---------------- */}
          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <h1 className="text-3xl md:text-[40px] font-extrabold text-primary tracking-tight mb-2 leading-tight">
                Rencana Masak Mingguan
              </h1>
              <p className="text-on-surface-variant text-base md:text-lg">
                Atur jadwal makan Anda untuk hidup yang lebih sehat dan teratur.
              </p>
            </div>

            <div className="overflow-x-auto hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
              <div className="min-w-[1000px] grid grid-cols-8 gap-4">
                {/* Kolom label jenis makan */}
                <div className="flex flex-col gap-4 mt-16">
                  {MEALS.map((meal) => (
                    <div key={meal.key} className="h-40 flex items-center justify-end pr-4 text-right">
                      <span className="text-xs font-semibold text-outline uppercase tracking-widest">
                        {meal.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Kolom per hari */}
                {DAYS.map((day, dayIdx) => (
                  <div key={day.key} className="flex flex-col gap-4">
                    {/* Header tanggal */}
                    <div className="text-center pb-4">
                      <div className="text-xs font-semibold text-outline mb-1 uppercase tracking-wide">
                        {day.short}
                      </div>
                      <div className="text-2xl font-bold text-on-surface">{weekDates[dayIdx]}</div>
                    </div>

                    {/* Slot makan */}
                    {MEALS.map((meal) => {
                      const slot = weeklyPlan?.[day.key]?.[meal.key];
                      if (slot) {
                        return (
                          <div
                            key={meal.key}
                            className="h-40 group relative rounded-3xl overflow-hidden recipe-card-shadow cursor-pointer"
                          >
                            <img
                              src={slot.imageUrl}
                              alt={slot.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                              <span className="text-white font-semibold text-[13px] leading-tight mb-1 line-clamp-2">
                                {slot.title}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-white/95 shadow-sm border border-white/10">
                                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                                  <span className="text-[9px] font-bold tracking-wide">{slot.readyInMinutes}m</span>
                                </div>
                                <div className="flex items-center gap-1 bg-primary/90 backdrop-blur-md px-2 py-0.5 rounded-full text-white shadow-sm border border-primary-container/30">
                                  <span className="material-symbols-outlined text-[12px]">group</span>
                                  <span className="text-[9px] font-bold tracking-wide">{slot.servings || 2} porsi</span>
                                </div>
                              </div>
                            </div>
                            {/* Tombol hapus */}
                            <button
                              onClick={() => onRemoveSlot(day.key, meal.key)}
                              title="Hapus dari rencana"
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={meal.key}
                          onClick={() => {
                            setPickerTarget({ day: day.key, meal: meal.key });
                            setPickerSearch('');
                          }}
                          className="h-40 border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center gap-2 text-outline hover:border-primary hover:text-primary transition-all bg-white/50 group cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                            add_circle
                          </span>
                          <span className="text-xs font-semibold">Add Recipe</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------- Sidebar ---------------- */}
          <aside className="lg:w-80 shrink-0 flex flex-col gap-6">
            {/* Recommended for you */}
            <div className="bg-surface-cream/40 border border-outline-variant rounded-[32px] p-6">
              <h3 className="text-xl font-bold text-primary mb-2">Recommended for you</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Rekomendasi pilihan berdasarkan tren populer dan riwayat pesanan Anda.
              </p>
              <div className="space-y-4">
                {recommended.map((recipe, idx) => (
                  <div key={recipe.id} className="flex items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 recipe-card-shadow">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-on-surface leading-tight line-clamp-1">
                        {recipe.title}
                      </h4>
                      <span className="text-xs text-outline">{recommendCaptions[idx]}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={onGoToCatalog}
                className="mt-6 w-full py-2.5 rounded-full border border-secondary text-secondary font-bold text-sm hover:bg-secondary-container/30 transition-all cursor-pointer"
              >
                Lihat Semua Rekomendasi
              </button>
            </div>

            {/* Weekly Progress */}
            <div className="bg-primary-container text-on-primary-container rounded-[32px] p-6">
              <h3 className="text-xl font-bold mb-2">Weekly Progress</h3>
              <p className="text-on-primary-container/80 text-sm mb-6">
                {stats.filled} dari {TOTAL_SLOTS} slot makan terisi.
              </p>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('id-ID').format(stats.avgCalories)}
                  </div>
                  <div className="text-[10px] uppercase opacity-70 tracking-tight">Avg Calories</div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${budgetColor}`}>{stats.budgetImpact}</div>
                  <div className="text-[10px] uppercase opacity-70 tracking-tight">Budget Impact</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ---------------- Bottom Action Bar ---------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 md:p-6 bg-gradient-to-t from-[#FBFAF9] via-[#FBFAF9]/95 to-transparent flex justify-center pointer-events-none">
        <button
          onClick={() =>
            alert('Fitur Generate Shopping List sedang dikembangkan oleh rekan tim!')
          }
          className="pointer-events-auto bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-3 transition-all active:scale-95 group cursor-pointer"
        >
          <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
            shopping_cart
          </span>
          <span className="font-bold text-lg">Generate Shopping List</span>
        </button>
      </div>

      {/* ---------------- Recipe Picker Modal ---------------- */}
      {pickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[32px] overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-outline-variant relative">
            {/* Content Based on Selection */}
            {!pickerSelectedRecipe ? (
              <>
                <div className="p-6 border-b border-outline-variant shrink-0">
                  <button
                    onClick={() => {
                      setPickerTarget(null);
                      setPickerSelectedRecipe(null);
                    }}
                    className="absolute right-4 top-4 w-9 h-9 rounded-full bg-secondary-container/40 text-on-surface flex items-center justify-center hover:bg-secondary-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                  <h3 className="text-xl font-bold text-primary mb-1 flex items-center gap-1.5 pr-10">
                    <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
                    Pilih Resep
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4">
                    Pilih hidangan untuk{' '}
                    <strong>{MEALS.find((m) => m.key === pickerTarget.meal)?.label}</strong> hari{' '}
                    <strong>{pickerTarget.day}</strong>.
                  </p>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                      search
                    </span>
                    <input
                      type="text"
                      autoFocus
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Cari resep..."
                      className="w-full pl-11 pr-4 py-2.5 rounded-full border border-outline-variant bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm font-medium"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 p-6">
                  {pickerResults.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl text-outline-variant mb-2 block">
                        sentiment_dissatisfied
                      </span>
                      <p className="text-sm">Resep tidak ditemukan.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pickerResults.map((recipe) => (
                        <button
                          key={recipe.id}
                          onClick={() => handlePickRecipe(recipe)}
                          className="flex items-center gap-3 p-3 rounded-2xl border border-outline-variant bg-white hover:bg-secondary-container/20 hover:border-primary transition-all text-left cursor-pointer group"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                            <img
                              src={recipe.imageUrl}
                              alt={recipe.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-on-surface leading-tight line-clamp-2 mb-1">
                              {recipe.title}
                            </h4>
                            <div className="flex items-center gap-3 text-on-surface-variant text-xs font-semibold">
                              <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[15px]">schedule</span>
                                {recipe.readyInMinutes} mnt
                              </span>
                              <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[15px]">payments</span>
                                {formatRupiah(recipe.priceIdr)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Konfirmasi Porsi Modal */}
                <div className="p-6 md:p-8">
                  <button
                    onClick={() => {
                      setPickerTarget(null);
                      setPickerSelectedRecipe(null);
                    }}
                    className="absolute right-4 top-4 w-9 h-9 rounded-full bg-secondary-container/40 text-on-surface flex items-center justify-center hover:bg-secondary-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>

                  <h3 className="text-xl font-bold text-primary mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-2xl">group</span>
                    Atur Jumlah Porsi
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                    Berapa porsi <strong>{pickerSelectedRecipe.title}</strong> yang ingin Anda masak untuk{' '}
                    <strong>{MEALS.find((m) => m.key === pickerTarget.meal)?.label}</strong> hari{' '}
                    <strong>{pickerTarget.day}</strong>?
                  </p>

                  {/* Servings Stepper */}
                  <div className="space-y-1.5 mb-8">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                      Jumlah Porsi (Servings)
                    </label>
                    <div className="flex items-center gap-4 bg-secondary-container/20 border border-outline-variant p-2 rounded-2xl justify-between">
                      <button
                        onClick={() => setPickerServings(Math.max(1, pickerServings - 1))}
                        className="w-9 h-9 rounded-xl bg-white border border-outline-variant flex items-center justify-center hover:bg-secondary-container/30 active:scale-95 transition-all text-primary font-bold cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">remove</span>
                      </button>
                      <span className="font-extrabold text-lg text-primary">{pickerServings} Porsi</span>
                      <button
                        onClick={() => setPickerServings(pickerServings + 1)}
                        className="w-9 h-9 rounded-xl bg-white border border-outline-variant flex items-center justify-center hover:bg-secondary-container/30 active:scale-95 transition-all text-primary font-bold cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleCancelPick}
                      className="flex-1 py-3 border border-outline-variant text-on-surface-variant hover:bg-secondary-container/20 rounded-full font-bold text-sm transition-colors cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handleConfirmAdd}
                      className="flex-1 py-3 bg-primary text-white hover:bg-primary-container rounded-full font-bold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-lg">check</span>
                      Konfirmasi
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyPlanner;

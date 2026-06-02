import { useMemo, useState } from 'react';
import { mockRecipes } from '../utils/mockRecipes';
import { usePlan } from '../hooks/usePlan.js';

// Porsi dasar resep di mockRecipes (takaran bahan ditulis untuk ~2 porsi)
const BASE_SERVINGS = 2;

// Biaya pengantaran tetap (mock) untuk ringkasan pesanan
const DELIVERY_FEE = 15000;

// Metadata tampilan tiap kategori bahan: label, ikon, dan toko lokal penyedia.
// Urutan objek ini menentukan urutan section di halaman.
const CATEGORY_META = {
  vegetables: { label: 'Sayuran', icon: 'eco', store: 'Lembang Organic Farm' },
  meat: { label: 'Protein', icon: 'set_meal', store: 'Pasar Segar Lokal' },
  dairy: { label: 'Telur & Susu', icon: 'egg', store: 'Toko Tani Sejahtera' },
  dry_goods: { label: 'Bahan Pokok', icon: 'grocery', store: 'Toko Sembako Makmur' },
  spices: { label: 'Bumbu & Rempah', icon: 'restaurant', store: 'Pasar Modern BSD' }
};

const CATEGORY_FALLBACK = { label: 'Lainnya', icon: 'shopping_basket', store: 'Toko Serba Ada' };

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

// Bulatkan jumlah bahan agar rapi (hilangkan ekor desimal panjang, sisakan max 1 angka)
function formatAmount(amount) {
  const rounded = Math.round(amount * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

// Bangun daftar belanja dari rencana mingguan:
// kumpulkan tiap slot terisi -> ambil resep penuh -> agregasi bahan per (nama+satuan),
// skala jumlah & harga sesuai porsi, lalu kelompokkan per kategori.
function buildShoppingList(weeklyPlan) {
  const itemMap = new Map(); // key: `${name}__${unit}` -> { name, unit, amount, priceIdr, category }

  if (weeklyPlan && typeof weeklyPlan === 'object') {
    Object.values(weeklyPlan).forEach((daySlots) => {
      if (!daySlots) return;
      Object.values(daySlots).forEach((slot) => {
        if (!slot) return;
        const recipe = mockRecipes.find((r) => r.id === slot.recipeId);
        if (!recipe) return;

        const factor = (slot.servings || BASE_SERVINGS) / BASE_SERVINGS;

        recipe.ingredients.forEach((ing) => {
          const key = `${ing.name}__${ing.unit}`;
          const existing = itemMap.get(key);
          if (existing) {
            existing.amount += ing.amount * factor;
            existing.priceIdr += (ing.priceIdr || 0) * factor;
          } else {
            itemMap.set(key, {
              name: ing.name,
              unit: ing.unit,
              amount: ing.amount * factor,
              priceIdr: (ing.priceIdr || 0) * factor,
              category: ing.category
            });
          }
        });
      });
    });
  }

  // Total estimasi = jumlah harga semua bahan (sudah diskala)
  let estimatedCost = 0;
  itemMap.forEach((item) => { estimatedCost += item.priceIdr; });

  // Kelompokkan per kategori mengikuti urutan CATEGORY_META
  const sections = [];
  const order = Object.keys(CATEGORY_META);
  const grouped = {};
  itemMap.forEach((item, key) => {
    const cat = order.includes(item.category) ? item.category : 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ ...item, id: key });
  });

  [...order, 'other'].forEach((cat) => {
    const items = grouped[cat];
    if (!items || items.length === 0) return;
    items.sort((a, b) => a.name.localeCompare(b.name, 'id'));
    sections.push({
      key: cat,
      meta: CATEGORY_META[cat] || CATEGORY_FALLBACK,
      items
    });
  });

  const totalItems = itemMap.size;
  return { sections, totalItems, estimatedCost: Math.round(estimatedCost) };
}

function ShoppingList({ weeklyPlan, onGoToPlanner }) {
  // Bahan yang sudah dicentang (sudah dibeli): kumpulan id item
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  const { showToast } = usePlan();

  const { sections, totalItems, estimatedCost } = useMemo(
    () => buildShoppingList(weeklyPlan),
    [weeklyPlan]
  );

  const toggleItem = (id) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalCost = estimatedCost + (totalItems > 0 ? DELIVERY_FEE : 0);
  const checkedCount = checkedItems.size;

  // ---------------- Empty State ----------------
  if (totalItems === 0) {
    return (
      <div className="bg-canvas-white min-h-dvh text-on-surface">
        <main className="max-w-container-max mx-auto px-5 md:px-10 section-padding flex flex-col items-center text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-surface-cream flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-5xl md:text-6xl">shopping_cart</span>
          </div>
          <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-primary mb-3 tracking-tight">
            Daftar Belanja Masih Kosong
          </h1>
          <p className="text-on-surface-variant text-body-lg max-w-md mb-8">
            Susun dulu menu masakanmu di Rencana Mingguan. Bahan-bahan akan otomatis terkumpul
            di sini, dikelompokkan rapi per kategori.
          </p>
          <button
            onClick={onGoToPlanner}
            className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined">calendar_month</span>
            Buka Rencana Mingguan
          </button>
        </main>
      </div>
    );
  }

  // ---------------- Daftar Belanja ----------------
  return (
    <div className="bg-canvas-white min-h-dvh text-on-surface">
      <main className="max-w-container-max mx-auto px-5 md:px-10 py-8 md:py-12">
        {/* Header */}
        <header className="mb-10 max-w-3xl animate-fade-in">
          <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-primary tracking-tight mb-3 leading-tight">
            Daftar Belanja Kamu
          </h1>
          <p className="text-on-surface-variant text-body-lg">
            Bahan-bahan segar dari pertanian lokal yang siap untuk menu masakan minggu ini.
            Optimalkan nutrisi keluarga Anda dengan bahan organik pilihan.
          </p>
        </header>

        {/* Grid utama: daftar (kiri) + ringkasan (kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ---------------- Daftar bahan ---------------- */}
          <div className="lg:col-span-8 space-y-10">
            {sections.map((section) => (
              <section key={section.key}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    {section.meta.icon}
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">{section.meta.label}</h2>
                  <span className="ml-auto text-sm font-semibold text-outline">
                    {section.items.length} bahan
                  </span>
                </div>

                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden recipe-card-shadow">
                  {section.items.map((item) => {
                    const checked = checkedItems.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full text-left item-row flex items-center justify-between p-5 md:p-6 border-b border-outline-variant last:border-0 transition-colors group cursor-pointer ${
                          checked
                            ? 'bg-surface-container-low hover:bg-surface-container-low'
                            : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Check ring */}
                          <div
                            className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                              checked
                                ? 'bg-success-green border-success-green'
                                : 'border-outline-variant group-hover:border-primary'
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-sm transition-opacity ${
                                checked
                                  ? 'text-white opacity-100'
                                  : 'text-primary opacity-0 group-hover:opacity-60'
                              }`}
                            >
                              check
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              Tersedia di:{' '}
                              <span className="text-primary font-bold">{section.meta.store}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-3 flex flex-col items-end gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                              checked
                                ? 'bg-success-green/15 text-success-green'
                                : 'bg-surface-cream text-on-surface'
                            }`}
                          >
                            {formatAmount(item.amount)} {item.unit}
                          </span>
                          {item.priceIdr > 0 && (
                            <span className="text-xs font-bold text-primary">
                              {formatRupiah(Math.round(item.priceIdr))}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* ---------------- Sidebar / Ringkasan ---------------- */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Ringkasan pesanan */}
              <div className="bg-surface-cream p-7 md:p-8 rounded-panel shadow-sm">
                <h3 className="font-headline-md text-headline-md text-primary mb-6">Ringkasan Pesanan</h3>

                {/* Progress belanja */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-2">
                    <span>Progres belanja</span>
                    <span>
                      {checkedCount} dari {totalItems} akan dibeli
                    </span>
                  </div>
                  <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.round((checkedCount / totalItems) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Total Bahan</span>
                    <span className="font-bold text-on-surface">{totalItems} Item</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Estimasi Biaya</span>
                    <span className="font-bold text-on-surface">{formatRupiah(estimatedCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Biaya Pengantaran</span>
                    <span className="font-bold text-on-surface">{formatRupiah(DELIVERY_FEE)}</span>
                  </div>
                  <div className="pt-4 border-t border-outline/20 flex justify-between items-center">
                    <span className="text-xl font-bold text-primary">Total</span>
                    <span className="text-xl font-bold text-primary">{formatRupiah(totalCost)}</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    showToast('Fitur pembayaran & pengantaran akan terhubung dengan produsen lokal!')
                  }
                  className="w-full bg-primary-container text-on-primary py-4 rounded-full font-bold hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Bayar &amp; Antar</span>
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                    shopping_cart_checkout
                  </span>
                </button>

                <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Estimasi pengiriman hari ini sebelum pukul 17:00 WIB untuk menjaga kesegaran
                    bahan.
                  </p>
                </div>
              </div>

              {/* Kartu ajakan jadi supplier CookPlan (gaya urgensi/FOMO) */}
              <button
                onClick={() =>
                  showToast('Pendaftaran supplier CookPlan akan segera dibuka untuk produsen & petani lokal!')
                }
                className="w-full text-left relative overflow-hidden rounded-panel h-60 bg-primary group cursor-pointer shadow-md"
              >
                <div
                  className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #4a7c2e 0%, #2d5218 55%, #1a3410 100%)' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent z-10"></div>

                {/* Badge slot terbatas */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/90 text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                  </span>
                  Slot Mitra Terbatas
                </div>

                <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                  <p className="text-xs uppercase tracking-widest mb-1 opacity-80">
                    Khusus Petani &amp; Produsen Lokal
                  </p>
                  <h4 className="font-headline-md text-headline-md mb-3 leading-tight">
                    Jadi Supplier Resmi CookPlan Hari Ini
                  </h4>
                  <div className="inline-flex items-center gap-1.5 bg-white text-primary px-4 py-2 rounded-full text-sm font-bold group-hover:gap-2.5 transition-all">
                    <span>Amankan Slotmu</span>
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ShoppingList;

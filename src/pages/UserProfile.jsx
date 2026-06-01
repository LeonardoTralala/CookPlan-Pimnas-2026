import { useState, useMemo } from 'react';
import { mockRecipes } from '../utils/mockRecipes';
import { usePlan } from '../hooks/usePlan.js';
import { AVATAR_URL } from '../utils/userConfig.js';

// Item navigasi pada sidebar Settings (desktop)
const SETTINGS_NAV = [
  { id: 'personal', icon: 'person', label: 'Info Personal' },
  { id: 'orders', icon: 'receipt_long', label: 'Riwayat Pesanan' },
  { id: 'addresses', icon: 'location_on', label: 'Alamat' },
  { id: 'preferences', icon: 'tune', label: 'Preferensi' },
  { id: 'saved', icon: 'bookmark', label: 'Resep Tersimpan' },
  { id: 'security', icon: 'shield', label: 'Keamanan' },
  { id: 'subscription', icon: 'payments', label: 'Langganan' }
];

const RECIPE_FILTERS = ['Semua Resep', 'Sarapan Cepat', 'Favorit Vegetarian', 'Makan Malam Tradisional'];

function UserProfile() {
  const { showToast } = usePlan();
  const soon = (fitur) => showToast(`Fitur ${fitur} sedang dikembangkan oleh rekan tim!`);
  const [activeNav, setActiveNav] = useState('saved');
  const [activeFilter, setActiveFilter] = useState('Semua Resep');
  const [savedSearch, setSavedSearch] = useState('');
  const [gender, setGender] = useState('');

  // Ambil sebagian resep dari katalog sebagai "resep tersimpan" milik pengguna
  const savedRecipes = useMemo(() => mockRecipes.slice(0, 6), []);

  const filteredSaved = useMemo(() => {
    if (savedSearch.trim() === '') return savedRecipes;
    const q = savedSearch.toLowerCase();
    return savedRecipes.filter((r) => r.title.toLowerCase().includes(q));
  }, [savedRecipes, savedSearch]);

  return (
    <div className="bg-canvas-white text-on-surface min-h-screen">
      <div className="w-full max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ---------------- Sidebar Settings (desktop) ---------------- */}
        <aside className="hidden md:block col-span-3 space-y-2 sticky top-[100px] self-start">
          <h2 className="font-headline-md text-headline-md text-primary mb-6">Pengaturan</h2>
          {SETTINGS_NAV.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors cursor-pointer ${active
                  ? 'bg-surface-cream text-primary font-bold shadow-[0_4px_20px_-4px_rgba(44,58,30,0.04)]'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
              >
                <span className={`material-symbols-outlined ${active ? 'fill' : ''}`}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          <div className="pt-6 mt-6 border-t border-outline-variant">
            <h3 className="text-xs font-semibold text-on-surface mb-3 px-4 uppercase tracking-widest">
              Bantuan &amp; Legal
            </h3>
            <button
              onClick={() => soon('Customer Service')}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors text-sm font-medium cursor-pointer text-left"
            >
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
              Layanan Pelanggan
            </button>
            <button
              onClick={() => soon('Privacy Policy')}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:text-primary transition-colors text-sm font-medium cursor-pointer text-left"
            >
              <span className="material-symbols-outlined text-[20px]">policy</span>
              Kebijakan Privasi
            </button>
          </div>
        </aside>

        {/* ---------------- Content Area ---------------- */}
        <div className="col-span-1 md:col-span-9 space-y-12">
          {/* User Header */}
          <section className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant shadow-[0_8px_24px_-8px_rgba(44,58,30,0.04)]">
            <div className="relative group cursor-pointer" onClick={() => soon('Ubah Foto Profil')}>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-surface-cream bg-surface-variant flex items-center justify-center shadow-sm">
                <img
                  src={AVATAR_URL}
                  alt="Brokoli"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full backdrop-blur-sm">
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </div>
            </div>

            <div className="flex-grow text-center md:text-left space-y-2 mt-2 md:mt-4">
              <h1 className="font-headline-xl text-headline-lg md:text-headline-xl text-primary tracking-tight leading-tight">
                Brokoli
              </h1>
              <p className="text-lg text-on-surface-variant">brokoli@example.com</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-on-primary rounded-full text-xs font-semibold shadow-sm">
                  <span className="material-symbols-outlined text-[14px] fill">verified</span> Paket Pro
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-full text-xs font-semibold">
                  Bergabung Mar 2024
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container-low border border-outline-variant text-on-surface-variant rounded-full text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">wc</span>
                  Jenis Kelamin:
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="bg-transparent border-none p-0 pr-1 focus:ring-0 text-xs font-semibold cursor-pointer outline-none"
                  >
                    <option value="" disabled>Pilih</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </span>
              </div>
            </div>

            <button
              onClick={() => soon('Edit Profil')}
              className="hidden md:flex items-center justify-center px-6 py-3 bg-primary text-white rounded-full text-sm font-semibold hover:bg-surface-tint transition-colors shadow-sm cursor-pointer"
            >
              Edit Profil
            </button>
          </section>

          {/* Saved Recipes */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-2 inline-block">
                Resep Tersimpan
              </h3>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-grow md:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={savedSearch}
                    onChange={(e) => setSavedSearch(e.target.value)}
                    placeholder="Cari resep tersimpan..."
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  onClick={() => soon('Tambah Koleksi Resep')}
                  className="flex items-center justify-center p-2 bg-surface-cream text-primary rounded-full hover:bg-surface-variant transition-colors cursor-pointer"
                  aria-label="Tambah koleksi resep"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">add</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {RECIPE_FILTERS.map((filter) => {
                const active = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${active
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-cream text-on-surface-variant hover:bg-surface-variant'
                      }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {filteredSaved.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-2 block">
                  sentiment_dissatisfied
                </span>
                <p className="text-sm">Resep tidak ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSaved.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="group cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary rounded-2xl"
                    role="button"
                    tabIndex={0}
                    onClick={() => soon('Detail Resep')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        soon('Detail Resep');
                      }
                    }}
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 recipe-card-shadow">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/img/recipe-placeholder.svg'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => soon('Hapus dari Tersimpan')}
                        className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full text-error hover:bg-white transition-colors cursor-pointer"
                        aria-label="Hapus resep tersimpan"
                      >
                        <span className="material-symbols-outlined fill text-[20px]" aria-hidden="true">favorite</span>
                      </button>
                    </div>
                    <p className="text-sm font-medium text-on-surface line-clamp-1">{recipe.title}</p>
                    <p className="text-xs text-outline">{recipe.readyInMinutes} mnt</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Connected Accounts */}
          <section className="space-y-6">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-2 inline-block">
              Akun Terhubung
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Google */}
              <div className="p-5 rounded-2xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between hover:shadow-[0_4px_20px_-4px_rgba(44,58,30,0.04)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Google</p>
                    <p className="text-xs font-semibold text-success-green">Terhubung</p>
                  </div>
                </div>
                <button
                  onClick={() => soon('Putuskan Akun Google')}
                  className="text-outline hover:text-error transition-colors cursor-pointer"
                  aria-label="Putuskan akun Google"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">link_off</span>
                </button>
              </div>
              {/* Phone */}
              <div className="p-5 rounded-2xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between hover:shadow-[0_4px_20px_-4px_rgba(44,58,30,0.04)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">smartphone</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">+62 812-3456-7890</p>
                    <p className="text-xs font-semibold text-success-green">Terverifikasi</p>
                  </div>
                </div>
                <button
                  onClick={() => soon('Ubah Nomor Telepon')}
                  className="text-primary hover:text-surface-tint transition-colors cursor-pointer"
                  aria-label="Ubah nomor telepon"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                </button>
              </div>
              {/* WhatsApp */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-lowest flex items-center justify-between hover:shadow-[0_4px_20px_-4px_rgba(44,58,30,0.04)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-canvas-white border border-outline-variant flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined">chat</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface-variant">WhatsApp</p>
                    <p className="text-xs text-outline">Belum terhubung</p>
                  </div>
                </div>
                <button
                  onClick={() => soon('Hubungkan WhatsApp')}
                  className="px-3 py-1 border border-primary text-primary rounded-full text-xs font-semibold hover:bg-surface-cream transition-colors cursor-pointer"
                >
                  Hubungkan
                </button>
              </div>
            </div>
          </section>

          {/* Account Security */}
          <section className="space-y-6 pt-4">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-2 inline-block">
              Keamanan Akun
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => soon('Ubah Kata Sandi')}
                className="p-5 rounded-2xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between hover:shadow-[0_4px_20px_-4px_rgba(44,58,30,0.04)] transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Ubah Kata Sandi</p>
                    <p className="text-xs text-on-surface-variant">Perbarui kata sandi akun Anda</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </button>
              <button
                onClick={() => soon('Autentikasi Dua Faktor')}
                className="p-5 rounded-2xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between hover:shadow-[0_4px_20px_-4px_rgba(44,58,30,0.04)] transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">security</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Autentikasi Dua Faktor</p>
                    <p className="text-xs text-on-surface-variant">Amankan login Anda dengan 2FA</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </button>
            </div>
          </section>

          {/* Subscription Management */}
          <section className="space-y-6 pt-4">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-2 inline-block">
              Manajemen Langganan
            </h3>
            <div className="p-6 rounded-2xl border border-outline-variant bg-surface-container-lowest flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[32px] fill">card_membership</span>
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <p className="font-headline-md text-headline-md text-primary">Paket Pro</p>
                  <p className="text-base text-on-surface-variant">
                    Langganan Anda diperpanjang pada 15 April 2026
                  </p>
                </div>
              </div>
              <button
                onClick={() => soon('Opsi Upgrade Langganan')}
                className="w-full md:w-auto px-6 py-3 border-2 border-primary text-primary rounded-full text-sm font-semibold hover:bg-surface-cream transition-colors cursor-pointer"
              >
                Lihat Opsi Upgrade
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

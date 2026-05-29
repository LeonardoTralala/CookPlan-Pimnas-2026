import { useState } from 'react';
import RecipeCatalog from './pages/RecipeCatalog';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // State rencana masak mingguan (diambil dari localStorage jika ada)
  // eslint-disable-next-line no-unused-vars
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const saved = localStorage.getItem('weeklyPlan');
    return saved ? JSON.parse(saved) : {
      "Senin": [],
      "Selasa": [],
      "Rabu": [],
      "Kamis": [],
      "Jumat": [],
      "Sabtu": [],
      "Minggu": []
    };
  });

  // Handler callback untuk menambah resep ke planner
  const handleAddToPlan = (recipe, day, servings) => {
    setWeeklyPlan((prev) => {
      const updated = {
        ...prev,
        [day]: [...prev[day], {
          recipeId: recipe.id,
          title: recipe.title,
          servings: servings,
          imageUrl: recipe.imageUrl,
          priceIdr: recipe.priceIdr,
          readyInMinutes: recipe.readyInMinutes,
          calories: recipe.calories
        }]
      };
      localStorage.setItem('weeklyPlan', JSON.stringify(updated));
      return updated;
    });
  };

  const features = [
    {
      id: 1,
      title: "📚 Katalog Inspirasi Menu",
      desc: "Menjelajahi koleksi resep masakan khas Indonesia, lengkap dengan pencarian bahan, estimasi waktu, dan harga bahan makanan.",
      icon: (
        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 2,
      title: "📅 Perencanaan Menu Mingguan",
      desc: "Menyusun jadwal menu masakan untuk 7 hari ke depan (Senin-Minggu) dengan sistem input porsi dan fitur acak menu.",
      icon: (
        <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "🛒 Daftar Belanja Otomatis",
      desc: "Konversi otomatis dari rencana mingguan ke daftar belanja terkategorisasi dengan estimasi total biaya bahan masakan.",
      icon: (
        <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 4,
      title: "🏪 Integrasi Produsen Lokal",
      desc: "Menghubungkan langsung daftar belanja dengan produsen dan distributor bahan makanan lokal terdekat untuk bahan segar.",
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 5,
      title: "🚚 Pengiriman Bahan Masakan",
      desc: "Layanan logistik pengiriman bahan masakan terjadwal yang dikirimkan langsung ke pintu kos atau rumah pengguna.",
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m9-1H9m10-4h.243a2 2 0 011.414.586l2.828 2.828A2 2 0 0124 15.657V17a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 00-1-1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
        </svg>
      )
    },
    {
      id: 6,
      title: "🔔 Pengingat Ketahanan Bahan",
      desc: "Notifikasi otomatis tentang masa simpan bahan masakan di kulkas/pantry agar bahan tidak terbuang sia-sia (Zero Waste).",
      icon: (
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFAF9] flex flex-col font-sans selection:bg-[#4E6B2F] selection:text-white">
      {/* Top Banner */}
      {activeTab !== 'catalog' && (
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-center py-2 px-4 text-xs font-semibold tracking-wider text-slate-950 uppercase shadow-md">
          🚀 Mode Rebuild: Arsitektur React + Vite + Tailwind v4 + Supabase Sedang Di-setup
        </div>
      )}

      {/* Header */}
      {activeTab === 'catalog' ? (
        <header className="sticky top-0 z-50 bg-[#FBFAF9] border-b border-outline-variant px-6 md:px-12 py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <img src="/cookplan-logo.svg" alt="CookPlan Logo" className="w-8 h-8 shrink-0" />
            <span className="font-sans font-bold text-2xl text-primary tracking-tight">CookPlan</span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-6 md:gap-8 overflow-x-auto whitespace-nowrap py-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className="text-primary font-bold border-b-2 border-primary pb-1 text-sm transition-colors cursor-pointer"
            >
              Catalog
            </button>
            <button
              onClick={() => alert('Fitur Weekly Planner sedang didevelop oleh rekan tim!')}
              className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold cursor-pointer"
            >
              Planner
            </button>
            <button
              onClick={() => alert('Fitur Shopping List sedang didevelop oleh rekan tim!')}
              className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold cursor-pointer"
            >
              Shopping List
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => alert('Gunakan bar pencarian di halaman untuk mencari resep!')}
              className="p-2 hover:bg-secondary-container/20 rounded-full transition-all text-on-surface-variant cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">search</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-secondary-container/20 p-1 rounded-full pr-3 transition-all">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6odIuOL3lOpT9KvOC3lLPVT9QUV5V0_ERHx_tm4JbQgrxb4YQ-3YA71v9MPggK9PKLK8GwLCrY58zvY2thnXRYIWZx_MKNu9T1unG1Loy-2z6TZjGTMM-Q2bC7lbTKVG_QQU2S_zKpH4kBECNu-_g_a8TxyfbpbYzlykIJEoGOVpfZFinQPBWE34Nvl7WSNewV3llUb5Xn4162z2Az3_VgWDc2t81tIMwMAQXKpjk_WSIyzTknKRzKQp6-MDp4YcBAzS12o2LGrDD"
                alt="User profile"
                className="w-8 h-8 rounded-full border border-outline-variant object-cover"
              />
              <span className="text-sm font-bold text-on-surface hidden sm:inline">Profile</span>
            </div>
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900 px-6 py-4 flex items-center justify-between text-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍳</span>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">CookPlan</h1>
              <p className="text-xs text-slate-500 font-medium">Meal Planner & Local Sourcing</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap py-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`text-sm font-medium transition-colors ${activeTab === 'features' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Fitur Utama
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`text-sm font-medium transition-colors ${activeTab === 'tech' ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Tech Stack
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`text-sm font-medium transition-colors ${activeTab === 'catalog' ? 'text-orange-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🥗 Katalog Resep
            </button>
          </nav>
          <div>
            <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-semibold">
              Status: v0.0 (Greenfield)
            </span>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col justify-center ${activeTab === 'catalog' ? 'bg-[#FBFAF9] text-on-surface' : 'max-w-6xl w-full mx-auto px-6 py-12 bg-slate-950 text-slate-100'}`}>

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-fade-in py-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-block p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl mb-4">
                <span className="text-5xl">👷‍♂️</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Penulisan Ulang Kode <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  CookPlan Sedang Berjalan
                </span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Kami sedang melakukan migrasi dari purwarupa statis monolitik HTML menuju arsitektur modern berbasis
                <strong> React SPA (Vite)</strong> dengan sistem styling <strong>Tailwind CSS v4</strong>.
                Semua fitur diatur ulang agar siap diintegrasikan dengan backend database dan autentikasi Supabase.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-orange-950/30 transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🥗</span> Buka Katalog Resep
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium rounded-xl transition-all"
                >
                  Lihat Rencana Fitur
                </button>
                <button
                  onClick={() => setActiveTab('tech')}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium rounded-xl transition-all"
                >
                  Detail Arsitektur
                </button>
              </div>
            </div>

            {/* Quick Documentation Navigation Links */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 max-w-2xl mx-auto flex flex-col gap-4 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-1">📄</span>
                <div>
                  <h4 className="font-bold text-slate-200">Dokumentasi Proyek CookPlan</h4>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Seluruh berkas purwarupa awal HTML statis telah dibersihkan demi kerapian repositori. Anda dapat mempelajari arsitektur target, fitur, dan panduan melalui file dokumentasi utama berikut:
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/50">
                <a href="./README.md" className="flex items-center justify-center py-2 px-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-xs font-semibold rounded-lg transition-all text-orange-400">
                  📖 README.md
                </a>
                <a href="./docs/ARCHITECTURE.md" className="flex items-center justify-center py-2 px-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-xs font-semibold rounded-lg transition-all text-orange-400">
                  🏛️ ARCHITECTURE.md
                </a>
                <a href="./docs/PRD_PKM.md" className="flex items-center justify-center py-2 px-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-xs font-semibold rounded-lg transition-all text-orange-400">
                  📋 PRD_PKM.md
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-8 animate-fade-in py-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">Rencana Fitur Utama (Rebuild)</h2>
              <p className="text-slate-400 text-sm">
                Enam fitur utama yang dirancang untuk membantu mahasiswa dan pekerja kantoran merencanakan masakan mingguan dengan efisien.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.id} className="group relative bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300">
                  <div className="p-3 bg-slate-950 border border-slate-900 group-hover:border-slate-800 rounded-xl w-fit mb-4 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                  <div className="absolute top-6 right-6 px-2 py-0.5 bg-slate-950 text-slate-500 rounded text-[10px] font-bold tracking-widest uppercase border border-slate-900">
                    Planned
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tech' && (
          <div className="space-y-8 animate-fade-in py-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">Spesifikasi Arsitektur Baru</h2>
              <p className="text-slate-400 text-sm">
                Teknologi modern yang dipilih untuk penulisan ulang kode guna memastikan performa, skalabilitas, dan kemudahan pemeliharaan.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-orange-400">✨</span> Frontend Stack
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-1">✓</span>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">React (Vite)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Single Page Application yang cepat dengan Hot Module Replacement (HMR) bawaan.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-1">✓</span>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">Tailwind CSS v4.0</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Sistem styling utility-first terbaru dengan performa compiler super cepat.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-1">✓</span>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">Component-Based Design</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Memisahkan UI menjadi modul-modul kecil (Button, Navbar, RecipeCard) agar mudah dikelola.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-teal-400">⚡</span> Backend Target
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 mt-1">✓</span>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">Supabase Database & Auth</h4>
                      <p className="text-xs text-slate-400 mt-0.5">PostgreSQL database + autentikasi bawaan (Email/Password, Google OAuth) untuk menyimpan data user.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 mt-1">✓</span>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">Row Level Security (RLS)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Keamanan tingkat database untuk memastikan setiap pengguna hanya bisa mengakses datanya sendiri.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-400 mt-1">✓</span>
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">Recipe API Integration</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Rencana integrasi dengan external API resep makanan (seperti Spoonacular) di masa depan.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <RecipeCatalog onAddToPlan={handleAddToPlan} />
        )}

      </main>

      {/* Footer */}
      {activeTab === 'catalog' ? (
        <footer className="bg-[#D9DFB0]/50 border-t border-outline-variant py-12 px-6 md:px-16 text-on-surface">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            {/* Left side brand */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <img src="/cookplan-logo.svg" alt="CookPlan Logo" className="w-8 h-8 shrink-0" />
                <span className="font-bold text-2xl text-primary tracking-tight">CookPlan</span>
              </div>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                Membantu keluarga merencanakan makanan sehat dengan bahan lokal dan hemat budget.
              </p>
            </div>

            {/* Right side links */}
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex flex-wrap justify-center gap-6 text-xs md:text-sm font-semibold text-on-surface-variant">
                <a href="#" className="hover:text-primary transition-colors">About Us</a>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              </div>
              <p className="text-[10px] md:text-xs text-on-surface-variant/80">
                © 2026 CookPlan All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-6 py-6 text-center text-xs text-slate-600">
          <p>CookPlan © 2026 — Clean Architecture Rebuild. Dibuat untuk Pimnas 2026.</p>
        </footer>
      )}
    </div>
  );
}

export default App;

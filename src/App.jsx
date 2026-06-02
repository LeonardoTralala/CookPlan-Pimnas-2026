import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.jsx';
import RecipeCatalog from './pages/RecipeCatalog';
import WeeklyPlanner from './pages/WeeklyPlanner';
import UserProfile from './pages/UserProfile';
import TeamProfile from './pages/TeamProfile';
import ShoppingList from './pages/ShoppingList';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { Toast } from './components/Toast.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { usePlan } from './hooks/usePlan.js';
import { useAuth } from './hooks/useAuth.js';

const FALLBACK_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD6odIuOL3lOpT9KvOC3lLPVT9QUV5V0_ERHx_tm4JbQgrxb4YQ-3YA71v9MPggK9PKLK8GwLCrY58zvY2thnXRYIWZx_MKNu9T1unG1Loy-2z6TZjGTMM-Q2bC7lbTKVG_QQU2S_zKpH4kBECNu-_g_a8TxyfbpbYzlykIJEoGOVpfZFinQPBWE34Nvl7WSNewV3llUb5Xn4162z2Az3_VgWDc2t81tIMwMAQXKpjk_WSIyzTknKRzKQp6-MDp4YcBAzS12o2LGrDD';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

function createEmptyPlan() {
  return DAYS.reduce((acc, day) => {
    acc[day] = { breakfast: null, lunch: null, dinner: null };
    return acc;
  }, {});
}

function isValidPlanShape(plan) {
  if (!plan || typeof plan !== 'object') return false;
  return DAYS.every((day) => {
    const slots = plan[day];
    return slots && typeof slots === 'object' && !Array.isArray(slots) &&
      MEAL_TYPES.every((meal) => meal in slots);
  });
}

function App() {
  const { showToast } = usePlan();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Profil';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const saved = localStorage.getItem('weeklyPlan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isValidPlanShape(parsed)) return parsed;
      } catch {
        // abaikan data rusak
      }
    }
    return createEmptyPlan();
  });

  const handleSetSlot = (recipe, day, mealType, servings) => {
    setWeeklyPlan((prev) => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: {
            recipeId: recipe.id,
            title: recipe.title,
            servings: servings,
            imageUrl: recipe.imageUrl,
            priceIdr: recipe.priceIdr,
            readyInMinutes: recipe.readyInMinutes,
            calories: recipe.calories
          }
        }
      };
      localStorage.setItem('weeklyPlan', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveSlot = (day, mealType) => {
    setWeeklyPlan((prev) => {
      const updated = {
        ...prev,
        [day]: { ...prev[day], [mealType]: null }
      };
      localStorage.setItem('weeklyPlan', JSON.stringify(updated));
      return updated;
    });
  };

  if (location.pathname === '/') {
    return <LandingPage onNavigate={(path) => navigate(path === 'overview' ? '/' : `/${path}`)} />;
  }

  // Halaman auth tampil penuh tanpa header/footer aplikasi.
  if (location.pathname === '/login') return <Login />;
  if (location.pathname === '/register') return <Register />;

  return (
    <div className="min-h-screen bg-[#FBFAF9] flex flex-col font-sans selection:bg-[#4E6B2F] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FBFAF9] border-b border-outline-variant px-6 md:px-12 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <img src="/cookplan-logo.svg" alt="CookPlan Logo" className="w-8 h-8 shrink-0" />
        </Link>

        <nav className="flex items-center gap-6 md:gap-8 overflow-x-auto whitespace-nowrap py-1">
          <Link
            to="/catalog"
            className={`pb-1 text-sm transition-colors cursor-pointer ${
              location.pathname === '/catalog'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-primary font-semibold'
            }`}
          >
            Katalog
          </Link>
          <Link
            to="/planner"
            className={`pb-1 text-sm transition-colors cursor-pointer ${
              location.pathname === '/planner'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-primary font-semibold'
            }`}
          >
            Rencana Masak
          </Link>
          <Link
            to="/shopping"
            className={`pb-1 text-sm transition-colors cursor-pointer ${
              location.pathname === '/shopping'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-primary font-semibold'
            }`}
          >
            Daftar Belanja
          </Link>
          <Link
            to="/profile"
            className={`pb-1 text-sm transition-colors cursor-pointer ${
              location.pathname === '/profile'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-primary font-semibold'
            }`}
          >
            Profil
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary-container/20 p-1 rounded-full pr-3 transition-all"
          >
            <img
              src={profile?.avatar_url || FALLBACK_AVATAR}
              alt={displayName}
              className="w-8 h-8 rounded-full border border-outline-variant object-cover"
            />
            <span className="text-sm font-bold text-on-surface hidden sm:inline max-w-[10rem] truncate">{displayName}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-9 h-9 rounded-full text-on-surface-variant hover:bg-secondary-container/20 hover:text-primary transition-colors cursor-pointer"
            aria-label="Keluar"
            title="Keluar"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center bg-[#FBFAF9] text-on-surface">
        <Routes>
          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <RecipeCatalog onAddToPlan={handleSetSlot} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <WeeklyPlanner
                  weeklyPlan={weeklyPlan}
                  onSetSlot={handleSetSlot}
                  onRemoveSlot={handleRemoveSlot}
                  onGoToCatalog={() => navigate('/catalog')}
                  onGenerateShoppingList={() => navigate('/shopping')}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping"
            element={
              <ProtectedRoute>
                <ShoppingList
                  weeklyPlan={weeklyPlan}
                  onGoToPlanner={() => navigate('/planner')}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<TeamProfile />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-[#D9DFB0]/50 border-t border-outline-variant py-12 px-6 md:px-16 text-on-surface">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <img src="/cookplan-logo.svg" alt="CookPlan Logo" className="w-8 h-8 shrink-0" />
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
              Membantu keluarga merencanakan makanan sehat dengan bahan lokal dan hemat budget.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="flex flex-wrap justify-center gap-6 text-xs md:text-sm font-semibold text-on-surface-variant">
              <Link to="/about" className="hover:text-primary transition-colors cursor-pointer">Tentang Kami</Link>
              <button onClick={() => showToast('Halaman "Bantuan" segera hadir')} className="hover:text-primary transition-colors cursor-pointer">Bantuan</button>
              <button onClick={() => showToast('Halaman "Kebijakan Privasi" segera hadir')} className="hover:text-primary transition-colors cursor-pointer">Kebijakan Privasi</button>
              <button onClick={() => showToast('Halaman "Syarat dan Ketentuan" segera hadir')} className="hover:text-primary transition-colors cursor-pointer">Syarat dan Ketentuan</button>
            </div>
            <p className="text-[10px] md:text-xs text-on-surface-variant/80">
              © 2026 CookPlan Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
      <Toast />
    </div>
  );
}

export default App;

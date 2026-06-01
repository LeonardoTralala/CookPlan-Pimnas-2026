import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, ShoppingCart, User } from 'lucide-react';
import { LandingPage } from './pages/LandingPage.jsx';
import RecipeCatalog from './pages/RecipeCatalog';
import WeeklyPlanner from './pages/WeeklyPlanner';
import UserProfile from './pages/UserProfile';
import TeamProfile from './pages/TeamProfile';
import ShoppingList from './pages/ShoppingList';
import { Toast } from './components/Toast.jsx';
import { Navbar } from './components/Navbar.jsx';
import { usePlan } from './hooks/usePlan.js';

function App() {
  const { showToast, weeklyPlan, setSlot, removeSlot } = usePlan();
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/') {
    return <LandingPage onNavigate={(path) => navigate(path === 'overview' ? '/' : `/${path}`)} />;
  }

  return (
    <div className="min-h-screen bg-canvas-white flex flex-col font-sans selection:bg-primary-container selection:text-white">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center bg-canvas-white text-on-surface">
        <Routes>
          <Route path="/catalog" element={<RecipeCatalog onAddToPlan={setSlot} />} />
          <Route
            path="/planner"
            element={
              <WeeklyPlanner
                weeklyPlan={weeklyPlan}
                onSetSlot={setSlot}
                onRemoveSlot={removeSlot}
                onGoToCatalog={() => navigate('/catalog')}
                onGenerateShoppingList={() => navigate('/shopping')}
              />
            }
          />
          <Route
            path="/shopping"
            element={
              <ShoppingList
                weeklyPlan={weeklyPlan}
                onGoToPlanner={() => navigate('/planner')}
              />
            }
          />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/about" element={<TeamProfile />} />
        </Routes>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-canvas-white/95 backdrop-blur-md border-t border-outline-variant flex items-center justify-around px-2 pt-2 pb-safe-2">
        <Link
          to="/catalog"
          className={`flex flex-col items-center gap-1 p-2 ${
            location.pathname === '/catalog' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <BookOpen size={24} className={location.pathname === '/catalog' ? 'fill-primary/20' : ''} />
          <span className="text-[10px] font-semibold">Katalog</span>
        </Link>
        <Link
          to="/planner"
          className={`flex flex-col items-center gap-1 p-2 ${
            location.pathname === '/planner' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <Calendar size={24} className={location.pathname === '/planner' ? 'fill-primary/20' : ''} />
          <span className="text-[10px] font-semibold">Rencana</span>
        </Link>
        <Link
          to="/shopping"
          className={`flex flex-col items-center gap-1 p-2 ${
            location.pathname === '/shopping' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <ShoppingCart size={24} className={location.pathname === '/shopping' ? 'fill-primary/20' : ''} />
          <span className="text-[10px] font-semibold">Belanja</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 p-2 ${
            location.pathname === '/profile' ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          <User size={24} className={location.pathname === '/profile' ? 'fill-primary/20' : ''} />
          <span className="text-[10px] font-semibold">Profil</span>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="bg-surface-cream/50 border-t border-outline-variant py-12 pb-24 md:pb-12 px-6 md:px-16 text-on-surface">
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

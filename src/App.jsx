import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, ShoppingCart, User } from 'lucide-react';
import { LandingPage } from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import RecipeCatalog from './pages/RecipeCatalog.jsx';
import WeeklyPlanner from './pages/WeeklyPlanner.jsx';
import UserProfile from './pages/UserProfile.jsx';
import ShoppingList from './pages/ShoppingList.jsx';
import { TeamProfile } from './pages/TeamProfile.jsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.jsx';
import { HelpCenter } from './pages/HelpCenter.jsx';
import { TermsOfService } from './pages/TermsOfService.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { Toast } from './components/Toast.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { usePlan } from './hooks/usePlan.js';

// Halaman "standalone" yang membawa chrome-nya sendiri (Navbar + Footer + Toast),
// sama seperti LandingPage — dirender penuh tanpa app-shell.
const STANDALONE_PAGES = {
  '/about': TeamProfile,
  '/privacy': PrivacyPolicy,
  '/help': HelpCenter,
  '/terms': TermsOfService,
};

function App() {
  const { weeklyPlan, setSlot, removeSlot } = usePlan();
  const location = useLocation();
  const navigate = useNavigate();
  const handleNavigate = (path) => navigate(path === 'overview' ? '/' : `/${path}`);

  // Landing & autentikasi: tampil penuh tanpa navbar/footer aplikasi.
  if (location.pathname === '/') {
    return <LandingPage onNavigate={handleNavigate} />;
  }
  if (location.pathname === '/auth') {
    return <AuthPage />;
  }

  // Halaman informasi (tentang/privasi/bantuan/syarat) membawa chrome sendiri.
  const StandalonePage = STANDALONE_PAGES[location.pathname];
  if (StandalonePage) {
    return <StandalonePage onNavigate={handleNavigate} />;
  }

  // App-shell: fitur aplikasi dengan navbar atas, bottom-nav (mobile), dan footer.
  return (
    <div className="min-h-screen bg-canvas-white flex flex-col font-sans selection:bg-primary-container selection:text-white">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center bg-canvas-white text-on-surface">
        <Routes>
          {/* Publik: katalog resep (untuk discovery + demo) */}
          <Route path="/catalog" element={<RecipeCatalog onAddToPlan={setSlot} />} />

          {/* Wajib login: halaman dengan data milik pengguna */}
          <Route element={<ProtectedRoute />}>
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
          </Route>

          {/* Rute tak dikenal kembali ke beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
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

      <Footer />
      {/* Ruang ekstra agar footer tak tertutup bottom-nav di mobile */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      <Toast />
    </div>
  );
}

export default App;

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.jsx';
import { PreRegister } from './pages/PreRegister.jsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.jsx';
import { HelpCenter } from './pages/HelpCenter.jsx';
import { TermsOfService } from './pages/TermsOfService.jsx';
import { TeamProfile } from './pages/TeamProfile.jsx';
import AuthPage from './pages/AuthPage.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AppShell } from './components/AppShell.jsx';
import { CatalogPage } from './pages/CatalogPage.jsx';
import { PlannerPage } from './pages/PlannerPage.jsx';
import { ShoppingPage } from './pages/ShoppingPage.jsx';
import UserProfile from './pages/UserProfile.jsx';
import { GeneratePlan } from './pages/GeneratePlan.jsx';
import { GenerateResult } from './pages/GenerateResult.jsx';
import { OrderPage } from './pages/OrderPage.jsx';
import { AIProviders } from './pages/admin/AIProviders.jsx';
import { Toast } from './components/Toast.jsx';

// Routing penuh CookPlan. Halaman publik (landing, pre-register, legal) + halaman
// aplikasi terproteksi (generate, katalog, planner, belanja, profil) di balik
// ProtectedRoute. Auth diaktifkan kembali setelah fase pre-register.
function App() {
  const navigate = useNavigate();
  const handleNavigate = (path) => navigate(path === 'overview' ? '/' : `/${path}`);

  return (
    <>
      <Routes>
        {/* Publik */}
        <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
        <Route path="/register" element={<PreRegister onNavigate={handleNavigate} />} />
        <Route path="/privacy" element={<PrivacyPolicy onNavigate={handleNavigate} />} />
        <Route path="/help" element={<HelpCenter onNavigate={handleNavigate} />} />
        <Route path="/terms" element={<TermsOfService onNavigate={handleNavigate} />} />
        <Route path="/about" element={<TeamProfile onNavigate={handleNavigate} />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Terproteksi (butuh login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/generate" element={<AppShell><GeneratePlan /></AppShell>} />
          <Route path="/generate/:planId" element={<AppShell><GenerateResult /></AppShell>} />
          <Route path="/order/:planId" element={<AppShell><OrderPage /></AppShell>} />
          <Route path="/catalog" element={<AppShell><CatalogPage /></AppShell>} />
          <Route path="/planner" element={<AppShell><PlannerPage /></AppShell>} />
          <Route path="/shopping" element={<AppShell><ShoppingPage /></AppShell>} />
          <Route path="/profile" element={<AppShell><UserProfile /></AppShell>} />
          <Route path="/admin/ai" element={<AppShell><AIProviders /></AppShell>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  );
}

export default App;

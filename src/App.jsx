import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.jsx';
import { PreRegister } from './pages/PreRegister.jsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.jsx';
import { HelpCenter } from './pages/HelpCenter.jsx';
import { TermsOfService } from './pages/TermsOfService.jsx';
import { TeamProfile } from './pages/TeamProfile.jsx';

// Fase pre-register: aplikasi hanya membuka halaman pemasaran (landing) dan
// formulir daftar tunggu (/register). Fitur aplikasi (katalog, planner, belanja,
// profil) dan login belum dibuka untuk umum — route apa pun selain dua di atas
// diarahkan kembali ke beranda. Kode fitur & auth tetap ada di repo agar mudah
// diaktifkan kembali saat peluncuran.
function App() {
  const navigate = useNavigate();
  const handleNavigate = (path) => navigate(path === 'overview' ? '/' : `/${path}`);

  return (
    <Routes>
      <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
      <Route path="/register" element={<PreRegister onNavigate={handleNavigate} />} />
      <Route path="/privacy" element={<PrivacyPolicy onNavigate={handleNavigate} />} />
      <Route path="/help" element={<HelpCenter onNavigate={handleNavigate} />} />
      <Route path="/terms" element={<TermsOfService onNavigate={handleNavigate} />} />
      <Route path="/about" element={<TeamProfile onNavigate={handleNavigate} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

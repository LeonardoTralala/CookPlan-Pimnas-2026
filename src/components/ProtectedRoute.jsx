import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// Route layout yang mewajibkan login. Selagi sesi dipulihkan dari storage,
// tampilkan loader agar user yang sudah login tidak ikut "terlempar" ke /auth
// saat halaman di-refresh. Lokasi tujuan dibawa lewat state agar setelah login
// user dikembalikan ke halaman yang tadi dia tuju.
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary" aria-hidden="true">
          progress_activity
        </span>
        <span className="sr-only">Memuat…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

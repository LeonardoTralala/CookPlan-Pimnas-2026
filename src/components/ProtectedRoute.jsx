import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// Membungkus rute yang butuh login. Selama sesi masih dimuat tampilkan loader;
// jika tidak ada user, alihkan ke /login sambil menyimpan tujuan asal.
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-3xl" aria-hidden="true">
          progress_activity
        </span>
        <span className="sr-only">Memuat…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

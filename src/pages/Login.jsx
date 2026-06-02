import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/catalog";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await signIn({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      setError("Email atau kata sandi salah. Silakan coba lagi.");
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas-white text-on-surface flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 select-none">
          <img src="/cookplan-logo.svg" alt="CookPlan" className="w-10 h-10" />
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 shadow-[0_8px_24px_-8px_rgba(44,58,30,0.08)]">
          <h1 className="text-2xl font-extrabold text-primary mb-1">Masuk</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Selamat datang kembali di CookPlan.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-1.5">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full text-sm font-semibold hover:bg-surface-tint transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && (
                <span className="material-symbols-outlined animate-spin text-[18px]" aria-hidden="true">
                  progress_activity
                </span>
              )}
              {loading ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

export default Login;

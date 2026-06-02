import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || "Pendaftaran gagal. Silakan coba lagi.");
      return;
    }

    // Konfirmasi email mati → sesi langsung aktif → masuk aplikasi.
    if (data.session) {
      navigate("/catalog", { replace: true });
      return;
    }

    // Konfirmasi email aktif → belum ada sesi → minta cek email.
    setInfo("Pendaftaran berhasil! Cek email kamu untuk konfirmasi sebelum masuk.");
  };

  return (
    <div className="min-h-screen bg-canvas-white text-on-surface flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 select-none">
          <img src="/cookplan-logo.svg" alt="CookPlan" className="w-10 h-10" />
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 shadow-[0_8px_24px_-8px_rgba(44,58,30,0.08)]">
          <h1 className="text-2xl font-extrabold text-primary mb-1">Daftar Akun</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Mulai rencanakan menu mingguanmu bersama CookPlan.
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

          {info && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2 rounded-xl bg-secondary-container/60 border border-primary/20 px-4 py-3 text-sm text-on-secondary-container"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">mark_email_unread</span>
              <span>{info}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-on-surface mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama kamu"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

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
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
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
              {loading ? "Memproses…" : "Daftar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
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

export default Register;

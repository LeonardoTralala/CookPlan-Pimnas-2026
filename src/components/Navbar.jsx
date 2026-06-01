import { Link, useLocation } from 'react-router-dom';
import { Logo } from "./Logo.jsx";
import { usePlan } from "../hooks/usePlan.js";
import { AVATAR_URL } from "../utils/userConfig.js";

// Sticky top navigation. Router-aware: uses Link + useLocation for active states.
// Landing-page scroll helpers are no longer needed since we always run inside BrowserRouter.
export function Navbar() {
  const { plannedCount } = usePlan();
  const location = useLocation();

  const navLink = (to, label, extra) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`transition-colors font-label-md text-label-md cursor-pointer ${extra ?? ''} ${
          active
            ? 'text-primary font-bold border-b-2 border-primary pb-0.5'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="w-full sticky top-0 z-50 border-b border-outline-variant/30 backdrop-blur-md bg-canvas-white/95">
      <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <Link to="/" className="flex items-center gap-3 cursor-pointer select-none">
          <Logo className="h-11 w-auto" />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLink('/catalog', 'Katalog')}
          {navLink('/planner', 'Rencana Masak')}
          <Link
            to="/shopping"
            className={`flex items-center gap-1.5 transition-colors font-label-md text-label-md cursor-pointer ${
              location.pathname === '/shopping'
                ? 'text-primary font-bold border-b-2 border-primary pb-0.5'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Daftar Belanja
            {plannedCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-white text-[10px] rounded-full font-bold">
                {plannedCount}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary-container/20 p-1 rounded-full pr-3 transition-all"
          >
            <img
              src={AVATAR_URL}
              alt="User profile"
              className="w-8 h-8 rounded-full border border-outline-variant object-cover"
            />
            <span className="text-sm font-bold text-on-surface hidden sm:inline">Profil</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

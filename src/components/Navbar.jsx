
import { useState } from "react";
import { Logo } from "./Logo.jsx";
import { usePlan } from "../hooks/usePlan.js";
import { scrollToSection, scrollToTop } from "../utils/scroll.js";

// Sticky top navigation: brand, section links, search, shopping counter & profile.
// `onNavigate(tab)` routes into the app tabs; falls back to in-page scrolling.
export function Navbar({ onNavigate }) {
  const { addedRecipes, showToast } = usePlan();
  const [menuOpen, setMenuOpen] = useState(false);

  const goCatalog = () => (onNavigate ? onNavigate("catalog") : scrollToSection("recipes"));
  const goPlanner = () => (onNavigate ? onNavigate("planner") : scrollToSection("how-it-works"));

  const handleShoppingList = () => {
    if (addedRecipes.length > 0) {
      showToast(`Anda memiliki ${addedRecipes.length} resep di rencana belanja Anda`);
    } else {
      showToast("Rencana belanja kosong. Silakan tambah resep terlebih dahulu!");
    }
  };

  // Tutup menu mobile dulu, lalu jalankan aksinya.
  const onMobile = (fn) => () => {
    setMenuOpen(false);
    fn();
  };

  return (
    <header className="w-full sticky top-0 z-50 border-b border-outline-variant/30 backdrop-blur-md bg-canvas-white/95">
      <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={scrollToTop}
        >
          <Logo className="h-11 w-auto" />
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={goCatalog}
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer"
          >
            Katalog
          </button>
          <button
            onClick={goPlanner}
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer"
          >
            Rencana Masak
          </button>
          <button
            onClick={handleShoppingList}
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer flex items-center gap-1.5"
          >
            Daftar Belanja
            {addedRecipes.length > 0 && (
              <span className="px-2 py-0.5 bg-primary text-white text-[10px] rounded-full font-bold">
                {addedRecipes.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNavigate && onNavigate("profile")}
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary-container/20 p-1 rounded-full pr-3 transition-all"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6odIuOL3lOpT9KvOC3lLPVT9QUV5V0_ERHx_tm4JbQgrxb4YQ-3YA71v9MPggK9PKLK8GwLCrY58zvY2thnXRYIWZx_MKNu9T1unG1Loy-2z6TZjGTMM-Q2bC7lbTKVG_QQU2S_zKpH4kBECNu-_g_a8TxyfbpbYzlykIJEoGOVpfZFinQPBWE34Nvl7WSNewV3llUb5Xn4162z2Az3_VgWDc2t81tIMwMAQXKpjk_WSIyzTknKRzKQp6-MDp4YcBAzS12o2LGrDD"
              alt="User profile"
              className="w-8 h-8 rounded-full border border-outline-variant object-cover"
            />
            <span className="text-sm font-bold text-on-surface hidden sm:inline">Profil</span>
          </button>

          {/* Tombol hamburger — hanya tampil di mobile */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-on-surface hover:bg-secondary-container/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </nav>

      {/* Menu mobile (drawer dropdown) */}
      {menuOpen && (
        <div className="md:hidden border-t border-outline-variant/30 bg-canvas-white animate-fade-in">
          <div className="flex flex-col px-margin-mobile py-2">
            <button
              onClick={onMobile(goCatalog)}
              className="flex items-center justify-between py-3 text-left text-on-surface hover:text-primary transition-colors font-label-md text-label-md cursor-pointer border-b border-outline-variant/20"
            >
              Katalog
            </button>
            <button
              onClick={onMobile(goPlanner)}
              className="flex items-center justify-between py-3 text-left text-on-surface hover:text-primary transition-colors font-label-md text-label-md cursor-pointer border-b border-outline-variant/20"
            >
              Rencana Masak
            </button>
            <button
              onClick={onMobile(handleShoppingList)}
              className="flex items-center justify-between py-3 text-left text-on-surface hover:text-primary transition-colors font-label-md text-label-md cursor-pointer"
            >
              <span>Daftar Belanja</span>
              {addedRecipes.length > 0 && (
                <span className="px-2 py-0.5 bg-primary text-white text-[10px] rounded-full font-bold">
                  {addedRecipes.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

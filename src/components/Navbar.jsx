import { useState } from "react";
import { Logo } from "./Logo.jsx";
import { ProfileModal } from "./ProfileModal.jsx";
import { usePlan } from "../hooks/usePlan.js";
import { scrollToSection, scrollToTop } from "../utils/scroll.js";

// Sticky top navigation: brand, section links, search, shopping counter & profile.
// `onNavigate(tab)` routes into the app tabs; falls back to in-page scrolling.
export function Navbar({ onNavigate }) {
  const { addedRecipes, showToast } = usePlan();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const goCatalog = () => (onNavigate ? onNavigate("catalog") : scrollToSection("recipes"));
  const goPlanner = () => (onNavigate ? onNavigate("planner") : scrollToSection("how-it-works"));

  const handleShoppingList = () => {
    if (addedRecipes.length > 0) {
      showToast(`Anda memiliki ${addedRecipes.length} resep di rencana belanja Anda`);
    } else {
      showToast("Rencana belanja kosong. Silakan tambah resep terlebih dahulu!");
    }
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
            Catalog
          </button>
          <button
            onClick={goPlanner}
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer"
          >
            Planner
          </button>
          <button
            onClick={handleShoppingList}
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer flex items-center gap-1.5"
          >
            Shopping List
            {addedRecipes.length > 0 && (
              <span className="px-2 py-0.5 bg-primary text-white text-[10px] rounded-full font-bold">
                {addedRecipes.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md active:scale-95 duration-150 ease-in-out cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">person</span>
            <span className="hidden sm:inline">Profile</span>
          </button>
        </div>
      </nav>

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </header>
  );
}

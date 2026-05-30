import { Logo } from "./Logo.jsx";
import { usePlan } from "../hooks/usePlan.js";

const links = ["About Us", "Support", "Privacy Policy", "Terms of Service"];

export function Footer() {
  const { showToast } = usePlan();

  return (
    <footer className="w-full mt-auto bg-surface-container-highest border-t border-outline-variant/30">
      <div className="w-full px-margin-mobile md:px-margin-desktop py-12 flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-8">
        <div className="flex items-center gap-3 select-none">
          <Logo className="h-9 w-auto" />
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {links.map((label) => (
            <button
              key={label}
              onClick={() => showToast(`Halaman "${label}" segera hadir`)}
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant/60">
          ©2026 CookPlan All rights reserved.
        </p>
      </div>
    </footer>
  );
}

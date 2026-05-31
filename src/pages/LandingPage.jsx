import { Navbar } from "../components/Navbar.jsx";
import { Hero } from "../components/Hero.jsx";
import { HowItWorks } from "../components/HowItWorks.jsx";
import { WhyCookPlan } from "../components/WhyCookPlan.jsx";
import { FeaturedRecipes } from "../components/FeaturedRecipes.jsx";
import { FinalCTA } from "../components/FinalCTA.jsx";
import { Footer } from "../components/Footer.jsx";
import { Toast } from "../components/Toast.jsx";

// Buyer-facing landing page — composes every section in the order from the
// Stitch reference design. Search state is lifted here so the navbar search
// box filters the FeaturedRecipes grid. `onNavigate(tab)` (optional) lets the
// nav links & CTAs jump into the app's tabs (catalog/planner/profile); when it
// is omitted the buttons fall back to in-page smooth scrolling.
export function LandingPage({ onNavigate }) {
  return (
    <div className="font-body-md text-on-surface bg-canvas-white min-h-screen flex flex-col antialiased">
      <Navbar onNavigate={onNavigate} />
      <main className="flex-grow">
        <Hero onNavigate={onNavigate} />
        <HowItWorks />
        <WhyCookPlan />
        <FeaturedRecipes onNavigate={onNavigate} />
        <FinalCTA onNavigate={onNavigate} />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}

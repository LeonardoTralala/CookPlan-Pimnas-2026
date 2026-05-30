import { useState } from "react";
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
// box filters the FeaturedRecipes grid.
export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="font-body-md text-on-surface bg-canvas-white min-h-screen flex flex-col antialiased">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <WhyCookPlan />
        <FeaturedRecipes searchQuery={searchQuery} />
        <FinalCTA />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}

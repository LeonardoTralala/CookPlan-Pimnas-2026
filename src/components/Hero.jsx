import { heroImage } from "../utils/recipes.js";
import { scrollToSection } from "../utils/scroll.js";

export function Hero({ onNavigate }) {
  const goPlanner = () => (onNavigate ? onNavigate("planner") : scrollToSection("how-it-works"));
  const goCatalog = () => (onNavigate ? onNavigate("catalog") : scrollToSection("recipes"));

  return (
    <section className="hero-gradient pt-20 pb-32">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold">
            Mulai Hidup Sehat
          </span>
          <h1 className="font-headline-xl text-headline-xl text-primary leading-tight">
            Makan Sehat, Belanja Lokal, Tanpa Ribet.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
            Rencanakan menu mingguanmu dan dapatkan daftar belanja otomatis dari produsen lokal favoritmu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={goPlanner}
              className="px-8 py-4 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:shadow-lg transition-shadow cursor-pointer font-semibold"
            >
              Mulai Rencana Masak
            </button>
            <button
              onClick={goCatalog}
              className="px-8 py-4 border-2 border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary/5 transition-colors cursor-pointer font-semibold"
            >
              Lihat Katalog Resep
            </button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          <img
            className="relative w-full h-[320px] sm:h-[500px] object-cover rounded-3xl shadow-xl image-reveal"
            alt="Hidangan masakan rumahan sehat khas Indonesia yang menggugah selera"
            src={heroImage}
          />
        </div>
      </div>
    </section>
  );
}

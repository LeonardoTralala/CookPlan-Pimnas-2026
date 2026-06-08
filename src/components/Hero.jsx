import { heroImage } from "../utils/recipes.js";
import { scrollToSection } from "../utils/scroll.js";

export function Hero({ onNavigate }) {
  // Fase pre-register: CTA utama menuju formulir daftar tunggu; CTA sekunder
  // hanya menggulir ke bagian "Cara Kerja" (fitur belum dibuka).
  const goRegister = () => (onNavigate ? onNavigate("register") : scrollToSection("how-it-works"));
  const goLearn = () => scrollToSection("how-it-works");

  return (
    <section className="hero-gradient pt-12 pb-16 md:pt-20 md:pb-32">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="space-y-6 md:space-y-8">
          <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold">
            Dapur Cerdas Dimulai di Sini
          </span>
          <h1 className="font-headline-xl text-headline-xl text-primary leading-tight">
            Plan It, Cook It, Waste Nothing.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
            Susun menu mingguanmu, dapatkan daftar belanja otomatis, dan kurangi food waste mulai dari sekarang.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={goRegister}
              className="px-6 py-3 md:px-8 md:py-4 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:shadow-lg transition-shadow cursor-pointer font-semibold"
            >
              Daftar Gratis Sekarang
            </button>
            <button
              onClick={goLearn}
              className="px-6 py-3 md:px-8 md:py-4 border-2 border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary/5 transition-colors cursor-pointer font-semibold"
            >
              Pelajari Cara Kerja
            </button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/5 rounded-panel blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          <img
            className="relative w-full h-[240px] sm:h-[400px] md:h-[500px] object-cover rounded-3xl shadow-xl image-reveal"
            alt="Hidangan masakan rumahan sehat khas Indonesia yang menggugah selera"
            src={heroImage}
            loading="eager"
            onError={(e) => { e.currentTarget.src = '/img/recipe-placeholder.svg'; }}
          />
        </div>
      </div>
    </section>
  );
}

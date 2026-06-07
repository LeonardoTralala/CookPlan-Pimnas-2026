import { usePlan } from "../hooks/usePlan.js";

export function FinalCTA({ onNavigate }) {
  const { showToast } = usePlan();

  const start = () =>
    onNavigate
      ? onNavigate("register")
      : showToast("Terima kasih! Pendaftaran beta akan segera dibuka.");

  return (
    <section className="py-24 px-margin-mobile md:px-margin-desktop text-center">
      <div className="max-w-4xl mx-auto bg-primary-container rounded-panel p-12 md:p-20 text-on-primary-container relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
        <h2 className="font-headline-lg text-headline-lg mb-6 relative z-10">
          Siap Ubah Gaya Masakmu?
        </h2>
        <p className="font-body-lg text-body-lg mb-10 text-on-primary-container/80 relative z-10">
          Bergabunglah dengan 5,000+ keluarga yang telah mempermudah hidup mereka dengan CookPlan.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <button
            onClick={start}
            className="px-10 py-5 bg-on-primary-container text-primary-container font-bold rounded-full hover:bg-white hover:text-primary transition-colors shadow-xl cursor-pointer"
          >
            Mulai Sekarang - Gratis
          </button>
        </div>
      </div>
    </section>
  );
}

import { usePlan } from "../hooks/usePlan.js";

// Region aria-live selalu ada di DOM agar screen reader mendeteksinya sejak awal.
// Konten berubah saat ada pesan; sr-only menyembunyikannya secara visual saat kosong.
export function Toast() {
  const { toast } = usePlan();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={
        toast.message
          ? "fixed bottom-6 right-6 z-50 bg-primary text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in"
          : "sr-only"
      }
    >
      <span className="material-symbols-outlined text-success-green shrink-0" aria-hidden="true">
        check_circle
      </span>
      <span className="font-medium text-sm">{toast.message}</span>
      {toast.onUndo && (
        <button
          onClick={toast.onUndo}
          className="ml-1 text-sm font-bold underline underline-offset-2 text-white/90 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
        >
          Urungkan
        </button>
      )}
    </div>
  );
}

import { usePlan } from "../hooks/usePlan.js";
import { Modal } from "./Modal.jsx";

// Lightweight account preview modal opened from the navbar Profile pill.
export function ProfileModal({ onClose }) {
  const { plannedCount, showToast } = usePlan();

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="bg-canvas-white rounded-panel p-8 max-w-sm w-full shadow-2xl border border-outline-variant/30 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full cursor-pointer"
        >
          close
        </button>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center select-none">
            <span className="material-symbols-outlined text-4xl">person</span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary">Akun Pengguna</h3>
            <p className="text-sm text-on-surface-variant">Mahasiswa Kos / Pekerja Kantoran</p>
          </div>
          <div className="w-full border-t border-outline-variant/30 pt-4 space-y-2 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Menu di Rencana:</span>
              <span className="font-bold text-primary">{plannedCount} resep</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Status Paket:</span>
              <span className="font-bold text-secondary">Gratis</span>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              showToast("Fitur integrasi Supabase Auth segera hadir!");
            }}
            className="w-full py-3 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity cursor-pointer font-semibold"
          >
            Masuk ke Dashboard
          </button>
        </div>
      </div>
    </Modal>
  );
}

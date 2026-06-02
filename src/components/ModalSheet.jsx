import { useEffect, useRef, useState } from "react";

// Responsive modal shell. Di mobile tampil sebagai bottom sheet (muncul dari
// bawah, ada drag-handle, bisa di-swipe ke bawah untuk menutup); di desktop
// tetap dialog yang berada di tengah layar. Menutup lewat klik backdrop & Escape.
//
// Props:
//   onClose        — dipanggil saat backdrop diklik, Escape ditekan, atau swipe-down.
//   labelledBy     — id elemen judul untuk aria-labelledby.
//   panelClassName — kelas tambahan untuk panel (ukuran maksimum, layout, dsb).
export function ModalSheet({ onClose, labelledBy, panelClassName = "", children }) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    if (startY.current == null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  };
  const handleTouchEnd = () => {
    if (dragY > 100) onClose();
    else setDragY(0);
    startY.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative bg-white w-full shadow-2xl border border-outline-variant rounded-t-[28px] md:rounded-[32px] animate-slide-up md:animate-fade-in ${panelClassName}`}
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {/* Drag-handle — hanya tampil & berfungsi di mobile */}
        <div
          className="md:hidden shrink-0 pt-3 pb-1 flex justify-center touch-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-hidden="true"
        >
          <span className="block w-10 h-1.5 rounded-full bg-outline-variant" />
        </div>
        {children}
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Setiap kali route berubah: scroll kembali ke atas dan pindahkan fokus ke
// <main> (elemen ber-id "main-content") supaya pengguna keyboard & screen
// reader mendarat di konten halaman baru, bukan di posisi scroll lama.
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const main = document.getElementById("main-content");
    if (main) {
      // preventScroll agar pemindahan fokus tidak membatalkan scroll-to-top
      main.focus({ preventScroll: true });
    }
  }, [pathname]);

  return null;
}

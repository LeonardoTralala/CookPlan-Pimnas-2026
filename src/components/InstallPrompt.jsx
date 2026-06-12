import { useState, useEffect } from 'react';

// Banner ajakan install PWA ("Add to Home Screen"). 
// Android/Chrome: tangkap event beforeinstallprompt → tombol "Pasang".
// iOS Safari: tidak ada API prompt → tampilkan instruksi manual (Share → Add to Home Screen).
// Sembunyi otomatis bila app sudah berjalan dalam mode standalone (sudah dipasang).

const DISMISS_KEY = 'pwa_install_dismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !window.MSStream;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Android/Chrome
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS: tidak ada beforeinstallprompt → tampilkan hint manual setelah jeda.
    let iosTimer;
    if (isIOS()) {
      iosTimer = setTimeout(() => { setIosHint(true); setShow(true); }, 2500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 pb-safe-4 animate-slide-up md:max-w-md md:mx-auto md:bottom-4 md:rounded-3xl">
      <div className="bg-canvas-white border border-outline-variant rounded-3xl shadow-2xl p-4 flex items-start gap-3">
        <img src="/icon-192.png" alt="" className="w-12 h-12 rounded-xl shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-on-surface text-sm">Pasang CookPlan di HP-mu</p>
          {iosHint ? (
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              Tap tombol <span className="material-symbols-outlined text-[14px] align-middle">ios_share</span> Bagikan di Safari, lalu pilih <strong>"Tambah ke Layar Utama"</strong>.
            </p>
          ) : (
            <p className="text-xs text-on-surface-variant mt-0.5">
              Akses cepat seperti aplikasi, langsung dari layar utama.
            </p>
          )}
          <div className="flex gap-2 mt-3">
            {!iosHint && (
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-semibold cursor-pointer active:scale-95 transition"
              >
                Pasang
              </button>
            )}
            <button
              onClick={dismiss}
              className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-full text-xs font-semibold cursor-pointer"
            >
              Nanti saja
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Tutup" className="text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  );
}

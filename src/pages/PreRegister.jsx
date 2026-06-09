import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/Logo.jsx";
import { Toast } from "../components/Toast.jsx";
import { usePlan } from "../hooks/usePlan.js";
import { supabase } from "../lib/supabase.js";

const USER_TYPES = [
  "Mahasiswa / Anak Kos",
  "Pekerja",
  "Ibu Rumah Tangga / Keluarga",
  "Lainnya",
];

// Kota-kota utama (target awal CookPlan). Daftar ini hanya saran — pengguna
// tetap boleh mengetik kota lain yang belum ada di sini agar demand dari kota
// baru tetap tertangkap.
const CITIES = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Malang",
  "Yogyakarta",
  "Semarang",
  "Surakarta (Solo)",
  "Bogor",
  "Depok",
  "Tangerang",
  "Bekasi",
  "Medan",
  "Makassar",
  "Palembang",
  "Denpasar",
  "Balikpapan",
];

const BENEFITS = [
  {
    icon: "restaurant_menu",
    title: "Akses Awal Gratis",
    desc: "Jadi yang pertama mencoba semua fitur CookPlan tanpa biaya saat peluncuran.",
  },
  {
    icon: "local_offer",
    title: "Diskon Khusus Pendaftar Awal",
    desc: "Dapatkan penawaran eksklusif untuk bahan dari supplier lokal favoritmu.",
  },
  {
    icon: "notifications_active",
    title: "Info Peluncuran Duluan",
    desc: "Kami kabari langsung lewat email/WhatsApp begitu CookPlan resmi dibuka.",
  },
];

// Kecamatan di Kota Malang. Field kecamatan hanya muncul saat kota Malang
// dipilih, karena daftar ini spesifik untuk Malang.
const KECAMATAN_MALANG = [
  "Blimbing",
  "Kedungkandang",
  "Klojen",
  "Lowokwaru",
  "Sukun",
];

const isMalang = (city) => city.trim().toLowerCase() === "malang";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  city: "",
  kecamatan: "",
  userType: USER_TYPES[0],
};

// Pre-register (daftar tunggu) page for buyers. Captures interest before the
// product launch and stores submissions in Supabase (tabel `preregistrations`,
// insert-only untuk anon). Mirrors the standalone layout pattern used by
// LandingPage.
export function PreRegister({ onNavigate }) {
  const { showToast } = usePlan();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Honeypot anti-bot: harus tetap kosong. Diisi otomatis oleh bot, bukan
  // manusia (field-nya disembunyikan dari layar & tab order).
  const [botField, setBotField] = useState("");
  const successRef = useRef(null);

  // Pindahkan fokus ke judul sukses agar perubahan layar terumumkan ke
  // pembaca layar (screen reader), bukan tertinggal di tombol submit lama.
  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Nama lengkap wajib diisi.";
    if (!form.email.trim()) {
      next.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Format email tidak valid.";
    }
    if (form.phone.trim() && !/^[0-9+\s-]{8,16}$/.test(form.phone.trim())) {
      next.phone = "Nomor WhatsApp tidak valid.";
    }
    if (!form.city.trim()) next.city = "Kota / domisili wajib diisi.";
    if (isMalang(form.city) && !form.kecamatan) next.kecamatan = "Pilih kecamatan kamu.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Honeypot terisi → hampir pasti bot. Pura-pura sukses tanpa menyentuh
    // database agar bot tidak tahu submission-nya diabaikan.
    if (botField) {
      setSubmitted(true);
      return;
    }

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      showToast("Periksa kembali data yang kamu isi.", { variant: "error" });
      return;
    }

    // Kolom dipetakan ke tabel `preregistrations`. Field opsional yang kosong
    // dikirim sebagai null agar konsisten di database.
    const entry = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      city: form.city.trim(),
      kecamatan: isMalang(form.city) ? form.kecamatan || null : null,
      user_type: form.userType || null,
    };

    setSubmitting(true);
    try {
      const { error } = await supabase.from("preregistrations").insert(entry);
      if (error) {
        // 23505 = unique_violation → email sudah ada di daftar tunggu.
        if (error.code === "23505") {
          setErrors({ email: "Email ini sudah terdaftar di daftar tunggu." });
          showToast("Email ini sudah terdaftar.", { variant: "error" });
          return;
        }
        showToast("Gagal mendaftar. Periksa koneksi lalu coba lagi.", { variant: "error" });
        return;
      }

      setSubmitted(true);
      setForm(EMPTY_FORM);
      showToast("Pendaftaran berhasil! Sampai jumpa di peluncuran 🎉");
    } catch {
      // Kegagalan jaringan bisa membuat fetch melempar (bukan mengembalikan
      // { error }). Tangani di sini supaya tombol tidak terkunci selamanya.
      showToast("Gagal mendaftar. Periksa koneksi lalu coba lagi.", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-body-md text-on-surface bg-canvas-white min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 border-b border-outline-variant/30 backdrop-blur-md bg-canvas-white/95">
        <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <Link to="/" className="flex items-center gap-3 cursor-pointer select-none">
            <Logo className="h-11 w-auto" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke Beranda
          </Link>
        </nav>
      </header>

      <main className="flex-grow hero-gradient">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: pitch + benefits */}
          <div className="space-y-8">
            <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Daftar Tunggu • Segera Hadir
            </span>
            <h1 className="font-headline-xl text-headline-xl text-primary leading-tight">
              Jadi yang Pertama Mencoba CookPlan.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Daftarkan dirimu sekarang dan dapatkan akses awal, diskon khusus, serta kabar peluncuran langsung ke kotak masukmu.
            </p>
            <ul className="space-y-5 pt-2">
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex items-start gap-4">
                  <span className="shrink-0 w-11 h-11 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined">{b.icon}</span>
                  </span>
                  <div>
                    <p className="font-headline-md text-base font-semibold text-on-surface">{b.title}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{b.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form / success */}
          <div className="bg-surface-container-lowest rounded-[32px] p-8 md:p-10 shadow-xl border border-outline-variant/30">
            {submitted ? (
              <div className="flex flex-col items-center text-center space-y-5 py-6">
                <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h2
                  ref={successRef}
                  tabIndex={-1}
                  className="font-headline-lg text-headline-lg text-primary outline-none"
                >
                  Kamu Sudah Terdaftar!
                </h2>
                <p className="text-on-surface-variant max-w-xs">
                  Terima kasih sudah bergabung di daftar tunggu CookPlan. Kami akan menghubungimu begitu peluncuran dimulai.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                  <button
                    onClick={() => {
                      const text = "Aku baru daftar ke CookPlan — aplikasi rencana masak dengan bahan lokal! Kamu juga bisa ikut daftar tunggu gratis di sini:";
                      const url = window.location.origin + "/register";
                      if (navigator.share) {
                        navigator.share({ title: "CookPlan — Daftar Tunggu", text, url }).catch(() => {});
                      } else {
                        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank", "noopener");
                      }
                    }}
                    className="flex-1 py-3 border-2 border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary/5 transition-colors cursor-pointer font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">share</span>
                    Bagikan ke Teman
                  </button>
                  <button
                    onClick={() => (onNavigate ? onNavigate("overview") : null)}
                    className="flex-1 py-3 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:shadow-lg transition-shadow cursor-pointer font-semibold"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <h2 className="font-headline-md text-headline-md text-primary">Pre-Register Gratis</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Isi data di bawah, tidak sampai satu menit.</p>
                </div>

                <Field id="pr-name" label="Nama Lengkap" error={errors.name}>
                  <input
                    id="pr-name"
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Contoh: Andi Pratama"
                    autoComplete="name"
                    maxLength={120}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? "pr-name-error" : undefined}
                    className={inputClass(errors.name)}
                  />
                </Field>

                <Field id="pr-email" label="Email" error={errors.email}>
                  <input
                    id="pr-email"
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="kamu@email.com"
                    autoComplete="email"
                    maxLength={200}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? "pr-email-error" : undefined}
                    className={inputClass(errors.email)}
                  />
                </Field>

                <Field id="pr-phone" label="Nomor WhatsApp (opsional)" error={errors.phone}>
                  <input
                    id="pr-phone"
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="0812xxxxxxxx"
                    autoComplete="tel"
                    maxLength={25}
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={errors.phone ? "pr-phone-error" : undefined}
                    className={inputClass(errors.phone)}
                  />
                </Field>

                <Field id="pr-city" label="Kota / Domisili" error={errors.city}>
                  <CityCombobox
                    id="pr-city"
                    value={form.city}
                    error={errors.city}
                    describedBy={errors.city ? "pr-city-error" : undefined}
                    onChange={(city) => {
                      setForm((prev) => ({
                        ...prev,
                        city,
                        // reset kecamatan bila pindah dari Malang ke kota lain
                        kecamatan: isMalang(city) ? prev.kecamatan : "",
                      }));
                      setErrors((prev) => ({ ...prev, city: undefined }));
                    }}
                  />
                </Field>

                {isMalang(form.city) && (
                  <Field id="pr-kecamatan" label="Kecamatan (Kota Malang)" error={errors.kecamatan}>
                    <select
                      id="pr-kecamatan"
                      value={form.kecamatan}
                      onChange={update("kecamatan")}
                      aria-invalid={errors.kecamatan ? true : undefined}
                      aria-describedby={errors.kecamatan ? "pr-kecamatan-error" : undefined}
                      className={inputClass(errors.kecamatan)}
                    >
                      <option value="">Pilih kecamatan…</option>
                      {KECAMATAN_MALANG.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <Field id="pr-usertype" label="Kamu seorang...">
                  <select id="pr-usertype" value={form.userType} onChange={update("userType")} className={inputClass()}>
                    {USER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:shadow-lg transition-shadow cursor-pointer font-semibold disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <span className="material-symbols-outlined animate-spin text-[20px]" aria-hidden="true">progress_activity</span>
                  )}
                  {submitting ? "Mendaftarkan…" : "Daftar Sekarang"}
                </button>
                <p className="text-xs text-center text-on-surface-variant/70">
                  Dengan mendaftar, kamu setuju menerima informasi peluncuran dari CookPlan dan menyetujui{" "}
                  <Link to="/privacy" className="underline underline-offset-2 hover:text-primary">
                    Kebijakan Privasi
                  </Link>{" "}
                  kami.
                </p>

                {/* Honeypot: tersembunyi dari manusia (off-screen + di luar tab
                    order). Hanya bot yang mengisinya, lihat handleSubmit. */}
                <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
                  <label>
                    Jangan isi kolom ini
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      value={botField}
                      onChange={(e) => setBotField(e.target.value)}
                    />
                  </label>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Toast />
    </div>
  );
}

// Searchable city picker (creatable combobox): ketik untuk memfilter daftar kota
// lalu klik pilih. Bila kota yang diketik tidak ada di daftar, muncul opsi
// eksplisit "Pakai '...'" sehingga kota di luar daftar tetap bisa dipilih dan
// tercatat — bukan sekadar dibiarkan sebagai teks bebas.
function CityCombobox({ value, error, onChange, id, describedBy }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = `${id || "city"}-listbox`;

  const trimmed = value.trim();

  const matches = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [trimmed]);

  const exactMatch = CITIES.some((c) => c.toLowerCase() === trimmed.toLowerCase());

  // Opsi "buat baru" muncul saat user mengetik kota yang tidak persis ada di
  // daftar — ini solusi untuk kota yang belum terdaftar.
  const showCreate = trimmed !== "" && !exactMatch;

  // Gabungan opsi (kota + opsi buat-baru) dipakai untuk render sekaligus
  // navigasi keyboard agar indeks aktif selalu konsisten.
  const options = useMemo(() => {
    const opts = matches.map((city) => ({ kind: "city", value: city }));
    if (showCreate) opts.push({ kind: "create", value: trimmed });
    return opts;
  }, [matches, showCreate, trimmed]);

  const choose = (city) => {
    onChange(city);
    setOpen(false);
    setActive(-1);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      // Saat dropdown terbuka, Enter memilih opsi aktif (atau sekadar menutup
      // dropdown) tanpa langsung men-submit form.
      if (open) {
        e.preventDefault();
        if (active >= 0 && options[active]) choose(options[active].value);
        else setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const activeId = active >= 0 && options[active] ? `${listId}-opt-${active}` : undefined;

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder="Cari atau ketik kotamu, mis. Malang"
        autoComplete="off"
        className={inputClass(error)}
      />
      {/* Badge penanda kota di luar daftar — hanya saat dropdown tertutup agar
          tidak muncul prematur di tengah pengetikan. */}
      {!open && showCreate && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wide font-semibold text-on-surface-variant/60">
          Kota lainnya
        </span>
      )}

      {open && options.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl bg-canvas-white border border-outline-variant shadow-xl py-1"
          // Cegah input kehilangan fokus saat opsi diklik — tanpa ini, blur
          // menutup dropdown sebelum onClick opsi sempat terpanggil.
          onMouseDown={(e) => e.preventDefault()}
        >
          {options.map((opt, i) => (
            <li key={opt.kind + ":" + opt.value} role="none">
              <button
                type="button"
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onClick={() => choose(opt.value)}
                onMouseEnter={() => setActive(i)}
                className={`w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2 ${
                  i === active
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                {opt.kind === "create" ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] shrink-0" aria-hidden="true">
                      add_location_alt
                    </span>
                    <span>
                      Pakai “{opt.value}” <span className="text-on-surface-variant/70">(kota lain)</span>
                    </span>
                  </>
                ) : (
                  opt.value
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({ id, label, error, children }) {
  const errorId = id ? `${id}-error` : undefined;
  return (
    <label htmlFor={id} className="block">
      <span className="block text-sm font-semibold text-on-surface mb-1.5">{label}</span>
      {children}
      {error && (
        <span id={errorId} className="block text-xs text-error mt-1">
          {error}
        </span>
      )}
    </label>
  );
}

function inputClass(error) {
  return `w-full px-4 py-3 rounded-xl bg-canvas-white border ${
    error ? "border-error" : "border-outline-variant"
  } text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all`;
}

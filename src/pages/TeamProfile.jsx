// Data anggota tim — placeholder, mudah diganti dengan data asli nanti.
// Setiap kartu pakai lg:col-span-2 agar membentuk grid bento di 6 kolom.
const TEAM_MEMBERS = [
  {
    name: 'Alex Roihan',
    role: 'Ketua Tim',
    desc: 'Mengatur visi proyek dan menjaga seluruh tim tetap selaras dengan misi utama kami.'
  },
  {
    name: 'Sarah Devina',
    role: 'Developer Utama',
    desc: 'Menerjemahkan data nutrisi yang kompleks menjadi pengalaman pengguna yang cepat dan mulus.'
  },
  {
    name: 'Budi Santoso',
    role: 'Pemasaran & UI',
    desc: 'Membangun identitas visual dan memastikan suara kami sampai pada yang paling membutuhkan.'
  },
  {
    name: 'Diana Larasati',
    role: 'Desainer UI/UX',
    desc: 'Memastikan setiap interaksi terasa alami dan menyenangkan bagi pengguna kami.'
  },
  {
    name: 'Kevin Pratama',
    role: 'Operasional',
    desc: 'Menjaga roda tetap berputar dan memastikan kelancaran layanan yang kami berikan.'
  }
];

const ADVISOR = {
  name: 'Dr. Hendra Wijaya, M.Sc.',
  quote:
    'Membimbing tim berbakat ini melalui program PKM-K sangat memuaskan. Dedikasi mereka dalam memecahkan tantangan pola makan nyata dengan platform yang dirancang apik menetapkan standar baru bagi inovasi mahasiswa.',
  faculty: 'Fakultas Ilmu Komputer'
};

function TeamProfile() {
  return (
    <div className="bg-canvas-white text-on-surface min-h-screen">
      {/* ---------------- Hero ---------------- */}
      <section className="w-full max-w-6xl mx-auto px-5 md:px-10 py-16 md:py-24 text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary max-w-3xl mb-6 leading-tight">
          Menyederhanakan Perencanaan Makan untuk Pikiran yang Sibuk
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mb-12 leading-relaxed">
          Berawal dari pergumulan sehari-hari mahasiswa dan pekerja kantoran, CookPlan hadir untuk
          membawa kembali keteraturan, kesehatan, dan kesederhanaan ke dapur. Kami percaya makanan
          yang baik tidak seharusnya menjadi sumber stres.
        </p>
        {/* Blok dekoratif (tanpa aset eksternal) */}
        <div className="w-full h-48 md:h-64 rounded-3xl bg-gradient-to-br from-surface-cream via-surface-variant to-surface-container-low flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-primary/40 text-[80px] md:text-[112px]">
            restaurant
          </span>
        </div>
      </section>

      {/* ---------------- Meet the Team ---------------- */}
      <section className="w-full bg-surface-container-lowest py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-5 md:px-10">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">Kenali Tim Kami</h2>
            <p className="text-base text-on-surface-variant">
              Para individu penuh semangat yang membangun asisten dapur favorit Anda berikutnya.
            </p>
          </div>

          {/* Bento grid: 6 kolom di desktop, tiap kartu mengisi 2 kolom */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {TEAM_MEMBERS.map((member, idx) => (
              <div
                key={member.name}
                className={`lg:col-span-2 ${
                  idx === 3 ? 'lg:col-start-2' : ''
                } bg-surface-cream rounded-3xl p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300`}
              >
                <div className="w-32 h-32 rounded-full mb-6 overflow-hidden border-4 border-canvas-white bg-surface-variant flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[64px] text-primary opacity-50">
                    account_circle
                  </span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">{member.name}</h3>
                <span className="text-sm font-semibold text-primary bg-surface-container-low px-4 py-1 rounded-full mb-4">
                  {member.role}
                </span>
                <p className="text-base text-on-surface-variant mt-auto">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Project Advisor ---------------- */}
      <section className="w-full bg-surface-container-low py-16 md:py-24 border-t border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-canvas-white rounded-3xl p-8 md:p-12 shadow-sm border border-outline-variant/50">
            <div className="w-40 h-40 md:w-48 md:h-48 flex-shrink-0 rounded-2xl bg-surface-variant flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[80px] text-primary opacity-50">
                account_circle
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <span className="material-symbols-outlined fill">verified</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary-container">
                  Dosen Pembimbing
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">{ADVISOR.name}</h2>
              <p className="text-lg text-on-surface-variant mb-6 max-w-2xl leading-relaxed italic">
                &ldquo;{ADVISOR.quote}&rdquo;
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                <span className="material-symbols-outlined text-[18px]">school</span>
                {ADVISOR.faculty}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TeamProfile;

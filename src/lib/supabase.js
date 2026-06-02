import { createClient } from "@supabase/supabase-js";

// Klien Supabase tunggal untuk seluruh aplikasi. Kredensial diambil dari
// variabel lingkungan Vite (lihat .env.example). Kunci anon/publishable aman
// dipakai di sisi klien; keamanan data ditegakkan lewat Row Level Security.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Konfigurasi Supabase belum lengkap. Isi VITE_SUPABASE_URL dan " +
      "VITE_SUPABASE_ANON_KEY di file .env (lihat .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

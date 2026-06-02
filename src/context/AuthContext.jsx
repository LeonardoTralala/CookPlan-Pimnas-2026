import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { AuthContext } from "./auth-context.js";

// Menyimpan state sesi Supabase (session/user) + baris `profiles` milik user,
// dipakai header App.jsx & UserProfile.jsx, serta ProtectedRoute.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Ambil sesi awal lalu dengarkan setiap perubahan auth (login/logout/refresh).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Sinkronkan baris `profiles` tiap kali user berubah. Reference `user` hanya
  //    berubah saat ada event auth, jadi efek ini tidak jalan tiap render.
  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) {
        if (active) setProfile(null);
        return;
      }

      const { data: existing, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        if (active) setProfile(null);
        return;
      }

      let row = existing;
      // Belum ada baris profil (mis. user baru yang konfirmasi emailnya) → buat.
      if (!row) {
        const { data: created } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name ?? null,
            username: user.user_metadata?.username ?? null,
          })
          .select()
          .single();
        row = created ?? null;
      }

      if (active) setProfile(row);
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const signUp = useCallback(async ({ email, password, fullName, username }) => {
    // full_name & username disimpan di user_metadata; baris `profiles` dibuat
    // saat sesi aktif (lihat efek di atas) agar lolos RLS (auth.uid() = id).
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName ?? null, username: username ?? null } },
    });
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    return supabase.auth.signOut();
  }, []);

  const value = { session, user, profile, loading, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

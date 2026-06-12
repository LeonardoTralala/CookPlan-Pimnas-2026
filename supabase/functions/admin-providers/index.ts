// Edge Function: admin-providers
// CRUD untuk ai_providers (tabel lockdown). Hanya admin (profiles.role='admin')
// yang boleh akses. API key di-MASK saat list (tidak pernah balik ke browser
// dalam bentuk plaintext). service_role dipakai untuk operasi DB.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••";
  return key.slice(0, 4) + "••••" + key.slice(-4);
}

// Validasi base_url anti-SSRF (audit H1). Wajib https, tolak host privat/loopback/
// link-local agar Edge Function tidak bisa diarahkan ke endpoint internal.
function validateBaseUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return "Base URL wajib diisi.";
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return "Base URL tidak valid."; }
  if (u.protocol !== "https:") return "Base URL harus pakai https://";

  const host = u.hostname.toLowerCase();
  // Tolak loopback & nama lokal
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return "Base URL tidak boleh menunjuk ke host lokal/internal.";
  }
  // Tolak IP literal privat/loopback/link-local
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 127 || a === 10 || a === 0 ||
        (a === 192 && b === 168) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 169 && b === 254) ||
        a >= 224) {
      return "Base URL tidak boleh menunjuk ke alamat IP privat/internal.";
    }
  }
  if (host === "[::1]" || host.startsWith("[fc") || host.startsWith("[fd") || host.startsWith("[fe80")) {
    return "Base URL tidak boleh menunjuk ke alamat IPv6 internal.";
  }
  return null; // valid
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, serviceKey);

  // Auth + cek admin
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Tidak terautentikasi." }, 401);

  const { data: profile } = await admin
    .from("profiles").select("role").eq("id", userData.user.id).single();
  if (profile?.role !== "admin") return json({ error: "Khusus admin." }, 403);

  let payload;
  try { payload = await req.json(); } catch { return json({ error: "Body invalid." }, 400); }
  const action = payload.action;

  // LIST — kembalikan provider dengan key ter-mask
  if (action === "list") {
    const { data, error } = await admin
      .from("ai_providers").select("*").order("created_at");
    if (error) return json({ error: error.message }, 500);
    const masked = (data ?? []).map((p) => ({ ...p, api_key: maskKey(p.api_key), _has_key: !!p.api_key }));
    return json({ providers: masked });
  }

  // CREATE
  if (action === "create") {
    const p = payload.provider ?? {};
    const urlErr = validateBaseUrl(p.base_url);
    if (urlErr) return json({ error: urlErr }, 400);
    const { data, error } = await admin.from("ai_providers").insert({
      label: p.label, base_url: p.base_url, api_key: p.api_key ?? "",
      model: p.model, temperature: p.temperature ?? 0.7, max_tokens: p.max_tokens ?? 4096,
      supports_json_mode: p.supports_json_mode ?? true, is_reasoning: p.is_reasoning ?? false,
      estimated_latency_seconds: p.estimated_latency_seconds ?? null, notes: p.notes ?? null,
    }).select("id").single();
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, id: data.id });
  }

  // UPDATE — hanya update api_key bila dikirim (biar tidak menimpa dgn mask)
  if (action === "update") {
    const id = payload.id;
    const p = payload.provider ?? {};
    if (p.base_url !== undefined) {
      const urlErr = validateBaseUrl(p.base_url);
      if (urlErr) return json({ error: urlErr }, 400);
    }
    const patch: Record<string, unknown> = {
      label: p.label, base_url: p.base_url, model: p.model,
      temperature: p.temperature, max_tokens: p.max_tokens,
      supports_json_mode: p.supports_json_mode, is_reasoning: p.is_reasoning,
      estimated_latency_seconds: p.estimated_latency_seconds, notes: p.notes,
    };
    if (typeof p.api_key === "string" && p.api_key && !p.api_key.includes("••")) {
      patch.api_key = p.api_key;
    }
    const { error } = await admin.from("ai_providers").update(patch).eq("id", id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  // SET ACTIVE / SET FALLBACK — pastikan hanya 1 yang aktif/fallback
  if (action === "set_active" || action === "set_fallback") {
    const id = payload.id;
    const col = action === "set_active" ? "is_active" : "is_fallback";
    // matikan dulu semua, lalu nyalakan target
    await admin.from("ai_providers").update({ [col]: false }).neq("id", id);
    const { error } = await admin.from("ai_providers").update({ [col]: true }).eq("id", id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  // DELETE
  if (action === "delete") {
    const { error } = await admin.from("ai_providers").delete().eq("id", payload.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Action tidak dikenal." }, 400);
});

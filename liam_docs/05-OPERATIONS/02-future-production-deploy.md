---
phase: operations
status: done
last-updated: 2026-06-11
---

# Deploy ke Produksi (NANTI — Belum Dilakukan)

> 🚨 **STATUS: BELUM PERNAH DEPLOY.** Project produksi (ref
> `phdbbiydrjwxlehdfubh`) masih kosong / belum disentuh. Dokumen ini panduan
> buat NANTI pas tim udah siap go-live.
>
> **Jangan jalanin langkah-langkah di bawah tanpa koordinasi sama Tiara (Manajer
> IT) dulu.** Deploy ke prod itu satu arah dampaknya gede — koordinasi tim wajib.

## Gambaran besar

Ada dua bagian yang di-deploy terpisah:

1. **Backend Supabase** (DB migration + Edge Functions + secrets) → ke project
   `phdbbiydrjwxlehdfubh`.
2. **Frontend React** → ke **Vercel** (udah ada `vercel.json` buat SPA rewrite).

## Checklist PRE-DEPLOY (kerjain dulu sebelum apa-apa)

Jangan deploy sebelum semua ini beres:

- [ ] **Ganti `WA_ADMIN_NUMBER`** — nomor WhatsApp admin buat order masih
      placeholder. Ganti ke nomor asli.
- [ ] **Isi AI provider key asli** — key di `ai_providers` masih placeholder.
      Siapin key produksi (jangan ditaruh di git).
- [ ] **Set minimal 1 admin** — pastiin ada user dengan `role = 'admin'` di prod
      biar bisa akses `/admin/ai`.
- [ ] **Test RLS dengan 2 user** — login 2 akun beda, pastiin user A ngga bisa
      lihat data user B (plan, order). Ini krusial buat keamanan.

## Langkah deploy backend

### 1. Link ke project prod

```bash
supabase link --project-ref phdbbiydrjwxlehdfubh
```

Sekali aja. Ngubungin folder lokal ke project prod.

### 2. Push migration ke prod

```bash
supabase db push
```

Ini ngapply **semua migration** di `supabase/migrations/` ke DB prod. Karena prod
masih kosong, semua 7 migration bakal jalan dari awal (bikin 11 tabel, function,
RLS policy).

> ⚠️ `db push` ngubah skema DB prod. Ngga bisa di-undo gampang. Pastiin
> migration udah teruji bersih di lokal (`supabase db reset` lancar).

### 3. Deploy Edge Functions

```bash
supabase functions deploy generate-plan
supabase functions deploy admin-providers
```

### 4. Set secrets (JANGAN di git)

API key AI dan secret lain **ngga boleh** masuk git. Set lewat:

- **Supabase Dashboard** → Project Settings → Edge Functions → Secrets, atau
- CLI:

```bash
supabase secrets set NAMA_SECRET=nilai
```

Buat AI key, idealnya disimpen di tabel `ai_providers` (server-side, ke-lockdown
RLS) atau lewat Vault. Yang penting **ngga pernah ke browser**. Lihat
`liam_docs/01-ARCHITECTURE/05-security-model.md`.

### 5. Seed data prod (opsional)

`seed.sql` itu data dummy buat dev. Buat prod, isi resep asli lewat Studio prod
atau migration seed terpisah. Jangan asal `seed.sql` dev ke prod.

## Langkah deploy frontend (Vercel)

### 1. Set env produksi

Di Vercel project settings → Environment Variables, isi env prod (BUKAN nilai
lokal `127.0.0.1`):

```
VITE_SUPABASE_URL=https://phdbbiydrjwxlehdfubh.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key prod dari dashboard>
```

> Anon key prod ambil dari Supabase Dashboard → Project Settings → API.
> Anon key aman ditaruh di frontend (dibatasi RLS). Yang ngga boleh itu
> **service_role key** dan **AI key**.

### 2. Deploy

Push ke branch yang ke-connect Vercel, atau:

```bash
vercel --prod
```

`vercel.json` udah punya SPA rewrite, jadi refresh di route mana pun ngga 404.

## Urutan deploy yang disaranin

```
1. Koordinasi tim (Tiara)        ← jangan skip
2. Beresin checklist pre-deploy
3. supabase link
4. supabase db push
5. supabase functions deploy (x2)
6. set secrets + AI keys
7. set min 1 admin di prod
8. test RLS 2 user di prod
9. set env Vercel + deploy frontend
10. smoke test end-to-end
```

## Setelah deploy: smoke test

- Signup user baru → cek row `profiles` kebikin.
- Generate foodplan → cek `generated_plans` keisi, AI kepanggil.
- Bikin order → cek WhatsApp deep link kebuka ke `WA_ADMIN_NUMBER` asli.
- Login admin → buka `/admin/ai`, cek provider kebaca.

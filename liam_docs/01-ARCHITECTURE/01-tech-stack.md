---
phase: architecture
status: in-progress
last-updated: 2026-06-11
---

# 🧱 Tech Stack

## Frontend

| Komponen | Teknologi | Versi | Catatan |
|----------|-----------|-------|---------|
| Framework | React | 19.2 | Hooks, function components |
| Build tool | Vite | 8.0 | Dev server + bundler |
| Routing | react-router-dom | 7.x | SPA routing |
| Styling | Tailwind CSS | 4.3 | Via `@tailwindcss/vite`, token di `@theme` |
| Icons | Material Symbols | — | Google Fonts (outlined) |
| Fonts | Plus Jakarta Sans + Inter | — | Headline + body |
| Client lib | @supabase/supabase-js | 2.106 | Auth + CRUD + functions |
| Lint | ESLint | 10.x | Flat config + react-hooks |

## Backend

| Komponen | Teknologi | Catatan |
|----------|-----------|---------|
| Database | PostgreSQL 17 | Via Supabase local (Docker) |
| Auth | Supabase Auth | Email/password + Google OAuth |
| API | PostgREST | Auto REST di atas Postgres |
| Serverless | Edge Functions (Deno) | Proxy AI + order logic |
| Secrets | Supabase Vault / env | AI keys |
| Security | Row Level Security | Per-tabel policy |

## AI

| Komponen | Teknologi | Catatan |
|----------|-----------|---------|
| Format | OpenAI-compatible chat completions | Provider-agnostic |
| Primary | Sonnet 4.5 thinking | Via 9router/enowxlabs |
| Fallback | Gemini | Google AI |
| Config store | Tabel `ai_providers` | Ganti tanpa redeploy |
| Validation | Custom validators (`_shared/validate.ts`) | Validasi input/output + pantry subtraction |

## Tooling Lokal

| Tool | Versi (terverifikasi) | Fungsi |
|------|----------------------|--------|
| Node.js | v25.9.0 | Runtime |
| npm | 11.12.1 | Package manager |
| Supabase CLI | 2.105.0 | Local stack + migrations |
| Docker | 29.2.1 | Container untuk Supabase local |

## Deployment (Future)

| Target | Platform | Catatan |
|--------|----------|---------|
| Frontend | Vercel | `vercel.json` SPA rewrite sudah ada |
| Backend | Supabase Cloud | `supabase db push` + `functions deploy` |

## Kenapa Stack Ini?

- **React + Vite**: sudah jadi codebase existing, matang.
- **Supabase**: all-in-one (DB + Auth + Edge Functions), free tier generous, cocok PKM.
- **Tailwind v4**: design token semantik di CSS, fluid typography pakai clamp().
- **Edge Functions (Deno)**: cukup untuk proxy AI, tidak perlu backend terpisah (ADR-001).

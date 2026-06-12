-- =============================================================================
-- Migrasi: ai_providers + generated_plans + ai_usage_log
-- -----------------------------------------------------------------------------
-- Inti fitur AI provider-agnostic (ADR-002):
--   - ai_providers   : config provider yang bisa diganti tanpa redeploy
--   - generated_plans: hasil generate AI + cache (input_hash) + history
--   - ai_usage_log   : tracking token & biaya per user (rate limit + monitoring)
-- Dibuat SEBELUM orders karena orders.plan_id mereferensi generated_plans.
-- =============================================================================

-- 1) ai_providers ---------------------------------------------------------------
-- Disimpan di DB agar admin bisa ganti model sesuka hati lewat UI (/admin/ai).
-- KEAMANAN: tabel ini direvoke total dari anon & authenticated. Hanya service_role
-- (dipakai Edge Function) yang bisa baca. API key TIDAK boleh kebaca dari klien.
create table if not exists public.ai_providers (
  id                          uuid primary key default gen_random_uuid(),
  label                       text not null,            -- 'OpenRouter Sonnet 4.5 Thinking'
  base_url                    text not null,            -- 'https://9router.../v1'
  api_key                     text not null,            -- TODO: pindah ke Vault saat prod
  model                       text not null,            -- 'anthropic/claude-sonnet-4.5'
  temperature                 numeric(3,2) not null default 0.70,
  max_tokens                  integer not null default 4096,
  supports_json_mode          boolean not null default true,
  is_reasoning                boolean not null default false,  -- thinking model?
  is_active                   boolean not null default false,
  is_fallback                 boolean not null default false,  -- dipakai saat primary gagal
  estimated_latency_seconds   integer,                  -- kasar, untuk UX loading
  notes                       text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

comment on table public.ai_providers is
  'Config AI provider (provider-agnostic). HANYA service_role yang boleh baca (ada API key).';

-- Hanya boleh ada 1 provider aktif & 1 fallback pada satu waktu.
create unique index if not exists ai_providers_only_one_active
  on public.ai_providers (is_active) where is_active = true;
create unique index if not exists ai_providers_only_one_fallback
  on public.ai_providers (is_fallback) where is_fallback = true;

-- 2) generated_plans ------------------------------------------------------------
create table if not exists public.generated_plans (
  id                serial primary key,
  user_id           uuid references public.profiles (id) on delete cascade,
  input_hash        text not null,           -- sha256 dari input → caching (ADR-009)
  input_json        jsonb not null,          -- raw input form user
  output_json       jsonb,                   -- hasil AI (menu + shopping list + prep)
  output_type       text not null,           -- foodplan | foodprep | full
  reasoning_content text,                    -- chain-of-thought (ditampilkan ke user)
  provider_id       uuid references public.ai_providers (id) on delete set null,
  model             text,
  tokens_input      integer,
  tokens_output     integer,
  cost_usd          numeric(10,6),
  latency_ms        integer,
  status            text not null default 'pending'
                      check (status in ('pending','success','failed')),
  error_message     text,
  created_at        timestamptz not null default now()
);

comment on table public.generated_plans is
  'Hasil generate AI + cache (input_hash) + history per user.';

create index if not exists generated_plans_user_id_idx on public.generated_plans (user_id);
create index if not exists generated_plans_input_hash_idx on public.generated_plans (input_hash);

-- 3) ai_usage_log ---------------------------------------------------------------
create table if not exists public.ai_usage_log (
  id            bigserial primary key,
  user_id       uuid references public.profiles (id) on delete set null,
  endpoint      text not null default 'generate-plan',
  provider_id   uuid references public.ai_providers (id) on delete set null,
  model         text,
  tokens_input  integer,
  tokens_output integer,
  cost_usd      numeric(10,6),
  cache_hit     boolean not null default false,
  created_at    timestamptz not null default now()
);

comment on table public.ai_usage_log is 'Log pemakaian AI per request (rate limit + biaya).';

create index if not exists ai_usage_log_user_created_idx
  on public.ai_usage_log (user_id, created_at);

-- 4) Trigger updated_at ---------------------------------------------------------
drop trigger if exists ai_providers_set_updated_at on public.ai_providers;
create trigger ai_providers_set_updated_at
  before update on public.ai_providers
  for each row execute function public.set_updated_at();

-- 5) Row Level Security ---------------------------------------------------------
alter table public.ai_providers   enable row level security;
alter table public.generated_plans enable row level security;
alter table public.ai_usage_log    enable row level security;

-- ai_providers: LOCKDOWN TOTAL. Tidak ada policy untuk anon/authenticated.
-- service_role bypass RLS otomatis (dipakai Edge Function). Admin UI akses lewat
-- Edge Function khusus, bukan langsung dari klien (lihat Phase 6).
revoke all on public.ai_providers from anon, authenticated;

-- generated_plans: pemilik bisa baca history-nya. Insert/update lewat Edge Function
-- (service_role). User read-only ke miliknya sendiri.
drop policy if exists "generated_plans_select_own" on public.generated_plans;
create policy "generated_plans_select_own"
  on public.generated_plans for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ai_usage_log: pemilik bisa baca log-nya sendiri (untuk lihat kuota).
drop policy if exists "ai_usage_log_select_own" on public.ai_usage_log;
create policy "ai_usage_log_select_own"
  on public.ai_usage_log for select
  to authenticated
  using ((select auth.uid()) = user_id);

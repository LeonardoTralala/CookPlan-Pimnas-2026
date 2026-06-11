-- =============================================================================
-- Migrasi: weekly_plans + meal_entries (rencana masak mingguan per user)
-- -----------------------------------------------------------------------------
-- Menggantikan persistensi localStorage di frontend. Satu rencana per user per
-- minggu (week_start_date). Slot UI = (day_of_week, meal_type) cocok dengan shape
-- weeklyPlan { Senin: { breakfast, lunch, dinner }, ... } di PlanContext.jsx.
-- =============================================================================

-- 1) weekly_plans ---------------------------------------------------------------
create table if not exists public.weekly_plans (
  id              serial primary key,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  week_start_date date not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, week_start_date)
);

comment on table public.weekly_plans is
  'Rencana masak mingguan milik user. Satu baris per user per minggu.';

create index if not exists weekly_plans_user_id_idx
  on public.weekly_plans (user_id);

-- 2) meal_entries ---------------------------------------------------------------
create table if not exists public.meal_entries (
  id          serial primary key,
  plan_id     integer not null references public.weekly_plans (id) on delete cascade,
  recipe_id   integer references public.recipes (id) on delete set null,
  day_of_week text check (day_of_week in
                ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu')),
  meal_type   text check (meal_type in ('breakfast','lunch','dinner')),
  servings    integer not null default 2,
  -- snapshot data resep saat ditambahkan, supaya kartu tetap tampil walau resep
  -- diubah/dihapus dari bank. Mengikuti shape slot di PlanContext.setSlot().
  title       text,
  image_url   text,
  price_idr   integer,
  ready_in_minutes integer,
  calories    integer,
  created_at  timestamptz not null default now(),
  unique (plan_id, day_of_week, meal_type)
);

comment on table public.meal_entries is
  'Slot menu pada rencana mingguan. Unik per (plan, hari, jenis makan).';

create index if not exists meal_entries_plan_id_idx
  on public.meal_entries (plan_id);

-- 3) Trigger updated_at ---------------------------------------------------------
drop trigger if exists weekly_plans_set_updated_at on public.weekly_plans;
create trigger weekly_plans_set_updated_at
  before update on public.weekly_plans
  for each row execute function public.set_updated_at();

-- 4) Row Level Security ---------------------------------------------------------
alter table public.weekly_plans enable row level security;
alter table public.meal_entries enable row level security;

-- weekly_plans: hanya pemilik (semua operasi)
drop policy if exists "weekly_plans_owner" on public.weekly_plans;
create policy "weekly_plans_owner"
  on public.weekly_plans for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- meal_entries: ikut kepemilikan plan induknya
drop policy if exists "meal_entries_owner" on public.meal_entries;
create policy "meal_entries_owner"
  on public.meal_entries for all
  to authenticated
  using (exists (
    select 1 from public.weekly_plans p
    where p.id = meal_entries.plan_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.weekly_plans p
    where p.id = meal_entries.plan_id and p.user_id = (select auth.uid())
  ));

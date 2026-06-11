-- =============================================================================
-- Migrasi: recipes + recipe_ingredients (bank resep untuk katalog & context AI)
-- -----------------------------------------------------------------------------
-- Skema mengikuti docs/BACKEND.md §4 + kolom tambahan untuk AI generate:
--   - tags[]            : constraint diet untuk filter AI (vegetarian, halal, dll)
--   - cuisine           : kategori masakan
--   - ingredients_text  : denormalisasi bahan jadi 1 string (hemat token saat ke AI)
-- Bentuk kolom dialias agar cocok dengan shape mockRecipes.js (camelCase via view/alias
-- di query service layer). Tabel pakai snake_case (konvensi Postgres).
-- =============================================================================

-- 1) Tabel recipes --------------------------------------------------------------
create table if not exists public.recipes (
  id                serial primary key,
  title             text not null,
  description       text,
  ready_in_minutes  integer,
  calories          integer,
  price_idr         integer,                 -- estimasi harga total resep (porsi dasar)
  image_url         text,
  difficulty        text check (difficulty in ('easy','medium','hard')),
  cuisine           text,                    -- nusantara | asia | western | dll
  badges            text[]  not null default '{}',  -- label tampilan (Vegetarian, Cepat, ..)
  tags              text[]  not null default '{}',  -- constraint AI (halal, vegan, low-carb)
  instructions      text[]  not null default '{}',  -- langkah memasak
  ingredients_text  text,                    -- ringkasan bahan utk prompt AI (hemat token)
  base_servings     integer not null default 2,     -- takaran bahan ditulis utk N porsi
  is_active         boolean not null default true,  -- soft hide tanpa delete
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.recipes is
  'Bank resep CookPlan. Sumber katalog + context untuk AI generate foodplan.';
comment on column public.recipes.ingredients_text is
  'Denormalisasi daftar bahan jadi satu string, dipakai saat kirim ke AI agar hemat token.';
comment on column public.recipes.base_servings is
  'Jumlah porsi acuan takaran bahan (default 2). Dipakai scaling porsi di shopping list.';

-- 2) Tabel recipe_ingredients ---------------------------------------------------
create table if not exists public.recipe_ingredients (
  id          serial primary key,
  recipe_id   integer not null references public.recipes (id) on delete cascade,
  name        text not null,
  amount      numeric,
  unit        text,
  category    text check (category in ('vegetables','meat','dairy','spices','dry_goods')),
  price_idr   integer,                  -- estimasi harga komponen ini (porsi dasar)
  created_at  timestamptz not null default now()
);

comment on table public.recipe_ingredients is
  'Bahan per resep. Diagregasi jadi shopping list saat generate foodprep.';

create index if not exists recipe_ingredients_recipe_id_idx
  on public.recipe_ingredients (recipe_id);

-- 3) Trigger auto-update updated_at ---------------------------------------------
-- Fungsi set_updated_at() sudah dibuat di migrasi profiles (search_path dikunci).
-- Aman re-create idempoten kalau migrasi profiles belum ada di environment lain.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

-- 4) Row Level Security ---------------------------------------------------------
-- Resep boleh dibaca publik (anon + authenticated). Tulis hanya admin (dicek di
-- migrasi berikutnya setelah kolom profiles.role ada). Untuk sekarang: read-only publik.
alter table public.recipes            enable row level security;
alter table public.recipe_ingredients enable row level security;

drop policy if exists "recipes_read_public" on public.recipes;
create policy "recipes_read_public"
  on public.recipes for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "recipe_ingredients_read_public" on public.recipe_ingredients;
create policy "recipe_ingredients_read_public"
  on public.recipe_ingredients for select
  to anon, authenticated
  using (true);

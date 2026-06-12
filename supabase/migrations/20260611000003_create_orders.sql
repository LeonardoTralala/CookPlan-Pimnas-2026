-- =============================================================================
-- Migrasi: orders + order_items + generate_order_id()
-- -----------------------------------------------------------------------------
-- Menyimpan pesanan dari fitur "Order via WhatsApp". ID kustom CP-YYYYMMDD-XXXX
-- digenerate sebelum buka WA agar admin bisa melacak. order_items menyimpan
-- rincian bahan (hasil agregasi shopping list).
-- =============================================================================

-- 1) Fungsi generator ID pesanan: CP-YYYYMMDD-XXXX ------------------------------
-- Pendekatan count+1 cukup untuk skala MVP PKM. search_path dikunci untuk keamanan.
create or replace function public.generate_order_id()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  today_str text := to_char(now(), 'YYYYMMDD');
  seq integer;
begin
  select count(*) + 1 into seq
  from public.orders
  where id like 'CP-' || today_str || '-%';
  return 'CP-' || today_str || '-' || lpad(seq::text, 4, '0');
end;
$$;

-- 2) orders ---------------------------------------------------------------------
create table if not exists public.orders (
  id               text primary key default public.generate_order_id(),
  user_id          uuid references public.profiles (id) on delete set null,
  plan_id          integer references public.generated_plans (id) on delete set null,
  output_type      text,                    -- foodplan | foodprep | full
  total_price      integer not null default 0,
  delivery_fee     integer not null default 15000,  -- selaras DELIVERY_FEE di ShoppingList.jsx
  delivery_address text,
  customer_name    text,
  customer_phone   text,
  payment_method   text check (payment_method in ('transfer_bank','qris','cod')),
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','processed','delivered','cancelled')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.orders is
  'Pesanan paket belanja. ID kustom CP-YYYYMMDD-XXXX. Dipakai untuk WA redirect.';

create index if not exists orders_user_id_idx on public.orders (user_id);

-- 3) order_items ----------------------------------------------------------------
create table if not exists public.order_items (
  id          serial primary key,
  order_id    text not null references public.orders (id) on delete cascade,
  name        text not null,
  amount      numeric not null,
  unit        text not null,
  category    text,
  price_idr   integer not null default 0,
  created_at  timestamptz not null default now()
);

comment on table public.order_items is 'Rincian bahan per pesanan (hasil shopping list).';

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- 4) Trigger updated_at ---------------------------------------------------------
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- 5) Row Level Security ---------------------------------------------------------
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- orders: hanya pemilik
drop policy if exists "orders_owner" on public.orders;
create policy "orders_owner"
  on public.orders for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- order_items: ikut kepemilikan order induk
drop policy if exists "order_items_owner" on public.order_items;
create policy "order_items_owner"
  on public.order_items for all
  to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = (select auth.uid())
  ));

-- 6) Hardening: cabut EXECUTE generate_order_id() dari role API -----------------
-- Default-nya dipanggil lewat default value kolom (server-side), bukan RPC publik.
revoke execute on function public.generate_order_id() from public, anon, authenticated;

-- =============================================================================
-- Migrasi: PATCH MINIMAL drift orders + order_items
-- -----------------------------------------------------------------------------
-- KONTEKS: tabel orders di prod ternyata strukturnya berbeda dari migration
-- 20260611000003_create_orders.sql (kemungkinan pernah dibuat manual / via
-- dashboard sebelum migration di-jalankan). Akibat: insert order baru dari
-- frontend GAGAL karena (a) id text NOT NULL tanpa default, (b) delivery_address
-- NOT NULL padahal frontend boleh kirim null, (c) check payment_method tidak
-- punya 'cod' yang dideklarasikan migration.
--
-- order_items juga miss kolom `category` dan `created_at` yang dipakai untuk
-- snapshot rincian belanja, plus order_id seharusnya NOT NULL.
--
-- Migrasi ini idempoten dan TIDAK menyentuh kolom extra di prod (service_fee,
-- payment_status, order_status) — kolom-kolom itu nullable & tidak dipakai di
-- code, jadi dibiarkan demi konservatif (project ini bukan punya kita).
--
-- Verifikasi sebelum apply: select count(*) from orders → harus 0 (saat patch).
-- =============================================================================

-- 1) orders.id : restore default generate_order_id() ----------------------------
-- Frontend insert tanpa supply id, mengandalkan default. Fungsi sudah ada di
-- migrasi 000003 + grant ke authenticated di migrasi 000005.
alter table public.orders
  alter column id set default public.generate_order_id();

-- 2) orders.delivery_address : drop NOT NULL ------------------------------------
-- Frontend (orderService.js) kirim null bila user tidak isi alamat (mis. order
-- via WA tanpa pengiriman). Migration aslinya juga nullable.
alter table public.orders
  alter column delivery_address drop not null;

-- 3) orders.payment_method : tambah 'cod' ke check ------------------------------
-- Drop & re-create check constraint dengan whitelist sesuai migration.
alter table public.orders
  drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method is null
         or payment_method in ('transfer_bank','qris','cod'));

-- 4) order_items.order_id : NOT NULL + cocokin migration ------------------------
-- Fail fast kalau masih ada baris yang melanggar (biar deploy tidak setengah jalan
-- — ALTER bakal gagal di tengah, sisa migration di bawah tetap dieksekusi).
do $$
begin
  if exists (select 1 from public.order_items where order_id is null) then
    raise exception 'Cannot set order_items.order_id NOT NULL: found rows with NULL order_id';
  end if;
end $$;
alter table public.order_items
  alter column order_id set not null;

-- 5) order_items: tambah kolom yang missing -------------------------------------
-- `category` dipakai oleh orderService.createOrder() saat snapshot shopping list.
-- `created_at` standar audit.
alter table public.order_items
  add column if not exists category text,
  add column if not exists created_at timestamptz not null default now();

-- =============================================================================
-- Verifikasi pasca-apply (manual di SQL editor):
--   select column_name, is_nullable, column_default from information_schema.columns
--    where table_schema='public' and table_name in ('orders','order_items')
--    order by table_name, ordinal_position;
--   select pg_get_constraintdef(oid) from pg_constraint
--    where conrelid='public.orders'::regclass and conname='orders_payment_method_check';
-- =============================================================================

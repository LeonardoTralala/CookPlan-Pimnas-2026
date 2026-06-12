-- =============================================================================
-- Migrasi: fix grant EXECUTE generate_order_id() untuk authenticated
-- -----------------------------------------------------------------------------
-- Fungsi dipakai sebagai DEFAULT kolom orders.id. Saat user authenticated insert
-- order, default memanggil fungsi ini → butuh EXECUTE. Revoke total di migrasi
-- sebelumnya terlalu ketat (memblokir insert order biasa).
-- Fungsi hanya menghasilkan string ID (CP-YYYYMMDD-XXXX), tidak sensitif, jadi
-- aman di-grant ke authenticated. Tetap revoke dari anon (order butuh login).
-- =============================================================================

grant execute on function public.generate_order_id() to authenticated;
revoke execute on function public.generate_order_id() from anon;

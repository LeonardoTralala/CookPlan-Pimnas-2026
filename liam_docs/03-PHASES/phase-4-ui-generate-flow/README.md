---
phase: 4
status: done
last-updated: 2026-06-11
estimated-effort: 4-5 hari
dependencies: [phase-3]
---

# Phase 4 — UI Generate Flow

## Goal
Antarmuka lengkap fitur AI: form wizard input + render hasil generate (3 mode) +
disclosure reasoning + resep detail per menu.

## Deliverables
- ✅ `GeneratePlan.jsx` — wizard 3 langkah (mobile-first)
- ✅ `GenerateResult.jsx` — renderer hasil (menu harian + shopping list + prep)
- ✅ Reasoning disclosure (show, sesuai keputusan)
- ✅ Resep detail per menu (modal, fetch dari DB by recipe_id)
- ✅ Hook ke order (tombol "Pesan Paket Belanja" → Phase 5)
- ✅ Loading state ("AI sedang menyusun…") + error state
- ✅ Lint + build pass

## Wizard 3 Langkah (GeneratePlan.jsx)
| Step | Input |
|------|-------|
| 1 | Periode (3/7/14), Porsi (stepper), Output type (foodplan/foodprep/full) |
| 2 | Diet (multi-chip), Budget (preset + custom), Pantry (parser "telur 5 butir") |
| 3 | Ringkasan + tombol Generate (loading + error) |

Pantry parser: regex `(.+?) (\d+) (\w+)?` → `{name, amount, unit}`. Tanpa angka →
disimpan sebagai nama saja.

Hasil di-cache ke `sessionStorage` (`plan_<id>`) agar GenerateResult tampil instan
tanpa refetch setelah generate.

## Renderer (GenerateResult.jsx)
- Header + plan_summary + meta (model, latency, cache).
- Warnings (budget kurang dll) — banner kuning.
- Reasoning disclosure — accordion "Cara AI Berpikir".
- Menu harian — kartu per hari, tiap meal klik → modal resep detail.
- Shopping list — muncul untuk foodprep & full (saat `shopping_list` ada isi).
- Prep instructions — tips batch cooking.
- Tombol order → `/order/:planId` (Phase 5).

Resep detail di-fetch via `getRecipesByIds()` (bukan dari AI) — menjamin akurasi
bahan & langkah dari DB.

## Catatan: Manual Edit (Swap Menu)
ADR-008 menetapkan edit manual masuk MVP. Implementasi swap slot dilakukan lewat
WeeklyPlanner existing (user bisa kirim hasil ke planner lalu edit). Swap inline di
GenerateResult ditandai sebagai penyempurnaan ringan dan dikerjakan di Phase 8
(polish) bila waktu memungkinkan — fungsionalitas inti (generate + render + detail)
sudah lengkap.

## Definition of Done
- Wizard jalan, kirim input ke Edge Function ✅
- Hasil ter-render rapi (3 mode) ✅
- Lint + build bersih ✅
- Generate sukses end-to-end menunggu API key asli (Phase 3)

Lihat [verification.md](./verification.md).

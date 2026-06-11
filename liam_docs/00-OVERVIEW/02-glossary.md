---
phase: overview
status: in-progress
last-updated: 2026-06-11
---

# 📖 Glossary

Istilah teknis & domain yang dipakai di sepanjang proyek.

## Domain CookPlan

| Istilah | Arti |
|---------|------|
| **Foodplan** | Daftar menu masak + resep untuk periode tertentu (tanpa belanja) |
| **Foodprep** | Foodplan + plan belanja + estimasi harga (prep batch cooking) |
| **Core Offer** | Foodplan & prep + layanan belanja (paket lengkap, revenue utama) |
| **Pantry** | Bahan yang sudah tersedia di rumah user (dikurangi dari shopping list) |
| **Slot** | Satu kombinasi hari + jenis makan (mis. Senin-breakfast) |
| **Meal type** | Jenis makan: breakfast / lunch / dinner |
| **Periode** | Lama rencana: 3 hari / 7 hari / 14 hari |
| **Diet** | Preferensi makan: vegetarian, halal, tinggi protein, hemat, dll |

## Teknis

| Istilah | Arti |
|---------|------|
| **RLS** | Row Level Security — kebijakan akses baris di Postgres/Supabase |
| **Edge Function** | Serverless function Supabase (Deno runtime) untuk logic server-side |
| **RAG** | Retrieval-Augmented Generation — kasih context (resep) ke AI sebelum generate |
| **Provider-agnostic** | Desain yang bisa pakai AI provider mana pun tanpa ubah kode |
| **OpenAI-compatible** | Format API `POST /chat/completions` yang jadi standar de-facto |
| **input_hash** | Hash deterministik dari input user, untuk caching hasil generate |
| **Reasoning model** | Model AI yang "berpikir" dulu (Sonnet thinking, DeepSeek thinking) |
| **reasoning_content** | Output chain-of-thought terpisah dari jawaban final |
| **Service layer** | Lapisan `src/services/` yang abstraksi call ke Supabase |
| **Vault** | Supabase Vault — penyimpanan secret terenkripsi |
| **PostgREST** | API REST otomatis Supabase di atas Postgres |
| **dvh/svh/lvh** | Dynamic/Small/Large viewport height — unit CSS untuk mobile address bar |

## Provider AI

| Istilah | Arti |
|---------|------|
| **9router** | AI proxy yang dipakai user (OpenAI-compat) |
| **enowxlabs** | AI proxy alternatif user (OpenAI-compat) |
| **Sonnet 4.5 thinking** | Model Claude reasoning, provider primary |
| **Gemini** | Model Google, dipakai sebagai fallback |

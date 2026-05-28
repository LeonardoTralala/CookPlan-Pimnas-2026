# 🏛️ ARCHITECTURE.md — Arsitektur Teknis CookPlan

Dokumen ini ditujukan untuk **developer** yang ingin memahami struktur kode, alur data, dan rancangan teknis untuk pengembangan projek CookPlan.

> [!IMPORTANT]
> **Status Kode Sekarang:** Projek ini sedang ditulis ulang dari awal (*code rebuild*). Oleh karena itu, arsitektur yang dijelaskan di bawah ini—termasuk state management, fungsi, dan komponen—merupakan **rancangan target** (*target architecture*) dan deskripsi purwarupa sebelumnya (`deepsek.html`, dsb.) yang digunakan sebagai referensi logika mock. Saat ini belum ada fitur operasional yang terintegrasi pada kode utama baru.

---

## Gambaran Umum Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                  CookPlan (Prototype)                   │
│                                                         │
│  ┌──────────────┐     ┌──────────────────────────────┐  │
│  │ Landing Page │     │      Main Application        │  │
│  │Home page.html│     │       deepsek.html           │  │
│  │              │     │                              │  │
│  │ - Marketing  │────▶│  ┌────────────────────────┐  │  │
│  │ - FAQ        │     │  │   JavaScript State     │  │  │
│  │ - CTA        │     │  │  (In-Memory, no DB)    │  │  │
│  └──────────────┘     │  │                        │  │  │
│                       │  │  currentUser           │  │  │
│  ┌──────────────┐     │  │  mockUsers[]           │  │  │
│  │  UI Prototype│     │  │  mockRecipes[]         │  │  │
│  │Untitled-2.html│    │  │  weeklyPlan{}          │  │  │
│  │              │     │  │  shoppingList{}        │  │  │
│  │ - Layout     │     │  └────────────────────────┘  │  │
│  │ - Components │     │                              │  │
│  └──────────────┘     │  ┌────────┐ ┌─────────────┐ │  │
│                       │  │  Auth  │ │   Sections  │ │  │
│  ┌──────────────┐     │  │Module  │ │  (Tabs UI)  │ │  │
│  │ Early Draft  │     │  └────────┘ └─────────────┘ │  │
│  │Untitled-1.html│    └──────────────────────────────┘  │
│  │ - Pure CSS   │                                        │
│  │ - API draft  │     External Dependencies (CDN):       │
│  └──────────────┘     - Tailwind CSS                     │
│                       - Font Awesome 6.4.0               │
│                       - Google Fonts (Poppins)           │
│                       - Unsplash (gambar resep)          │
└─────────────────────────────────────────────────────────┘
```

---

## Struktur Kode Referensi Purwarupa — `deepsek.html`

File ini merupakan aplikasi purwarupa monolitik HTML dari tahap awal. Semua logika berada dalam satu file ini dan digunakan sebagai acuan logika untuk penulisan ulang kode.

### State Management

```javascript
// === MOCK DATA ===
const mockUsers = [
  { username: "user1", password: "password1" },
  // ...
];

const mockRecipes = [
  {
    id: Number,
    title: String,
    readyInMinutes: Number,
    price: Number,          // dalam USD (placeholder)
    image: String,          // URL Unsplash
    ingredients: String[]   // nama bahan dalam Bahasa Indonesia
  },
  // ... 7 resep
];

// === APP STATE ===
let currentUser = null;  // { username: String } atau null

const weeklyPlan = {
  "Senin":  [],   // Array of MealEntry
  "Selasa": [],
  // ... dst
};
// MealEntry: { recipeId, title, servings, ingredients[] }

const shoppingList = {
  items: {},       // { ingredientName: { amount, unit, category } }
  totalCost: 0
};
```

### Section Navigation System

Aplikasi menggunakan sistem "show/hide sections" sebagai pengganti routing:

```javascript
// Semua section diberi class "section" (display: none)
// Satu section aktif diberi class "section-active" (display: block)

function showSection(sectionName) {
  // 1. Sembunyikan semua section
  // 2. Tampilkan section yang dipilih
  // 3. Update highlight di bottom navigation
  // 4. Toggle auth UI (auth-buttons vs user-info)
}
```

**Section yang tersedia:**
| Section ID | Ditampilkan Saat |
|------------|-----------------|
| `login-section` | Belum login / klik tombol Login |
| `register-section` | Klik tombol Register |
| `recipes-section` | Sudah login, klik tab Recipes |
| `planner-section` | Sudah login, klik tab Planner |
| `shopping-section` | Sudah login, klik tab Shopping |

### Function Index

```
setupEventListeners()        — Wire semua event listeners saat DOMContentLoaded
showSection(name)            — Navigasi antar section/tab
handleLogin(e)               — Proses form login
handleRegister(e)            — Proses form register
logout()                     — Hapus currentUser, kembali ke login
displayRecipes(recipes[])    — Render kartu resep ke DOM
searchRecipes()              — Filter mockRecipes dan render ulang
showAddToPlanModal(recipe)   — Modal: tambah resep dari kartu resep
showRecipeSelectionModal(day)— Modal: tambah resep dari kalender
addMealToPlan(id, day, s)    — Tambah meal ke weeklyPlan state
updateWeeklyPlanDisplay()    — Re-render seluruh kalender mingguan
regeneratePlan()             — Kosongkan & isi ulang weeklyPlan secara acak
generateShoppingList()       — Kalkulasi shopping list dari weeklyPlan
updateShoppingList()         — Refresh tampilan shopping list
showNotification(message)    — Toast notification (popup sementara)
```

---

## Alur Data

### Alur: Tambah Resep ke Planner

```
[User klik "Add to Plan"]
        ↓
showAddToPlanModal(recipe)
        ↓
[User pilih hari & porsi → klik Confirm]
        ↓
addMealToPlan(recipeId, day, servings)
        ↓
weeklyPlan[day].push({ recipeId, title, servings, ingredients })
        ↓
updateWeeklyPlanDisplay()
        ↓
[DOM diperbarui: kartu hari menampilkan meal baru]
```

### Alur: Generate Shopping List

```
[User klik "Generate Shopping List"]
        ↓
generateShoppingList()
        ↓
Iterasi weeklyPlan → kumpulkan semua ingredients
        ↓
Kategorisasi per bahan (Vegetables / Meat / Dairy / Spices / Dry Goods)
        ↓
Kalkulasi total biaya
        ↓
Render ke shopping-list-container
        ↓
showSection('shopping')
```

---

## Komponen UI Reusable

### Notification Toast

```javascript
function showNotification(message) {
  // Membuat div notifikasi di atas layar
  // Auto-dismiss setelah 3 detik
  // Animasi slide-in / slide-out
}
```

### Modal Pattern

Semua modal dibuat secara dinamis (tidak ada di HTML awal):
```javascript
const modal = document.createElement('div');
modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
modal.innerHTML = `...`;
document.body.appendChild(modal);

// Cleanup
document.getElementById('cancel-btn').addEventListener('click', () => modal.remove());
```

---

## Panduan Integrasi Backend

### Langkah 1: Setup Supabase

```bash
# Install Supabase CLI (opsional)
npm install -g supabase

# Atau langsung via dashboard: supabase.com
```

### Langkah 2: Skema Database yang Direkomendasikan

```sql
-- Tabel users (managed by Supabase Auth, extend dengan profile)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel recipes
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  ready_in_minutes INTEGER,
  price_idr INTEGER,           -- harga dalam Rupiah
  image_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel recipe_ingredients
CREATE TABLE recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id),
  ingredient_name TEXT NOT NULL,
  amount DECIMAL,
  unit TEXT,
  category TEXT CHECK (category IN ('vegetables', 'meat', 'dairy', 'spices', 'dry_goods'))
);

-- Tabel weekly_plans
CREATE TABLE weekly_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  week_start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel meal_entries
CREATE TABLE meal_entries (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES weekly_plans(id),
  recipe_id INTEGER REFERENCES recipes(id),
  day_of_week TEXT CHECK (day_of_week IN ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu')),
  servings INTEGER DEFAULT 2
);

-- Tabel subscriptions (untuk menyimpan data paket langganan bulanan)
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE,
  tier TEXT CHECK (tier IN ('basic', 'monthly_pass')),
  status TEXT CHECK (status IN ('active', 'expired')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel orders (menyimpan riwayat transaksi checkout belanja)
CREATE TABLE orders (
  id TEXT PRIMARY KEY,          -- Format kustom: CP-YYYYMMDD-XXXX (ID Pesanan Unik)
  user_id UUID REFERENCES profiles(id),
  total_price INTEGER NOT NULL,
  service_fee INTEGER DEFAULT 2000,
  delivery_address TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('transfer_bank', 'qris')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  order_status TEXT CHECK (order_status IN ('received', 'processed', 'shipped', 'delivered')) DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel order_items (menyimpan rincian bahan makanan per pesanan)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_idr INTEGER NOT NULL
);
```

### Langkah 3: Migrasi Mock Data

Ganti `const mockRecipes = [...]` dengan fetch ke Supabase:

```javascript
// SEBELUM (mock):
displayRecipes(mockRecipes);

// SESUDAH (Supabase):
const { data: recipes, error } = await supabase
  .from('recipes')
  .select('*, recipe_ingredients(*)');

if (!error) displayRecipes(recipes);
```

### Langkah 4: Persistent Weekly Plan

```javascript
// SEBELUM (in-memory):
weeklyPlan["Senin"].push({ recipeId, title, servings });

// SESUDAH (Supabase):
await supabase.from('meal_entries').insert({
  plan_id: currentPlanId,
  recipe_id: recipeId,
  day_of_week: day,
  servings: servings
});
```

---

## Bug yang Diketahui

### 🐛 Bug #1 — `searchRecipes()` Syntax Error

**File:** `deepsek.html` baris ~596–597

**Problem:** Missing closing parenthesis pada filter ingredients.

```javascript
// KODE SAAT INI (BUG):
return searchIngredients.every(ingredient =>
  recipe.ingredients.some(i => i.toLowerCase().includes(ingredient)
// ^ MISSING closing ) dan );

// SEHARUSNYA:
return searchIngredients.every(ingredient =>
  recipe.ingredients.some(i => i.toLowerCase().includes(ingredient))
);
```

**Impact:** Fitur filter berdasarkan bahan mungkin tidak bekerja dengan benar di beberapa browser.

---

### 🐛 Bug #2 — Tidak Ada Data Persistence

**Problem:** Semua data (weekly plan, shopping list, akun register) hilang saat halaman di-refresh.

**Workaround sementara:** Gunakan `localStorage` untuk menyimpan state sebelum backend nyata tersedia:

```javascript
// Simpan weeklyPlan ke localStorage
localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));

// Load saat inisialisasi
const saved = localStorage.getItem('weeklyPlan');
if (saved) Object.assign(weeklyPlan, JSON.parse(saved));
```

---

### ✓ Warning #1 — Warna Terunifikasi

Desain antarmuka Landing Page dan Aplikasi Utama telah disatukan mengikuti palet warna **Organic & Earthy Sage** (`#2C3A1E`, `#4E6B2F`, `#7A8C4A`, `#A6A96A`, `#D9DFB0`) sesuai ketetapan di `PRD_PKM.md`.

---

## Environment Variables (Untuk Production)

Saat dimigrasi ke framework seperti Next.js, gunakan `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_MAPS_API_KEY=AIza...
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```

---

## Checklist Sebelum Production

- [ ] Fix bug `searchRecipes()` syntax error
- [ ] Unifikasi color scheme antara landing page dan app
- [ ] Ganti mock auth dengan Supabase Auth
- [ ] Implementasikan data persistence (minimal localStorage untuk v1)
- [ ] Tambahkan loading states saat fetch data
- [ ] Implementasikan error handling yang proper (try/catch + user feedback)
- [ ] Validasi input form yang lebih ketat
- [ ] Accessibility: tambahkan `aria-label` pada tombol icon-only
- [ ] Mobile navigation: implementasikan hamburger menu yang actual (bukan `alert()`)
- [ ] SEO: tambahkan meta tags, Open Graph, sitemap
- [ ] Security: jangan store password dalam plaintext (sudah benar untuk production dengan Supabase)

---

*Dokumen ini harus diperbarui setiap kali ada perubahan arsitektur signifikan.*

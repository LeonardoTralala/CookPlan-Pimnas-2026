# 🏛️ ARCHITECTURE.md — Arsitektur Teknis CookPlan

Dokumen ini ditujukan untuk **developer** yang ingin memahami struktur kode, alur data, dan rancangan teknis untuk pengembangan projek CookPlan.

> [!IMPORTANT]
> **Status Kode Sekarang:** Projek ini sedang dikembangkan dengan arsitektur modern berbasis **React SPA + Supabase**. Arsitektur yang dijelaskan di bawah ini berfokus pada struktur komponen React dan model integrasi backend target.

---

## Gambaran Umum Arsitektur


```mermaid
graph TD
    subgraph Client [React SPA Client (Vite)]
        A[App.jsx State]
        A --> B[Overview Tab]
        A --> C[Features Tab]
        A --> D[Tech Stack Tab]
    end
    subgraph Backend [Supabase Backend]
        E[Supabase Auth]
        F[(PostgreSQL Database)]
        F --- F1[profiles]
        F --- F2[recipes]
        F --- F3[weekly_plans]
        F --- F4[orders]
    end
    Client <-->|API Calls| Backend
```


---

## Struktur Kode Aplikasi React — `src/App.jsx`

Aplikasi saat ini diorganisasikan menggunakan komponen React fungsional dengan sistem state internal untuk mengatur tab visual dan data aplikasi.

### Manajemen State Utama (React useState)

```javascript
// Navigasi Tab Utama
const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'features' | 'tech'

// State Pengguna (Target Integrasi Supabase Auth)
const [session, setSession] = useState(null);

// State Rencana Masak Mingguan (Target Integrasi Database)
const [weeklyPlan, setWeeklyPlan] = useState({
  "Senin":  [],
  "Selasa": [],
  "Rabu":   [],
  "Kamis":  [],
  "Jumat":  [],
  "Sabtu":  [],
  "Minggu": []
});
```

### Sistem Navigasi Tampilan (Tab Navigation)

Navigasi antar tab dilakukan secara dinamis dengan memperbarui state `activeTab` tanpa memuat ulang halaman browser (Single Page Application):

```jsx
<nav className="flex items-center gap-6">
  <button onClick={() => setActiveTab('overview')}>Overview</button>
  <button onClick={() => setActiveTab('features')}>Fitur Utama</button>
  <button onClick={() => setActiveTab('tech')}>Tech Stack</button>
</nav>

{/* Kondisional rendering berdasarkan tab aktif */}
{activeTab === 'overview' && <OverviewComponent />}
{activeTab === 'features' && <FeaturesComponent />}
{activeTab === 'tech' && <TechComponent />}
```

---

## Alur Data (Target)

### Alur: Tambah Resep ke Planner

```
[User klik "Add to Plan"]
        ↓
showAddToPlanModal(recipe)
        ↓
[User pilih hari & porsi → klik Confirm]
        ↓
Update weeklyPlanState (React State)
        ↓
Simpan data ke tabel `meal_entries` Supabase
        ↓
[React re-render: Kalender Planner otomatis memperbarui UI]
```

### Alur: Generate Shopping List

```
[User klik "Generate Shopping List"]
        ↓
Iterasi weeklyPlanState → kumpulkan semua ingredients & kalikan porsi
        ↓
Kompilasi & Kategorisasi per bahan (Vegetables / Meat / Dairy / Spices / Dry Goods)
        ↓
Kalkulasi estimasi biaya total
        ↓
Update shoppingListState (React State)
        ↓
[React re-render: UI Daftar Belanja menampilkan hasil kompilasi]
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

## Data Persistence (Workaround Sementara)

Sebelum backend Supabase diintegrasikan secara penuh, aplikasi dapat menggunakan `localStorage` untuk menyimpan state agar data tidak hilang saat halaman di-refresh:

```javascript
// Menyimpan weeklyPlan ke localStorage saat ada perubahan
localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));

// Memuat data saat inisialisasi aplikasi React
useEffect(() => {
  const savedPlan = localStorage.getItem('weeklyPlan');
  if (savedPlan) {
    setWeeklyPlan(JSON.parse(savedPlan));
  }
}, []);
```

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

- [ ] Unifikasi color scheme antara landing page dan app sesuai PRD
- [ ] Ganti mock auth dengan Supabase Auth
- [ ] Implementasikan data persistence (menggunakan localStorage/Supabase)
- [ ] Tambahkan loading states saat fetch data resep
- [ ] Implementasikan error handling yang proper (try/catch + user feedback)
- [ ] Validasi input form yang lebih ketat
- [ ] Accessibility: tambahkan `aria-label` pada tombol icon-only
- [ ] Mobile navigation: implementasikan hamburger menu yang actual
- [ ] SEO: tambahkan meta tags, Open Graph, sitemap
- [ ] Security: proteksi data sensitif dengan Supabase Row Level Security (RLS)

---

*Dokumen ini harus diperbarui setiap kali ada perubahan arsitektur signifikan.*

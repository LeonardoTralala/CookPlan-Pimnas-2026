---
phase: 2
status: done
last-updated: 2026-06-11
---

# Phase 2 — Service Layer API

Semua komunikasi ke Supabase lewat lapisan ini. Komponen tidak query langsung.

## recipeService.js
| Fungsi | Return | Catatan |
|--------|--------|---------|
| `getRecipes()` | `Recipe[]` | Semua resep aktif + ingredients. Alias camelCase. |
| `getRecipeById(id)` | `Recipe` | Untuk modal detail / resep per menu. |
| `getRecipesByIds(ids)` | `Recipe[]` | Untuk render hasil generate AI. |

**Trik alias** (snake_case DB → camelCase frontend), agar shape == mockRecipes lama:
```js
imageUrl:image_url, priceIdr:price_idr, readyInMinutes:ready_in_minutes,
ingredients:recipe_ingredients ( name, amount, unit, category, priceIdr:price_idr )
```

## planService.js
| Fungsi | Return | Catatan |
|--------|--------|---------|
| `getCurrentWeekStart(date?)` | `'YYYY-MM-DD'` | Senin minggu berjalan |
| `getCurrentPlan()` | `{ planId, plan }` | Auto-create plan minggu ini jika belum ada |
| `setSlot(planId, recipe, day, mealType, servings)` | — | Upsert slot |
| `removeSlot(planId, day, mealType)` | — | Hapus slot |

`plan` shape: `{ Senin: { breakfast, lunch, dinner }, ... }` (sama dengan PlanContext).

## orderService.js
| Fungsi | Return | Catatan |
|--------|--------|---------|
| `createOrder(payload)` | `order` | Insert orders + order_items, ID CP-... |
| `buildWhatsappText(order, items)` | `string` | Teks WA terformat |
| `buildWhatsappUrl(order, items, admin?)` | `string` | URL wa.me siap window.open |
| `buildSimpleWhatsappUrl(msg, admin?)` | `string` | Template singkat CTA |

## aiService.js
| Fungsi | Return | Catatan |
|--------|--------|---------|
| `generatePlan(input)` | `{ plan, reasoning, meta, planId }` | Invoke Edge Function |
| `getGeneratedHistory(limit?)` | `Plan[]` | History generate user |
| `getGeneratedPlanById(id)` | `Plan` | Render ulang hasil tersimpan |
| `getTodayUsageCount()` | `number` | Info kuota untuk UI |

## PlanContext Integration
- Saat **login** → `getCurrentPlan()` muat dari DB. Jika DB kosong tapi ada data
  localStorage lama → migrasi sekali ke DB, lalu hapus localStorage.
- Saat **belum login** → fallback localStorage (perilaku lama tetap jalan).
- `setSlot`/`removeSlot`/`restoreSlot` menulis ke DB bila `planIdRef` ada, kalau
  tidak ke localStorage. Optimistic update (state UI duluan, persist async).

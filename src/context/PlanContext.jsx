import { useState, useEffect, useCallback, useMemo } from "react";
import { PlanContext } from "./plan-context.js";

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

function createEmptyPlan() {
  return DAYS.reduce((acc, day) => {
    acc[day] = { breakfast: null, lunch: null, dinner: null };
    return acc;
  }, {});
}

function isValidPlanShape(plan) {
  if (!plan || typeof plan !== 'object') return false;
  return DAYS.every((day) => {
    const slots = plan[day];
    return slots && typeof slots === 'object' && !Array.isArray(slots) &&
      MEAL_TYPES.every((meal) => meal in slots);
  });
}

export function PlanProvider({ children }) {
  const [addedRecipes, setAddedRecipes] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const saved = localStorage.getItem('weeklyPlan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isValidPlanShape(parsed)) return parsed;
      } catch {
        // abaikan data rusak
      }
    }
    return createEmptyPlan();
  });

  const showToast = useCallback((message) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const isInPlan = useCallback(
    (recipeId) => addedRecipes.some((r) => r.id === recipeId),
    [addedRecipes]
  );

  const toggleRecipeInPlan = useCallback(
    (recipe) => {
      setAddedRecipes((prev) => {
        if (prev.some((r) => r.id === recipe.id)) {
          showToast(`${recipe.name} dihapus dari rencana belanja`);
          return prev.filter((r) => r.id !== recipe.id);
        }
        showToast(`${recipe.name} ditambahkan ke rencana belanja!`);
        return [...prev, recipe];
      });
    },
    [showToast]
  );

  const setSlot = useCallback((recipe, day, mealType, servings) => {
    setWeeklyPlan((prev) => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: {
            recipeId: recipe.id,
            title: recipe.title,
            servings,
            imageUrl: recipe.imageUrl,
            priceIdr: recipe.priceIdr,
            readyInMinutes: recipe.readyInMinutes,
            calories: recipe.calories
          }
        }
      };
      localStorage.setItem('weeklyPlan', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSlot = useCallback((day, mealType) => {
    setWeeklyPlan((prev) => {
      const updated = {
        ...prev,
        [day]: { ...prev[day], [mealType]: null }
      };
      localStorage.setItem('weeklyPlan', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Jumlah slot terisi di seluruh rencana mingguan – dipakai badge Navbar
  const plannedCount = useMemo(() => {
    let count = 0;
    Object.values(weeklyPlan).forEach((daySlots) => {
      if (!daySlots) return;
      Object.values(daySlots).forEach((slot) => { if (slot) count++; });
    });
    return count;
  }, [weeklyPlan]);

  const value = {
    addedRecipes,
    toastMessage,
    showToast,
    isInPlan,
    toggleRecipeInPlan,
    weeklyPlan,
    setSlot,
    removeSlot,
    plannedCount,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

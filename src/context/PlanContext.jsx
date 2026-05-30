import { useState, useEffect, useCallback } from "react";
import { PlanContext } from "./plan-context.js";

// Holds the buyer's shopping-plan state (selected recipes) and the transient
// toast message, shared across the Navbar (counter/badge) and recipe cards.
export function PlanProvider({ children }) {
  const [addedRecipes, setAddedRecipes] = useState([]);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((message) => {
    setToastMessage(message);
  }, []);

  // Auto-dismiss the toast after 3 seconds.
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

  const value = {
    addedRecipes,
    toastMessage,
    showToast,
    isInPlan,
    toggleRecipeInPlan,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

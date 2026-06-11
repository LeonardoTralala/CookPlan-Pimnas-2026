import { useNavigate } from 'react-router-dom';
import RecipeCatalog from './RecipeCatalog.jsx';
import { usePlan } from '../hooks/usePlan.js';

// Wrapper: hubungkan RecipeCatalog ke PlanContext (setSlot) + navigasi.
export function CatalogPage() {
  const { setSlot } = usePlan();
  const navigate = useNavigate();

  const handleAddToPlan = (recipe, day, mealType, servings) => {
    setSlot(recipe, day, mealType, servings);
  };

  return <RecipeCatalog onAddToPlan={handleAddToPlan} onGoToPlanner={() => navigate('/planner')} />;
}

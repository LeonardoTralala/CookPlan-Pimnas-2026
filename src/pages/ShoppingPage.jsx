import { useNavigate } from 'react-router-dom';
import ShoppingList from './ShoppingList.jsx';
import { usePlan } from '../hooks/usePlan.js';

// Wrapper: hubungkan ShoppingList ke PlanContext + navigasi.
export function ShoppingPage() {
  const { weeklyPlan } = usePlan();
  const navigate = useNavigate();

  return <ShoppingList weeklyPlan={weeklyPlan} onGoToPlanner={() => navigate('/planner')} />;
}

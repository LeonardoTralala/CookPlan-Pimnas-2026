import { useContext } from "react";
import { PlanContext } from "../context/plan-context.js";

// Convenience accessor for the shopping-plan context.
export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used within a <PlanProvider>");
  }
  return ctx;
}

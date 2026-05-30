import { createContext } from "react";

// Shared shopping-plan context. Kept in its own (component-free) module so that
// Fast Refresh works for the provider component in PlanContext.jsx.
export const PlanContext = createContext(null);

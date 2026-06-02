import { createContext } from "react";

// Shared authentication context. Kept in its own (component-free) module so that
// Fast Refresh works for the provider component in AuthContext.jsx — mirip pola
// plan-context.js / PlanContext.jsx.
export const AuthContext = createContext(null);

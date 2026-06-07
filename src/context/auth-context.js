import { createContext } from "react";

// Konteks autentikasi. Dipisah ke modul tanpa komponen (seperti plan-context.js)
// agar Fast Refresh tetap bekerja untuk komponen provider di AuthContext.jsx.
export const AuthContext = createContext(null);

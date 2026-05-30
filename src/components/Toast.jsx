import { usePlan } from "../hooks/usePlan.js";

// Transient confirmation toast, bottom-right.
export function Toast() {
  const { toastMessage } = usePlan();
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-primary text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in">
      <span className="material-symbols-outlined text-success-green">check_circle</span>
      <span className="font-medium text-sm">{toastMessage}</span>
    </div>
  );
}

// Chef-hat mark used in the navbar and footer.
export function Logo({ className = "w-10 h-10 text-primary" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18V6a6 6 0 0 1 12 0v12M4 18h16a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z" />
      <path d="M12 2v4" />
      <path d="M8 3v3" />
      <path d="M16 3v3" />
    </svg>
  );
}

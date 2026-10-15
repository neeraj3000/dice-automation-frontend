export default function WavyUnderline({ className = 'text-[#104e43] dark:text-[#4fcfbc]' }) {
  return (
    <svg
      className={`absolute -bottom-2 left-0 w-full h-3.5 ${className} opacity-90 overflow-visible pointer-events-none select-none`}
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M2 6 Q 14 0, 26 6 T 50 6 T 74 6 T 98 6 T 122 6 T 146 6 T 170 6 T 194 6 T 200 6"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

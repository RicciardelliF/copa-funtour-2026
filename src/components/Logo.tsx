/**
 * Logo placeholder. Sustitúyelo por el SVG o PNG de FunTour cuando tengas el PDF a mano.
 * - Si prefieres PNG/SVG: guarda el archivo en /public/logo.svg y cambia este componente
 *   por: <img src="/logo.svg" alt="FunTour" className={...} />
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-9 w-9"
        aria-hidden
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF7F3D" />
            <stop offset="100%" stopColor="#FF5A1F" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#g)" />
        <path
          d="M13 27V13h13v3.2h-9.5V19h8.3v3.2h-8.3V27H13z"
          fill="#fff"
        />
      </svg>
      <span className="font-display text-lg font-extrabold tracking-tight">
        Fun<span className="text-brand-500">Tour</span>
      </span>
    </span>
  );
}

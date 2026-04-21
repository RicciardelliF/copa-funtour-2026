/**
 * Logo FunTour — versión inline SVG.
 * Usa la paleta corporativa (rosa #E62D7C + azul #003385) y reproduce
 * el splash rosa característico junto al wordmark "FunTour · viajes.com".
 *
 * Si en el futuro tienes el SVG oficial, cópialo a /public/logo-funtour.svg
 * y cambia este componente por:
 *   <img src="/logo-funtour.svg" alt="FunTour Viajes" className="h-12 w-auto" />
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <svg
        viewBox="0 0 56 56"
        className="h-11 w-11 shrink-0 drop-shadow-sm sm:h-12 sm:w-12"
        aria-hidden
      >
        {/* Splash rosa estilizado */}
        <path
          d="M28 4c3.2 0 4.8 3.6 7.6 4.8 2.8 1.2 7.2-.8 9.2 1.6 2 2.4-.4 6 1.2 8.8 1.6 2.8 6 3.2 6.8 6.4.8 3.2-3.2 5.2-3.6 8.4-.4 3.2 2.8 6-0 8.4-2.8 2.4-6.4-0-9.6 1.2-3.2 1.2-4.4 5.6-7.6 5.6s-4.4-4.4-7.6-5.6c-3.2-1.2-6.8 1.2-9.6-1.2-2.8-2.4.4-5.2 0-8.4-.4-3.2-4.4-5.2-3.6-8.4.8-3.2 5.2-3.6 6.8-6.4 1.6-2.8-.8-6.4 1.2-8.8 2-2.4 6.4-.4 9.2-1.6C23.2 7.6 24.8 4 28 4z"
          fill="#E62D7C"
        />
        {/* F de FunTour */}
        <path
          d="M20 40V18h17v4.4H25v4.2h10.6V31H25v9h-5z"
          fill="#fff"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-extrabold tracking-tight text-ocean-700 sm:text-lg">
          Fun<span className="text-brand-500">Tour</span>
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ocean-700/70 sm:text-[11px]">
          viajes.com
        </span>
      </span>
    </span>
  );
}

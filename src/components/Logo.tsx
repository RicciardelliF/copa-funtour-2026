/**
 * Logo FunTour — versión asset SVG.
 * El archivo vive en /public/logo-funtour.svg y es el logo corporativo
 * original (splash rosa + wordmark "FUN TOUR" en blanco).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className ?? ''}`}>
      <img
        src="/logo-funtour.svg"
        alt="FunTour Viajes"
        className="h-14 w-auto sm:h-16"
        draggable={false}
      />
    </span>
  );
}

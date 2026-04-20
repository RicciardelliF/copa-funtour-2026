import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="hero-bg grid min-h-dvh place-items-center px-5">
      <div className="card max-w-md text-center">
        <p className="text-5xl">🧭</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold">Esta página se perdió en el viaje</h1>
        <p className="mt-1 text-sm text-ink/60">Pero tranquilos, te llevamos de vuelta.</p>
        <Link href="/" className="btn-primary mt-5 inline-flex">Volver a inicio</Link>
      </div>
    </div>
  );
}

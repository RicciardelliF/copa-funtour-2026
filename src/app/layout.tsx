import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Copa FunTour 2026',
  description: '¡Inscribe a tu equipo al torneo de fútbol y vóley del viaje de fin de curso!',
  openGraph: {
    title: 'Copa FunTour 2026',
    description: '¡El torneo oficial del viaje de fin de curso!',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#E62D7C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

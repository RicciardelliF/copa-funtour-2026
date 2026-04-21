import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta FunTour corporativa
        // Rosa principal: #E62D7C · Azul profundo: #003385
        brand: {
          50: '#FFF0F7',
          100: '#FFD9EA',
          200: '#FDB0D2',
          300: '#F97DB4',
          400: '#F14F98',
          500: '#E62D7C', // Rosa FunTour (primario)
          600: '#C91E68',
          700: '#A31553',
          800: '#7D1040',
          900: '#570B2D',
        },
        ocean: {
          50: '#EEF2FB',
          100: '#D6DEF3',
          200: '#ACBCE6',
          300: '#7F97D6',
          400: '#4E6FBD',
          500: '#1F4AA0',
          600: '#0A3A93',
          700: '#003385', // Azul FunTour (secundario)
          800: '#00286A',
          900: '#001C4C',
        },
        sun: {
          400: '#FACC15',
          500: '#EAB308',
        },
        ink: '#0F172A',
        paper: '#FFF7FB',
      },
      fontFamily: {
        display: [
          'var(--font-display)',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        sans: [
          'var(--font-sans)',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 10px 30px -15px rgba(15, 23, 42, 0.2)',
        pop: '0 20px 60px -20px rgba(230, 45, 124, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundImage: {
        'grain': 'radial-gradient(rgba(15,23,42,0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;

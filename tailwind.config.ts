import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta FunTour — ajusta estos HEX si el PDF de marca pide otros valores
        brand: {
          50: '#FFF4EC',
          100: '#FFE2CF',
          200: '#FFC39E',
          300: '#FFA06D',
          400: '#FF7F3D',
          500: '#FF5A1F', // Coral FunTour (primario)
          600: '#E8420A',
          700: '#BD3209',
          800: '#8F260A',
          900: '#6B1D08',
        },
        ocean: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#0BB6D1',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#0F2A3A', // Navy profundo
        },
        sun: {
          400: '#FACC15',
          500: '#EAB308',
        },
        ink: '#0F172A',
        paper: '#FFFBF7',
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
        pop: '0 20px 60px -20px rgba(255, 90, 31, 0.35)',
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

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#05070c',
          900: '#090d16',
          850: '#0e1320',
          800: '#141b2d',
          750: '#1b233a',
          700: '#232e4c',
          600: '#324068',
        },
        nasa: {
          blue: '#0b3d91',
          red: '#fc3d21',
          amber: '#f59e0b',
          cyan: '#00e5ff',
          neon: '#10b981',
          crimson: '#ef4444'
        },
        mars: {
          dust: '#c1440e',
          rust: '#89320e',
          glow: '#e0531b',
          sand: '#df8951'
        },
        lunar: {
          silver: '#cbd5e1',
          crater: '#64748b',
          basalt: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
        display: ['Space Grotesk', 'Rajdhani', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2.5s ease-in-out infinite alternate',
        'radar': 'radar 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 229, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.6)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}

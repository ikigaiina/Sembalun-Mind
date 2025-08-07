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
        // Sembalun Brand Colors - Hijau Perbukitan
        primary: {
          50: '#f0f9f1',
          100: '#daf1dd',
          200: '#b8e3c0',
          300: '#8bce97',
          400: '#6A8F6F', // Brand primary - hijau perbukitan
          500: '#4a6b4f',
          600: '#3a563e',
          700: '#304533',
          800: '#29382c',
          900: '#242f26',
          950: '#111a13',
        },
        // Sembalun Brand Colors - Biru Langit
        accent: {
          50: '#f1f7fb',
          100: '#e5f2f8',
          200: '#cde7f2',
          300: '#A9C1D9', // Brand accent - biru langit
          400: '#7ba8d0',
          500: '#5b8cc4',
          600: '#4973b5',
          700: '#3f61a5',
          800: '#385087',
          900: '#31446c',
          950: '#1f2a42',
        },
        // Stone colors for Cairn symbol
        stone: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Meditation-specific color scales with dark theme support
        meditation: {
          zen: {
            50: '#f0f9f2',
            100: '#dcf1e1',
            200: '#bce3c7',
            300: '#8bce9a',
            400: '#7C9885',
            500: '#4a7c5a',
            600: '#3a6447',
            700: '#2f5038',
            800: '#27402e',
            900: '#213527',
            950: '#101b14',
          },
          focus: {
            50: '#eff8ff',
            100: '#def0ff',
            200: '#b7e4ff',
            300: '#6B9BD1',
            400: '#3b9eff',
            500: '#1184f1',
            600: '#0369ce',
            700: '#0354a6',
            800: '#074889',
            900: '#0c3d72',
            950: '#08264b',
          },
          calm: {
            50: '#f7f8fa',
            100: '#eceef2',
            200: '#d5dae2',
            300: '#A8B8C8',
            400: '#8899aa',
            500: '#6b7d90',
            600: '#566677',
            700: '#475561',
            800: '#3c4751',
            900: '#353c45',
            950: '#23272d',
          },
          energy: {
            50: '#fefbf3',
            100: '#fef6e3',
            200: '#fdeac2',
            300: '#D4A574',
            400: '#f5c965',
            500: '#f2b23e',
            600: '#e39620',
            700: '#bc7618',
            800: '#975d19',
            900: '#7a4c18',
            950: '#42250a',
          },
          healing: {
            50: '#f1f9f2',
            100: '#def1e1',
            200: '#bfe3c6',
            300: '#85A887',
            400: '#6ea471',
            500: '#4f8757',
            600: '#3d6b44',
            700: '#325537',
            800: '#2b442e',
            900: '#243825',
            950: '#111f13',
          },
        }
      },
      fontFamily: {
        'primary': ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        'heading': ['Playfair Display Variable', 'Playfair Display', 'Georgia', 'serif'],
        'body': ['Source Serif 4 Variable', 'Source Serif Pro', 'Georgia', 'serif'],
        'mono': ['JetBrains Mono Variable', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.5vw + 0.65rem, 1rem)',
        'fluid-sm': 'clamp(0.875rem, 0.5vw + 0.775rem, 1.125rem)',
        'fluid-base': 'clamp(1rem, 0.5vw + 0.9rem, 1.25rem)',
        'fluid-lg': 'clamp(1.125rem, 1vw + 0.9rem, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 1.5vw + 0.875rem, 2rem)',
        'fluid-2xl': 'clamp(1.5rem, 2vw + 1rem, 3rem)',
        'fluid-3xl': 'clamp(1.875rem, 3vw + 1rem, 4rem)',
        'fluid-4xl': 'clamp(2.25rem, 4vw + 1rem, 5rem)',
      },
      spacing: {
        'meditation': '1.2rem',
        'breathing': '2rem',
      },
      borderRadius: {
        'soft': '1.5rem',
        'meditation': '2rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'breathe-slow': 'breathe 6s ease-in-out infinite',
        'breathe-fast': 'breathe 3s ease-in-out infinite',
        'meditation-pulse': 'meditation-pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'zen-rotate': 'zen-rotate 20s linear infinite',
      },
      keyframes: {
        'meditation-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '0.7' 
          },
          '50%': { 
            transform: 'scale(1.05)', 
            opacity: '1' 
          },
        },
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0px)' 
          },
          '50%': { 
            transform: 'translateY(-10px)' 
          },
        },
        'zen-rotate': {
          '0%': { 
            transform: 'rotate(0deg)' 
          },
          '100%': { 
            transform: 'rotate(360deg)' 
          },
        },
      },
      boxShadow: {
        'glassmorphism': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glassmorphism-lg': '0 24px 48px rgba(0, 0, 0, 0.18)',
        'neomorphism-convex': '8px 8px 16px #b8c5d1, -8px -8px 16px #ffffff',
        'neomorphism-concave': 'inset 8px 8px 16px #b8c5d1, inset -8px -8px 16px #ffffff',
        'meditation-glow': '0 0 25px rgba(106, 143, 111, 0.15)',
        'breathing-glow': '0 0 25px rgba(169, 193, 217, 0.15)',
      },
    },
  },
  plugins: [],
}
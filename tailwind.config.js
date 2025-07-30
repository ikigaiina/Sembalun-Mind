/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6A8F6F',      // hijau-perbukitan
        accent: '#A9C1D9',       // biru-langit  
        background: '#E1E8F0',   // biru-kabut
        warm: '#C56C3E',         // tanah-terakota
      },
      fontFamily: {
        'heading': ['Lora', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
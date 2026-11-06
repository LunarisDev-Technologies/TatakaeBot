/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tatakae: {
          950: '#070b14',
          900: '#0b1329',
          850: '#0f1c3d',
          800: '#16234d',
          700: '#233876',
          cyan: '#38bdf8',
          accent: '#6366f1',
        },
      },
    },
  },
  plugins: [],
};


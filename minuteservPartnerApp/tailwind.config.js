/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(110, 66, 229)',
          dark: 'rgb(88, 53, 183)',
          light: 'rgb(139, 92, 246)',
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: 'rgb(84, 84, 84)',
          light: '#C4C4C4',
          foreground: '#ffffff'
        },
        dark: {
          DEFAULT: '#1C1C28',
          text: '#212121'
        },
        background: 'rgb(250, 250, 250)',
        foreground: 'rgb(15, 15, 15)',
        card: {
          DEFAULT: '#ffffff',
          foreground: 'rgb(15, 15, 15)'
        },
        border: 'rgb(227, 227, 227)',
        input: 'rgb(227, 227, 227)',
        muted: {
          DEFAULT: 'rgb(245, 245, 245)',
          foreground: 'rgb(84, 84, 84)'
        },
        success: 'rgb(34, 197, 94)',
        warning: 'rgb(234, 179, 8)',
        error: 'rgb(220, 38, 38)',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}


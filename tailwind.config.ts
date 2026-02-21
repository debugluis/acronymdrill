import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#141413',
        surface: '#1c1c1a',
        'text-primary': '#faf9f5',
        'text-secondary': '#b0aea5',
        orange: '#d97757',
        blue: '#6a9bcc',
        green: '#788c5d',
        red: '#c0392b',
      },
      fontFamily: {
        poppins: ['Poppins', 'Arial', 'sans-serif'],
        lora: ['Lora', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config

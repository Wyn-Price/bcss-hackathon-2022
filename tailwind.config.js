module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        "main": "#93c5fd",
        "secondary": "#dc2626"
      },
      keyframes: {
        "wiggle": {
          '0%, 100%': { transform: 'translateX(-10px) translateY(-10px)' },
          '16%': { transform: 'translateY(10px)' },
          '33%': { transform: 'translateY(-10px)' },
          '50%': { transform: 'translateX(10px) translateY(10px)' },
          '66%': { transform: 'translateY(-10px)' },
          '82%': { transform: 'translateY(10px)' },
        },
        "intro-right": {
          "0%": { transform: 'translateX(24rem)' },
          "100%": { transform: 'translateX(0)' }
        },
        "intro-left": {
          "0%": { transform: 'translateX(-24rem)' },
          "100%": { transform: 'translateX(0)' }
        },
        "intro-right-long": {
          "0%": { transform: 'translateX(1000px)' },
          "100%": { transform: 'translateX(0)' }
        },
        "intro-left": {
          "0%": { transform: 'translateX(-1000px)' },
          "100%": { transform: 'translateX(0)' }
        }
      },
      animation: {
        'spin-slow': 'spin 60s linear infinite',
        "wiggle": 'wiggle 8s ease-in-out infinite',
        "intro-right": "intro-right 1s ease-in normal",
        "intro-left": "intro-left 1s ease-in normal",
        "intro-right-long": "intro-right-long 1s ease-in normal",
        "intro-left-long": "intro-left-long 1s ease-in normal",
      }
    },
  },
  plugins: [
    require("tailwindcss-animation-delay"),
  ],
}

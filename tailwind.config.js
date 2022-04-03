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
        }
      },
      animation: {
        'spin-slow': 'spin 60s linear infinite',
        "wiggle": 'wiggle 8s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

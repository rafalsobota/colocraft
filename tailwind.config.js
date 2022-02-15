module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionTimingFunction: {
        'spring': 'cubic-bezier(.48,1.6,.63,1.01)',
      },
      keyframes: {
        drop: {
          'from': { transform: 'translateY(-700px)', opacity: 0 },
          'to': { transform: 'translateY(0px)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
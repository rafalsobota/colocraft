module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionTimingFunction: {
        'spring': 'cubic-bezier(.48,1.6,.63,1.01)',
      }
    },
  },
  plugins: [],
}
// tailwind.config.js
module.exports = {
  content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html", 
  ],
  theme: {
      extend: {
          fontFamily: {
            'abhaya': ['Abhaya Libre', 'serif'],
            'nats': ['Nats', 'sans-serif'],
            'montserrat': ['Montserrat', 'sans-serif'],
          },
      },
  },
  plugins: [],
}

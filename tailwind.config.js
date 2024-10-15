/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#23AB49",
        primaryLighter: "#6EBD6A",
        thirdColor: "#F9C74F",
        thirdColorLighter: "#FAD275",
        secondary: "#FFFFFF",
        secondaryDarker: "#5C7582",
        backgroundOuter: "#0D1F29",
        backgroundInner: "#1B3848",
        danger: "#FE324B",
      },
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        xxl: "1536px",
      },
      sizes: {
        xxs: "0.5rem",
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
        "7xl": "4.5rem",
        "8xl": "6rem",
        "9xl": "8rem",
        "10xl": "10rem",
      },
      fontFamily: {
        sans: ["DINNextLTArabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};

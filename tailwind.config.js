import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Tailwind configuration.
 *
 * Colors are split into two groups:
 *   1. Semantic tokens — the design system. All new code should use these.
 *      They resolve to CSS variables defined in `src/css/index.css`, so a
 *      single change there (e.g. swapping primary, switching to dark mode)
 *      propagates everywhere without touching component files.
 *   2. Legacy tokens — hex values from the original design. Preserved so
 *      existing components keep compiling while the redesign is in progress.
 *      DELETE EACH ONE as its last consumer is migrated to a semantic token.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Semantic tokens (shadcn) — use these in all new code ────────
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ── Legacy tokens — DEPRECATED, to be removed progressively ─────
        // Do NOT reference these in any newly written file. Each redesign
        // round replaces them with semantic equivalents. Remove an entry
        // here once `grep -rn "class-name" src/` returns empty.
        //
        // Migration map:
        //   text-danger         → text-destructive
        //   bg-backgroundInner  → bg-surface
        //   bg-backgroundOuter  → bg-foreground/80  (used as modal overlay)
        //   brandGreen          → primary  (if still needed)
        //   thirdColor*         → pick a semantic replacement per use
        brandGreen: "#23AB49",
        brandGreenLight: "#6EBD6A",
        brandWhite: "#FFFFFF",
        brandGrey: "#5C7582",
        thirdColor: "#F9C74F",
        thirdColorLighter: "#FAD275",
        backgroundOuter: "#0D1F29",
        backgroundInner: "#1B3848",
        danger: "#FE324B",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      screens: {
        xs: "475px",
        xxl: "1536px",
      },
      fontFamily: {
        sans: [
          "DINNextLTArabic",
          "'Geist Variable'",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
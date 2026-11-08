import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      screens: {
        mobile: "390px",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      colors: {
        cream: "var(--cream)",
        "cream-2": "var(--cream-2)",
        blush: "var(--blush)",
        peach: "var(--peach)",
        rose: "var(--rose)",
        berry: "var(--berry)",
        crimson: "var(--crimson)",
        plum: "var(--plum)",
        "plum-soft": "var(--plum-soft)",
        surface: "var(--surface)",
        him: "var(--him)",
        her: "var(--her)",
        ink: "var(--plum)",
        // Preserved for backwards compatibility
        room: {
          bg: "var(--cream)",
          surface: "var(--cream-2)",
          card: "var(--surface)",
          border: "var(--blush)",
          text: "var(--plum)",
          muted: "var(--plum-soft)",
          primary: "var(--crimson)",
          secondary: "var(--berry)",
          accent: "var(--peach)",
          blush: "var(--blush)",
          peach: "var(--peach)",
          cream: "var(--cream)",
        },
        decoy: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          text: "#1E293B",
          muted: "#64748B",
          accent: "#3B82F6",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 10px -1px rgba(40, 19, 27, 0.06)",
        glow: "0 0 20px rgba(244, 172, 183, 0.35)",
        bubble: "0 1px 2px rgba(40, 19, 27, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

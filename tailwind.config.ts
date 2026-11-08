import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        mobile: "390px",
      },
      colors: {
        room: {
          bg: "#FFFDF9",
          surface: "#FFF7F0",
          card: "#FFFFFF",
          border: "#F3E8E2",
          text: "#2D2424",
          muted: "#8C7A7A",
          primary: "#E07A5F",
          secondary: "#81B29A",
          accent: "#F2CC8F",
          blush: "#F4ACB7",
          peach: "#FFCAD4",
          cream: "#FFF9EC",
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
        soft: "0 4px 20px -2px rgba(224, 122, 95, 0.08)",
        glow: "0 0 25px rgba(244, 172, 183, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        onaccent: "var(--color-on-accent)",
        offwhite: "var(--color-offwhite)",
        surface: "var(--color-surface)",
        darktext: "var(--color-darktext)",
        secondary: "var(--color-secondary)",
        muted: "var(--color-muted)",
        bordera: "var(--color-bordera)",
        borderb: "var(--color-borderb)",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

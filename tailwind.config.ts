import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#003399",
        accent: "#FFCC00",
        offwhite: "#F5F7FA",
        darktext: "#0A0A0A",
        secondary: "#4A5568",
        muted: "#718096",
        bordera: "#E2E8F0",
        borderb: "#CBD5E0",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

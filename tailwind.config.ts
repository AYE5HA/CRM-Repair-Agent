import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        steel: "#5a6b82",
        line: "#dbe4ef",
        mist: "#f4f7fb",
        repair: "#0f8a7a",
        warning: "#c96d1b",
        danger: "#b42318"
      },
      boxShadow: {
        panel: "0 12px 32px rgba(20, 32, 52, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

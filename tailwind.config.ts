import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-yellow-400",
    "bg-orange-500",
    "bg-red-500",
    "bg-green-500",
    "bg-yellow-100",
    "bg-orange-100",
    "bg-red-100",
    "bg-green-100",
    "text-yellow-800",
    "text-orange-800",
    "text-red-800",
    "text-green-800",
    "border-yellow-300",
    "border-orange-300",
    "border-red-300",
    "border-green-300",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;

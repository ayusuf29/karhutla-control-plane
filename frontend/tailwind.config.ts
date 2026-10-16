import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0a0e17",
          surface: "#111827",
          card: "#161f30",
          elevated: "#1e293b",
        },
        hazard: {
          low: "#10b981",       // Emerald
          medium: "#f59e0b",    // Amber
          high: "#f97316",      // Orange
          extreme: "#ef4444",   // Crimson
        },
        sentinel: {
          cyan: "#38bdf8",
          blue: "#0284c7",
          border: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.04)",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "beacon-pulse": "beaconPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radarSweep 4s linear infinite",
      },
      keyframes: {
        beaconPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.05)" },
        },
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;

module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0f",
        surface: { DEFAULT: "#111118", 2: "#1a1a24" },
        pink: { DEFAULT: "#ff2d78", light: "#e879f9" },
        violet: { DEFAULT: "#7b61ff" },
        cyan: { DEFAULT: "#4dc8ff" },
        success: "#00ff88",
        danger: "#ff4d4d",
        border: "#2a2a38",
        muted: "#6b6b80",
      },
      fontFamily: {
        mono: ["Space Mono", "monospace"],
        sans: ["DM Sans", "sans-serif"],
      },
      animation: {
        pulse_glow: "pulse_glow 1.5s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease both",
        slideUp: "slideUp 0.3s ease both",
      },
      keyframes: {
        pulse_glow: {
          "0%, 100%": { boxShadow: "0 0 10px #ff2d78, 0 0 20px #ff2d78" },
          "50%": { boxShadow: "0 0 25px #ff2d78, 0 0 50px #e879f9" },
        },
        fadeIn: {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};


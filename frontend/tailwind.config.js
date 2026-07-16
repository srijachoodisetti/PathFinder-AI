/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#6366F1",
        accent: "#3B82F6",
        background: "#F4F7FC",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        text: "#1F2937",
        claybg: "#FFFFFF"
      },
      boxShadow: {
        'clay-card': '12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff',
        'clay-card-inset': 'inset 4px 4px 8px rgba(0,0,0,0.03), inset -4px -4px 8px rgba(255,255,255,0.7)',
        'clay-btn': '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff',
        'clay-btn-active': 'inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff',
        'clay-input': 'inset 2px 2px 5px #d1d9e6, inset -3px -3px 5px #ffffff',
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}

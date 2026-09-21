/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        primary: {
          DEFAULT: 'var(--primary)',
          soft: 'var(--primary-soft)',
          deep: 'var(--primary-deep)',
        },
        'on-primary': 'var(--on-primary)',
        reward: {
          DEFAULT: 'var(--reward)',
          soft: 'var(--reward-soft)',
          deep: 'var(--reward-deep)',
        },
        success: 'var(--success)',
        danger: 'var(--danger)',
      },
      boxShadow: {
        warm: '0 4px 20px -2px rgba(120, 70, 20, 0.10), 0 2px 6px -1px rgba(120, 70, 20, 0.06)',
        'warm-hover': '0 8px 30px -4px rgba(120, 70, 20, 0.16), 0 4px 12px -2px rgba(120, 70, 20, 0.08)',
        'warm-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.50), 0 2px 6px -1px rgba(245, 158, 75, 0.08)',
        'warm-dark-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.60), 0 4px 14px -2px rgba(245, 158, 75, 0.16)',
      },
    },
  },
  plugins: [],
};

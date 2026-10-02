/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--border)',
        'line-soft': 'var(--border-soft)',
        ink: 'var(--text)',
        mute: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        nav: 'var(--nav-bg)',
        'nav-hover': 'var(--nav-bg-hover)',
        'nav-ink': 'var(--nav-text)',
        'nav-hover-ink': 'var(--nav-hover-text)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-hover': 'var(--accent-hover)',
        positive: 'var(--positive)',
        'positive-soft': 'var(--positive-soft)',
        negative: 'var(--negative)',
        'negative-soft': 'var(--negative-soft)',
        warn: 'var(--warn)',
        'warn-soft': 'var(--warn-soft)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'monospace'],
      },
    },
  },
}

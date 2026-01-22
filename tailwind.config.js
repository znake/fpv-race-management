/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Beamer-optimierte Font-Größen (Story 6.2)
      fontSize: {
        'beamer-caption': ['16px', { lineHeight: '1.4' }],
        'beamer-body': ['18px', { lineHeight: '1.5' }],
        'beamer-ui': ['20px', { lineHeight: '1.4' }],
        'beamer-name': ['24px', { lineHeight: '1.3' }],
        'beamer-rank': ['32px', { lineHeight: '1' }],
        'beamer-heat': ['36px', { lineHeight: '1.2' }],
        'beamer-display': ['48px', { lineHeight: '1.1' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Synthwave Theme (US-2.1 AC1)
        void: '#0d0221',
        night: '#1a0533',
        'night-light': '#2a0845',
        'neon-pink': '#ff2a6d',
        'neon-cyan': '#05d9e8',
        'neon-magenta': '#d300c5',
        gold: '#f9c80e',
        silver: '#c0c0c0',
        bronze: '#cd7f32',
        'winner-green': '#39ff14',
        'loser-red': '#ff073a',
        'rank-4': '#ac645e',
        chrome: '#e0e0e0',
        steel: '#888888',
        'live-orange': '#ff6b00',
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 42, 109, 0.5)',
        'glow-cyan': '0 0 20px rgba(5, 217, 232, 0.5)',
        'glow-gold': '0 0 20px rgba(249, 200, 14, 0.5)',
        'glow-silver': '0 0 20px rgba(192, 192, 192, 0.5)',
        'glow-bronze': '0 0 20px rgba(205, 127, 50, 0.5)',
        'glow-green': '0 0 15px rgba(57, 255, 20, 0.4)',
        'glow-red': '0 0 15px rgba(255, 7, 58, 0.4)',
        'glow-rank-4': '0 0 20px rgba(172, 100, 94, 0.6)',
        'glow-magenta': '0 0 20px rgba(211, 0, 197, 0.5)',
        'glow-orange': '0 0 20px rgba(255, 107, 0, 0.6)',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 42, 109, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 42, 109, 0.7)' },
        },
        'glow-pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249, 200, 14, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(249, 200, 14, 0.7)' },
        },
        'glow-pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(5, 217, 232, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(5, 217, 232, 0.7)' },
        },
        'glow-pulse-orange': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.6)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 0, 0.9)' },
        },
        'scale-in': {
          from: { transform: 'scale(0)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'rotate-border': {
          from: { '--angle': '0deg' },
          to: { '--angle': '360deg' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'glow-pulse-gold': 'glow-pulse-gold 2s ease-in-out infinite',
        'glow-pulse-cyan': 'glow-pulse-cyan 2s ease-in-out infinite',
        'glow-pulse-orange': 'glow-pulse-orange 1.5s ease-in-out infinite',
        'scale-in': 'scale-in 150ms ease-out',
        'rotate-border': 'rotate-border 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
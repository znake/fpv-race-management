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
        'winner-green': '#39ff14',
        'loser-red': '#ff073a',
        chrome: '#e0e0e0',
        steel: '#888888',
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 42, 109, 0.5)',
        'glow-cyan': '0 0 20px rgba(5, 217, 232, 0.5)',
        'glow-gold': '0 0 20px rgba(249, 200, 14, 0.5)',
        'glow-green': '0 0 15px rgba(57, 255, 20, 0.4)',
        'glow-red': '0 0 15px rgba(255, 7, 58, 0.4)',
        'glow-magenta': '0 0 20px rgba(211, 0, 197, 0.5)',
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
        'scale-in': 'scale-in 150ms ease-out',
        'rotate-border': 'rotate-border 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
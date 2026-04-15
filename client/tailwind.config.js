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
        // AI Monsters Design System
        bg: {
          deep: '#0a0b0f',
          surface: '#12141a',
          elevated: '#1a1d27',
        },
        // AI Monsters custom border colors — extend the HSL border base
        border: {
          subtle: '#2a2d3a',
          glow: '#3d4050',
          DEFAULT: 'hsl(var(--border))',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#8b8d9a',
          muted: '#5a5c6a',
        },
        rarity: {
          common: '#9ca3af',
          rare: '#3b82f6',
          epic: '#a855f7',
          legendary: '#f59e0b',
        },
        type: {
          unit: '#ef4444',
          building: '#6366f1',
          spell: '#22d3ee',
        },
        stat: {
          attack: '#f87171',
          defense: '#60a5fa',
          range: '#4ade80',
        },
        ui: {
          accent: '#8b5cf6',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
        // HSL vars for compatibility (border already defined above with subtle/glow/DEFAULT)
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8b5cf6",
          foreground: "#f0f0f5",
        },
        secondary: {
          DEFAULT: "#1a1d27",
          foreground: "#f0f0f5",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f0f0f5",
        },
        muted: {
          DEFAULT: "#1a1d27",
          foreground: "#8b8d9a",
        },
        accent: {
          DEFAULT: "#8b5cf6",
          foreground: "#f0f0f5",
        },
        popover: {
          DEFAULT: "#12141a",
          foreground: "#f0f0f5",
        },
        card: {
          DEFAULT: "#12141a",
          foreground: "#f0f0f5",
        },
      },
      fontFamily: {
        heading: ['Cinzel', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'tiny': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
        'badge': '6px',
        'input': '8px',
        'modal': '16px',
        'lg': '12px',
        'md': '8px',
        'sm': '6px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
        'glow-common': '0 0 20px rgba(156,163,175,0.2)',
        'glow-rare': '0 0 25px rgba(59,130,246,0.4)',
        'glow-epic': '0 0 30px rgba(168,85,247,0.5)',
        'glow-legendary': '0 0 40px rgba(245,158,11,0.6)',
        'glow-legendary-intense': '0 0 60px rgba(245,158,11,0.8)',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'card-flip': 'card-flip 0.5s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '-200% 0' },
          '50%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        'card-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
    },
  },
  plugins: [],
}

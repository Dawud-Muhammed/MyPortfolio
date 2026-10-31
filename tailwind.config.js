/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        // Custom breakpoints aligned with design specs
        'xs': '320px',   // Extra small phones
        'sm': '640px',   // Mobile
        'md': '768px',   // Tablet
        'lg': '1024px',  // Laptop
        'xl': '1440px',  // Ultrawide
        '2xl': '1600px', // Ultra ultrawide
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Obsidian void background system
        'void': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          900: '#0A0A0A',
          950: '#050505',
        },
        // Elevated surfaces (charcoal/translucent)
        'surface': {
          base: '#0F0F11',
          elevated: '#141417',
          hover: '#1A1A1E',
        },
        // Text hierarchy
        'text': {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          tertiary: '#71717A',
          mono: '#64748B',
        },
        // Borders (structural hairlines)
        'border': {
          subtle: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.22)',
          strong: 'rgba(255, 255, 255, 0.35)',
        },
        // Status & accent signals
        'status': {
          emerald: '#10B981',
          'emerald-dark': '#059669',
        },
        'accent': {
          primary: '#38BDF8',  // Cyan accent
          secondary: '#F97316', // Warm accent
        },
        // Legacy color support
        foreground: 'rgb(var(--fg) / <alpha-value>)',
        'foreground-muted': 'rgb(var(--fg-muted) / <alpha-value>)',
        background: 'rgb(var(--bg) / <alpha-value>)',
        'surface-old': 'rgb(var(--surface) / <alpha-value>)',
        'surface-elevated-old': 'rgb(var(--surface-elevated) / <alpha-value>)',
        'border-old': 'rgb(var(--border) / <alpha-value>)',
        'border-hover-old': 'rgb(var(--border-hover) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
          fg: 'rgb(var(--primary-fg) / <alpha-value>)',
        },
        'accent-old': {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          fg: 'rgb(var(--success-fg) / <alpha-value>)',
          400: '#4ade80',
          500: '#22c55e',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
          fg: 'rgb(var(--warning-fg) / <alpha-value>)',
          400: '#fbbf24',
          500: '#f59e0b',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
          fg: 'rgb(var(--danger-fg) / <alpha-value>)',
          400: '#f87171',
          500: '#ef4444',
        },
        error: {
          400: '#f87171',
          500: '#ef4444',
        },
        'accent-50': '#eef2ff',
        'accent-100': '#e0e7ff',
        'accent-200': '#c7d2fe',
        'accent-300': '#a5b4fc',
        'accent-400': '#818cf8',
        'accent-500': '#6366f1',
        'accent-600': '#4f46e5',
        'accent-700': '#4338ca',
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        sm: '0.375rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      fontSize: {
        // Display typographic scale (responsive, no horizontal overflow)
        'display-xl': ['clamp(3.5rem, 9vw, 7.5rem)', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 7vw, 5rem)', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.875rem, 5vw, 3.5rem)', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.015em' }],
        // Body text: Responsive for readability across breakpoints
        'body-base': ['clamp(0.875rem, 1.5vw, 1.125rem)', { lineHeight: '1.6' }],
        'body-lg': ['clamp(1rem, 1.75vw, 1.25rem)', { lineHeight: '1.6' }],
        'body-sm': ['clamp(0.75rem, 1.25vw, 0.875rem)', { lineHeight: '1.5' }],
        // Monospace technical labels
        'mono-label': ['0.75rem', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.18em', textTransform: 'uppercase' }],
        'mono-sm': ['0.6875rem', { lineHeight: '1.25', fontWeight: '500', letterSpacing: '0.1em' }],
      },
      spacing: {
        gutter: 'clamp(1.5rem, 5vw, 3rem)',
        section: 'clamp(5rem, 10vw, 8rem)',
        'touch-target': 'clamp(3rem, 8vw, 4rem)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-down': 'fadeDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'aurora': 'aurora 25s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
        'blob-drift': 'blobDrift 18s ease-in-out infinite',
        'blob-drift-2': 'blobDrift2 22s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeDown: { '0%': { opacity: '0', transform: 'translateY(-20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        aurora: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        bounceSubtle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        gradientX: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        blobDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-30px, 20px) scale(0.95)' },
        },
        blobDrift2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-40px, 30px) scale(1.05)' },
          '66%': { transform: 'translate(30px, -20px) scale(0.9)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 8px rgba(16, 185, 129, 0)' },
        },
      },
      boxShadow: {
        // Architectural spotlight effect
        'spotlight-sm': 'inset 0 0 20px rgba(56, 189, 248, 0.1)',
        'spotlight-md': 'inset 0 0 40px rgba(56, 189, 248, 0.15)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-cyan': '0 0 20px rgba(56, 189, 248, 0.2)',
      },
    },
  },
  plugins: [],
};

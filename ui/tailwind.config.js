/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cloud2 Labs Innovation Hub Color Scheme
        cloud2: {
          // Primary - Vibrant Purple (from Innovation Hub)
          purple: {
            DEFAULT: '#A335FC',
            50: '#F5E6FF',
            100: '#E6CCFF',
            200: '#D9B3FF',
            300: '#CC99FF',
            400: '#B866FF',
            500: '#A335FC', // Primary
            600: '#8B2BD9',
            700: '#7321B6',
            800: '#5B1893',
            900: '#430F70',
          },
          // Neutral Colors
          white: '#FFFFFF',
          black: {
            DEFAULT: '#000000',
            soft: '#07000E',
          },
          gray: {
            50: '#F8F9FA',
            100: '#F1F3F5',
            200: '#E9ECEF',
            300: '#DEE2E6',
            400: '#CED4DA',
            500: '#ADB5BD',
            600: '#6C757D',
            700: '#495057',
            800: '#343A40',
            900: '#212529',
          },
          // Status Colors
          success: '#28A745',
          warning: '#FFC107',
          error: '#DC3545',
          info: '#17A2B8',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        'hero': ['48px', { lineHeight: '1.1', letterSpacing: '-0.48px' }],
        '2xl': ['24px', { lineHeight: '1.2' }],
        'xl': ['20px', { lineHeight: '1.3' }],
        'lg': ['16px', { lineHeight: '1.5' }],
        'base': ['14px', { lineHeight: '1.6' }],
        'sm': ['13px', { lineHeight: '1.5' }],
        'xs': ['12px', { lineHeight: '1.4' }],
      },
      borderRadius: {
        'card': '20px',
        'button': '4px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(163, 53, 252, 0.15)',
        'purple': '0 4px 16px rgba(163, 53, 252, 0.2)',
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #A335FC 0%, #8B2BD9 100%)',
        'purple-gradient-soft': 'linear-gradient(180deg, #F5E6FF 0%, #FFFFFF 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Cairo',
                    'Tajawal',
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'Segoe UI',
                    'Roboto',
                    'Arial',
                    'Noto Sans Arabic',
                    'Noto Sans',
                    'Liberation Sans',
                    'sans-serif'
                ],
                arabic: ['Cairo', 'Tajawal', 'Noto Sans Arabic', 'sans-serif']
            },
            colors: {
                primary: {
                    DEFAULT: '#069484',
                    50: '#E6F7F4',
                    100: '#CFF0EB',
                    200: '#A3E2D6',
                    300: '#6DD0BE',
                    400: '#3DBAA8',
                    500: '#069484',
                    600: '#057F72',
                    700: '#046659',
                    800: '#034C43',
                    900: '#02352F'
                },
                brand: {
                    DEFAULT: '#069484',
                    50: '#E6F7F4',
                    100: '#CFF0EB',
                    200: '#A3E2D6',
                    300: '#6DD0BE',
                    400: '#3DBAA8',
                    500: '#069484',
                    600: '#057F72',
                    700: '#046659',
                    800: '#034C43',
                    900: '#02352F'
                },
                accent: {
                    DEFAULT: '#069484',
                    50: '#E6F7F4',
                    100: '#CFF0EB',
                    200: '#A3E2D6',
                    300: '#6DD0BE',
                    400: '#3DBAA8',
                    500: '#069484',
                    600: '#057F72',
                    700: '#046659',
                    800: '#034C43',
                    900: '#02352F'
                },
                surface: {
                    glass: 'rgba(255, 255, 255, 0.05)',
                    glassHover: 'rgba(255, 255, 255, 0.1)',
                    glassBorder: 'rgba(255, 255, 255, 0.15)',
                }
            },
            fontSize: {
                'display': ['2rem', { lineHeight: '1.2', fontWeight: '800' }],
                'h1': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
                'h2': ['1.25rem', { lineHeight: '1.35', fontWeight: '700' }],
                'h3': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
                'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
                'body': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
                'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
                'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
                'overline': ['0.75rem', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '0.05em' }],
            },
            spacing: {
                '4.5': '1.125rem',
                '13': '3.25rem',
                '15': '3.75rem',
                '18': '4.5rem',
                '22': '5.5rem',
                '26': '6.5rem',
                '30': '7.5rem',
            },
            boxShadow: {
                'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
                'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                'glass-lg': '0 16px 40px 0 rgba(0, 0, 0, 0.3)',
                'glow-brand': '0 0 20px rgba(6, 148, 132, 0.35)',
                'glow-brand-lg': '0 0 35px rgba(6, 148, 132, 0.55)',
                'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
                'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.1)',
                'elevated': '0 4px 16px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.12)',
                'inner-glow': 'inset 0 1px 2px rgba(6,148,132,0.1)',
            },
            borderRadius: {
                '2.5xl': '1.25rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            backdropBlur: {
                'glass': '16px',
                'glass-heavy': '24px',
            },
            transitionDuration: {
                '250': '250ms',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' }
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'translate(-50%, -50%) scale(0.98)' },
                    to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' }
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(6px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                slideDown: {
                    from: { opacity: '0', transform: 'translateY(-6px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                shimmer: {
                    from: { backgroundPosition: '200% 0' },
                    to: { backgroundPosition: '-200% 0' }
                },
                blob: {
                    '0%': { transform: 'translateY(0) scale(1)' },
                    '100%': { transform: 'translateY(-20px) scale(1.05)' }
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                }
            },
            animation: {
                'fade-in': 'fadeIn 180ms ease-out',
                'scale-in': 'scaleIn 180ms ease-out',
                'slide-up': 'slideUp 200ms ease-out',
                'slide-down': 'slideDown 200ms ease-out',
                'shimmer': 'shimmer 2s linear infinite',
                'blob-float': 'blob 10s infinite alternate',
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        }
    },
    plugins: []
}

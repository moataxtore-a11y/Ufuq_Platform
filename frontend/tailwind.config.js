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
                    DEFAULT: '#0F172A',
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                    950: '#020617'
                },
                brand: {
                    DEFAULT: '#D4AF37',
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#D4AF37',
                    600: '#B98C14',
                    700: '#9A6B06',
                    800: '#7C5306',
                    900: '#65420A',
                    950: '#3B2504'
                },
                accent: {
                    DEFAULT: '#F59E0B',
                    50: '#FFFBEB',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#FBBF24',
                    500: '#F59E0B',
                    600: '#D97706',
                    700: '#B45309',
                    800: '#92400E',
                    900: '#78350F',
                    950: '#451A03'
                }
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
                }
            },
            animation: {
                'fade-in': 'fadeIn 180ms ease-out',
                'scale-in': 'scaleIn 180ms ease-out',
                'slide-up': 'slideUp 200ms ease-out'
            }
        }
    },
    plugins: []
}
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Playfair Display', 'Georgia', 'serif'],
            },
            colors: {
                kamun: {
                    royal: '#1e3a8a',
                    blue: '#2563eb',
                    navy: '#0f172a',
                    light: '#dbeafe',
                    ice: '#eff6ff',
                    dark: '#0c1629',
                    slate: '#1e293b',
                    gold: '#d4af37',
                    goldLight: '#f4e4a6',
                }
            },
            animation: {
                'breathe': 'breathe 3s ease-in-out infinite',
                'fade-in': 'fadeIn 1s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                breathe: {
                    '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.02)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            backdropBlur: {
                glass: '20px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glow': '0 0 20px rgba(37, 99, 235, 0.4)',
                'royal': '0 0 30px rgba(30, 58, 138, 0.5)',
                'gold': '0 0 25px rgba(212, 175, 55, 0.4)',
            },
        },
    },
    plugins: [],
}

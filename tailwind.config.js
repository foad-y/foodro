/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["BYekan"],
      },
      colors: {
        // اتصال متغیرهای داینامیک به تیلویند با پشتیبانی از opacity
        'primary': 'rgb(var(--color-primary-rgb) / <alpha-value>)',
        'secondary': 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
        'tertiary': 'rgb(var(--color-tertiary-rgb) / <alpha-value>)',
        'border': 'rgb(var(--color-border-rgb) / <alpha-value>)',
        'success': 'rgb(var(--color-success-rgb) / <alpha-value>)',
        'error': 'rgb(var(--color-error-rgb) / <alpha-value>)',
        'warning': 'rgb(var(--color-warning-rgb) / <alpha-value>)',

        // رنگ‌های متن
        'primarytext': 'rgb(var(--color-primarytext-rgb) / <alpha-value>)',
        'secondarytext': 'rgb(var(--color-secondarytext-rgb) / <alpha-value>)',
        'tertiarytext': 'rgb(var(--color-tertiarytext-rgb) / <alpha-value>)',

        // گرادیانت‌ها
        'gradiantbtnfrom': 'rgb(var(--color-gradiantbtnfrom-rgb) / <alpha-value>)',
        'gradiantbtnto': 'rgb(var(--color-gradiantbtnto-rgb) / <alpha-value>)',
      }
    },
  },
};

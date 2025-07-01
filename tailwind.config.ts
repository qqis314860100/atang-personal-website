import type { Config } from 'tailwindcss'

const { addDynamicIconSelectors } = require('@iconify/tailwind')

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flyonui/dist/js/*.js',
  ],
  theme: {
    extend: {
      fontSize: {
        fclamp:
          'clamp(0.5rem, 0.38636363636363635rem + 1.1363636363636365vw, 1.75rem)',
        sclamp: 'clamp(1.25rem, -1.25rem + 5.208333333333333vw, 5rem)',
        tclamp:
          'clamp(0.5rem, -0.07692307692307687rem + 6.41025641025641vw, 3rem)',
        foclamp:
          'clamp(0.5rem, 0.38461538461538464rem + 1.282051282051282vw, 1rem)',
        ficlamp: 'clamp(1rem, 0.5625rem + 3.8889vw, 1.875rem)',
        siclamp: 'clamp(0.75rem, 0.625rem + 1.1111vw, 1rem)',
      },
      fontFamily: {
        FiraSans: ['Fira Sans', 'sans-serif'],
        Archivo: ['Archivo', 'sans-serif'],
      },
      screens: {
        '1140>=': { min: '9.375em', max: '71.25em' },
        '1180>=': { min: '60em', max: '73.75em' },
        '930>=': { min: '48em', max: '58.125em' },
        '768<=': { max: '48em' },
        '450>=': { min: '9.375em', max: '28.125em' },
        '540<=': { min: '9.375em', max: '33.75em' },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        fadeOut: 'fadeOut 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    require('flyonui')({
      themes: ['light', 'dark', 'gourmet', 'corporate', 'luxury', 'soft'],
      base: true,
      darkTheme: 'dark',
      styled: true,
    }),
    // 确保正确配置 Iconify
    addDynamicIconSelectors({
      // 可选：指定要使用的图标集
      collections: ['solar'],
      // 可选：配置前缀
      prefix: 'icon',
      // 可选：默认样式
      defaultStyle: {
        display: 'inline-block',
        verticalAlign: 'middle',
      },
      // 可选：默认类名
      extraProperties: {
        'font-size': '1.25em', // 默认图标大小
      },
    }),
  ],
}
export default config

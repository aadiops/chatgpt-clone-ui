import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 42, 0.25)',
      },
      colors: {
        sidebar: '#202123',
        panel: '#343541',
        panelAlt: '#40414f',
        accent: '#10a37f',
        textMuted: '#a0aec0'
      }
    }
  },
  plugins: []
}

export default config

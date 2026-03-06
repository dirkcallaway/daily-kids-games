import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  vite: { plugins: [tailwindcss() as any] },
  css: ['~/assets/css/main.css'],
  app: { head: { title: 'Daily Kids Games' } },
})

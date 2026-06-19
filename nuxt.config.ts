export default defineNuxtConfig({
  compatibilityDate: '2024-04-04',

  imports: {
    dirs: ['stores'],
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/wp-json/custom/v1',
    }
  },

  // @ts-ignore
  image: {
    quality: 80,
    format: ['webp'],
    ipx: {
      maxAge: 31536000
    }
  },

  nitro: {
    devProxy: {
      '/wp-content': {
        target: (() => {
          try { return new URL(process.env.NUXT_PUBLIC_API_BASE || '').origin } catch { return 'http://localhost:8000' }
        })(),
        changeOrigin: true,
      }
    }
  },
})

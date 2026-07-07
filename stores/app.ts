import { defineStore } from 'pinia'
import type { MenuItem } from '../types/menu'

interface Loader {
  status: boolean
  route: string
  error?: boolean
}

interface LoaderMain {
  status: boolean
  cached: string[]
  error: boolean
}

interface GeneralData {
  information: Record<string, unknown>
  primaryMenu: MenuItem[]
  footerMenu:  MenuItem[]
}

interface General {
  data: GeneralData
  loading: boolean
}

interface AppStore {
  general: General
  loader: LoaderMain
  pageData: any
  isNavigating: boolean
  sidebarData: any | null
  _apiBase: string
}

export const useAppStore = defineStore('app', {
  state: (): AppStore => ({
    general: {
      data: {
        information: {},
        primaryMenu: [],
        footerMenu:  []
      },
      loading: true
    },
    loader: {
      status: true,
      cached: [],
      error: false
    },
    pageData: null,
    isNavigating: false,
    sidebarData: null,
    _apiBase: ''
  }),
  getters: {
    loaderCached: (state) => state.loader.cached,
    loaderStatus: (state) => state.loader.status,
    loaderError:  (state) => state.loader.error,
    generalPrimaryMenu: (state): MenuItem[] => state.general.data.primaryMenu,
    generalFooterMenu:  (state): MenuItem[] => state.general.data.footerMenu,
  },
  actions: {
    // useRuntimeConfig() solo puede llamarse dentro de actions (contexto Nuxt garantizado).
    // Se cachea en _apiBase para no llamarlo en cada request.
    api(): string {
      if (!this._apiBase) {
        this._apiBase = useRuntimeConfig().public.apiBase as string
      }
      return this._apiBase
    },

    updateLoader(payload: { status: boolean; route: string; error?: boolean }): void {
      this.loader.status = payload.status

      if (payload.error) {
        this.loader.error = payload.error
      }

      if (!payload.status && !this.loader.cached.includes(payload.route)) {
        this.loader.cached.push(payload.route)
      }
    },

    cleanWpUrl(url: string): string {
      if (!url) return '/'
      try {
        const urlObj = new URL(url)
        const path = urlObj.pathname
        return (path !== '/' && path.endsWith('/')) ? path.slice(0, -1) : path
      } catch (e) {
        return (url !== '/' && url.endsWith('/')) ? url.slice(0, -1) : url
      }
    },

    deepCleanUrls(data: any): any {
      if (!data) return data

      if (Array.isArray(data)) {
        return data.map(item => this.deepCleanUrls(item))
      }

      if (typeof data === 'object') {
        const cleanObj: any = {}
        for (const key in data) {
          if (key === 'url' && typeof data[key] === 'string') {
            cleanObj[key] = this.cleanWpUrl(data[key])
          } else if (typeof data[key] === 'string' && /^https?:\/\/localhost(:\d+)?(\/|$)/.test(data[key])) {
            const wpOrigin = new URL(this.api()).origin
            cleanObj[key] = data[key].replace(/^https?:\/\/localhost(:\d+)?(?=\/|$)/, wpOrigin)
          } else if (typeof data[key] === 'string' && data[key].startsWith('http://')) {
            cleanObj[key] = data[key].replace('http://', 'https://')
          } else {
            cleanObj[key] = this.deepCleanUrls(data[key])
          }
        }
        return cleanObj
      }

      return data
    },

    async getGeneralData(): Promise<void> {
      if (this.general.data.primaryMenu.length > 0) return

      const urlFinal = `${this.api()}/pages/?type=general`

      try {
        const json = await $fetch(urlFinal)
        const rawData = (json as any).data || json

        if (rawData) {
          const mapItems = (items: any[]): MenuItem[] =>
            (items || []).map(item => ({ ...item, url: this.cleanWpUrl(item.url) }))

          this.general.data.information = rawData.information || {}
          this.general.data.primaryMenu = mapItems(rawData.primary_menu)
          this.general.data.footerMenu  = mapItems(rawData.footer_menu)
          this.general.loading = false

          if (this.general.data.primaryMenu.length === 0) {
            console.warn("⚠️ Menú primario vacío. Verifica el slug 'primary-menu' en WordPress.")
          }
        }
      } catch (error) {
        console.error("❌ Fallo crítico en getGeneralData:", error)
      }
    },

    async getPageData(slug: string, type: string = 'page', typeName: string = '', paged: number = 1): Promise<void> {
      try {
        const finalSlug = slug || 'home'
        const pagedParam = type === 'term' ? `&paged=${paged}` : (paged > 1 ? `&paged=${paged}` : '')
        const url = `${this.api()}/pages/${finalSlug}?type=${type}&type-name=${typeName}${pagedParam}`
        const rawJson = await $fetch(url) as any
        const data = rawJson.data || rawJson
        this.pageData = this.deepCleanUrls(data)
      } catch (error) {
        console.error("❌ Error en getPageData:", error)
      }
    },

    async getSidebarData(): Promise<void> {
      if (this.sidebarData) return

      const url = `${this.api()}/sidebar`

      try {
        const data = await $fetch(url) as any
        this.sidebarData = this.deepCleanUrls(data)
      } catch (error) {
        console.error("❌ Error cargando Sidebar:", error)
      }
    },
  }
})

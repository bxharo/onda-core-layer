function normalizeUrls(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(normalizeUrls)
  const result: any = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (key === 'url' && typeof value === 'string' && value.startsWith('/') && value !== '/' && value.endsWith('/')) {
      result[key] = value.slice(0, -1)
    } else {
      result[key] = normalizeUrls(value)
    }
  }
  return result
}

interface PayloadRequest {
  type: string
  slug: string
  typeName?: string
  parent?: string
}

const handleFetchError = (store: any, slug: string) => {
  const route = useRoute()
  console.error(`[ContentService] Error capturado para el recurso: ${slug}`)

  store.updateLoader({
    route: route.path,
    status: false,
    error: true
  })
}

export async function useGetContent(payload: PayloadRequest): Promise<any> {
  const store = useAppStore()

  const params = new URLSearchParams({
    type: payload.type,
    ...(payload.typeName && { 'type-name': payload.typeName }),
    ...(payload.parent && { parent: payload.parent })
  })

  const endpoint = `${store.api()}/pages/${payload.slug || 'home'}?${params.toString()}`

  try {
    const response = await fetch(endpoint)

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }

    const json = await response.json()

    const isValidData = json && (json.post || json.hero || json.articles || json.primary_menu)

    if (isValidData) {
      if (import.meta.client) {
        store.updateLoader({
          route: '',
          status: false,
          error: false
        })
      }
      return normalizeUrls(json)
    }

    handleFetchError(store, payload.slug)
    return { error: true, message: 'Invalid Structure' }

  } catch (error) {
    handleFetchError(store, payload.slug)
    return { error: true, message: error instanceof Error ? error.message : 'Unknown Error' }
  }
}

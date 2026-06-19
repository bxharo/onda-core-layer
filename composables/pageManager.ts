export async function usePageManager(payload: { slug: string, type: string, typeName?: string, parent?: string, paged?: number }) {
  const route = useRoute()
  const store = useAppStore()

  const fetchData = async (paged = payload.paged ?? 1) => {
    if (import.meta.client) {
      store.isNavigating = true
      store.loader.error = false
      store.pageData = null
    }

    await store.getPageData(payload.slug, payload.type, payload.typeName || '', paged)

    if (import.meta.client) {
      store.isNavigating = false
    }
  }

  const { error } = await useAsyncData(
    `content-${route.fullPath}`,
    async () => {
      await fetchData()
      return store.pageData
    }
  )

  if (import.meta.client) {
    watch(
      () => route.params,
      async (newParams) => {
        let shouldFetch = false

        if (payload.type === 'term' && newParams.category_slug && newParams.category_slug !== payload.slug) {
          payload.slug = newParams.category_slug as string
          shouldFetch = true
        } else if (newParams.slug && payload.slug !== newParams.slug) {
          payload.slug = newParams.slug as string
          shouldFetch = true
        } else if (route.path === '/' && payload.slug === 'home') {
          shouldFetch = true
        }

        if (shouldFetch) {
          window.scrollTo(0, 0)
          await fetchData(1)
        }
      },
      { deep: true }
    )
  }

  return { fetchData, error }
}

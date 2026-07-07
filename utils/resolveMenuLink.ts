import type { MenuItem } from '../types/menu'

export function resolveMenuLink(item: MenuItem): string {
  const { type, slug, external_url, url } = item

  if (!type || !slug) return url

  switch (type) {
    case 'category': return `/categoria/${slug}`
    case 'post_tag': return `/etiqueta/${slug}`
    case 'page':     return `/${slug}`
    case 'post':     return `/articulo/${slug}`
    case 'custom':   return external_url || url
    default:         return url
  }
}

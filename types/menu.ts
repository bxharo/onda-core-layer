export type MenuItemType = 'category' | 'post_tag' | 'page' | 'post' | 'custom'

export interface MenuItem {
  id:            number
  name:          string
  url:           string
  slug?:         string
  type?:         MenuItemType
  external_url?: string | null
}

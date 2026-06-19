export function useIsActiveMenuItem(routeName: string): boolean {
  const route = useRoute()

  if (!route || !route.name) return false

  const currentRouteName = String(route.name).toLowerCase()
  const targetRouteName = routeName.toLowerCase()

  return currentRouteName === targetRouteName
}

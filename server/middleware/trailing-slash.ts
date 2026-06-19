export default defineEventHandler((event) => {
  const raw = event.node.req.url
  if (!raw) return

  const [path, query] = raw.split('?')

  if (path === '/' || !path.endsWith('/')) return
  if (path.startsWith('/api/')) return
  if (/\.[a-zA-Z0-9]+$/.test(path)) return

  const cleanPath = path.slice(0, -1)
  const target = query ? `${cleanPath}?${query}` : cleanPath
  return sendRedirect(event, target, 301)
})

export function normalizeBaseUrl(input: string): string {
  const url = new URL(input)

  if (!isHttpUrl(url)) {
    throw new Error('Only http and https URLs are supported.')
  }

  url.hash = ''
  url.search = ''
  url.username = ''
  url.password = ''
  url.pathname = normalizePath(url.pathname)

  return url.toString()
}

export function normalizeRequestUrl(input: string): URL {
  const url = new URL(input)

  if (!isHttpUrl(url)) {
    throw new Error('Only http and https URLs are supported.')
  }

  url.hash = ''
  url.username = ''
  url.password = ''
  url.pathname = normalizePath(url.pathname)

  return url
}

export function computeMatchScore(baseUrl: string, requestUrl: URL): number | null {
  const base = new URL(baseUrl)

  if (base.protocol !== requestUrl.protocol) {
    return null
  }

  if (base.hostname !== requestUrl.hostname) {
    return null
  }

  if (normalizedPort(base) !== normalizedPort(requestUrl)) {
    return null
  }

  if (!pathMatches(base.pathname, requestUrl.pathname)) {
    return null
  }

  return base.pathname.length
}

function pathMatches(basePath: string, requestPath: string): boolean {
  if (basePath === '/') {
    return true
  }

  if (requestPath === basePath) {
    return true
  }

  return requestPath.startsWith(`${basePath}/`)
}

function normalizedPort(url: URL): string {
  if (url.port) {
    return url.port
  }

  return url.protocol === 'https:' ? '443' : '80'
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }

  const trimmed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return trimmed || '/'
}

function isHttpUrl(url: URL): boolean {
  return url.protocol === 'http:' || url.protocol === 'https:'
}

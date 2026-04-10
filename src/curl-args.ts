const SHORT_FLAGS_WITH_VALUE = new Set([
  '-A',
  '-b',
  '-c',
  '-d',
  '-e',
  '-E',
  '-F',
  '-H',
  '-I',
  '-m',
  '-o',
  '-p',
  '-u',
  '-x',
  '-X',
])

const LONG_FLAGS_WITH_VALUE = new Set([
  '--abstract-unix-socket',
  '--aws-sigv4',
  '--cacert',
  '--capath',
  '--cert',
  '--cert-type',
  '--ciphers',
  '--config',
  '--connect-timeout',
  '--cookie',
  '--cookie-jar',
  '--data',
  '--data-ascii',
  '--data-binary',
  '--data-raw',
  '--data-urlencode',
  '--dns-interface',
  '--dns-ipv4-addr',
  '--dns-ipv6-addr',
  '--dump-header',
  '--etag-save',
  '--expect100-timeout',
  '--form',
  '--form-string',
  '--header',
  '--http1.0',
  '--http1.1',
  '--http2-prior-knowledge',
  '--interface',
  '--json',
  '--key',
  '--key-type',
  '--limit-rate',
  '--max-time',
  '--output',
  '--proxy',
  '--proxy-header',
  '--proxy-user',
  '--range',
  '--referer',
  '--request',
  '--resolve',
  '--retry',
  '--retry-all-errors',
  '--retry-delay',
  '--retry-max-time',
  '--stderr',
  '--trace',
  '--trace-ascii',
  '--unix-socket',
  '--url',
  '--user',
  '--user-agent',
])

export type ParsedCurlArgs = {
  requestUrl: string | null
  userProvidedAuthorization: boolean
  verbose: boolean
}

export function parseCurlArgs(args: string[]): ParsedCurlArgs {
  let requestUrl: string | null = null
  let userProvidedAuthorization = false
  let verbose = false

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '-v' || arg === '--verbose') {
      verbose = true
      continue
    }

    if (arg === '-H' || arg === '--header') {
      const header = args[index + 1]
      if (header && isAuthorizationHeader(header)) {
        userProvidedAuthorization = true
      }
      index += 1
      continue
    }

    if (arg.startsWith('--header=')) {
      const header = arg.slice('--header='.length)
      if (isAuthorizationHeader(header)) {
        userProvidedAuthorization = true
      }
      continue
    }

    if (arg === '--url') {
      requestUrl = args[index + 1] ?? null
      index += 1
      continue
    }

    if (arg.startsWith('--url=')) {
      requestUrl = arg.slice('--url='.length)
      continue
    }

    if (LONG_FLAGS_WITH_VALUE.has(arg) || SHORT_FLAGS_WITH_VALUE.has(arg)) {
      index += 1
      continue
    }

    if (arg.startsWith('--')) {
      continue
    }

    if (arg.startsWith('-') && arg.length > 2 && SHORT_FLAGS_WITH_VALUE.has(arg.slice(0, 2))) {
      continue
    }

    if (looksLikeUrl(arg)) {
      requestUrl = arg
    }
  }

  return {
    requestUrl,
    userProvidedAuthorization,
    verbose,
  }
}

function isAuthorizationHeader(value: string): boolean {
  return value.trimStart().toLowerCase().startsWith('authorization:')
}

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

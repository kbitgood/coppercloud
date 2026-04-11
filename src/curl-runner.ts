import { spawn } from 'node:child_process'

import { loadIndex } from './index-store'
import { findBestMatch } from './match'
import { readSecret } from './secret-store'
import { parseCurlArgs } from './curl-args'

type CurlRunResult = {
  code: number
}

export async function runCurl(args: string[]): Promise<CurlRunResult> {
  const passthroughOnly = shouldPassthroughDirectly(args)
  const parsed = parseCurlArgs(args)

  if (passthroughOnly || !parsed.requestUrl) {
    return spawnCurl(args)
  }

  const entries = (await loadIndex()).entries
  const match = findBestMatch(entries, parsed.requestUrl)

  if (!match) {
    if (parsed.verbose) {
      process.stderr.write('[coppercloud] no matching API key found\n')
    }
    return spawnCurl(args)
  }

  if (parsed.userProvidedAuthorization) {
    if (parsed.verbose) {
      process.stderr.write(`[coppercloud] matched ${match.entry.baseUrl}; using caller-provided Authorization header\n`)
    }
    return spawnCurl(args)
  }

  const secret = readSecret(match.entry.id)
  if (!secret) {
    if (parsed.verbose) {
      process.stderr.write(`[coppercloud] matched ${match.entry.baseUrl}; key missing from secure storage\n`)
    }
    return spawnCurl(args)
  }

  if (parsed.verbose) {
    process.stderr.write(`[coppercloud] matched ${match.entry.baseUrl}; injecting Bearer authorization\n`)
  }

  return spawnCurl(args, {
    injectedHeader: `Authorization: Bearer ${secret}`,
    redactions: [secret],
  })
}

function shouldPassthroughDirectly(args: string[]): boolean {
  return args.includes('--help') || args.includes('--version') || args.includes('-V')
}

async function spawnCurl(
  args: string[],
  options?: {
    injectedHeader: string
    redactions: string[]
  },
): Promise<CurlRunResult> {
  if (!options) {
    const proc = spawn('curl', args, {
      stdio: 'inherit',
    })

    return waitForExit(proc)
  }

  const proc = spawn('curl', ['--config', '-', ...args], {
    stdio: ['pipe', 'inherit', 'pipe'],
  })

  proc.stdin?.end(buildCurlConfig(options.injectedHeader))

  const redactionTask = pipeRedacted(proc.stderr, process.stderr, options.redactions)
  const { code } = await waitForExit(proc)
  await redactionTask
  return { code }
}

function buildCurlConfig(header: string): string {
  return `header = ${JSON.stringify(header)}\n`
}

async function pipeRedacted(
  input: NodeJS.ReadableStream | null,
  output: NodeJS.WritableStream,
  redactions: string[],
): Promise<void> {
  if (!input) {
    return
  }

  let pending = ''

  for await (const chunk of input) {
    pending += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk)
    const lines = pending.split('\n')
    pending = lines.pop() ?? ''

    for (const line of lines) {
      output.write(redactText(line, redactions) + '\n')
    }
  }

  if (pending) {
    output.write(redactText(pending, redactions))
  }
}

function waitForExit(proc: ReturnType<typeof spawn>): Promise<CurlRunResult> {
  return new Promise((resolve, reject) => {
    proc.once('error', reject)
    proc.once('close', (code) => {
      resolve({ code: code ?? 1 })
    })
  })
}

function redactText(text: string, redactions: string[]): string {
  let result = text

  for (const secret of redactions) {
    result = result.split(secret).join('[REDACTED]')
  }

  return result
}

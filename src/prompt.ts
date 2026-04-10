import readline from 'node:readline/promises'

export async function promptForSecret(label = 'Enter API key'): Promise<string> {
  const stdin = process.stdin
  const stdout = process.stdout

  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('Interactive secret entry requires a TTY. Use --from-stdin instead.')
  }

  stdout.write(`${label}: `)
  stdin.resume()
  stdin.setRawMode?.(true)
  stdin.setEncoding('utf8')

  let secret = ''

  return await new Promise<string>((resolve, reject) => {
    const cleanup = () => {
      stdin.setRawMode?.(false)
      stdin.pause()
      stdin.removeListener('data', onData)
    }

    const onData = (chunk: string | Buffer) => {
      const value = String(chunk)

      for (const character of value) {
        if (character === '\u0003') {
          cleanup()
          stdout.write('\n')
          reject(new Error('Aborted by user.'))
          return
        }

        if (character === '\r' || character === '\n') {
          cleanup()
          stdout.write('\n')
          resolve(secret)
          return
        }

        if (character === '\u007f') {
          secret = secret.slice(0, -1)
          continue
        }

        secret += character
      }
    }

    stdin.on('data', onData)
  })
}

export async function readSecretFromStdin(): Promise<string> {
  const chunks: Uint8Array[] = []

  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  const secret = Buffer.concat(chunks).toString('utf8').trim()

  if (!secret) {
    throw new Error('No API key was provided on stdin.')
  }

  return secret
}

export async function promptForSelection(items: string[], label: string): Promise<number> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Interactive selection requires a TTY.')
  }

  if (items.length === 0) {
    throw new Error('No entries found.')
  }

  process.stdout.write(`${label}\n`)
  items.forEach((item, index) => {
    process.stdout.write(`  ${index + 1}. ${item}\n`)
  })

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    const answer = await rl.question('Choose an entry number: ')
    const parsed = Number.parseInt(answer.trim(), 10)

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > items.length) {
      throw new Error('Invalid selection.')
    }

    return parsed - 1
  } finally {
    rl.close()
  }
}

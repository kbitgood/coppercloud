import { deleteSecret, saveSecret } from './secret-store'
import { loadIndex, removeEntry, upsertEntry } from './index-store'
import { promptForSecret, promptForSelection, readSecretFromStdin } from './prompt'
import { CliUsageError, isCommandHelpRequest } from './help'
import { normalizeBaseUrl } from './url'
import { runCurl } from './curl-runner'

export async function handleAdd(args: string[]): Promise<number> {
  if (isCommandHelpRequest(args)) {
    return 0
  }

  const fromStdin = args.includes('--from-stdin')
  const positionalArgs = args.filter((arg) => arg !== '--from-stdin')
  const baseUrl = positionalArgs[0]

  if (!baseUrl || positionalArgs.length !== 1) {
    throw new CliUsageError('Expected exactly one <base-url>.', 'add')
  }

  const normalizedUrl = normalizeBaseUrl(baseUrl)
  const secret = fromStdin ? await readSecretFromStdin() : await promptForSecret()

  if (!secret) {
    throw new Error('API key cannot be empty.')
  }

  const entry = await upsertEntry(normalizedUrl)
  saveSecret(entry.id, secret)

  process.stdout.write(`Saved API key for ${entry.baseUrl}\n`)
  return 0
}

export async function handleLs(args: string[] = []): Promise<number> {
  if (isCommandHelpRequest(args)) {
    return 0
  }

  const entries = (await loadIndex()).entries

  if (entries.length === 0) {
    process.stdout.write('No saved API keys.\n')
    return 0
  }

  for (const entry of entries) {
    process.stdout.write(`${entry.baseUrl}\n`)
  }

  return 0
}

export async function handleRm(args: string[] = []): Promise<number> {
  if (isCommandHelpRequest(args)) {
    return 0
  }

  const entries = (await loadIndex()).entries

  if (entries.length === 0) {
    process.stdout.write('No saved API keys.\n')
    return 0
  }

  const selection = await promptForSelection(
    entries.map((entry) => entry.baseUrl),
    'Saved API base URLs:',
  )

  const entry = entries[selection]
  deleteSecret(entry.id)
  await removeEntry(entry.id)
  process.stdout.write(`Removed API key for ${entry.baseUrl}\n`)
  return 0
}

export async function handleCurl(args: string[]): Promise<number> {
  if (isCommandHelpRequest(args)) {
    return 0
  }

  const result = await runCurl(args)
  return result.code
}

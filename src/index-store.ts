import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

import { INDEX_FILE_NAME } from './constants'
import { getDataDirectory } from './platform'
import type { IndexFile, StoredEntry } from './types'

const EMPTY_INDEX: IndexFile = {
  version: 1,
  entries: [],
}

export async function loadIndex(): Promise<IndexFile> {
  const filePath = getIndexPath()

  try {
    const raw = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as IndexFile
    return {
      version: 1,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return structuredClone(EMPTY_INDEX)
    }

    throw error
  }
}

export async function saveIndex(index: IndexFile): Promise<void> {
  const dataDir = getDataDirectory()
  await mkdir(dataDir, { recursive: true })
  const filePath = getIndexPath()
  await writeFile(filePath, JSON.stringify(index, null, 2) + '\n', {
    encoding: 'utf8',
    mode: 0o600,
  })
}

export function createEntry(baseUrl: string): StoredEntry {
  const timestamp = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    baseUrl,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export async function upsertEntry(baseUrl: string): Promise<StoredEntry> {
  const index = await loadIndex()
  const existing = index.entries.find((entry) => entry.baseUrl === baseUrl)

  if (existing) {
    existing.updatedAt = new Date().toISOString()
    await saveIndex(index)
    return existing
  }

  const entry = createEntry(baseUrl)
  index.entries.push(entry)
  index.entries.sort((left, right) => left.baseUrl.localeCompare(right.baseUrl))
  await saveIndex(index)
  return entry
}

export async function removeEntry(entryId: string): Promise<StoredEntry | null> {
  const index = await loadIndex()
  const indexPosition = index.entries.findIndex((entry) => entry.id === entryId)

  if (indexPosition === -1) {
    return null
  }

  const [removed] = index.entries.splice(indexPosition, 1)
  await saveIndex(index)
  return removed
}

export function getIndexPath(): string {
  return path.join(getDataDirectory(), INDEX_FILE_NAME)
}

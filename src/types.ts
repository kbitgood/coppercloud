export type StoredEntry = {
  id: string
  baseUrl: string
  createdAt: string
  updatedAt: string
}

export type IndexFile = {
  version: 1
  entries: StoredEntry[]
}

export type MatchResult = {
  entry: StoredEntry
  score: number
}

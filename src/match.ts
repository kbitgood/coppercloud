import { computeMatchScore, normalizeRequestUrl } from './url'
import type { MatchResult, StoredEntry } from './types'

export function findBestMatch(entries: StoredEntry[], requestUrlRaw: string): MatchResult | null {
  const requestUrl = normalizeRequestUrl(requestUrlRaw)

  let bestMatch: MatchResult | null = null

  for (const entry of entries) {
    const score = computeMatchScore(entry.baseUrl, requestUrl)

    if (score === null) {
      continue
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { entry, score }
    }
  }

  return bestMatch
}

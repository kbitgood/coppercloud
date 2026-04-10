import { describe, expect, test } from 'bun:test'

import { computeMatchScore, normalizeBaseUrl } from '../src/url'
import { findBestMatch } from '../src/match'

describe('normalizeBaseUrl', () => {
  test('normalizes trailing slash and strips query/hash', () => {
    expect(normalizeBaseUrl('https://example.com/api/?q=1#hash')).toBe('https://example.com/api')
  })
})

describe('computeMatchScore', () => {
  test('matches exact path and subpaths only', () => {
    const request = new URL('https://example.com/api/resource')

    expect(computeMatchScore('https://example.com/api', request)).toBe(4)
    expect(computeMatchScore('https://example.com/api2', request)).toBeNull()
  })
})

describe('findBestMatch', () => {
  test('returns the most specific matching entry', () => {
    const match = findBestMatch(
      [
        {
          id: 'one',
          baseUrl: 'https://example.com/api',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'two',
          baseUrl: 'https://example.com/api/admin',
          createdAt: '',
          updatedAt: '',
        },
      ],
      'https://example.com/api/admin/users',
    )

    expect(match?.entry.id).toBe('two')
  })
})

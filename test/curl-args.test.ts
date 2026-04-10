import { describe, expect, test } from 'bun:test'

import { parseCurlArgs } from '../src/curl-args'

describe('parseCurlArgs', () => {
  test('detects url-first invocation', () => {
    expect(parseCurlArgs(['https://example.com/api', '-X', 'POST']).requestUrl).toBe('https://example.com/api')
  })

  test('detects url-last invocation', () => {
    expect(parseCurlArgs(['-X', 'POST', 'https://example.com/api']).requestUrl).toBe('https://example.com/api')
  })

  test('detects authorization header override', () => {
    expect(parseCurlArgs(['https://example.com/api', '-H', 'Authorization: Basic abc']).userProvidedAuthorization).toBe(
      true,
    )
  })

  test('detects verbose flags', () => {
    expect(parseCurlArgs(['https://example.com/api', '--verbose']).verbose).toBe(true)
  })
})

import { Entry } from '@napi-rs/keyring'

import { KEYRING_SERVICE } from './constants'
import { getSecretServiceHelp } from './platform'

export function saveSecret(entryId: string, secret: string): void {
  try {
    new Entry(KEYRING_SERVICE, entryId).setPassword(secret)
  } catch (error) {
    throw wrapKeyringError(error)
  }
}

export function readSecret(entryId: string): string | null {
  try {
    return new Entry(KEYRING_SERVICE, entryId).getPassword()
  } catch (error) {
    throw wrapKeyringError(error)
  }
}

export function deleteSecret(entryId: string): void {
  try {
    new Entry(KEYRING_SERVICE, entryId).deletePassword()
  } catch (error) {
    throw wrapKeyringError(error)
  }
}

function wrapKeyringError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error)

  if (process.platform === 'linux') {
    return new Error(`${message} ${getSecretServiceHelp()}`.trim())
  }

  return new Error(message)
}

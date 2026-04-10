import os from 'node:os'
import path from 'node:path'

import { APP_NAME } from './constants'

export function getDataDirectory(): string {
  const home = os.homedir()

  switch (process.platform) {
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', APP_NAME)
    case 'win32': {
      const appData = process.env.APPDATA
      if (appData) {
        return path.join(appData, APP_NAME)
      }

      return path.join(home, 'AppData', 'Roaming', APP_NAME)
    }
    default: {
      const xdgConfigHome = process.env.XDG_CONFIG_HOME
      if (xdgConfigHome) {
        return path.join(xdgConfigHome, APP_NAME)
      }

      return path.join(home, '.config', APP_NAME)
    }
  }
}

export function getSecretServiceHelp(): string {
  return [
    'No supported OS credential store is available.',
    'Linux requires a working Secret Service backend such as GNOME Keyring or KWallet.',
    'Start a desktop session with Secret Service enabled, or install/configure a compatible keyring before using coppercloud.',
  ].join(' ')
}

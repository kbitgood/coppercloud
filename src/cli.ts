import { handleAdd, handleCurl, handleLs, handleRm } from './commands'

const [, , command, ...args] = process.argv

async function main(): Promise<number> {
  switch (command) {
    case 'add':
      return handleAdd(args)
    case 'curl':
      return handleCurl(args)
    case 'ls':
      return handleLs()
    case 'rm':
      return handleRm()
    case undefined:
      printUsage()
      return 1
    default:
      throw new Error(`Unknown command: ${command}`)
  }
}

function printUsage(): void {
  process.stderr.write(
    [
      'Usage:',
      '  coppercloud add <base-url> [--from-stdin]',
      '  coppercloud curl <url> [curl args...]',
      '  coppercloud ls',
      '  coppercloud rm',
    ].join('\n') + '\n',
  )
}

main()
  .then((code) => {
    process.exitCode = code
  })
  .catch((error) => {
    process.stderr.write(`coppercloud: ${(error as Error).message}\n`)
    process.exitCode = 1
  })

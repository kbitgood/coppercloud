import { handleAdd, handleCurl, handleLs, handleRm } from './commands'
import {
  CliUsageError,
  isCommandHelpRequest,
  isCommandName,
  isRootHelpRequest,
  renderCommandHelp,
  renderRootHelp,
} from './help'

type CliIo = Pick<typeof process, 'stdout' | 'stderr'>

export async function runCli(argv: string[], io: CliIo = process): Promise<number> {
  const [command, ...args] = argv

  if (command === undefined) {
    io.stderr.write(renderRootHelp())
    return 1
  }

  if (isRootHelpRequest(argv)) {
    io.stdout.write(renderRootHelp())
    return 0
  }

  if (command === 'help') {
    const target = args[0]

    if (!target) {
      io.stdout.write(renderRootHelp())
      return 0
    }

    if (!isCommandName(target)) {
      throw new CliUsageError(`Unknown command: ${target}`)
    }

    io.stdout.write(renderCommandHelp(target))
    return 0
  }

  if (isCommandName(command) && isCommandHelpRequest(args)) {
    io.stdout.write(renderCommandHelp(command))
    return 0
  }

  switch (command) {
    case 'add':
      return handleAdd(args)
    case 'curl':
      return handleCurl(args)
    case 'ls':
      return handleLs(args)
    case 'rm':
      return handleRm(args)
    default:
      throw new CliUsageError(`Unknown command: ${command}`)
  }
}

async function main(): Promise<void> {
  try {
    process.exitCode = await runCli(process.argv.slice(2))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`coppercloud: ${message}\n`)

    if (error instanceof CliUsageError) {
      process.stderr.write('\n')

      if (error.command) {
        process.stderr.write(renderCommandHelp(error.command))
      } else {
        process.stderr.write(renderRootHelp())
      }
    }

    process.exitCode = 1
  }
}

if (import.meta.main) {
  void main()
}

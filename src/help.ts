export type CommandName = 'add' | 'curl' | 'ls' | 'rm'

type CommandHelp = {
  summary: string
  usage: string[]
  description: string[]
  options?: Array<{ flags: string; description: string }>
  examples?: string[]
  notes?: string[]
}

const CLI_NAME = 'coppercloud'

const COMMAND_HELP: Record<CommandName, CommandHelp> = {
  add: {
    summary: 'Save an API key for a base URL in the native OS credential store.',
    usage: [
      'coppercloud add <base-url>',
      'coppercloud add <base-url> --from-stdin',
    ],
    description: [
      'Normalizes the base URL before saving it so trailing slashes, query strings, and URL fragments do not create duplicate entries.',
      'Prompts for the secret interactively by default. In non-interactive environments, use --from-stdin to pipe the secret in.',
    ],
    options: [
      {
        flags: '--from-stdin',
        description: 'Read the API key from standard input instead of prompting in the terminal.',
      },
      {
        flags: '-h, --help',
        description: 'Show help for the add command.',
      },
    ],
    examples: [
      'coppercloud add https://api.example.com',
      "printf '%s' \"$API_KEY\" | coppercloud add https://api.example.com --from-stdin",
      'coppercloud add https://api.example.com/v1',
    ],
    notes: [
      'The saved secret is stored in the OS credential store. The local index only stores URL metadata.',
      'A more specific path such as https://api.example.com/v1 will beat https://api.example.com when both match the same request.',
    ],
  },
  curl: {
    summary: 'Run curl and inject a Bearer token when a saved base URL matches the request.',
    usage: [
      'coppercloud curl <url> [curl args...]',
      'coppercloud curl --url <url> [curl args...]',
    ],
    description: [
      'Passes nearly all arguments through to curl unchanged.',
      'When the request URL matches a saved entry, coppercloud injects Authorization: Bearer <token> unless you already supplied your own Authorization header.',
    ],
    options: [
      {
        flags: '-h, --help',
        description: 'Show help for the curl wrapper command.',
      },
      {
        flags: '-v, --verbose',
        description: 'Preserved for curl and also enables wrapper diagnostics about matching and injection behavior.',
      },
      {
        flags: '-H, --header',
        description: 'If you provide an Authorization header, coppercloud will not inject one.',
      },
    ],
    examples: [
      'coppercloud curl https://api.example.com/v1/me',
      'coppercloud curl https://api.example.com/v1/users -X POST --json \'{"name":"Ada"}\'',
      'coppercloud curl --url https://api.example.com/v1/me --verbose',
      "coppercloud curl https://api.example.com/v1/me -H 'Authorization: Basic abc123'",
    ],
    notes: [
      'Use plain curl --help to inspect curl-specific help text. coppercloud curl --help documents the wrapper behavior.',
      'If no saved key matches, the request is forwarded to curl without modification.',
    ],
  },
  ls: {
    summary: 'List saved base URLs that currently have an index entry.',
    usage: ['coppercloud ls'],
    description: [
      'Prints the normalized base URLs stored in the local index.',
      'Secrets are never printed.',
    ],
    options: [
      {
        flags: '-h, --help',
        description: 'Show help for the ls command.',
      },
    ],
    examples: [
      'coppercloud ls',
    ],
  },
  rm: {
    summary: 'Remove a saved API key and its URL mapping.',
    usage: ['coppercloud rm'],
    description: [
      'Shows an interactive numbered list of saved base URLs and asks you which one to remove.',
      'Deletes both the secure-store secret and the local index entry.',
    ],
    options: [
      {
        flags: '-h, --help',
        description: 'Show help for the rm command.',
      },
    ],
    examples: [
      'coppercloud rm',
    ],
    notes: [
      'This command currently requires an interactive terminal.',
    ],
  },
}

export class CliUsageError extends Error {
  command?: CommandName

  constructor(message: string, command?: CommandName) {
    super(message)
    this.name = 'CliUsageError'
    this.command = command
  }
}

export function isHelpFlag(value: string): boolean {
  return value === '--help' || value === '-h'
}

export function isRootHelpRequest(args: string[]): boolean {
  return args.length > 0 && args.every(isHelpFlag)
}

export function isCommandHelpRequest(args: string[]): boolean {
  return args.some(isHelpFlag)
}

export function isCommandName(value: string): value is CommandName {
  return value in COMMAND_HELP
}

export function renderRootHelp(): string {
  const lines = [
    'coppercloud',
    '',
    'Store API keys in the native OS credential store and inject them into matching curl requests.',
    '',
    'Usage:',
    `  ${CLI_NAME} <command> [options]`,
    `  ${CLI_NAME} help [command]`,
    '',
    'Commands:',
    ...Object.entries(COMMAND_HELP).map(([name, help]) => `  ${name.padEnd(4, ' ')} ${help.summary}`),
    '',
    'Global options:',
    '  -h, --help  Show help for the CLI or a specific command.',
    '',
    'Examples:',
    '  coppercloud add https://api.example.com',
    '  coppercloud curl https://api.example.com/v1/me --verbose',
    '  coppercloud help curl',
  ]

  return lines.join('\n') + '\n'
}

export function renderCommandHelp(command: CommandName): string {
  const help = COMMAND_HELP[command]
  const lines = [
    `${CLI_NAME} ${command}`,
    '',
    help.summary,
    '',
    'Usage:',
    ...help.usage.map((line) => `  ${line}`),
  ]

  if (help.description.length > 0) {
    lines.push('', 'Description:', ...help.description.map((line) => `  ${line}`))
  }

  if (help.options && help.options.length > 0) {
    lines.push('', 'Options:', ...help.options.map((option) => `  ${option.flags.padEnd(16, ' ')} ${option.description}`))
  }

  if (help.examples && help.examples.length > 0) {
    lines.push('', 'Examples:', ...help.examples.map((line) => `  ${line}`))
  }

  if (help.notes && help.notes.length > 0) {
    lines.push('', 'Notes:', ...help.notes.map((line) => `  ${line}`))
  }

  return lines.join('\n') + '\n'
}

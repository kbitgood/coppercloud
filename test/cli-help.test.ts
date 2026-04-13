import { describe, expect, test } from 'bun:test'

import { runCli } from '../src/cli'

function createBuffer() {
  let value = ''

  return {
    write(chunk: string) {
      value += chunk
    },
    read() {
      return value
    },
  }
}

describe('runCli help output', () => {
  test('shows root help for --help', async () => {
    const stdout = createBuffer()
    const stderr = createBuffer()

    const code = await runCli(['--help'], { stdout, stderr })

    expect(code).toBe(0)
    expect(stdout.read()).toContain('Store API keys in the native OS credential store')
    expect(stdout.read()).toContain('coppercloud help [command]')
    expect(stderr.read()).toBe('')
  })

  test('shows subcommand help for add --help', async () => {
    const stdout = createBuffer()
    const stderr = createBuffer()

    const code = await runCli(['add', '--help'], { stdout, stderr })

    expect(code).toBe(0)
    expect(stdout.read()).toContain('coppercloud add')
    expect(stdout.read()).toContain('--from-stdin')
    expect(stdout.read()).toContain('Examples:')
    expect(stderr.read()).toBe('')
  })

  test('shows command help through help command', async () => {
    const stdout = createBuffer()
    const stderr = createBuffer()

    const code = await runCli(['help', 'curl'], { stdout, stderr })

    expect(code).toBe(0)
    expect(stdout.read()).toContain('coppercloud curl')
    expect(stdout.read()).toContain('injects Authorization: Bearer <token>')
    expect(stderr.read()).toBe('')
  })

  test('shows root help on bare invocation', async () => {
    const stdout = createBuffer()
    const stderr = createBuffer()

    const code = await runCli([], { stdout, stderr })

    expect(code).toBe(1)
    expect(stderr.read()).toContain('Usage:')
    expect(stdout.read()).toBe('')
  })
})

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

import { describe, expect, test } from 'bun:test'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(testDir, '..')
const sourceFiles = [
  'src/cli.ts',
  'src/commands.ts',
  'src/constants.ts',
  'src/curl-args.ts',
  'src/curl-runner.ts',
  'src/index-store.ts',
  'src/match.ts',
  'src/platform.ts',
  'src/prompt.ts',
  'src/secret-store.ts',
  'src/types.ts',
  'src/url.ts',
]

describe('published CLI runtime', () => {
  test('production source files do not reference the Bun runtime', async () => {
    for (const relativePath of sourceFiles) {
      const filePath = path.join(repoRoot, relativePath)
      const source = await readFile(filePath, 'utf8')

      expect(source).not.toMatch(/\bBun\b/)
    }
  })

  test('built CLI runs under Node without Bun globals', async () => {
    await runCommand('bun', ['run', 'build'])

    const builtCli = await readFile(path.join(repoRoot, 'dist/cli.js'), 'utf8')
    expect(builtCli).not.toMatch(/\bBun\b/)

    const { code, stdout, stderr } = await runCommand('node', ['./dist/cli.js', 'curl', '--version'])

    expect(code).toBe(0)
    expect(`${stdout}\n${stderr}`).toContain('curl ')
  })
})

function runCommand(command: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    proc.once('error', reject)
    proc.once('close', (code) => {
      resolve({
        code: code ?? 1,
        stdout,
        stderr,
      })
    })
  })
}

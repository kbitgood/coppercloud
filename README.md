# coppercloud

`coppercloud` is a CLI for securely wrapping `curl` with API key injection from the operating system's native credential store.

The goal is to let people and AI agents call web APIs without storing API keys in `.env` files or plaintext config files, and without needing the caller to manually handle secrets for every request.

## What It Does

- Stores API keys in the OS credential store
- Matches saved keys to request base URLs and subpaths
- Wraps `curl` and injects `Authorization: Bearer ...` when a matching key exists
- Avoids printing saved secrets in normal command output

## Commands

What exists today:

- `coppercloud add <base-url> [--from-stdin]`
- `coppercloud curl <url> [curl args...]`
- `coppercloud ls`
- `coppercloud rm`

## Why It Exists

`coppercloud` is being built to reduce secret exposure when working with web APIs locally, especially in workflows that involve AI agents. The intent is to keep secrets on the user's machine, inside native secure storage, while still making authenticated API calls easy.

## Installation

You can install `coppercloud` globally with any major JavaScript package manager:

```bash
npm install -g coppercloud
pnpm add -g coppercloud
bun install -g coppercloud
```

## Runtime Requirements

- Node.js 18 or newer
- `curl` available on your `PATH`
- A supported OS credential store

`coppercloud` uses the operating system's native secure secret storage through `@napi-rs/keyring`.

- macOS: Keychain Access
- Linux: Secret Service compatible keyring
- Windows: Credential Manager

If the underlying secure storage service is unavailable, `coppercloud` will surface a platform-specific error message.

## First Run

Save an API key:

```bash
coppercloud add https://api.example.com
```

Or read the secret from stdin:

```bash
printf '%s' "$API_KEY" | coppercloud add https://api.example.com --from-stdin
```

Then make a request through the wrapper:

```bash
coppercloud curl https://api.example.com/v1/me
```

List saved URL mappings:

```bash
coppercloud ls
```

Remove a saved key:

```bash
coppercloud rm
```

## Security Notes

- API keys are stored in the OS credential store, not in a `.env` file.
- `coppercloud` keeps a local index of saved base URLs so it can match requests to stored secrets.
- The local index contains request base URLs and entry metadata, but not the secret values themselves.
- Normal CLI output avoids printing stored secrets.

## Development

This repository uses Bun for development.

```bash
bun install
bun test
bun run build
bun run ./src/cli.ts
```

## Release Workflow

Publishing is handled through the npm registry and a GitHub Actions tag workflow.

1. Ensure your npm account is verified and has 2FA enabled.
2. Configure npm trusted publishing for this repository and the `.github/workflows/publish.yml` workflow.
3. If npm requires the package to exist before trusted publishing can be attached, do one bootstrap publish, switch the package to trusted publishing immediately after, and revoke the bootstrap token.
4. Bump the package version in `package.json`.
5. Create and push a matching git tag such as `v0.1.0`.
6. GitHub Actions will run tests, build the CLI, check the publish tarball, and publish to npm.

# coppercloud

`coppercloud` is a work-in-progress CLI for securely wrapping `curl` with API key injection from the operating system's native credential store.

The goal is to let people and AI agents call web APIs without storing API keys in `.env` files or plaintext config files, and without needing the caller to manually handle secrets for every request.

## What It Does

- Stores API keys in the OS credential store
- Matches saved keys to request base URLs and subpaths
- Wraps `curl` and injects `Authorization: Bearer ...` when a matching key exists
- Avoids printing saved secrets in normal command output

## Current Status

This project is an early MVP and is still under active development.

What exists today:

- `coppercloud add <base-url> [--from-stdin]`
- `coppercloud curl <url> [curl args...]`
- `coppercloud ls`
- `coppercloud rm`

What is still evolving:

- command ergonomics
- platform hardening
- broader test coverage
- future interactive management UI

## Why It Exists

`coppercloud` is being built to reduce secret exposure when working with web APIs locally, especially in workflows that involve AI agents. The intent is to keep secrets on the user's machine, inside native secure storage, while still making authenticated API calls easy.

## Built With AI

This project was built with the help of AI and is being developed in an AI-assisted workflow.

## Development

This repository uses Bun.

```bash
bun install
bun test
bun run ./src/cli.ts
```

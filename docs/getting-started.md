# Getting started

This guide gets `coppercloud` installed, saves a key, and sends the first authenticated request.

## Install

```bash
npm install -g coppercloud
```

You can also use `pnpm` or `bun`:

```bash
pnpm add -g coppercloud
bun install -g coppercloud
```

## Check the CLI help

The CLI is designed to be self-documenting:

```bash
coppercloud --help
coppercloud add --help
coppercloud curl --help
```

If you prefer a dedicated help command:

```bash
coppercloud help curl
```

## Save an API key

Interactive entry:

```bash
coppercloud add https://api.example.com
```

Non-interactive entry from standard input:

```bash
printf '%s' "$API_KEY" | coppercloud add https://api.example.com --from-stdin
```

The saved secret goes into the operating system credential store. The CLI keeps a separate local index of normalized base URLs so it can decide which secret to use for a request.

## Make a request

```bash
coppercloud curl https://api.example.com/v1/me
```

Anything after the URL is passed through to `curl`:

```bash
coppercloud curl https://api.example.com/v1/users -X POST --json '{"name":"Ada"}'
```

## Inspect what is saved

```bash
coppercloud ls
```

Example output:

```text
https://api.example.com
https://api.example.com/v1/admin
```

## Remove a saved key

```bash
coppercloud rm
```

`rm` opens an interactive picker so you can choose which saved entry to delete.

## How matching works

- Protocol must match
- Hostname must match
- Port must match after normalization
- Path must match exactly or as a parent prefix
- The longest matching path wins

That means `https://api.example.com/v1/admin` will be chosen ahead of `https://api.example.com/v1` for a request like `https://api.example.com/v1/admin/users`.

## Troubleshooting

If `add` or `rm` fails in a script or CI job, check whether the command needs a TTY. `add --from-stdin` is the non-interactive path for secret entry. `rm` is currently interactive only.

If a request is not authenticated, rerun it with `--verbose`:

```bash
coppercloud curl https://api.example.com/v1/me --verbose
```

That will surface wrapper diagnostics such as whether a key matched and whether an `Authorization` header was injected.

# Command reference

This page mirrors the built-in `--help` output and adds a little more context around behavior and examples.

## `coppercloud`

Show root help:

```bash
coppercloud --help
```

General usage:

```text
coppercloud <command> [options]
coppercloud help [command]
```

Available commands:

- `add`: save an API key for a base URL
- `curl`: run `curl` with optional key injection
- `ls`: list saved base URLs
- `rm`: remove a saved API key and mapping

## `coppercloud add`

Usage:

```text
coppercloud add <base-url>
coppercloud add <base-url> --from-stdin
```

Options:

- `--from-stdin`: read the API key from stdin instead of prompting
- `-h, --help`: show help for the command

Examples:

```bash
coppercloud add https://api.example.com
printf '%s' "$API_KEY" | coppercloud add https://api.example.com --from-stdin
coppercloud add https://api.example.com/v1
```

Behavior notes:

- The base URL is normalized before storage.
- Query strings and fragments are removed.
- A trailing slash is removed unless the path is just `/`.
- The command expects exactly one positional URL.

## `coppercloud curl`

Usage:

```text
coppercloud curl <url> [curl args...]
coppercloud curl --url <url> [curl args...]
```

Options and relevant pass-through flags:

- `-h, --help`: show wrapper help
- `-v, --verbose`: preserved for `curl` and used by `coppercloud` to print matching diagnostics
- `-H, --header`: if you provide `Authorization: ...`, `coppercloud` will not inject one

Examples:

```bash
coppercloud curl https://api.example.com/v1/me
coppercloud curl https://api.example.com/v1/users -X POST --json '{"name":"Ada"}'
coppercloud curl --url https://api.example.com/v1/me --verbose
coppercloud curl https://api.example.com/v1/me -H 'Authorization: Basic abc123'
```

Behavior notes:

- If a saved key matches, `coppercloud` injects `Authorization: Bearer <token>`.
- If no key matches, the request is forwarded to `curl` unchanged.
- If you supplied your own `Authorization` header, `coppercloud` respects it.
- If the secure-store secret is missing for an indexed entry, the request still runs and `--verbose` will explain why no injection happened.

To view native `curl` help, run:

```bash
curl --help
```

## `coppercloud ls`

Usage:

```text
coppercloud ls
```

Examples:

```bash
coppercloud ls
```

Behavior notes:

- Prints normalized base URLs from the local index.
- Does not print secrets.

## `coppercloud rm`

Usage:

```text
coppercloud rm
```

Examples:

```bash
coppercloud rm
```

Behavior notes:

- Presents an interactive numbered list of saved base URLs.
- Removes both the secure-store secret and the local index entry.
- Currently requires a TTY.

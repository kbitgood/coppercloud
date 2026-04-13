# Examples

This page focuses on realistic command lines you can copy and adapt.

## Save one key for a whole API host

```bash
coppercloud add https://api.example.com
coppercloud curl https://api.example.com/v1/me
```

Use this when one Bearer token should work across the entire API.

## Save a more specific key for an admin subpath

```bash
coppercloud add https://api.example.com/v1
coppercloud add https://api.example.com/v1/admin
```

Requests under `/v1/admin` will prefer the more specific entry:

```bash
coppercloud curl https://api.example.com/v1/admin/users
```

## Pipe secrets from a secret manager or shell variable

```bash
printf '%s' "$API_KEY" | coppercloud add https://api.example.com --from-stdin
```

This is the best fit for scripts and automation because it avoids an interactive prompt.

## Send JSON with `curl`

```bash
coppercloud curl https://api.example.com/v1/users \
  -X POST \
  --json '{"name":"Ada","role":"admin"}'
```

## Keep a custom Authorization header

```bash
coppercloud curl https://api.example.com/v1/me \
  -H 'Authorization: Basic abc123'
```

When you pass your own `Authorization` header, `coppercloud` leaves it alone.

## Debug matching with verbose output

```bash
coppercloud curl https://api.example.com/v1/me --verbose
```

Useful when you want to know whether:

- a saved base URL matched the request
- the wrapper injected a token
- the request fell back to plain `curl`

## List current mappings before cleanup

```bash
coppercloud ls
coppercloud rm
```

This is a simple review-and-remove workflow when you rotate or retire keys.

## Use in shell scripts

```bash
#!/usr/bin/env bash
set -euo pipefail

printf '%s' "$API_KEY" | coppercloud add https://api.example.com --from-stdin
coppercloud curl https://api.example.com/v1/health --fail --silent --show-error
```

For non-interactive scripts:

- prefer `add --from-stdin`
- keep `curl` flags explicit
- use `--verbose` only when you need diagnostics

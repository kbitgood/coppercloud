# AI agents and automation

`coppercloud` is a good fit for agent workflows because it lets the caller make authenticated API requests without storing long-lived secrets in prompt text, `.env` files, or checked-in config.

## Why this matters

In agent-driven workflows, secrets often leak through:

- copied shell history
- generated config files
- debug output
- prompt transcripts

`coppercloud` reduces that surface area by keeping the token in the OS credential store and injecting it only at request time.

## Recommended workflow

1. Provision the API key outside the prompt when possible.
2. Pipe it to `coppercloud add ... --from-stdin`.
3. Let the agent use `coppercloud curl ...` for requests.
4. Use `coppercloud ls` for visible metadata only.
5. Remove stale credentials with `coppercloud rm`.

## Agent-friendly command patterns

Prefer explicit, copyable commands:

```bash
printf '%s' "$GITHUB_TOKEN" | coppercloud add https://api.github.com --from-stdin
coppercloud curl https://api.github.com/user --verbose
```

Prefer examples with concrete URLs and flags over placeholder-heavy pseudo-code. Agents perform better when docs show the exact command shape they should emit.

## Writing docs for humans and agents

When documenting an npm CLI in 2026, the docs should work well for both people and LLM-based tools. The practical checklist is:

- Keep `--help` complete enough that the next action is obvious.
- Use stable command shapes and descriptive flag names.
- Put runnable examples close to every command.
- Explain edge cases like precedence, matching, and non-interactive behavior.
- Prefer plain Markdown with short sections and copyable code fences.
- Avoid hiding essential behavior only inside prose paragraphs.

## Good prompts for agents

Instead of:

```text
Call the example API with the saved key.
```

Use:

```text
Run `coppercloud curl https://api.example.com/v1/me --verbose` and report whether the wrapper injected an Authorization header.
```

Specific commands are easier for agents to execute correctly and easier for humans to audit afterward.

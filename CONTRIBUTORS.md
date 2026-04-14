# Contributors — ditto CLI

## Original author

- colinlaptop (the user), 2026-04-13.
- Implemented by Claude (Opus 4.6 session) from a detailed written plan.

## Purpose

File plumbing for the companion skill at `~/.claude/skills/ditto/`. The skill
does the human-facing authoring; this CLI does all the side-effectful work:
detect the installed Claude Code, fetch/cache the matching tweakcc prompt
catalog, parse variant JSONs, diff / apply / verify against `cli.js`, and
track state. Recovery is done by reinstalling the current version via
`npm install -g @anthropic-ai/claude-code@<version>` — no local backup files.

## Key design decisions

- **Bun runtime, Node.js verify.** Ditto itself runs under Bun (`#!/usr/bin/env
  bun`). The verify step (`node cli.js --version`) shells out to Node because
  that's what end users actually run Claude Code under.
- **Per-piece granularity, not per-prompt.** Variants target
  `{promptId, pieceIndex, originalText, newText}` — a specific substring in a
  specific piece of a specific prompt. Makes edits survivable across minor
  Claude Code version drift.
- **Ported apply flow from a predecessor patch script.** Reuses the proven
  split/join replacement, "already applied" idempotency check, and post-apply
  `--version` sanity check.
- **Fetch with cache.** `getPromptSet(version)` checks
  `~/.ditto/cache/prompts/` first, then fetches from tweakcc on GitHub raw.
  Cache survives offline use.
- **Strict-fail on version mismatch.** If tweakcc has no matching
  `prompts-{version}.json`, `ditto check` exits non-zero with an actionable
  message (latest tweakcc version + downgrade command). The skill relays this
  and stops.
- **`smart` ships as a committed default.** `variants/smart.json` is checked
  in as a shipped artifact — the original 13 opinions (quality > speed,
  judgment > rules) mapped to `{promptId, pieceIndex}` edits for the pinned
  tweakcc version. Users get it for free via `ditto apply smart`; it evolves
  through the ditto skill or hand edits to the JSON.

## Layout

- `bin/ditto` — `#!/usr/bin/env bun` shim to `src/cli.ts`.
- `src/` — one module per concern (detect, fetch, prompts, patch, variants,
  diff, verify, reinstall, state, paths, types, cli).
- `variants/` — user's named variant JSONs (ships with `smart.json` as a
  committed default).
- `cache/prompts/` — cached `prompts-{version}.json` files.
- `state.json` — tracks currently-applied variant.

## Recovery model

No backup files. `ditto reinstall` shells out to `npm install -g
@anthropic-ai/claude-code@<current-version>` to get a pristine `cli.js`.
`ditto apply` also reinstalls implicitly when switching variants and as
the recovery path when post-apply `--version` verification fails. Manual
unsaved edits to `cli.js` are intentionally not preserved — if you want
to keep a change, save it as a variant first.

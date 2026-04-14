# ditto

A library of Claude Code personalities, authored by talking to Claude.

Say *"make claude push back harder"* inside Claude Code — a skill walks
you through surgically rewriting the handful of system prompts that
matter and saves the result as a named variant you can apply, swap,
and reset.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/cc13engineering-sketch/ditto/main/install.sh | bash
```

Installs the CLI to `~/.ditto/` and the authoring skill to
`~/.claude/skills/ditto/`. See [INSTALL.md](INSTALL.md) for
prerequisites, manual install, updating, and uninstall.

## The flow

### 1. Author a variant — inside Claude Code

Just talk to Claude. The skill triggers on phrases like:

- *"make claude trust me more"*
- *"ditto claude to stop narrating every step"*
- *"customize claude to push back harder"*

What happens:

1. **Intake.** Runs `ditto check` to confirm your installed Claude Code
   matches a published [tweakcc](https://github.com/Piebald-AI/tweakcc)
   prompt catalog, extracts your directive, and loads the prompt list.
2. **Batched walkthrough.** Ranks candidate prompts by impact and walks
   you through them 10 at a time. For each one it proposes a surgical
   rewrite and offers four choices:
   **Accept** / **Skip** (blacklist this prompt) / **Tweak** (you supply
   replacement text, the skill polishes it) / **Submit all and finish**.
   Later batches adapt to your tweak patterns — if you consistently
   shorten rewrites, subsequent suggestions come in tighter.
3. **Finalize.** Saves your accepted edits as `variants/<name>.json`,
   previews the diff, and offers to apply.

### 2. Operate — from the shell

Once you have variants, drive them directly:

```
ditto apply trust-me-more    # swap to it
ditto list                   # see your library
ditto status                 # what's installed, what's applied
ditto reinstall              # back to pristine via npm
```

### Why split the skill and the CLI?

The **skill** does the authoring intelligence and the human
conversation. The **CLI** (`~/.ditto/bin/ditto`) does all the side
effects — detect, fetch, patch, verify, reinstall, state. The skill
shells out to `ditto save`, `ditto diff`, and `ditto apply`; nothing
ever hand-edits `cli.js`. Author with the skill; operate with the CLI.

## Shipped variants

This repo ships a few pre-authored variants in `variants/`:

- **`smart`** — quality > speed, judgment > rules, pragmatic fixes >
  narrow scope. A port of [roman01la's
  gist](https://gist.github.com/roman01la/483d1db15043018096ac3babf5688881)
  into ditto's format.
- **`disagreeable`** — licenses pushback over deference.

**Heads up: variants are version-pinned.** Every variant records the
Claude Code version it was authored against (look at
`claudeCodeVersion`). Claude Code's prompt strings drift between
releases, so a shipped variant may not line up with your installed
version. Run `ditto diff <name>` first to see what would change — if
the diff is empty or partial, the variant has drifted and should be
re-authored via the skill. Shipped variants get re-cut periodically
but there's no guarantee they track the latest CC release.

## Staging — the safe-to-modify whitelist

The tweakcc catalog ships ~280 prompts per Claude Code version, but
most are load-bearing for the harness (tool schemas, security rails,
plan-mode machinery, git safety). Variant authoring should only touch
the minority that shape tone, style, and coding philosophy.

`ditto stage [version]` prepares a per-version whitelist at
`staged/prompts-{version}.json`. The ditto skill runs the
classification (keep / prune / grey, with a walkthrough for grey
cases) and writes the file; the authoring flow hard-errors if the
staged file is missing for the current Claude Code version.

This repo ships staged sets for the CC versions it was cut against.
When you upgrade Claude Code to a version with no pre-shipped staged
set, invoke the skill with *"stage ditto for the current version"*
to build one. Existing variants keep applying regardless of the
staged set — enforcement is authoring-time only.

## The idea

**[tweakcc](https://github.com/Piebald-AI/tweakcc)** — a safe way to
patch Claude Code's system prompts (versioned prompt catalog +
patcher for the minified `cli.js`).

**[roman01la's gist](https://gist.github.com/roman01la/483d1db15043018096ac3babf5688881)**
— a handful of targeted prompt rewrites can meaningfully reshape
Claude Code's behavior.

**ditto** glues those together and generalizes: you describe the
behavior you want in plain English; a skill picks the highest-impact
prompts from tweakcc's catalog and drafts surgical rewrites; the
patcher applies them as a named variant you can apply, swap, and
reset.

## Commands

| | |
|---|---|
| `ditto check`           | detect + precheck |
| `ditto prompts`         | list the installed version's prompts |
| `ditto show <id>`       | print one full prompt |
| `ditto save <name>`     | save a variant (from `--stdin` or `--file`) |
| `ditto diff <name>`     | preview what a variant would change |
| `ditto apply <name>`    | apply it (with verify + auto-recover) |
| `ditto stage [version]` | prepare the per-version whitelist |
| `ditto reinstall`       | npm reinstall current CC to return to pristine |
| `ditto list`            | see your variants |
| `ditto status`          | what's installed, what's applied |

## Variant shape

```json
{
  "name": "trust-me-more",
  "directive": "trust me more",
  "claudeCodeVersion": "2.1.104",
  "tweakccVersion": "2.1.104",
  "modifications": [
    { "promptId": "...", "pieceIndex": 0,
      "originalText": "...", "newText": "...", "rationale": "..." }
  ]
}
```

## Layout

```
~/.ditto/
├── bin/ditto          # bun shim
├── src/               # TypeScript source (no build step)
├── variants/          # your library (+ shipped variants)
├── staged/            # per-version safe-to-modify whitelists
├── cache/prompts/     # tweakcc prompts-{version}.json
└── state.json         # which variant is applied

~/.claude/skills/ditto/  # the authoring skill
```

## Requirements

Bun (`#!/usr/bin/env bun`), Node.js for the verify step, an
`npm install -g @anthropic-ai/claude-code` that matches a tweakcc
version.

## Safety

Every apply runs `node cli.js --version` before trusting the result.
A failed verify auto-reinstalls the current version via npm. `ditto
reinstall` is the universal "get back to pristine" button — it just
runs `npm install -g @anthropic-ai/claude-code@<current-version>`.
Manual edits to `cli.js` that weren't saved as a variant are on you;
reinstall will blow them away.

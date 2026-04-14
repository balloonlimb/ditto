# ditto

A library of Claude Code personalities.

Give it a directive. Get a named variant you can apply, swap, and reset.

```
ditto apply smart            # shipped default: quality > speed, judgment > rules
ditto apply trust-me-more    # one you authored via the skill
ditto reinstall              # back to pristine (npm reinstalls current version)
```

ditto ships with a `smart` variant already committed in `variants/` —
`ditto apply smart` to try it without authoring anything.

## The idea

**[tweakcc](https://github.com/Piebald-AI/tweakcc)** — a safe way to patch
Claude Code's system prompts (versioned prompt catalog + patcher for the
minified `cli.js`).

**[roman01la's gist](https://gist.github.com/roman01la/483d1db15043018096ac3babf5688881)**
— a handful of targeted prompt rewrites can meaningfully reshape Claude
Code's behavior (his example: make it less shortcut-happy, more thorough).

**ditto** is those two glued together and generalized. You describe the
behavior you want in plain English ("trust me more", "push back harder");
a skill inside Claude Code picks the highest-impact prompts from tweakcc's
catalog and drafts surgical rewrites; the patcher applies them as a named
variant you can apply, swap, and reset.

The shipped `smart` variant **is** roman01la's gist, ported into ditto's
format with a couple of tweaks — some of the original prompt strings have
drifted in Claude Code releases since the gist was posted, so the rewrites
had to be re-aimed at the current catalog.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/cc13engineering-sketch/ditto/main/install.sh | bash
```

See [INSTALL.md](INSTALL.md) for prerequisites, manual install, updating, and uninstall.

## How it works

1. `ditto check` — confirms your installed Claude Code matches a published
   [tweakcc](https://github.com/Piebald-AI/tweakcc) prompt catalog.
2. The **ditto skill** (in Claude Code) walks you through authoring a variant:
   picks the highest-impact prompts for your directive, proposes surgical
   rewrites, saves a JSON.
3. `ditto apply <name>` — patch → `node cli.js --version` verify →
   auto-reinstall on failure.

## Commands

| | |
|---|---|
| `ditto check`            | detect + precheck |
| `ditto prompts`          | list the installed version's prompts |
| `ditto show <id>`        | print one full prompt |
| `ditto save <name>`      | save a variant (from `--stdin` or `--file`) |
| `ditto diff <name>`      | preview what a variant would change |
| `ditto apply <name>`     | apply it (with verify + auto-recover) |
| `ditto reinstall`        | npm reinstall current version to return to pristine |
| `ditto list`             | see your variants |
| `ditto status`           | what's installed, what's applied |

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
├── variants/          # your library
├── cache/prompts/     # tweakcc prompts-{version}.json
└── state.json         # which variant is applied
```

## Requirements

Bun (`#!/usr/bin/env bun`), Node.js for the verify step, an
`npm install -g @anthropic-ai/claude-code` that matches a tweakcc version.

## Safety

Every apply runs `node cli.js --version` before trusting the result. A
failed verify auto-reinstalls the current version via npm. `ditto
reinstall` is the universal "get back to pristine" button — it just runs
`npm install -g @anthropic-ai/claude-code@<current-version>`. Manual edits
to `cli.js` that weren't saved as a variant are on you; reinstall will
blow them away.

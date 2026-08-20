# repo-dossier

Point it at any repository in any language. It reads the whole thing and leaves behind a dossier that teaches you the codebase — high-level purpose down to annotated code snippets, external tool boundaries, deployment pipelines, maintainers, conventions, and a SWOT analysis — plus a guided reading itinerary and an interactive tour that walks you through the code.

Built for the way engineers actually learn a codebase: by reading all of it, in the right order.

## What's included

| Component | Path | Description |
|-----------|------|-------------|
| Agent | `agents/repo-dossier.agent.md` | Analyses a repository exhaustively and generates an 11-chapter, evidence-cited markdown dossier. Every claim is anchored to a `path:line`; anything unverifiable goes to Open Questions rather than into prose |
| Skill | `skills/repo-dossier/` | The 13-step analysis procedure, with six reference docs covering repository acquisition, 13 language ecosystems, git investigation commands, evidence standards, a SWOT detection catalogue, and chapter templates |
| Skill | `skills/codebase-tour/` | Interactive walkthrough that follows the generated reading path file by file, stopping after each stop so you can ask questions |

## The dossier

```
<repo-name>-dossier/
├── 00-index.md          summary, navigation, headline findings
├── 01-overview.md       purpose, domain vocabulary, snapshot
├── 02-architecture.md   directory map, entrypoints, layers, mermaid diagram
├── 03-execution.md      annotated code traces through every entrypoint
├── 04-data-config.md    models, persistence, caching, every env var
├── 05-integrations.md   dependencies, outbound calls, brokers, datastores
├── 06-delivery.md       build, test, CI/CD job-by-job, IaC, environments
├── 07-patterns.md       the team's actual conventions — and where they break them
├── 08-swot.md           strengths, weaknesses, opportunities, threats
├── 09-ownership.md      maintainers, per-area ownership, bus factor
└── 10-reading-path.md   the guided reading itinerary
```

Written to your current directory. The analysed repository is never modified.

## How it works

### Agent: repo-dossier

1. **Acquires** the repo — give it a URL and it clones to `~/.cache/repo-dossier/<owner>/<repo>`, or give it nothing and it analyses your current workspace
2. **Inventories** the entire tree into a coverage ledger, so exhaustiveness is checkable rather than hoped for
3. **Orients** outside-in — README, docs, ADRs, manifests — establishing the project's own vocabulary before touching code
4. **Maps** every entrypoint, module boundary, and component relationship
5. **Traces** each entrypoint hop by hop through the code with verbatim snippets, flagging every point the service crosses a boundary into an external tool
6. **Analyses** data, configuration, integrations, delivery pipelines, and git history
7. **Assesses** the team's conventions and produces an evidence-backed SWOT
8. **Guides** — writes the reading itinerary, then offers to walk it with you

### Skill: repo-dossier

The repeatable procedure behind the agent. Reference docs:

- `acquisition.md` — URL resolution, blobless cloning, private repos, monorepos, ledger exclusions
- `language-playbooks.md` — entrypoints, manifests, tests, and conventions across JS/TS, Python, Go, Java/Kotlin, C#/.NET, Ruby, Rust, PHP, C/C++, Swift, Elixir, Scala, and shell — with a generic fallback for anything unlisted
- `investigation-commands.md` — the git and `gh` commands each step runs, each annotated for blobless-clone safety
- `evidence-rules.md` — the standard that keeps output specific: citation format, snippet rules, banned hedging language, SWOT admission bars
- `pattern-catalogue.md` — detection signals for each SWOT quadrant, organised by how to find them in a repo
- `chapter-templates.md` — the markdown skeleton for every chapter

### Skill: codebase-tour

Reads `10-reading-path.md` and walks you through the code one stop at a time. Presents a file, connects it to the previous stop, shows the code that matters, flags external boundaries — then stops and waits. Supports `next`, `back`, `skip`, jumping to any sitting, "go deeper on X", "what calls this?", and "show me the tests". Each sitting closes with a checkpoint question you should now be able to answer.

## Why it stays specific

The failure mode of any codebase summariser is prose that would read identically about any repo of the same type. Three mechanisms prevent it:

- **The substitution test** — every sentence must fail to describe a different repo, or it gets deleted
- **Mandatory citation** — claims carry `path:line`; snippets are verbatim; hedging verbs (`likely`, `appears to`, `presumably`) are banned outright. Unverified observations go to Open Questions
- **SWOT admission bars** — an Opportunity must name the seam that makes it cheap; a Threat must cite a version, date, EOL, or CVE. Entries that can't meet the bar are dropped, not softened

## Working on large repositories

Exhaustive analysis is the default — no sampling, no silent scope reduction. The coverage ledger makes this survivable: each finding is appended to its chapter the moment it's written and its ledger row flipped to `covered`, so an interrupted run resumes from the first `pending` row without redoing work. Zero `pending` rows is the completion condition.

## Usage

> "Analyse https://github.com/owner/repo and write me a dossier"

> "I've inherited this repo — help me understand it"

> "Give me a dossier on this codebase"

> "Walk me through the code"

> "Continue the tour from sitting 3"

## Prerequisites

- **git** — required
- **gh CLI** (authenticated) — optional. Enriches maintainer data, release cadence, and review norms. Without it, ownership analysis falls back to git history alone and the gap is recorded rather than guessed

## License

[MIT](../../LICENSE)

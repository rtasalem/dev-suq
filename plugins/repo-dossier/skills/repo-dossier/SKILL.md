---
name: repo-dossier
description: "Exhaustively analyse any repository in any language and generate an evidence-cited markdown dossier. Use when: understanding a new codebase, onboarding onto a repo, learning how a service works end to end, documenting an inherited project, mapping architecture and execution paths, identifying external integrations and deployment pipelines, finding repo maintainers, producing a codebase SWOT, generating a guided reading path through unfamiliar code."
---

# Repository Dossier

Produce a durable, evidence-cited dossier that teaches a reader an unfamiliar codebase the way reading all of it would — but ordered, annotated, and complete. Language-agnostic: the procedure discovers the ecosystem first, then applies the right playbook.

## When to Use

- Joining a team and needing to get productive on their service
- Inheriting a repository with no living maintainer
- Evaluating a codebase before adopting, forking, or integrating with it
- Auditing how a service is deployed and what it depends on
- Building onboarding documentation that stays specific enough to be useful

## The Standard

The user's bar is **extremely specific**. Before writing any line, apply the test in [evidence-rules.md](./references/evidence-rules.md): *would this sentence read identically about a different repo of the same type?* If yes, it is too generic — either anchor it to a `path:line` and a snippet, or delete it.

## Working Discipline

Three rules govern every step. They are what make an exhaustive pass on a large repository finish rather than collapse.

1. **The ledger is the source of truth.** `.coverage.md` (written in Step 0) lists every file with a status. Work one `pending` row at a time.
2. **Append per item, not per chapter.** The moment a single execution trace, integration entry, or SWOT finding is written, append it to its chapter file and flip its ledger row to `covered`. Then discard the supporting evidence from context. An interruption should cost you one item, never a chapter.
3. **Resume from disk.** If a run is interrupted, re-read `.coverage.md` and continue from the first `pending` row. Never redo `covered` work.

## Procedure

Follow these steps in order. Each step names the chapter it emits.

Every chapter is written to the skeleton in [chapter-templates.md](./references/chapter-templates.md) — same front-matter line, same section order, same citation and snippet formatting. Consistency is what lets a reader move between chapters, and between dossiers for different repos, without relearning the layout each time.

### Step 0 — Acquire, Orient & Inventory

1. **Resolve the target** using [acquisition.md](./references/acquisition.md):
   - A URL or `owner/repo` → clone to `~/.cache/repo-dossier/<owner>/<repo>` with `git clone --filter=blob:none --single-branch`
   - No target given → analyse the current working directory
   - Confirm it is a git repository; if not, say so and continue with a note that all history-derived analysis will be unavailable

2. **Establish identity**: repo name (from the remote, else the directory name), current commit SHA, default branch, repo age from the first commit. Every chapter's front-matter carries the name, SHA, and generation date.

3. **Detect the ecosystem**: find manifests (`package.json`, `pyproject.toml`, `go.mod`, `pom.xml`, `Cargo.toml`, `*.csproj`, `Gemfile`, `composer.json`, `mix.exs`, `build.gradle`, …) and match them to a playbook in [language-playbooks.md](./references/language-playbooks.md). A repo may match several — record all of them. If nothing matches, fall back to the generic strategy at the end of that file.

4. **Create the dossier directory** `./<repo-name>-dossier/` in the invocation cwd — **not** inside the analysed repo.

5. **Walk the entire tree and write the coverage ledger** to `<repo-name>-dossier/.coverage.md`:

   ```markdown
   # Coverage Ledger — <repo> @ <sha>

   | File | Apparent role | Status | Chapter |
   |------|---------------|--------|---------|
   | `src/index.js` | HTTP entrypoint, wires router + starts server | pending | |
   | `src/db/pool.js` | Postgres connection pool | pending | |
   | `package-lock.json` | lockfile | n/a — generated | |
   ```

   Include every file except those excluded by the rules in `acquisition.md` (VCS internals, vendored dependencies, lockfiles, build output, binary assets) — each exclusion recorded as `n/a — <reason>` rather than omitted, so the ledger accounts for the whole tree.

   The role column is a one-line guess from path, name, and a quick look — not a deep read. Precision comes later; completeness is what matters here.

> The ledger is the exhaustiveness proof. At the end, zero `pending` rows means nothing was missed. It also supplies the raw material for chapter 02's directory map and chapter 10's itinerary.

### Step 1 — Outside-In → `01-overview.md`

Read the repository the way a newcomer would, before touching implementation code.

1. `README`, `docs/`, `ARCHITECTURE.md`, ADRs (`docs/adr/`, `docs/decisions/`), `CONTRIBUTING`, `CHANGELOG`, issue and PR templates, `LICENSE`
2. Manifest metadata: name, description, declared entrypoints, scripts, version
3. From these, establish the **domain vocabulary** — the nouns and verbs this codebase uses for its own concepts. Use the project's terms from here on, not your own

Write: what the service is for, the problem it solves, who consumes it, its place in a wider system, primary languages with rough proportions, repo age and activity, licence. Where the README makes a claim the code contradicts, note both — that contradiction is itself a finding, and it belongs in `08-swot.md` as a weakness.

### Step 2 — Map the Terrain → `02-architecture.md`

1. **Annotated directory map** — every significant directory with its responsibility, derived from the ledger
2. **Entrypoint inventory** — every way the process can be entered: `main`, HTTP server bootstrap, queue consumer registration, CLI command, lambda handler, scheduled job, migration runner, worker loop. Use the playbook's entrypoint conventions. Rank each by how much of the system it reaches
3. **Layer and module boundaries** — how the code separates concerns, and where the separation leaks
4. **Component diagram** — a mermaid `graph` showing internal modules and the external systems they talk to

### Step 3 — Trace Execution → `03-execution.md`

The bulk of the dossier. For **every** entrypoint from Step 2, and every distinct feature reachable from it:

1. Start at the entrypoint and follow the call chain hop by hop
2. For each significant hop, write: the file and line, what this code does, a verbatim snippet, and what it hands off to next
3. Flag every **boundary crossing** inline — the exact line where the process leaves itself for a database, HTTP call, queue, cache, filesystem, subprocess, or third-party SDK. Record these; chapters 05 and 10 both consume them
4. Note error paths and edge-case branches, not just the happy path — what happens on failure is often where the real design lives

Append each trace as you finish it. Flip the ledger rows for every file the trace covered.

### Step 4 — Data & Configuration → `04-data-config.md`

Delegate to a subagent — this chapter is self-contained.

1. **Data models**: schemas, entities, migrations, and how they evolved
2. **Persistence**: every query or ORM call, where it lives, what it touches
3. **Caching**: what is cached, keyed how, invalidated when
4. **Configuration surface**: every environment variable and config key — where it is read (`path:line`), its default, whether it is required, and what breaks without it. Present as a table
5. **Secrets**: how they are supplied and whether anything sensitive is committed

### Step 5 — External Boundary Census → `05-integrations.md`

Consumes the boundary crossings recorded in Step 3.

1. **Dependency inventory**: every direct dependency with its version, *why it is here*, and where it is used (`path:line`). A dependency you cannot locate in the source is itself a finding — flag it as potentially unused
2. **Outbound calls**: every external HTTP API, with endpoint and calling site
3. **Messaging**: brokers, queues, topics, and the publish/consume sites
4. **Datastores**: engines, connection setup, pooling
5. **Third-party SDKs and platform services**: cloud SDKs, observability, auth providers, payment processors, feature flags
6. **Inbound surface**: what calls *this* service — routes, handlers, subscriptions

### Step 6 — Delivery → `06-delivery.md`

Delegate to a subagent — this chapter is self-contained.

1. **Build**: toolchain, how an artefact is produced, containerisation
2. **Test**: frameworks, layout, what is actually covered versus what exists, how to run them
3. **CI/CD**: every workflow file, job by job — triggers, matrix, steps, gates, required checks, secrets consumed. Do not summarise a pipeline; walk it
4. **Infrastructure as code**: Terraform, CloudFormation, CDK, Helm, Kubernetes manifests, Compose — what infrastructure they declare
5. **Environments and release**: what environments exist, how a change reaches each, versioning and tagging conventions, release cadence from git tags
6. **Runtime**: how the process is started in production, health checks, scaling, observability

### Step 7 — History & Ownership → `09-ownership.md`

Delegate to a subagent — this chapter is self-contained. Commands in [investigation-commands.md](./references/investigation-commands.md); every one is annotated for blobless-clone safety.

1. `CODEOWNERS`, `MAINTAINERS`, and any governance docs
2. Overall contributor ranking, and **per-area** ownership for each significant directory
3. Recency — who is still active, and which areas have gone quiet
4. **Bus factor**: directories with a single effective owner. Name them; they feed the Threats quadrant
5. Review norms from merged PRs: approval counts, review latency, whether PRs are squashed, commit message conventions
6. Where `gh` is unavailable or unauthenticated, derive everything from git history and record the gap in Open Questions rather than guessing

### Step 8 — Patterns → `07-patterns.md`

The idioms this team actually uses, each with representative snippets. Use [pattern-catalogue.md](./references/pattern-catalogue.md) for detection signals.

Error handling, logging, dependency injection and wiring, module shape, naming conventions, async and concurrency style, validation, test style and fixtures, commit and PR conventions.

For each: state the convention, show two or three examples proving it is consistent, then note where the codebase departs from its own convention. Those departures are the most useful thing in this chapter — they tell a newcomer which parts of the code were written under different assumptions or different hands.

### Step 9 — SWOT → `08-swot.md`

Canonical grid: **internal vs. external** against **helpful vs. harmful**.

|  | Helpful | Harmful |
|---|---|---|
| **Internal** (the code) | Strengths | Weaknesses |
| **External** (deps, runtime, ecosystem, people) | Opportunities | Threats |

- **Strengths** — what it demonstrably does well. Practice named, `path:line` cited, snippet shown
- **Weaknesses** — what is wrong inside it. Snippet, `path:line`, severity rating
- **Opportunities** — improvements genuinely available. Either an external development it could exploit (name the version, and the `path:line` of the workaround it would delete) or an internal seam that makes a change cheap (name the seam). Effort estimate on each. Architectural rewrites are not opportunities — they go to Open Questions
- **Threats** — external risks: unmaintained dependencies with last release dates, EOL runtimes declared in manifests/Dockerfiles/CI matrices, deprecated third-party APIs, unpinned version ranges, vendor SDK major-version lag, bus-factor risk from Step 7. Each cites a verifiable fact (version + date, EOL date, CVE ID) or a `path:line`

Chapters 05 and 09 feed this one directly. An entry that cannot meet its evidentiary bar is **dropped, not softened**.

### Step 10 — Reading Path → `10-reading-path.md`

The headline deliverable: the guided route through the code.

1. **Where it all starts** — every entrypoint, ranked by reach, with one line on what each one governs
2. **What it leads to** — from each entrypoint, the ordered chain of files to read. Per file: *why you're reading it*, *what to notice*, *what it hands off to next*. Group so that one sitting completes one feature end to end
3. **Where it touches the outside world** — the boundary crossings from Step 3, flagged inline in the itinerary at the point the reader reaches them, naming the external tool on the other side
4. **Suggested sittings** — split into roughly 45-minute sessions, each closing with a "you now understand X" checkpoint

Order by comprehension dependency, not by directory layout: a reader should never arrive at a file needing a concept the itinerary has not yet introduced.

### Step 11 — Index → `00-index.md`

Written last, once all content exists.

Executive summary, chapter navigation with a one-line teaser each, the headline findings a newcomer most needs, coverage statistics from the ledger, and consolidated **Open Questions** gathered from every chapter.

### Step 12 — Verify and Offer the Tour

1. Confirm zero `pending` rows remain in `.coverage.md`. If any remain, return to them — the dossier is not finished
2. Confirm every chapter exists and is non-empty
3. Report the summary to the user
4. Offer the **`codebase-tour`** skill to walk the reading path interactively

**Remember**: the analysed repository is read-only. The only files written are inside `<repo-name>-dossier/`.

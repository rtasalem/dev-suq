# Pattern Catalogue

Detection signals for chapter 07 (patterns) and chapter 08 (SWOT), organised by quadrant. Every entry says **how to detect it from the repository**, because a pattern you cannot evidence is not a finding.

Nothing here is a checklist to complete. These are things worth *looking for*; report what you actually find.

---

## Strengths — internal, helpful

| Signal | How to detect |
|---|---|
| **Layering discipline** | Grep for lower-layer imports in upper layers (handlers importing the DB client directly). Absence across the whole codebase is the finding. Stronger still if a lint rule enforces it — cite the rule |
| **Consistent error handling** | Read 10+ error sites. One shape throughout (wrapped-and-rethrown, typed errors, `Result`) is a strength; cite three examples proving consistency |
| **Structured logging** | Logger takes objects not interpolated strings; correlation/request IDs threaded through; consistent levels. Cite the logger setup and two call sites |
| **Idempotency** | Dedup keys, upserts, "already processed" guards in message handlers or payment paths. Cite the guard |
| **Retry with backoff** | Retry helper with exponential/jittered delay and a cap. Cite the helper and one caller. Bare `while(true)` retry is a Weakness, not this |
| **Timeouts everywhere** | Every outbound client configures a timeout. Verify across *all* clients — one missing timeout makes this a Weakness instead |
| **Graceful shutdown** | SIGTERM/SIGINT handler that drains in-flight work and closes pools before exit. Cite the handler |
| **Config validated at boot** | Schema validation of env vars at startup that fails fast. Cite the schema |
| **Clean test seams** | Dependencies injected rather than imported directly, so tests substitute them without monkey-patching. Cite a constructor and its test |
| **Meaningful test coverage** | Not the percentage — whether the *risky* paths have tests. Pick the three scariest functions and check |
| **Migrations as code** | Versioned, ordered, reversible, in-repo. Cite the directory and a representative migration |

## Weaknesses — internal, harmful

| Signal | How to detect |
|---|---|
| **God module** | Outsized file relative to its neighbours, or one module imported by nearly everything. Cite path, size, and importer count |
| **Duplicated logic** | The same non-trivial computation in two or more places. Cite every occurrence — duplication is only convincing when you show all of it |
| **Swallowed errors** | `catch` with only a log, or an empty catch/`except: pass`/`_ = err`. Cite each; state what gets silently lost |
| **Hardcoded configuration** | Literal URLs, hosts, timeouts, credentials, magic numbers in logic. Grep for `http://`, `https://`, IPs, bare numeric constants in conditionals |
| **Missing timeouts** | Outbound calls with no deadline — the single most common production-hang cause. Check every HTTP/DB/queue client |
| **Chatty I/O in loops** | A query or request inside a loop over a collection. Classic N+1; cite the loop and the call inside it |
| **Untested risky paths** | Payment, auth, deletion, or migration code with no referencing test. Name the function and confirm no test names it |
| **Circular dependencies** | Modules importing each other, directly or transitively. Cite the cycle |
| **Dead code** | Exported symbols with no importer, unreachable branches, commented-out blocks. Confirm with a repo-wide search before claiming it |
| **Leaky abstraction** | A wrapper whose callers must know what it wraps — driver-specific errors or types escaping through the interface. Cite the leak |
| **Inconsistent async** | Callbacks, promises, and async/await mixed in one path; unawaited promises; fire-and-forget without error handling |
| **Broad exception catching** | `catch (Exception)`, `except:`, `catch {}` around large blocks — hides failures the author never considered |
| **Convention violated in-tree** | The codebase's own dominant pattern broken in specific files. Cite the convention and the departure — the most actionable weakness you can report |

## Opportunities — external and internal, helpful, forward-looking

Two admissible kinds. Each needs a named seam or a named external development, plus an effort estimate.

| Signal | How to detect |
|---|---|
| **Newer dependency version removes local code** | A workaround in the repo that upstream has since solved natively. Name the version, the release date, and the `path:line` of the workaround it deletes |
| **Existing abstraction makes a swap cheap** | An interface/port already isolating an external system. Cite the interface and its implementations — that's the seam |
| **Adjacent test harness makes coverage cheap** | Fixtures or factories already covering a shape, next to code lacking tests. Cite the harness and the uncovered function |
| **Tooling present but unused** | A linter, type checker, or CI action configured but not enforced — `continue-on-error: true`, a script never invoked, a config with no runner. Cite the config and its absence from CI |
| **Partial migration finished cheaply** | A pattern adopted in most of the codebase but not all. Cite the majority and the stragglers; effort scales with the count |
| **Feature flag already wired** | Flag infrastructure present, enabling incremental rollout of an otherwise risky change. Cite the flag system |
| **Language/runtime feature obviates a helper** | A hand-rolled utility the runtime now provides natively. Cite the helper and the built-in that replaces it |

**Rejected by rule**: anything needing an architectural rewrite, anything without a named seam, and anything that would read the same about any repo. Those belong in Open Questions or nowhere.

## Threats — external, harmful, forward-looking

Every entry needs a verifiable external fact (version + date, EOL date, CVE ID) or a `path:line`.

| Signal | How to detect |
|---|---|
| **Unmaintained dependency** | Last release long past, archived upstream, or explicitly deprecated. Name the package, the pinned version, and the last release date |
| **EOL runtime** | Language/runtime version in `engines`, `requires-python`, `<TargetFramework>`, `rust-version`, Dockerfile base image, or CI matrix, checked against its support end date. Cite the declaration |
| **EOL base image** | Dockerfile `FROM` on an unsupported OS or runtime tag. Cite the line |
| **Deprecated third-party API** | Calls to endpoints or SDK methods the vendor has announced sunset for. Cite the call site |
| **Unpinned version ranges** | `^`, `~`, `>=`, or bare names in a *service* (libraries legitimately differ) — builds are not reproducible. Cite the manifest lines |
| **Vendor SDK major-version lag** | Several majors behind current, with a migration cost that grows. Name current vs pinned |
| **Known vulnerability** | A CVE against a pinned version. Cite the CVE ID and the manifest line. Report only what you can verify |
| **Bus factor** | Directories with one effective owner, or long untouched, from Step 7. Name the directory, the owner, and the last-touch date |
| **Single point of external failure** | An external service with no fallback, cache, or circuit breaker, whose outage takes the whole system down. Cite the call site and the absence of a guard |
| **Committed secrets** | Credentials, tokens, or keys in tracked files. Report the file and *do not reproduce the value in the dossier* — the dossier is a document that gets shared |
| **Undocumented operational dependency** | A required external system that no README or config mentions, discovered only by reading code. Cite where it is used |

---

## Chapter 07 — Reporting Conventions

Chapter 07 is descriptive, not evaluative: what does this team actually do?

For each convention:

1. **State it** in one sentence
2. **Prove it** with two or three snippets from different parts of the codebase
3. **Note departures** — files that do it differently, cited

Cover: error handling, logging, dependency wiring, module shape and file organisation, naming, async/concurrency style, validation, test structure and fixtures, commit and PR conventions.

The departures matter most. They mark where the code was written under different assumptions, by different hands, or in a hurry — precisely what a newcomer needs warning about, and precisely what no summary would ever tell them.

# Evidence Rules

What separates a dossier from a summary. These rules are not style preferences — they are the definition of the deliverable. A chapter that violates them has failed regardless of how well written it is.

---

## The Substitution Test

Before writing any sentence, ask:

> **Would this sentence read identically about a different repository of the same type?**

If yes, it is filler. Either anchor it to a `path:line` and a snippet, or delete it.

| ❌ Fails the test | ✅ Passes |
|---|---|
| "The service uses a layered architecture." | "Handlers never touch the database directly — every call goes through `src/repo/*.js`, enforced by the import lint rule at `.eslintrc.json:31`." |
| "Error handling could be improved." | "`src/worker/consume.js:88` catches and logs without rethrowing, so a failed message is acked and silently dropped." |
| "It has good test coverage." | "412 tests across `test/unit` and `test/integration`; the payment path at `src/billing/charge.js:40-120` has none — no test file references `chargeCard`." |
| "Dependencies are up to date." | "All 14 direct dependencies are within one minor of latest except `redis@3.1.2` (`package.json:22`), superseded by 4.x in Nov 2021." |

---

## Citation

Every factual claim carries a citation.

- Format: `path/to/file.ext:42` for a line, `path/to/file.ext:42-58` for a range, `path/to/file.ext` when the whole file is the subject
- Paths are relative to the repository root, never absolute, never including the cache directory
- One citation per claim. Reciting a whole trace after a paragraph is not citation — attach each reference to the specific claim it supports

## Snippets

Show the code. A snippet is warranted whenever behaviour is non-obvious, surprising, or is itself the evidence for a claim.

````markdown
```js
// src/messaging/consume.js:88
try {
  await handler(JSON.parse(msg.Body))
} catch (err) {
  logger.error({ err }, 'handler failed')   // ← no rethrow
}
```
````

Rules:

- **Verbatim.** Never retype, reformat, or "clean up" code. Copy it. A snippet that does not match the file is a fabrication
- **Path comment on the first line**, matching the citation
- **~25 lines maximum.** Elide the middle with `// …` and say what was cut: `// … 30 lines of field validation …`
- **Language-tagged fence** so it highlights
- **Lead in and lead out.** A bare snippet teaches nothing. One sentence before saying what to look at, one after saying what it means

## Banned Language

If it is not verified, it does not go in the prose. It goes in **Open Questions**.

Never write: `likely`, `presumably`, `appears to`, `seems to`, `probably`, `it is assumed`, `one would expect`, `typically`, `should be`, `may be intended to`.

The one exception is an explicit, labelled inference where the reasoning is shown and the gap is named:

> The retry count is not configurable — `src/http/client.js:14` hardcodes `3`. No env var or config key references it, and no test overrides it. **Open question**: whether this was deliberate or an oversight; no ADR or commit message explains it.

## Open Questions

Every chapter ends with an Open Questions section (omit only if genuinely empty). It holds anything the repository alone cannot answer: undocumented business rules, unexplained constants, dead code whose purpose is unclear, config with no visible consumer, decisions with no recorded rationale.

This section is a feature, not an admission. It is the list of questions a new joiner should take to the team, and it is more useful than a confident guess would be.

---

## SWOT-Specific Rules

The forward-looking quadrants are where generic filler creeps back in. Each has an admission bar, and **an entry that cannot meet it is dropped, not softened**.

| Quadrant | Bar |
|---|---|
| **Strengths** | Names the practice, cites `path:line`, shows the snippet demonstrating it |
| **Weaknesses** | Snippet, `path:line`, severity, and the concrete failure it could cause |
| **Opportunities** | Names **either** an external development it could exploit (with version and the `path:line` of the workaround it would delete) **or** an internal seam making a change cheap (with the seam's `path:line`). Plus an effort estimate |
| **Threats** | Cites a verifiable external fact — version + last release date, EOL date, CVE ID — **or** a `path:line` |

Rejected by rule:

- "Could adopt microservices" — architectural rewrite, not an opportunity. Open Questions
- "Dependencies may become outdated" — true of every repo. Name the dependency and the date, or drop it
- "Could improve documentation" — no seam, no effort estimate, no evidence
- "Security could be tightened" — name the line and the vector, or drop it

## Severity and Effort

**Severity** (Weaknesses, Threats) — justify by consequence, not by feel:

| | Meaning |
|---|---|
| **Critical** | Data loss, security exposure, or silent incorrectness in production today |
| **High** | Will cause an incident under foreseeable conditions |
| **Medium** | Degrades correctness, performance, or maintainability without breaking |
| **Low** | Friction, inconsistency, or cleanliness |

**Effort** (Opportunities) — `Trivial` (a few lines) · `Small` (one file/day) · `Medium` (several files, tests) · `Large` (cross-cutting but not architectural).

---

## Chapter Front-Matter

Every chapter opens with the same line, so any chapter read in isolation states what it describes:

```markdown
> **Repo**: owner/repo · **Commit**: `a1b2c3d` · **Generated**: YYYY-MM-DD
```

## Cross-Linking

Chapters reference each other by relative link, never by repeating content: `see [05-integrations.md](./05-integrations.md#datastores)`.

Where content genuinely belongs in two places — a boundary crossing appears in a trace, in the integration inventory, and in the reading path — the **full treatment lives in one chapter** and the others link to it. Duplicated prose drifts out of sync the moment anything is regenerated.

## Voice

Write for an engineer who will read the code themselves and will notice if you are wrong. Direct, concrete, unhedged. No marketing register — a codebase is not "powerful" or "robust"; it either has a timeout on that call or it does not.

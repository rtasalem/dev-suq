# Acquisition

How to resolve, obtain, and prepare the repository before analysis begins. Used by Step 0.

---

## 1. Resolving the Target

| The user gives you | Do this |
|---|---|
| `https://github.com/owner/repo` (with or without `.git`, `/tree/main`, trailing slash) | Clone |
| `git@github.com:owner/repo.git` | Clone |
| `owner/repo` | Clone, assuming GitHub |
| A local path | Analyse in place |
| Nothing | Analyse the current working directory |
| A non-GitHub URL (GitLab, Bitbucket, self-hosted) | Clone — git works the same; only the `gh` enrichment in Step 7 is unavailable |

Normalise any GitHub form to `owner` and `repo` before building the cache path.

---

## 2. Cloning

```bash
git clone --filter=blob:none --single-branch \
  https://github.com/<owner>/<repo>.git \
  ~/.cache/repo-dossier/<owner>/<repo>
```

If the cache path already exists, refresh instead of re-cloning:

```bash
git -C ~/.cache/repo-dossier/<owner>/<repo> fetch --filter=blob:none --tags
git -C ~/.cache/repo-dossier/<owner>/<repo> status
```

Keep tags — release cadence feeds chapter 06. Do not pass `--no-tags`.

### Why blobless

`--filter=blob:none` creates a **partial clone**: every commit and every tree object is present, but file *contents* are fetched lazily on first access. The consequences that matter here:

| Operation | Works? | Why |
|---|---|---|
| `git log`, `git shortlog -sne` | ✅ Full fidelity | Needs commit objects only |
| `git log --name-only` (churn) | ✅ Full fidelity | Needs trees, not blobs |
| `git log --diff-filter=A` | ✅ Full fidelity | Tree comparison only |
| Reading the working tree | ✅ | Checkout fetches HEAD blobs, which the analysis needs anyway |
| `git blame <file>` | ✅ With lazy fetch | Fetches historical blobs for that one file. Step 7 blames hotspots, not everything |
| `git log -S` / `-G` (pickaxe) | ❌ **Never run** | Reads content across all history — triggers a fetch storm |

Historical blobs dominate the size of a long-lived repository, so this is a large saving with no loss of the history chapter 09 depends on.

**`--depth` is wrong here.** A shallow clone discards history outright, which breaks `shortlog`, `blame`, and every ownership and churn question in Step 7. Never use it.

### Fallbacks

- Server refuses partial clone (older git, some self-hosted forges) → retry as a plain full clone
- Analysis must run offline → full clone up front, since lazy fetches will fail
- Clone fails on authentication → see §4

---

## 3. Identity

Capture once, then stamp every chapter's front-matter:

```bash
git -C <repo> rev-parse HEAD                          # commit SHA
git -C <repo> rev-parse --abbrev-ref HEAD             # branch
git -C <repo> remote get-url origin                   # remote (repo name fallback: directory name)
git -C <repo> log --reverse --format=%aI | head -1    # first commit date → repo age
git -C <repo> log -1 --format=%aI                     # last commit date → activity
```

Front-matter block for every chapter:

```markdown
> **Repo**: owner/repo · **Commit**: `a1b2c3d` · **Generated**: YYYY-MM-DD
```

Pinning the SHA is what makes the dossier honest — it describes one specific state of the code, and a later reader can diff against it.

---

## 4. Private Repositories

If the clone fails on authentication:

1. Check `gh auth status`. If authenticated, clone via `gh repo clone <owner>/<repo> ~/.cache/repo-dossier/<owner>/<repo> -- --filter=blob:none --single-branch`
2. If not authenticated, tell the user to run `gh auth login` and stop — do not attempt to work around it
3. If the repo is genuinely inaccessible to them, say so plainly rather than analysing a fork or a similarly-named public repo

---

## 5. GitHub Enrichment (optional)

These enrich Step 7. All are optional — if `gh` is missing or unauthenticated, derive what you can from git history and record the gap in Open Questions.

```bash
gh api repos/{owner}/{repo}                                    # description, topics, stars, archived, default branch
gh api repos/{owner}/{repo}/contributors --paginate            # contributor counts
gh api repos/{owner}/{repo}/releases --paginate                # release cadence
gh pr list --repo {owner}/{repo} --state merged --limit 50 \
  --json number,title,mergedAt,reviews,additions,deletions     # review norms
gh api repos/{owner}/{repo}/branches/{default}/protection      # required checks (needs admin; may 404)
```

Never let a failed `gh` call block the dossier. Degrade and note it.

---

## 6. Ledger Exclusions

Every path in the tree gets a ledger row. Files below are recorded as `n/a — <reason>` rather than omitted, so the ledger accounts for the whole tree:

| Pattern | Reason |
|---|---|
| `.git/` | VCS internals |
| `node_modules/`, `vendor/`, `.venv/`, `target/`, `Pods/` | vendored dependencies |
| `package-lock.json`, `yarn.lock`, `poetry.lock`, `Cargo.lock`, `go.sum`, `Gemfile.lock` | generated lockfile — read for versions in Step 5, but not analysed as source |
| `dist/`, `build/`, `out/`, `bin/`, `obj/`, `.next/` | build output |
| Images, fonts, videos, archives, compiled binaries | binary asset |
| `*.min.js`, `*.bundle.js`, generated clients, `*_pb.go`, `*.g.dart` | generated code — note the generator in chapter 06 |
| `.DS_Store`, `.idea/`, `.vscode/` | editor/OS noise |

Two cautions. **Generated code still matters** — note what generates it and from what source, because the generator is part of the build story. And **a vendored directory that is actually maintained in-tree** (patched dependencies, forked libraries) is not an exclusion; it is source, and often the most interesting source in the repo. Check before excluding.

---

## 7. Monorepos

Detect via workspace declarations — `workspaces` in `package.json`, `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json`, Go multi-module, Gradle `settings.gradle` with multiple includes, Cargo `[workspace]`, or several manifests at sibling paths.

When detected:

1. Say so in `01-overview.md` and list every package with its path and purpose
2. Build **one ledger for the whole tree**, with a package column added
3. Ask the user whether they want the whole monorepo or specific packages. This is the one place scope is negotiable, because "the repo" is genuinely ambiguous — but ask; never decide silently
4. Whatever the scope, chapters 06 and 09 stay repo-wide: CI and ownership are shared concerns
5. Trace cross-package dependencies explicitly in chapter 02 — in a monorepo, the seams between packages are the architecture

# Investigation Commands

The concrete commands behind each step. Run from the repository root, or with `git -C <repo>`.

## Blobless Safety

The clone is a partial clone (`--filter=blob:none`), so file contents are fetched lazily. Every command below is marked:

- **✅ safe** — needs only commits and trees, both fully present locally
- **⚠️ lazy** — fetches blobs for specific files; fine in bounded use
- **❌ never** — reads content across all history; triggers a fetch storm

> ### ❌ Never run on a blobless clone
>
> ```bash
> git log -S'searchterm'      # pickaxe: content diff across all history
> git log -G'regex'           # same, regex form
> git log -p                  # full patches across history
> ```
>
> **Instead**, to find where and when something changed:
>
> ```bash
> git log --oneline --name-only -- <path>          # ✅ which commits touched this file
> git log --diff-filter=A --format='%h %aI %an' -- <path>   # ✅ when it was introduced
> git blame -L 40,60 -- <path>                     # ⚠️ then blame the specific lines
> ```
>
> Narrow by path with tree metadata first, then reach for content on the handful of files that actually matter.

---

## Step 0 — Identity, Ecosystem, Ledger

```bash
git rev-parse HEAD                                   # ✅ commit SHA
git rev-parse --abbrev-ref HEAD                      # ✅ branch
git remote get-url origin                            # ✅ remote
git rev-parse --is-shallow-repository                # ✅ must print false
git log --reverse --format=%aI | head -1             # ✅ first commit → repo age
git log -1 --format=%aI                              # ✅ last commit → activity
git log --oneline | wc -l                            # ✅ total commits

git ls-files                                         # ✅ every tracked file — the ledger's source
git ls-files | sed 's/.*\.//' | sort | uniq -c | sort -rn   # ✅ extension census
git ls-files | wc -l                                 # ✅ tracked file count
```

`git ls-files` is preferable to `find` — it respects `.gitignore` for free and never descends into `node_modules` or build output.

Line counts per language, if `cloc` or `tokei` is available, are a nice-to-have; the extension census above is the portable fallback.

## Step 2 — Entrypoints

```bash
git ls-files | grep -Ei '(^|/)(main|index|app|server|cli|bootstrap|entry|program)\.[a-z]+$'   # ✅
git ls-files '*Dockerfile*' 'docker-compose*' '*.tf' '*.yaml' '*.yml'                          # ✅
```

Then confirm against the manifest's declared entrypoint (`main`/`bin`/`scripts` in `package.json`, `[project.scripts]` in `pyproject.toml`, `func main()` in Go, `<StartupObject>` in `.csproj`) — see `language-playbooks.md`.

Container `ENTRYPOINT`/`CMD` and CI job commands are authoritative for what actually runs in production. A repo often has several plausible-looking entrypoints and only one that ships.

## Step 5 — Dependencies

```bash
git ls-files | grep -Ei 'package\.json|requirements.*\.txt|pyproject\.toml|go\.mod|Cargo\.toml|pom\.xml|build\.gradle|Gemfile|composer\.json|\.csproj|mix\.exs'   # ✅
```

For each direct dependency, locate its use — a dependency with no import is a finding:

```bash
grep -rn "from 'dep-name'\|require('dep-name')\|import dep_name" --include='*.{js,ts,py}' .   # ✅
```

Freshness for the Threats quadrant (needs network; skip and note if offline):

```bash
npm view <pkg> version time.modified      # npm
pip index versions <pkg>                  # PyPI
gh api repos/<owner>/<repo>/releases/latest --jq '.tag_name,.published_at'
```

## Step 6 — Delivery

```bash
git ls-files '.github/workflows/*' '.gitlab-ci.yml' 'Jenkinsfile' '.circleci/*' 'azure-pipelines.yml'   # ✅
git ls-files '*Dockerfile*' '*.tf' '*.yaml' 'helm/**' 'k8s/**'                                           # ✅
git tag --sort=-creatordate | head -20                  # ✅ release cadence
git for-each-ref --sort=-creatordate --format='%(refname:short) %(creatordate:short)' refs/tags | head -20   # ✅
```

Read every workflow file in full. Do not summarise a pipeline from its job names — the gates live in `if:` conditions and step-level flags.

## Step 7 — History & Ownership

```bash
git shortlog -sne --all | head -30                      # ✅ overall ranking
git shortlog -sne --since='12 months ago' | head -20    # ✅ who is still active

git log --format='%an' -- <dir> | sort | uniq -c | sort -rn | head   # ✅ per-area ownership
git log -1 --format='%aI %an' -- <dir>                              # ✅ last touch per area

git log --format='%h' --name-only --since='12 months ago' \
  | grep -v '^$' | sort | uniq -c | sort -rn | head -30             # ✅ churn hotspots

git blame -L <start>,<end> -- <path>                    # ⚠️ bounded: hotspots only
git log --diff-filter=A --format='%h %aI %an' -- <path> # ✅ when a file was introduced

git log -50 --format='%s' | sort | uniq -c              # ✅ commit message conventions
git log --merges -20 --format='%s'                      # ✅ merge/PR style
```

**Bus factor**: run the per-area command over every significant directory. Any directory where the top author holds a dominant share, or whose last touch is long past, is a Threats entry — name the directory and the person.

Mailmap: check for `.mailmap`; without it the same person may appear under several emails and skew every ranking above.

## Step 8 — Patterns

```bash
git ls-files '.eslintrc*' '.prettierrc*' 'ruff.toml' '.editorconfig' 'setup.cfg' '.golangci.yml' 'rustfmt.toml'   # ✅
git ls-files | grep -Ei '(^|/)(test|tests|spec|__tests__)/'   # ✅ test layout
```

Config files state the *intended* convention; the code shows the *actual* one. Where they disagree, that gap belongs in chapter 07.

## Reading Files

Prefer ripgrep where available (`rg`), falling back to `grep -rn`. Both read the working tree — already materialised, so no lazy fetches.

```bash
rg 'pattern' --type js -n
rg 'process\.env\.' -n                    # config surface, Step 4
rg 'https?://' -n --glob '!*.md'          # outbound URLs, Step 5
```

## Environment Checks

```bash
git --version
gh auth status          # non-zero → skip all gh enrichment, note in Open Questions
docker info             # only if the repo's build needs inspecting; never required
```

None of these should ever block the dossier. Degrade and record the gap.

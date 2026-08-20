# Language Playbooks

Per-ecosystem orientation. Detect the ecosystem from its manifest, then use that playbook to find entrypoints, dependencies, tests, and conventions fast.

A repo may match several playbooks — polyglot repos are normal. Record every match and apply each. If nothing matches, use the [generic strategy](#generic-strategy-unknown-ecosystem).

---

## Detection Table

| Manifest | Ecosystem |
|---|---|
| `package.json` | [JavaScript / TypeScript](#javascript--typescript) |
| `pyproject.toml`, `requirements.txt`, `setup.py`, `Pipfile` | [Python](#python) |
| `go.mod` | [Go](#go) |
| `pom.xml`, `build.gradle`, `build.gradle.kts` | [Java / Kotlin](#java--kotlin) |
| `*.csproj`, `*.sln`, `*.fsproj` | [C# / .NET](#c--net) |
| `Gemfile`, `*.gemspec` | [Ruby](#ruby) |
| `Cargo.toml` | [Rust](#rust) |
| `composer.json` | [PHP](#php) |
| `CMakeLists.txt`, `Makefile`, `meson.build`, `configure.ac` | [C / C++](#c--c) |
| `Package.swift`, `*.xcodeproj` | [Swift](#swift) |
| `mix.exs` | [Elixir](#elixir) |
| `build.sbt` | [Scala](#scala) |
| Mostly `*.sh` / `*.bash` | [Shell](#shell) |

---

## JavaScript / TypeScript

- **Manifests**: `package.json`; lock: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb` (the lockfile names the package manager)
- **Entrypoints**: `main`/`module`/`exports`/`bin` in `package.json`; `scripts.start`; `src/index.*`, `src/server.*`, `src/app.*`; framework conventions — Next.js `app/`/`pages/`, Express `app.listen`, NestJS `main.ts` + `@Module`, Fastify `fastify()`
- **Dependencies**: `dependencies` vs `devDependencies` — the split tells you what ships. `peerDependencies` implies a library, not a service
- **Tests**: Jest, Vitest, Mocha, AVA, node:test, Playwright/Cypress for e2e. Layout `__tests__/`, `*.test.ts`, `*.spec.ts`, `test/`
- **Build**: tsc, esbuild, Vite, Webpack, Rollup, SWC, Turbopack
- **Config**: `tsconfig.json` (`strict` is a strong quality signal), `.eslintrc*`, `eslint.config.js`, `.prettierrc*`
- **Watch for**: CommonJS vs ESM (`"type": "module"`) — mixing them is a common source of pain; `engines` pins the Node version, a Threats signal if EOL

## Python

- **Manifests**: `pyproject.toml` (modern), `requirements*.txt`, `setup.py`/`setup.cfg` (legacy), `Pipfile`, `environment.yml`. Lock: `poetry.lock`, `uv.lock`, `Pipfile.lock`
- **Entrypoints**: `[project.scripts]`; `if __name__ == "__main__"`; `__main__.py`; `app = FastAPI()` / `Flask(__name__)`; Django `manage.py`, `wsgi.py`, `asgi.py`; Celery `celery.py`
- **Dependencies**: check for pinned vs unpinned (`==` vs `>=` vs bare) — unpinned in a *service* is a Threats entry
- **Tests**: pytest (`test_*.py`, `conftest.py` for fixtures), unittest, tox/nox for matrices
- **Build**: setuptools, poetry, hatch, uv, flit
- **Config**: `ruff.toml`, `.flake8`, `mypy.ini`, `setup.cfg`, `.pre-commit-config.yaml`
- **Watch for**: `python_requires` / `requires-python` versus EOL Python versions; type-hint coverage as a quality signal; virtualenv assumptions in scripts

## Go

- **Manifests**: `go.mod` (module path + Go version), `go.sum`
- **Entrypoints**: `func main()` in `package main` — conventionally `cmd/<name>/main.go`. Multiple `cmd/` dirs mean multiple binaries; enumerate all
- **Dependencies**: `require` in `go.mod`; indirect deps marked `// indirect`
- **Tests**: `*_test.go` beside source; `TestXxx`, `BenchmarkXxx`, `func TestMain`; table-driven tests are the idiom — their presence is a Strengths signal
- **Build**: `go build`, Makefile, goreleaser
- **Config**: `.golangci.yml`
- **Watch for**: `internal/` (import-restricted by the compiler) marks the real public API boundary; `context.Context` threading as a cancellation-discipline signal; error wrapping with `%w`

## Java / Kotlin

- **Manifests**: `pom.xml` (Maven), `build.gradle[.kts]` + `settings.gradle` (Gradle)
- **Entrypoints**: `public static void main`; `@SpringBootApplication`; `web.xml`; Quarkus/Micronaut annotations. `settings.gradle` includes reveal a multi-module build
- **Dependencies**: `<dependencies>` or `dependencies {}`; watch `scope`/`configuration` (`compile`, `runtime`, `test`, `provided`)
- **Tests**: JUnit 4/5, TestNG, Spock, Mockito, Testcontainers. Layout `src/test/java`
- **Build**: Maven/Gradle lifecycle; `mvnw`/`gradlew` wrappers pin the build tool version
- **Watch for**: `src/main/java` vs `src/main/kotlin`; Spring profiles in `application*.yml`; annotation-driven wiring means execution paths are not always greppable — follow annotations, not just call sites

## C# / .NET

- **Manifests**: `*.csproj`, `Directory.Packages.props`, `*.sln`
- **Entrypoints**: `Program.cs` (top-level statements in modern .NET), `Main`, `Startup.cs`, `[ApiController]`, minimal-API `app.MapGet`
- **Dependencies**: `<PackageReference>`; central management via `Directory.Packages.props`
- **Tests**: xUnit, NUnit, MSTest; `*.Tests.csproj`
- **Build**: `dotnet build`/`publish`, MSBuild
- **Watch for**: `<TargetFramework>` against .NET support dates — a direct Threats signal; `appsettings*.json` layering; `IServiceCollection` registrations are the DI map

## Ruby

- **Manifests**: `Gemfile`, `Gemfile.lock`, `*.gemspec`
- **Entrypoints**: `config.ru`, `bin/`, `exe/`, Rails `config/application.rb` + `routes.rb`, Sidekiq workers, Rake tasks
- **Dependencies**: `Gemfile` groups (`:development`, `:test`)
- **Tests**: RSpec (`spec/`), Minitest (`test/`), factories, `spec_helper.rb`/`rails_helper.rb`
- **Watch for**: Rails autoloading means little is explicitly imported — use naming conventions to trace; initializers in `config/initializers/` carry a lot of hidden setup

## Rust

- **Manifests**: `Cargo.toml`, `Cargo.lock`; `[workspace]` means multi-crate
- **Entrypoints**: `src/main.rs` (`fn main`), `src/lib.rs` for libraries, extra binaries in `src/bin/`
- **Dependencies**: `[dependencies]`, `[dev-dependencies]`, `[build-dependencies]`; feature flags materially change what compiles — note them
- **Tests**: `#[test]` inline, `#[cfg(test)] mod tests`, `tests/` for integration, doctests in `///` comments
- **Watch for**: `unsafe` blocks — always worth citing; `Result`/`?` propagation style; MSRV in `rust-version`

## PHP

- **Manifests**: `composer.json`, `composer.lock`
- **Entrypoints**: `public/index.php`, `index.php`, Laravel `artisan` + `routes/*.php`, Symfony `bin/console` + `config/routes.yaml`
- **Dependencies**: `require` vs `require-dev`; PSR-4 autoload maps namespaces to directories
- **Tests**: PHPUnit (`phpunit.xml`), Pest
- **Watch for**: `php` version constraint against PHP EOL dates; framework service containers hide wiring

## C / C++

- **Manifests**: `CMakeLists.txt`, `Makefile`, `meson.build`, `configure.ac`, `conanfile.txt`, `vcpkg.json`
- **Entrypoints**: `int main(`; library targets have none — check the build file's target definitions
- **Dependencies**: often vendored or system-provided. `find_package`, `pkg-config`, submodules, `third_party/`
- **Tests**: GoogleTest, Catch2, CTest, Unity
- **Watch for**: the build file *is* the architecture document — read it first; conditional compilation (`#ifdef`) creates execution paths that vary by platform, so state which configuration you traced

## Swift

- **Manifests**: `Package.swift`, `*.xcodeproj`, `*.xcworkspace`, `Podfile`, `Cartfile`
- **Entrypoints**: `@main`, `AppDelegate`, `SceneDelegate`, SwiftUI `App` conformance, `main.swift`
- **Tests**: XCTest, Swift Testing; `Tests/` or `*Tests` targets
- **Watch for**: platform/deployment targets; `.xcodeproj` is opaque — prefer `Package.swift` where both exist

## Elixir

- **Manifests**: `mix.exs`, `mix.lock`
- **Entrypoints**: `Application.start/2`, the supervision tree in `application.ex`, Phoenix `endpoint.ex` + `router.ex`
- **Dependencies**: `deps` in `mix.exs`
- **Tests**: ExUnit (`test/`, `*_test.exs`, `test_helper.exs`)
- **Watch for**: the **supervision tree is the architecture** — read it before anything else; GenServer state and message handling are where behaviour lives

## Scala

- **Manifests**: `build.sbt`, `project/*.scala`, `project/build.properties`
- **Entrypoints**: `object X extends App`, `def main`, Play `routes` + `Module`, Akka actor systems
- **Tests**: ScalaTest, Specs2, MUnit
- **Watch for**: implicits and given/using — they make call graphs non-obvious; effect systems (Cats Effect, ZIO) mean execution is described, not sequential

## Shell

- **Entrypoints**: files with a shebang and the executable bit
- **Dependencies**: external commands invoked — each one is a hidden requirement worth listing in chapter 05
- **Watch for**: `set -euo pipefail` (its absence is a Weakness); unquoted expansions; the same script called from CI with different arguments

---

## Generic Strategy (Unknown Ecosystem)

When nothing matches, the method still works — only the shortcuts are missing.

1. **Extension census** (`investigation-commands.md`, Step 0) to identify the dominant language
2. **Find the build file.** Any repo that ships something has one. It names targets, dependencies, and entrypoints — it is the highest-value file in an unfamiliar ecosystem
3. **Find entrypoints structurally**: executable-bit files, shebangs, `main` in any casing, container `ENTRYPOINT`/`CMD`, and the commands CI actually runs. CI is the most reliable oracle for what runs in production
4. **Find dependencies**: whatever file lists third-party names, plus vendored directories
5. **Find tests**: directories or filenames containing `test`/`spec`, and files that import an assertion library
6. **Infer conventions from repetition.** Read a dozen files across different directories; whatever they all do is the convention, and whatever one does differently is a finding
7. **State the uncertainty.** If you cannot confidently identify the ecosystem, say so in `01-overview.md` and record it in Open Questions. Never invent conventions for a language you are inferring

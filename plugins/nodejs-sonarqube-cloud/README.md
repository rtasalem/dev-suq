# nodejs-sonarqube-cloud

An agent that analyses SonarQube Cloud quality gate results from the CI pipeline, triages all issues, and implements fixes automatically. Includes a skill for running local scans via `sonar-scanner-cli`.

## What's included

| Component | Path | Description |
|-----------|------|-------------|
| Agent | `agents/nodejs-sonarqube-cloud.agent.md` | Fetches quality gate results from the SonarCloud API, triages issues by severity, and implements fixes |
| Skill | `skills/nodejs-local-sonar-scan/` | Runs a local code scan via the `sonar-scanner-cli` Docker container to verify fixes before pushing |

## Prerequisites

- [GitHub CLI](https://cli.github.com/) (authenticated)
- [Node.js](https://nodejs.org/)
- `sonar-project.properties` in the project root (must contain `sonar.projectKey`)
- `SONAR_TOKEN` set in `.env` or the environment
- [Docker](https://www.docker.com/) (for local scans only)

## How it works

### Agent: SonarQube Cloud issue fixer

Triggered when a SonarQube Cloud quality gate fails on a pull request. The agent:

1. Identifies the current branch and its associated PR
2. Fetches the quality gate status, metrics, issues, and security hotspots from the SonarCloud API
3. Triages all issues by severity (BLOCKER → INFO)
4. Implements fixes directly in the codebase following SonarQube Cloud's recommendations
5. Reports a summary and prompts you to push so CI can re-verify

### Skill: Local Sonar scan

Run a local scan to verify fixes before pushing:

1. The skill copies `local-sonar-scan.js` into your project at `scripts/local-sonar-scan.js`
2. Adds a `sonar` script to your `package.json`
3. Run with `npm run sonar`

The script is zero-dependency (Node.js built-ins only) and uses the `sonarsource/sonar-scanner-cli` Docker image.

## Usage

Ask the agent to fix your SonarQube issues:

> "My SonarQube quality gate failed, fix the issues"

Or run a local scan first:

> "Run a local sonar scan"

## License

[MIT](../../LICENSE)

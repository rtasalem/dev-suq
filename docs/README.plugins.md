# Plugins

Plugins in the dev-suq marketplace bundle agents, skills, and scripts that extend GitHub Copilot for specific workflows. Each plugin lives under `plugins/` and is registered in the [marketplace manifest](../.github/plugin/marketplace.json).

## Installing plugins

To install a plugin using Copilot CLI:

```bash
copilot plugin install <plugin-name>@dev-suq
```

## Available plugins

| Plugin | Description | Install |
|--------|-------------| ------- |
| [nodejs-sonarqube-cloud](../plugins/nodejs-sonarqube-cloud/README.md) | Analyses SonarQube Cloud quality gate results from the CI pipeline, triages all issues, and implements fixes automatically. Includes a skill for running local scans via `sonar-scanner-cli`. | `copilot plugin install nodejs-sonarqube-cloud@dev-suq` |
| [repo-dossier](../plugins/repo-dossier/README.md) | Analyses any repository in any language and produces an evidence-cited markdown dossier — purpose, architecture, annotated execution traces, external integrations, CI/CD, maintainers, conventions, and a SWOT analysis — plus a guided reading itinerary and an interactive code tour. | `copilot plugin install repo-dossier@dev-suq` |

# Plugins

Plugins in the dev-suq marketplace bundle agents, skills, and scripts that extend GitHub Copilot for specific workflows. Each plugin lives under `plugins/` and is registered in the [marketplace manifest](../.github/plugin/marketplace.json).

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [nodejs-sonarqube-cloud](../plugins/nodejs-sonarqube-cloud/) | Analyses SonarQube Cloud quality gate results from the CI pipeline, triages all issues, and implements fixes automatically. Includes a skill for running local scans via `sonar-scanner-cli`. |

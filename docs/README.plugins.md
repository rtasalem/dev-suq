# 🔌 Plugins

Plugins in the Dev Suq marketplace bundle agents, skills, and scripts that extend GitHub Copilot for specific workflows. Each plugin lives under `plugins/` and is registered in the [marketplace manifest](../.github/plugin/marketplace.json).

## Installing a plugin

To install a plugin:

```
copilot plugin install <plugin-name>@dev-suq
```

## Available plugins

| Plugin | Description | Install |
| ------ | ----------- | ------- |
| [nodejs-sonarqube-cloud](../plugins/nodejs-sonarqube-cloud/) | Analyses SonarQube Cloud quality gate results from the CI pipeline, triages all issues, and implements fixes automatically. Includes a skill for running local scans via `sonar-scanner-cli`. | ```copilot plugin install nodejs-sonarqube-cloud@dev-suq```

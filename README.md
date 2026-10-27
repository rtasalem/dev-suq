# 💻 Dev Suq

In Arabic, the suq (pronouced "sook" like "book") is a marketplace or bazaar.

The Dev Suq is an open-source Claude Code and GitHub Copilot plugin marketplace for software developers, making available plugins to support a hybrid agentic-developer workflow.

##  Usage 

### Claude Code

Add the Dev Suq marketplace:

```
/plugin marketplace add rtasalem/dev-suq
```

Install a plugin:

```
/plugin install <plugin-name>@dev-suq
```

Run `/plugin` and open the **Discover** tab to browse what's available. Not every plugin supports Claude Code yet; check the [plugin index](./docs/README.plugins.md).

### GitHub Copilot CLI

#### Add marketplace

Add the Dev Suq marketplace to Copilot CLI:

```
copilot plugin marketplace add rtasalem/dev-suq
```

#### Browsing

Browse all plugins in the Dev Suq marketplace:

```
copilot plugin marketplace browse dev-suq
```

#### Installing plugins

Install plugins via the Copilot CLI:

```
copilot plugin install <plugin-name>@dev-suq
```

## Resources

| Resource | Description | Index |
| -------- | ----------- | ----- |
| 🔌 Plugins | Custom agents with supplementary skills to support niche workflows. | [View plugins &rarr;](./docs/README.plugins.md) |

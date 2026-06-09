# SpecThis Claude Code Marketplace

A [Claude Code](https://code.claude.com) plugin marketplace published by [SpecThis](https://specthis.ai).

## Prerequisites

- [Claude Code](https://code.claude.com) installed and authenticated.

## Add the marketplace

From your terminal:

```
claude plugin marketplace add SpecThis-Open-Source/spec-this-claude-code-marketplace
```

You should see `specthis` listed in `claude plugin marketplace list`.

## Install a plugin

```
claude plugin install specthis-planning@specthis
```

Start a Claude Code session, then ask Claude to plan a feature — the skill walks through the SpecThis plan scaffolding flow (goal, open questions, workflow, acceptance, work items).

## Update

When a new release lands, refresh your local copy:

```
claude plugin marketplace update specthis
```

Claude Code resolves each plugin's version from its `plugin.json`, so updates only flow when the version field changes — semantic-release does this for you on every push to `main`.

## Uninstall

```
claude plugin uninstall specthis-planning@specthis
claude plugin marketplace remove specthis
```

## Available plugins

| Plugin | Description |
| --- | --- |
| [`specthis-planning`](./plugins/specthis-planning) | Guides Claude Code through the full SpecThis plan scaffolding flow. |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) — `semantic-release` reads them to bump versions and cut releases automatically.

## How releases work

- Push to `main` → `release.yml` runs `semantic-release`.
- Conventional commits drive the version bump (`feat:` → minor, `fix:` → patch, `BREAKING CHANGE:` → major).
- The plugin's `plugin.json` `version` field is bumped, a git tag (`specthis-planning@vX.Y.Z`) is created, and a GitHub Release is published with auto-generated notes.

## More info

- Anthropic docs: [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) · [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
- SpecThis: https://specthis.ai

## License

[MIT](./LICENSE)

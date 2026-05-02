# SpecThis Claude Code Marketplace

A [Claude Code](https://code.claude.com) plugin marketplace published by [SpecThis](https://specthis.ai).

> **Status:** MVP. Currently ships one starter plugin (`hello-specthis`) so you can verify the install path. Real plugins land in subsequent releases.

## Prerequisites

- [Claude Code](https://code.claude.com) installed and authenticated.

## Add the marketplace

From your terminal:

```
claude plugin marketplace add SpecThis-Open-Source/spec-this-claude-code-marketplace
```

You should see `specthis` listed in `claude plugin marketplace list`.

## Install the starter plugin

```
claude plugin install hello-specthis@specthis
```

Start a Claude Code session, then invoke the bundled skill:

```
/hello-world
```

You should see a SpecThis greeting confirming the install path is wired up end-to-end.

## Update

When a new release lands, refresh your local copy:

```
claude plugin marketplace update specthis
```

Claude Code resolves each plugin's version from its `plugin.json`, so updates only flow when the version field changes — semantic-release does this for you on every push to `main`.

## Uninstall

```
claude plugin uninstall hello-specthis@specthis
claude plugin marketplace remove specthis
```

## Available plugins

| Plugin | Description |
| --- | --- |
| [`hello-specthis`](./plugins/hello-specthis) | Starter plugin that proves the install path. |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) — `semantic-release` reads them to bump versions and cut releases automatically.

## How releases work

- Push to `main` → `release.yml` runs `semantic-release`.
- Conventional commits drive the version bump (`feat:` → minor, `fix:` → patch, `BREAKING CHANGE:` → major).
- The plugin's `plugin.json` `version` field is bumped, a git tag (`hello-specthis@vX.Y.Z`) is created, and a GitHub Release is published with auto-generated notes.

## More info

- Anthropic docs: [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) · [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
- SpecThis: https://specthis.ai

## License

[MIT](./LICENSE)

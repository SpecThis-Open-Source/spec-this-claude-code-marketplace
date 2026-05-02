# Contributing

## Commit messages — required format

All commits must follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/). `semantic-release` parses them to determine version bumps; commits that don't match are silently ignored, so a missing `feat:` prefix means **no release happens**.

| Type | Effect | Example |
| --- | --- | --- |
| `feat:` | minor bump (1.X.0) | `feat(hello-specthis): add greeting variant for evening sessions` |
| `fix:` | patch bump (1.0.X) | `fix(hello-specthis): correct typo in skill description` |
| `chore:` | no release | `chore: bump dev dependencies` |
| `docs:` | no release | `docs: clarify install steps in README` |
| `BREAKING CHANGE:` in body or `feat!:` | major bump (X.0.0) | `feat(hello-specthis)!: rename skill to hello-specthis-world` |

Use the plugin name as the scope (`feat(hello-specthis): ...`) so commits stay grep-able when more plugins land.

## Add a new plugin

Today the marketplace ships one plugin. Adding more follows a fixed pattern:

1. **Create the plugin directory.**
   ```
   mkdir -p plugins/<name>/.claude-plugin
   mkdir -p plugins/<name>/skills/<skill-name>
   ```

2. **Write the plugin manifest** at `plugins/<name>/.claude-plugin/plugin.json`:
   ```json
   {
     "name": "<name>",
     "version": "1.0.0",
     "description": "...",
     "author": { "name": "SpecThis", "email": "support@specthis.ai" },
     "license": "MIT"
   }
   ```

3. **Write at least one skill, agent, command, or hook.** A skill goes at `plugins/<name>/skills/<skill-name>/SKILL.md` with frontmatter (`description` is required).

4. **Register the plugin in the marketplace catalog** — add an entry to `.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "<name>",
     "source": "./plugins/<name>",
     "description": "..."
   }
   ```

5. **Add a per-plugin README** at `plugins/<name>/README.md` describing what the plugin does and how to use it.

6. **Smoke-test locally** before pushing:
   ```
   claude plugin marketplace add /Users/<you>/core-biz/spec-this-claude-code-marketplace
   claude plugin install <name>@specthis
   ```

7. **Open a PR.** `validate.yml` checks every manifest. Use a `feat(<name>): ...` commit so semantic-release picks it up.

## Versioning today vs. tomorrow

**Today (one plugin):** a single `release.config.js` runs once per push to `main`. The plugin's `plugin.json` `version` is bumped and one tag (`hello-specthis@vX.Y.Z`) is created.

**When plugin #2 lands:** running one bump for "any commit anywhere" stops being right — a `fix:` in plugin A would also bump plugin B. Switch to per-plugin scoped releases, e.g.:

- [`semantic-release-monorepo`](https://github.com/pmowrer/semantic-release-monorepo) — runs semantic-release once per package, scoping commits by path.
- A matrix workflow that invokes semantic-release per plugin directory with its own config.

That migration is intentionally deferred until we actually need it.

## Local development

```
npm install        # installs semantic-release + plugins
npx semantic-release --dry-run --no-ci  # preview what the next release would look like
```

The dry-run won't push tags or create GitHub releases — useful for sanity-checking commit messages before opening a PR.

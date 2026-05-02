# hello-specthis

Starter plugin for the SpecThis Claude Code marketplace.

## What it does

Ships one skill, `hello-world`, that prints a SpecThis greeting. The only purpose of this plugin is to prove the end-to-end install path:

1. The marketplace catalog (`marketplace.json`) is reachable.
2. The plugin manifest (`plugin.json`) is valid.
3. Claude Code can copy the plugin into its cache and load the skill.

## Install

From your terminal:

```
claude plugin marketplace add SpecThis-Open-Source/spec-this-claude-code-marketplace
claude plugin install hello-specthis@specthis
```

Start a Claude Code session, then invoke the skill:

```
/hello-world
```

You should see the SpecThis greeting.

## Update

```
claude plugin marketplace update specthis
```

## Uninstall

```
claude plugin uninstall hello-specthis@specthis
```

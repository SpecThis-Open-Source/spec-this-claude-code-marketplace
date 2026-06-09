# specthis-planning

Plugin that guides Claude Code through the SpecThis plan-scaffolding flow end-to-end.

## What it does

Ships one skill, `specthis-planning`, that walks Claude through the five-step SpecThis plan scaffolding sequence:

1. **Goal** — a tight, grounded statement of what's being built and why.
2. **Open questions** — surfaces real ambiguity before committing to a solution.
3. **Workflow** — a current-state vs. proposed-state graph of the actual system change.
4. **Acceptance criteria + non-goals** — concrete, testable success conditions and explicit scope guardrails.
5. **Work items** — specific, implementable tasks another developer could pick up.

The skill uses the SpecThis MCP tools, so the plan updates live in the SpecThis UI as the agent works.

## Prerequisites

- The SpecThis MCP server must be configured in your Claude Code setup. Without it, the skill has no tools to call.
- The GitHub repository you're planning in must be **linked to your SpecThis project** — creating a plan requires it (SpecThis opens the plan's branch + draft PR there on finalize). The skill auto-detects the `org/repo` from your local git remote; if it isn't linked yet, link it in the SpecThis UI (or via `link_project_repository`) and the skill will guide you.

## Install

```
claude plugin marketplace add SpecThis-Open-Source/spec-this-claude-code-marketplace
claude plugin install specthis-planning@specthis
```

## Use

Start a Claude Code session in the project you want to plan a feature for, then ask:

```
plan a feature: <your feature description>
```

Or invoke the skill directly:

```
/specthis-planning
```

Claude drafts a goal first (so you have something to react to in the UI), then reads the codebase, then surfaces open questions before scaffolding the remaining sections.

### Live auto-resume (recommended)

Invoke the skill via Claude Code's built-in `/loop` skill to get live auto-resume — Claude wakes up automatically when you answer open questions in the UI, no manual "I'm ready" message needed:

```
/loop /specthis-planning
```

In normal invocation, Claude pauses after open questions and waits for you to message back. With `/loop`, Claude polls every ~60s and resumes the moment all answers are in. You can chat freely between polls — message "pause" to stop polling, or "proceed without answers" to continue with the unanswered questions documented as assumptions.

## Update

```
claude plugin marketplace update specthis
```

## Uninstall

```
claude plugin uninstall specthis-planning@specthis
```

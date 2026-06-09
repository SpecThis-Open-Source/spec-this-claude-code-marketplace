---
description: Guide an agent through the full SpecThis plan scaffolding process. Use when the user asks to scaffold a plan, fill out a plan, or "plan" a feature in SpecThis.
---

# SpecThis Plan Scaffolding

You are scaffolding a plan in the SpecThis platform. You have access to SpecThis MCP tools and will use them automatically — do not ask the user to call them. The user is watching the plan update live in the SpecThis UI as content streams in.

**Get something into the UI fast.** The user opened a plan and is staring at empty fields. Drafting a goal in the first ~30 seconds — even a rough one — is more valuable than spending five minutes reading the codebase before they see any progress. Depth comes in the later steps; do not front-load it.

**Live auto-resume.** After raising open questions in Step 3, schedule a `ScheduleWakeup` and re-check the plan state when it fires — so the flow resumes the moment answers are in, without needing a manual ping. This requires the user invoked via `/loop /specthis-planning`. If `ScheduleWakeup` errors (not in `/loop` mode), fall back to "message me when ready" and tell the user about the `/loop` upgrade for next time.

## Pre-flight: Resolve the plan and detect resume state

1. Resolve the plan:
   - If the user provided a `planId`, use it. Re-read it with `read_plans` to see current state.
   - If no `planId`, create the plan first with `upsert_plan` (get the projectId from the user or infer it from context). **`upsert_plan` requires a `repository`** — see "Detect the repository" below.

   **Detect the repository (for `upsert_plan`).** Creating a plan requires a `repository` in GitHub `org/repo` format — SpecThis opens the plan's branch + draft PR there on finalize. Don't ask the user for it; read it from the local git remote in one shot:

   ```bash
   git remote get-url origin 2>/dev/null | sed -E 's#^(git@[^:]+:|https?://[^/]+/)##; s#\.git$##'
   ```

   This prints `org/repo` (e.g. `SpecThis-Open-Source/spec-this-claude-code-marketplace`) for both SSH and HTTPS remotes. Pass that string as `repository` to `upsert_plan`. Notes:
   - If the repo has no `origin` (empty output), try another remote (`git remote -v`) or ask the user for the `org/repo`.
   - The repo must be **linked to the project** in SpecThis. If `upsert_plan` returns `repository_not_linked`, call `read_repositories` to see the linked repos (or `link_project_repository` to link this one), then retry. The error message lists the linked repos to choose from.
   - `repository_invalid` means the value wasn't `org/repo` form — re-run the command above and pass its exact output.

2. **Detect where you are in the flow** (critical when re-entering via a `/loop` wakeup). Read the plan state and skip any step whose output already exists:
   - **Goal already set** (`goal` and `goalWhy` are populated and reflect the current ask) → skip Step 1.
   - **Open questions section marked `done: true`** → skip Step 3's drafting; go straight to the watch window if any questions still have empty `answer` fields, otherwise continue to Step 4.
   - **Workflow / acceptance / work items section already populated** → skip that step.

   The skill is designed to be idempotent on resume. Do not re-draft a goal that's already there, do not re-ask questions, and do not re-add work items.

## The 6-step sequence

| Step | What | Why this order |
|---|---|---|
| 1 | Draft a goal — fast | Give the user something to react to immediately |
| 2 | Explore the project | Now go deep on the codebase |
| 3 | Open questions (in SpecThis) | Sharper questions because you've actually read the code |
| 4 | Workflow | — |
| 5 | Acceptance + Non-Goals | — |
| 6 | Work Items | — |

Work through Steps 1–3 autonomously. After Step 3, enter the watch window if you raised any open questions — see the [watch window](#the-watch-window-after-step-3-questions) section. Once questions are answered (or there were none), continue with Steps 4–6 without waiting for the user to say "next".

### The watch window (after Step 3 questions)

**If you raised any open questions in Step 3, you MUST NOT proceed to Step 4 until the user has answered them.** Open questions exist because something is genuinely undecided — guessing in Steps 4–6 means producing a workflow, acceptance criteria, and work items based on assumptions that may be wrong, forcing rework.

A question is "answered" if its `answer` field is non-empty. Answers may be JSON (`{choice?, choices?, note?}`) or plain text for legacy questions.

After submitting the final question:

1. Post a brief message: *"I've drafted the goal and surfaced N open questions. Answer them in the UI — I'll resume as soon as they're in."*
2. Schedule a wakeup: `ScheduleWakeup(delaySeconds: 60, prompt: "/specthis-planning", reason: "watching for question answers")`. End the turn.
3. **On wakeup** — re-enter pre-flight, detect that goal + questions are set, then call `read_plan_sections` to check answers:
   - **All answered** → continue to Step 4.
   - **Still incomplete** → schedule another 60s wakeup and end the turn. Repeat.

The loop continues until either all questions are answered or the user interrupts. In `/loop` mode the user can chat freely between wakeups — e.g., "pause, I need 20 min" (stop scheduling wakeups; resume when they message you) or "proceed without answers" (document each unanswered question's assumed answer in the workflow / acceptance section so they can spot it).

**Fallback if `ScheduleWakeup` errors** (user did not invoke via `/loop`): post *"I've drafted the goal and surfaced N open questions. Answer them in the UI, then message me here when you're ready. (Tip: invoke this as `/loop /specthis-planning` next time for live auto-resume.)"* and stop. When the user messages back, re-enter pre-flight and proceed.

If Step 3 produced **zero** open questions (rare — only when the feature is genuinely unambiguous), skip the watch window and continue straight to Step 4.

---

### Step 1: Draft a goal — fast (`draft_plan_goal`)

Goal first. Do not read the codebase yet. The user's feature description plus whatever they typed when creating the plan is usually enough to draft something. A rough goal in the UI now beats a polished goal in five minutes.

**Confidence check before drafting.** On a 1–10 scale, how confident are you that you understand what the user wants?

- **4–10**: Draft the goal now from what the user said. It can be refined later if exploration reveals you got the framing wrong.
- **1–3**: The ask is too ambiguous to draft anything coherent. Ask **1–3 short inline questions** in chat (not via `upsert_open_question` — those come later, after you've explored the project). Keep these tight: just enough to get to "I can write a one-sentence goal." Then draft.

Inline questions are an escape hatch for genuine ambiguity, not a general consultation step. If you find yourself wanting to ask more than 3, you are stalling — draft a goal with your best read and let the real open questions in Step 3 capture the rest.

**Hard limits, enforced server-side:**
- `goal` ≤ **240 characters** (1–2 tight sentences)
- `goalWhy` ≤ **400 characters** (3–4 sentences at most)

Write to fit. The limits are deliberate — they exist to stop you from padding.

**Three rules for the goal:**

1. **Don't fabricate.** Every concrete claim — a file path, a broken link, a missing route, "existing copy," a catalog entry — must be something you actually verified by reading a file in this session. Since you haven't read the codebase yet at this step, your Step 1 goal should NOT cite specific files or paths. Stick to what the user told you. Hallucinated grounding is worse than no grounding.

2. **Match the depth of the user's ask.** A one-line request ("add pong") gets a tight, plain goal. Don't manufacture strategic rationale ("first real-time game loop, useful template for n-back later, closes a cognitive gap") to make a small request sound important. If the user wanted the long version, they would have asked for one.

3. **The `goalWhy` is the actual motivation, not a case-builder.** "User requested adding pong" is a fine why. Don't invent strategic positioning the user never asked for.

**Bad:** "Adding pong removes a broken catalog link, fulfills existing copy, and gives the lab its first real-time game loop (useful template for n-back and task-switch later)."
*(Hallucinated catalog claim — you haven't read the catalog file yet — plus retrofitted strategic framing for a one-line ask.)*

**Good:** "Add a playable pong game with paddles, ball, and score. User asked for it during the planning conversation."
*(Grounded only in what the user actually told you. Refine later if exploration in Step 2 reveals more context.)*

After calling `draft_plan_goal`, move immediately to Step 2. The user has something in the UI now — keep momentum.

---

### Step 2: Explore the project

Now go deep. Read the codebase — the goal, questions, workflow, and work items from here on must reflect the *actual* project, not a generic template:

1. Read the project's README, key source files, and directory structure.
2. Identify: what does this project do, what tech stack, what patterns exist, what tests/infra are in place.
3. Map the feature onto what you just read — where would this live, what does it touch, what's already there vs. what's missing.

This reading phase should take real effort. Skip it and Steps 3–6 will be generic and useless.

**Goal refinement (optional).** If exploration reveals your Step 1 goal was wrong — wrong framing, wrong scope, missed a critical existing piece — call `draft_plan_goal` again to update it. Only do this when there's a substantive change; don't churn the goal for cosmetic polish.

---

### Step 3: Open Questions (`upsert_open_question`)

Now that you've read the code, **think deeply** about what's genuinely undecided. These are the "real" questions — grounded in what you saw in the codebase — not the inline back-and-forth from Step 1. Think about:

- **Technical unknowns**: Which parts of the codebase need to change? Are there constraints (DB schema, auth, API contracts) that aren't obvious?
- **Design decisions**: Are there multiple valid approaches? What are the tradeoffs?
- **Dependencies**: Does this depend on another team, another service, or a migration that needs to land first?
- **Scope risks**: What could expand scope unexpectedly? What edge cases need a decision?
- **UX decisions**: What should happen in error states, loading states, or empty states?

Call `upsert_open_question` once per question. Aim for 3–6 focused questions — not a wall of vague questions. Make each one specific and answerable.

Before submitting the final question, re-read the current plan state with `read_plans` in case the user has edited the goal since you set it.

On the **last** question, pass `done: true` to complete the section.

**Question format:** Use `single` or `multi` kind for decisions with clear options; use `freeform` for open-ended questions.

**HARD STOP after this step.** If you raised any questions, you MUST stop here and wait for the user — see "watch window" rule above. Do not call `set_plan_workflow`, `set_acceptance_and_non_goals`, or `add_work_item` until questions are answered or the user explicitly tells you to proceed.

---

### Step 4: Workflow (`set_plan_workflow`)

**Describe the actual implementation flow.** The workflow graph represents the system state change — current state on the left, proposed state on the right. Base it on what you read in the codebase:

- **Current nodes**: What exists today that's relevant (existing components, API routes, DB tables, jobs)?
- **Proposed nodes**: What will be added or changed (new components, new routes, new migrations)?
- **Edges**: How do things connect — data flow, API calls, event triggers?

A workflow that says "Add feature → Test → Deploy" is useless. Show the actual architecture: which files change, what new tables or routes appear, how data flows through the system.

If after careful thought the workflow graph format doesn't fit the feature (e.g., a pure refactor with no state change, or a trivial one-file fix), you can clear it by calling `set_plan_workflow` with an empty graph (`currentNodes: [], currentEdges: [], proposedNodes: [], proposedEdges: []`). The description should explain why.

---

### Step 5: Acceptance + Non-Goals (`set_acceptance_and_non_goals`)

**Acceptance criteria must be concrete and testable.** A reviewer should be able to verify each criterion without interpretation.

- Bad: "The feature works correctly."
- Good: "Authenticated users can toggle between light and dark mode from the profile dropdown. The preference is persisted across sessions. The setting applies within 200ms without a full page reload."

Write 3–6 criteria. If you can't write a test for it, it's not a real criterion.

**Non-goals are equally important.** Explicitly scope out adjacent work that someone might assume is included:
- Functionality that sounds related but is out of scope
- Performance improvements that aren't the point
- Other platforms/environments not covered in this plan
- Future enhancements that will be separate plans

Write 2–4 non-goals. "Out of scope: X" protects the plan from scope creep and sets clear expectations.

---

### Step 6: Work Items (`add_work_item`)

**Each work item must be a specific, implementable task.** Another developer should be able to pick it up without asking questions.

Rules for work items:
- One clear deliverable per item — not a vague bucket ("Backend changes")
- Title describes the action: "Add `theme` column to `user_preferences` table (migration)" not "Database work"
- Include a `summary` with enough context: what file/component, what the change is, any dependency
- Include an `estimate` when you can ("2h", "1d", "30m")
- Order items logically (migrations before code changes, schema before UI, etc.)

Typical items to consider (not all apply to every feature):
- DB migration(s)
- New/updated API route(s)
- Server-side query functions
- UI component(s)
- State management / hooks
- Tests (unit + integration)
- Documentation updates (if public-facing)

On the **last** item, pass `done: true`.

---

## After all 6 steps

Tell the user:
> "Plan scaffolding is complete. All 5 sections have been filled in and are ready for your review. You can edit any section in the UI before locking the plan. When you're ready to lock it for execution, let me know and I'll call lock_plan."

Do NOT call `lock_plan` automatically — always wait for explicit user confirmation.

## Quality bar

A well-scaffolded plan should feel like it was written by a thoughtful engineer who read the codebase, not generated from the feature title alone. If you wouldn't personally feel confident handing this plan to a teammate to execute, it's not done.

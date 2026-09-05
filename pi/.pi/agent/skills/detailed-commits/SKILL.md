---
name: detailed-commits
description: Creates high-context git commits with clear subject lines, structured commit bodies, and evidence from staged changes. Use when preparing commits so work is logged accurately for teammates and future debugging.
---

# Detailed Commits

Use this skill whenever the user asks to commit work clearly, write better commit messages, or log changes with full context.

## Goal

Produce commits that explain:
1. **What changed**
2. **Why it changed**
3. **How it was implemented**
4. **How it was validated**
5. **What follow-ups remain**

## Workflow

1. Inspect repo state:
   ```bash
   git status --short
   git branch --show-current
   git diff --staged --name-status
   git diff --staged --stat
   ```
2. Read the staged diff carefully:
   ```bash
   git diff --staged
   ```
3. If context is unclear, ask the user targeted questions before committing.
4. Draft a commit message in this structure:

   - Subject (<= 72 chars, imperative)
   - Blank line
   - Why
   - What
   - Validation
   - Risks / Follow-ups (if any)

5. Show the draft to the user for approval.
6. Commit only after explicit confirmation.

## Message Format Template

```text
<type>: <concise imperative summary>

Why:
- <problem or motivation>

What:
- <key change 1>
- <key change 2>
- <key change 3>

Validation:
- <tests run / checks performed>

Risks / Follow-ups:
- <known limitation, migration, or TODO>
```

## Quality Bar

- Reference concrete files/components affected.
- Avoid vague wording like "update stuff" or "fix things".
- Mention behavior changes and user impact when relevant.
- Include test evidence; if not tested, explicitly state that.
- Split unrelated work into separate commits.

## Suggested Types

- `feat`: new user-facing behavior
- `fix`: bug fix
- `refactor`: internal restructuring with same behavior
- `perf`: performance improvements
- `docs`: documentation only
- `test`: tests only
- `chore`: tooling/maintenance

## Example

```text
fix: prevent duplicate webhook retries on timeout

Why:
- Transient timeout paths could enqueue the same webhook more than once.

What:
- Added idempotency check in `WebhookDispatcher.enqueue()`.
- Stored retry token in Redis with 10-minute TTL.
- Updated timeout handler to skip enqueue when token already exists.

Validation:
- Added unit tests for duplicate timeout path.
- Ran `npm test -- webhook-dispatcher`.

Risks / Follow-ups:
- Redis outage now degrades to previous behavior; monitor retry metrics.
```

## If user asks to commit now

After drafting and approval:

```bash
git commit -m "<subject>" -m "Why:
- ...

What:
- ...

Validation:
- ...

Risks / Follow-ups:
- ..."
```

For very detailed bodies, prefer:

```bash
git commit
```

and paste the structured message in the editor.

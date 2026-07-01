---
name: checkpoint
description: >
  Use this proactively right after finishing any feature, fix, or self-contained
  chunk of work in this repo. Stages only that chunk's files, runs the repo's
  real validation flow, writes a conventional commit, and then proposes pushing
  it to origin.
---

# Checkpoint Workflow

Use this after a unit of work is actually done, not while it is half-working.
The goal is small, reviewable commits with validation that matches this repo.

## When to run

- After any discrete feature or fix is working.
- After each independent chunk of a larger task.
- Before ending the turn if finished work is still uncommitted.

## Procedure

1. **Scope the diff.**
   Run `git status` and `git diff` to isolate the files that belong to the
   completed unit of work. If unrelated work is also in progress, do not stage it.

2. **Run the validation flow.**
   Use the `testing` skill as the technical gate and the `ship` skill as the
   final scoped validation pass.

   Minimum required command today:

   ```bash
   npm run typecheck
   ```

   Then run any targeted searches or smoke checks the touched flow needs. Do not
   claim lint/tests passed unless those scripts actually exist and were run.

3. **Stage precisely.**
   Use `git add <specific files>`. Avoid `git add .` or `git add -A` when the
   working tree contains unrelated changes.

4. **Commit with repo convention.**
   Follow existing history style:

   - format: `type(scope): imperative, why-focused summary`
   - common types: `feat`, `fix`, `chore`, `docs`, `refactor`
   - one coherent unit of work per commit

   End the commit message with:

   ```
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   ```

   Never use `--amend` unless the user explicitly asks. Never use `--no-verify`.

5. **Propose pushing.**
   This repo pushes directly; do not invent a PR flow. Ask before `git push` if
   the current permission mode still requires confirmation.

   If push is rejected because remote has moved, stop and tell the user. Do not
   force-push.

6. **Confirm result.**
   Run `git status` after commit or push and report what was committed, what
   validation ran, and whether anything remains uncommitted.

## Notes

- Prefer multiple small commits over one large mixed commit.
- If the change touches risky areas such as app shell, persistence, or broad
  navigation behavior, mention that explicitly before shipping.
- For this repo, a commit is not really done until both `testing` and `ship`
  expectations are satisfied for the changed scope.

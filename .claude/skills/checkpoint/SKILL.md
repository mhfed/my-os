---
name: checkpoint
description: >
  Use this proactively right after finishing any feature, fix, or self-contained
  chunk of work in this repo — even a small one, and even as one of several
  chunks within a bigger task. Stages just that chunk's files, runs the
  typecheck gate, and writes a conventional commit — then proposes pushing it
  to origin. Prevents work from piling up into one large uncommitted/unpushed
  blob. Trigger phrases: "commit this", "push this up", "checkpoint", or
  simply having just completed a working, typecheck-clean unit of work.
---

# Checkpoint: commit (and propose pushing) per unit of work

This repo's owner (mhfed) wants small, frequent commits pushed to `main` as
work completes — **not** one giant diff sitting uncommitted until the whole
session is done. This skill is the standing procedure for the commit side of
that. It does **not** change the normal push-confirmation rules: still treat
`git push` as an action that needs the user's go-ahead each time, per the
harness's normal permission flow — do not skip or suppress that prompt.

If the user wants pushes to stop prompting for confirmation every time, that
is a Claude Code **permission setting**, not something a skill file should
grant itself — point them at the `update-config` skill to add a `Bash(git
push:*)` allow rule in `.claude/settings.json` if they want that.

## When to run this

- Immediately after any discrete feature/fix is working and typechecked —
  don't wait for the rest of an unrelated task to finish first.
- After each independent sub-part of a larger task (e.g. each parallel
  subagent's file group, each unrelated bug fix bundled into one request).
  Commit them **separately**, not as one combined commit, so history stays
  bisectable and reviewable.
- At the natural end of your turn, before reporting back to the user, if
  there is finished, uncommitted work sitting in the tree.

Don't run this mid-way through a half-working change, or while a parallel
agent group is still editing files you'd be staging (wait for it to report
back first).

## Procedure

1. **Scope the diff.** `git status` and `git diff` — identify exactly which
   files belong to the unit of work you just finished. If unrelated
   in-progress changes exist alongside it (e.g. another feature still being
   worked on), only touch the files for the completed unit.

2. **Quality gate.** Run `npm run typecheck` (`tsc --noEmit`). If it fails
   because of your changes, fix it before committing — never commit code
   that doesn't typecheck. If there's a lint/test script in `package.json`
   at the time, run those too. If the failure is pre-existing and unrelated
   to your diff, say so and proceed (don't block on someone else's breakage).

3. **Stage precisely.** `git add <specific files>` — never `git add -A` or
   `git add .` if there's other unrelated in-flight work in the tree.

4. **Commit**, following this repo's existing convention (see `git log` for
   live examples): `type(scope): imperative, why-focused summary`.
   - Types: `feat`, `fix`, `chore`, `docs`, `refactor` — match what actually
     happened.
   - Keep each commit to one coherent unit. If a bigger task naturally split
     into parallel chunks (e.g. multiple subagents each owning a file
     group), give each its own commit — optionally note what it covered in
     the body, matching prior history style (e.g. `(agent A+B)`).
   - Always end the message with:
     ```
     Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
     ```
   - Never use `--amend` (unless the user explicitly asks) and never
     `--no-verify` / skip hooks.

5. **Propose pushing.** This repo pushes straight to `main` — there's no
   PR/branch-per-feature flow here, so don't invent one. Run (or ask to run,
   per whatever the current permission mode requires) `git push` — if the
   branch has no upstream yet, `git push -u origin <branch>`. If there are
   older local commits already ahead of `origin/main`, a plain `git push`
   carries those along too — don't leave them stranded.
   - If the push is rejected because the remote has diverged, **stop and
     tell the user** — do not force-push. Pull/rebase only if the user
     confirms that's what they want.

6. **Confirm.** After pushing, run `git status` to verify the working tree
   is clean and the branch is no longer ahead of origin. Report back a
   one-line summary of what was committed and pushed.

## Notes on scope

Committing small and often is always fine to do proactively. Pushing follows
the normal permission rules — ask (or rely on whatever allow-rule the user
has configured) rather than assuming standing authorization. Flag anything
that feels too large or risky to ship without a heads-up (e.g. touches CI
config, deletes a lot of code, changes auth/security-sensitive logic) instead
of quietly checkpointing it.

# Agent instructions

## Git safety and synchronization

- Preserve unrelated work and inspect repository state before editing.
- For shared-history synchronization, never use `git rebase`; use `git merge` or `git pull` so history remains additive and reviewable.
- Do not use `git stash`, destructive `git reset`, or `git clean` to hide or discard inconvenient state. Preserve work explicitly and report blockers instead.
- Never use `git push --force` or `git push --force-with-lease` against shared or protected branches.
- Resolve conflicts semantically with surrounding code, history, tests, documentation, and related repositories rather than choosing one side wholesale.

## Repository-local Git worktrees

- Create or use a Git worktree only when the human operator explicitly authorizes it for the current task. Concurrency or a dirty checkout is not permission by itself.
- Put every authorized worktree at `<repository-root>/tmp/worktrees/<name>`; from the repository root, use `./tmp/worktrees/<name>`. Never place worktrees beside repositories or organization directories.
- Keep `tmp`, `temp`, `tmp/worktrees`, and `temp/worktrees` ignored in the repository-root `.gitignore`. Do not commit files from those directories.
- Relocate or remove a worktree only when the operator explicitly requests it. Before removal, preserve and publish intended changes, verify its commit is represented on the target branch, and confirm there are no tracked, untracked, ignored-sensitive, or in-use files that must survive. Remove it with `git worktree remove <path>` without `--force`; never delete a worktree directory with `rm`.

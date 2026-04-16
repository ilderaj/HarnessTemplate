# superpowering-with-files

superpowering-with-files is a governance harness for local coding-agent workflows. It turns one shared policy into the native instruction, skill, and optional hook entry points used by Codex, GitHub Copilot, Cursor, and Claude Code.

Gemini CLI is not currently a supported Harness installer target. Harness does not render installer-managed Gemini entry files, skill roots, or user-global state.

## What It Adds

- `planning-with-files` as durable task memory under `planning/active/<task-id>/`
- `superpowers` as optional reasoning support for complex planning, debugging, review, and execution
- Rendered workspace and user-global entry files for supported IDEs
- Skill projection into each target's discovery path
- Optional hook projection for adapters with an explicit contract
- Staged upstream update flow for the vendored `superpowers` and `planning-with-files` baselines

## Core Rules

Harness is opinionated about where agent workflow state lives and when extra process is justified.

1. **Durable task state lives only in task-scoped planning files**
   - `planning/active/<task-id>/task_plan.md`
   - `planning/active/<task-id>/findings.md`
   - `planning/active/<task-id>/progress.md`
   - closed work may move to `planning/archive/<timestamp>-<task-id>/`

2. **`planning-with-files` is the source of truth**
   - `docs/**`, `docs/superpowers/plans/**`, and `docs/plans/**` are documentation, not active task memory.
   - If `superpowers` is used, durable decisions must be synced back into the active planning files.

3. **Default mode stays lightweight**
   - Do direct execution for straightforward work.
   - Use `superpowers` only when architecture is unclear, requirements are ambiguous, debugging is complex, root cause is not obvious, or deep structured reasoning is explicitly needed.

4. **Complex-mode order is fixed**
   - create or reuse one task under `planning/active/<task-id>/`
   - group work into phases with finishing criteria
   - run worktree preflight before isolation when needed
   - use `superpowers` only for the phase that justifies it
   - sync durable decisions back into Planning with Files
   - let the main agent review, verify, and integrate

5. **Worktree base must be explicit**

```bash
./scripts/harness worktree-preflight
git worktree add <path> -b <new-branch> <base-ref>
```

Record `Worktree base: <base-ref> @ <base-sha>` in the active task files before implementation continues.

## Upstream Foundations

Harness vendors two upstream systems and applies a stricter integration policy on top of them.
Both vendored baselines are used under their upstream MIT licenses, with original attribution preserved.

| Upstream | Original role | License | How Harness inherits it |
| --- | --- | --- | --- |
| [`superpowers`](https://github.com/obra/superpowers) | Agentic skills framework and software-development workflow | MIT | Kept as an optional, temporary reasoning layer for complex phases such as design, debugging, execution, and review |
| [`planning-with-files`](https://github.com/OthmanAdi/planning-with-files) | Persistent markdown planning skill for task memory and session recovery | MIT | Adopted as the only durable task-memory system, always rooted in `planning/active/<task-id>/` |

### Inherited Usage Model

- Harness **does not replace** the upstream projects' original purpose. It composes them.
- Harness **does narrow their scope**:
  - `planning-with-files` owns durable task state
  - `superpowers` can guide a phase, but it does not own long-lived project memory
- Harness **does adapt projection behavior**:
  - upstream files stay in `harness/upstream/**`
  - `sync` projects target-specific copies into IDE roots
  - the projected `writing-plans` flow is patched so active plans stay under `planning/active/<task-id>/`, not `docs/superpowers/plans/**`

### Credit

Thanks to the upstream authors and communities whose work this project builds on:

- [`obra/superpowers`](https://github.com/obra/superpowers) by Jesse Vincent and contributors
- [`OthmanAdi/planning-with-files`](https://github.com/OthmanAdi/planning-with-files) by Othman Adi and contributors

Harness vendors these projects as upstream baselines, preserves their attribution, and layers repository-specific governance on top.

## Quick Start

Workspace install:

```bash
./scripts/harness install --scope=workspace --targets=all --projection=link
./scripts/harness sync
./scripts/harness doctor
```

User-global baseline:

```bash
./scripts/harness install --scope=user-global --targets=all --projection=link
./scripts/harness sync
./scripts/harness doctor
```

Use `--scope=both` when you want a shared user-global baseline plus repository-local entry files.

## Installation Modes

| Mode | Use when | Result |
| --- | --- | --- |
| Replace | Existing rules should be retired | Harness-rendered files become the rule source |
| Update | Harness already owns the scope | `sync` refreshes the rendered files |
| Enhance | Existing lower-level rules are still useful | Harness stays above them as governance |
| Wrap | Another local router already coordinates behavior | Harness sets policy and delegates selectively |

## What Harness Projects

Harness manages three categories of target output:

1. **Entry files** for Codex, GitHub Copilot, Cursor, and Claude Code
2. **Skills** projected into each target's discovery path
3. **Hooks** only when explicitly enabled

Hooks are opt-in:

```bash
./scripts/harness install --scope=workspace --targets=all --projection=link --hooks=on
./scripts/harness sync
./scripts/harness doctor --check-only
```

Detailed target paths, hook behavior, and adapter support live in the docs instead of this README.

## Upstream Updates

Harness keeps governance separate from vendored upstream content.

```bash
./scripts/harness fetch
./scripts/harness update
```

To update a single upstream baseline:

```bash
./scripts/harness fetch --source=superpowers
./scripts/harness fetch --source=planning-with-files
./scripts/harness update --source=superpowers
./scripts/harness update --source=planning-with-files
```

After updating baselines:

```bash
npm run verify
./scripts/harness sync --dry-run
./scripts/harness sync
./scripts/harness doctor
```

## Commands

```bash
./scripts/harness install
./scripts/harness sync
./scripts/harness doctor
./scripts/harness status
./scripts/harness fetch
./scripts/harness update
./scripts/harness verify --output=.harness/verification
./scripts/harness worktree-preflight
```

## Docs

- [Architecture](docs/architecture.md)
- [Maintenance](docs/maintenance.md)
- [Release](docs/release.md)
- [Platform support](docs/install/platform-support.md)
- [Codex installation](docs/install/codex.md)
- [GitHub Copilot installation](docs/install/copilot.md)
- [Cursor installation](docs/install/cursor.md)
- [Claude Code installation](docs/install/claude-code.md)

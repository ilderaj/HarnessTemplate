# Findings

- Worktree base: `codex/global-context-remediation` @ current `HEAD`.
- The current superpowers session-start script reads the full upstream `using-superpowers/SKILL.md`; that is the main payload bloat source.
- `context-budgets.json` already defines a `hookPayload` budget, so health can reuse existing thresholds instead of inventing a new config shape.
- `health.context` currently tracks entries, hooks, planning, and skillProfiles, but not measured hook payloads.
- `health.context.hooks` now records the local `superpowers` SessionStart payload and the planning hot context payload when `hookMode=on`.
- The planning hot context test needs an absolute script path because the fixture `cwd` changes to the temp task root.

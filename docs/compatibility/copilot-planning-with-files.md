# Copilot Planning With Files Compatibility

Copilot receives a materialized `planning-with-files` copy because its skill loading and hook behavior can differ from Codex and Claude Code.

The materialized copy must preserve:

- task-scoped planning paths,
- `task_plan.md`, `findings.md`, and `progress.md`,
- restore-context guidance,
- sync-back behavior.

The materialized copy must avoid incompatible hook assumptions.

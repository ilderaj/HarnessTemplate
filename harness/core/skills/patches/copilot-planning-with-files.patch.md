# Copilot Planning With Files Patch

Copilot receives a materialized `planning-with-files` copy because Copilot skill loading and hook behavior differs from Codex and Claude Code.

Patch behavior:

- preserve the planning workflow body,
- remove or avoid incompatible hook assumptions,
- keep task-scoped planning paths unchanged,
- keep the skill name `planning-with-files`.

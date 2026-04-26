# Progress Log

## 2026-04-26

- 创建 task-scoped planning 目录 `planning/active/cross-ide-hook-capability-alignment/`。
- 已加载 process skills：`using-superpowers`、`brainstorming`、`planning-with-files`、`writing-plans`。
- 已确认现有仓库中与本次整改直接相关的文档入口：
  - `docs/install/copilot.md`
  - `docs/install/claude-code.md`
  - `docs/install/cursor.md`
  - `docs/install/codex.md`
  - `docs/install/platform-support.md`
- 已确认可复用的历史审计基线：`planning/active/cross-ide-projection-audit/findings.md`。
- 已抓取并复核官方 hooks 文档：
  - VS Code / GitHub Copilot preview hooks
  - Claude Code hooks reference
  - Codex hooks
  - Cursor hooks
  - Cursor third-party Claude hooks
- 本轮新确认的关键事实：
  - VS Code Chat hooks 是原生 runtime，不只是兼容读取外部格式。
  - VS Code 默认会读取 `.claude/settings*.json`，但存在 matcher 忽略与 tool schema 差异。
  - Cursor 原生 hooks 与 third-party Claude hooks 都已有官方页面；仓库中 `provisional` 表述已过时。
  - Codex hooks 官方页面现可直接抓取；`codex_hooks = true` 仍是前提。
- 已读取本地实现控制点：
  - `harness/installer/lib/hook-projection.mjs`
  - `harness/core/hooks/planning-with-files/copilot-hooks.json`
  - `harness/core/hooks/planning-with-files/scripts/task-scoped-hook.sh`
  - `harness/core/skills/index.json`
  - `harness/installer/lib/health.mjs`
- 已识别的主要整改点：
  - Copilot planning hook 事件名仍停留在旧 schema（`agentStop` / `errorOccurred`）。
  - Copilot 未声明 `superpowers` hook adapter。
  - health 仍把 Cursor 硬编码为 provisional。
  - 多份安装/兼容/架构文档仍保留过时事实。
- 已起草 companion implementation plan：`docs/superpowers/plans/2026-04-26-cross-ide-hook-capability-alignment.md`。
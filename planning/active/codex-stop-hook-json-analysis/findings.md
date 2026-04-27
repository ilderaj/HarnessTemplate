# 发现

- 用户级 Codex 配置当前已安装 Harness 管理的 hooks：`/Users/jared/.codex/hooks.json` 中同时存在 `SessionStart`、`UserPromptSubmit`、`Stop` 三个 Harness-managed entries，其中 `Stop` 指向 `/Users/jared/.codex/hooks/task-scoped-hook.sh codex stop`。
- 仓库安装文档与投影逻辑明确说明 Harness 会为 Codex 投影 planning hook：`docs/install/codex.md` 写明 `--hooks=on` 时会投影 Codex hooks；`harness/installer/lib/hook-projection.mjs` 将 Codex planning 事件硬编码为 `SessionStart`、`UserPromptSubmit`、`Stop`；`harness/core/hooks/planning-with-files/codex-hooks.json` 为这三个事件都生成 command hooks。
- 当前 Harness 的 Codex task-scoped hook 对所有非空上下文统一输出 `{"hookSpecificOutput":{"hookEventName":...,"additionalContext":...}}`，见 `harness/core/hooks/planning-with-files/scripts/task-scoped-hook.sh` 与当前安装脚本 `/Users/jared/.codex/hooks/task-scoped-hook.sh`。
- 官方 Codex hooks 实现对 `UserPromptSubmit` / `SessionStart` 接受 `hookSpecificOutput.additionalContext`，但 `Stop` 的输出结构只接受 universal fields 加 `decision`/`reason`，不接受 `hookSpecificOutput`。因此 Harness 的 Codex `Stop` hook 输出结构与 Codex 的 `stop.command.output` schema 不兼容，会被解析为 `hook returned invalid stop hook JSON output`。
- 现场复现：在当前仓库执行 `/Users/jared/.codex/hooks/task-scoped-hook.sh codex stop`，stdout 为 `{"hookSpecificOutput":{"hookEventName":"stop","additionalContext":"[planning-with-files] Multiple active tasks found under planning/active. Inspect the task directories before proceeding."}}`。这证明当前生效的用户级 Harness hook 确实在 stop 事件输出 Codex 不接受的 payload。
- 额外发现：当存在多个 active tasks 时，脚本走 `emit_context ... "$event"` 分支，传出的 `hookEventName` 是原始小写/短横线事件名（如 `stop`、`user-prompt-submit`），而不是 Codex 期望的常量名（如 `Stop`、`UserPromptSubmit`）。这意味着即使不考虑 `Stop` 的 schema 限制，多 active task 分支对 Codex 的事件名也不稳妥。
- 设计结论已经固化为 spec：`docs/superpowers/specs/2026-04-27-codex-hook-allowlist-design.md`。
- implementation plan 已写入：`docs/superpowers/plans/2026-04-27-codex-hook-allowlist-implementation-plan.md`，实施范围收敛为 projection/config、回归测试、文档对齐和 task-memory sync，不包含上游源码修改。

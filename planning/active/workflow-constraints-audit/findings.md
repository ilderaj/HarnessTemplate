## 当前发现

- 本次关注的最近提交至少包括：
  - `c030cbe`：澄清 task classification 与 precedence。
  - `37340d5`：引入 deep-reasoning companion-plan model。
- `AGENTS.md` 已包含：
  - hybrid workflow 基线；
  - task classification / rule precedence；
  - superpowers 使用边界与 sync-back 规则；
  - companion plan model 与 `planning/active/<task-id>/` 的权威性声明。
- `README.md` 已有高层说明，但还需要继续核对其是否足够明确回答：
  - tracked task 不得因 “straightforward work” 绕过 `planning-with-files`；
  - companion plan 不是 implementation dump，也不能替代 task plan。

## 待验证点

- 各 IDE 入口文档是否都承接了同一套约束，而不是只在 `AGENTS.md` 存在。
- `doctor` / `verify` / 兼容文档是否对 companion plan 给出一致边界。
- README 是否需要更直接地写明“tracked task 优先于 straightforward work 直做”这一点。

## 审计结论

- 相关约束已经存在于共享 policy 源头 `harness/core/policy/base.md`，不是只存在于单个 IDE 入口文件。
- 四个 adapter manifest 都从同一套模板与 core policy 渲染入口文档，因此这些规则在设计上是跨 Codex、Copilot、Cursor、Claude Code 统一生效的。
- `harness/installer/lib/superpowers-writing-plans-patch.mjs` 会在投影 `writing-plans` 技能时覆盖上游默认保存位置，并把 companion plan 约束注入实际技能内容。
- `tests/adapters/templates.test.mjs` 已验证所有支持目标渲染出的入口都包含 companion-plan / sync-back 规则。
- `tests/adapters/sync-skills.test.mjs` 已验证投影后的 `writing-plans` 技能带有 Harness patch。
- `tests/installer/health.test.mjs` 已验证：
  - 被 active task 正确引用的 companion plan 不会被报错；
  - orphan companion plan 会被告警；
  - root-level planning files 只会作为位置警告处理。

## 本次补强

- 明确写入：一旦任务被归类为 tracked task，不能再被 “straightforward work 直接执行” 的默认行为覆盖。
- 明确写入：superpowers 的 sync-back 只能回填 durable summary，不能把完整 implementation plan 直接粘进 `planning/active/<task-id>/task_plan.md`。
- 明确写入：存在 companion plan 时，详细 implementation checklist 属于 companion artifact；`task_plan.md` 只保留 lifecycle、phase、finishing criteria 与 durable decisions。

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

## 2026-04-18 复核结论

- 当前 `dev` HEAD 为 `74f342e (Tighten planning-with-files and superpowers policy)`；与本次问题直接相关的连续提交为：
  - `c030cbe`：task classification / precedence / tracked-task 触发条件澄清。
  - `37340d5`：deep-reasoning companion-plan model 与 plan-location/health 语义落地。
  - `74f342e`：summary-only sync-back 与 companion-plan 边界进一步收紧。
- 共享源头 `harness/core/policy/base.md` 已同时包含：
  - `Rule Precedence`
  - `Quick task` / `Tracked task` / `Deep-reasoning task`
  - “tracked task 不会被 quick-work 默认行为覆盖”
  - “sync-back is summary-only”
  - `Companion Plan Model`
- 四个支持目标并不是各自维护一份独立 policy，而是统一经过 `renderEntry()`：
  - 读取 `harness/core/policy/base.md`
  - 叠加各 target 的 `platformOverride`
  - 渲染到各自 entry template
- `writing-plans` 的上游默认保存位置会在 projection 阶段被 `harness/installer/lib/superpowers-writing-plans-patch.mjs` 覆盖；当前 patch 明确要求：
  - durable task state 留在 `planning/active/<task-id>/`
  - `docs/superpowers/plans/**` 只允许作为 Deep-reasoning companion artifact
  - detailed implementation plan 留在 companion artifact
  - active planning files 只回填 path / short summary / sync-back status
- `plan-locations.mjs` 与 `health.test.mjs` 已把 companion plan 的运行语义固化为：
  - 被 active task planning files 引用的 companion plan：`ok`
  - 未被引用的 companion plan：`warning`
  - canonical planning files 不可读时：`problem`
- 当前“跨 IDE 同样效果”的证据链以“共享源头 + render/projection + tests/doctor/verify”为主，不是依赖仓库内已经 materialize 出来的四套目标文件。

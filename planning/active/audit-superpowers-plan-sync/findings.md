# Findings

## Scope

- 审计目标文件：
  - `/Users/jared/HarnessTemplate/harness/core/policy/base.md`
  - `/Users/jared/HarnessTemplate/planning/active/superpowers-plan-artifact-model/task_plan.md`
- 审计范围扩展到：
  - `HarnessTemplate` 中与 companion-plan 相关的 projection、installer、tests、docs
  - Jared 的全局 / 工作区 IDE 入口文件与技能投影结果
  - 重点检查 Copilot

## Recovered Context

- `superpowers-plan-artifact-model` 任务计划声称：
  - companion plan 在实际使用 Superpowers 时为 mandatory persistence
  - active planning files 与 companion plan 之间必须双向引用
  - 四个 supported targets 都已同步适配
- `cross-ide-projection-audit` 已确认：
  - Copilot workspace entry 为 `.github/copilot-instructions.md`
  - Copilot user-global entry 为 `~/.copilot/instructions/harness.instructions.md`
  - Copilot 专门存在 `planning-with-files` projection / patch
- `plan-location-consolidation` 是旧模型：
  - 当时仍把 `docs/superpowers/plans/**` 视为历史/外部位置，而不是 required companion artifact

## Working Hypothesis

- 需要特别验证是否存在“源策略已升级，但某些 rendered entry、patch 或现存 workspace 仍停留在旧模型”的裂缝。

## Audit Results

### 1. 源策略与测试链路：已升级到新模型

- `harness/core/policy/base.md` 已明确要求：
  - 实际使用 Superpowers 时，详细 implementation plan 必须落到 `docs/superpowers/plans/<date>-<task-id>.md`
  - active planning files 与 companion plan 必须双向引用
  - `planning/active/<task-id>/` 仍是唯一 authoritative task memory
- `HarnessTemplate/AGENTS.md` 已与 source policy 对齐，包含同样的 `Companion Plan Model` 结构。
- 测试也证明 source/render/projection/health 这一层已经支持新模型：
  - `tests/adapters/templates.test.mjs` 对四个 supported targets 断言 `Companion Plan Model`、required companion artifact、双向引用、sync-back status
  - `tests/adapters/sync-skills.test.mjs` 断言 projected `writing-plans` 已要求 companion plan + sync-back status
  - `tests/installer/health.test.mjs` 断言 referenced companion / missing back-reference / orphan companion 的健康语义
- 运行验证结果：34 tests passed, 0 failed。

### 2. Jared 的真实 user-global 入口：仍是旧模型，未同步

- `/Users/jared/.codex/AGENTS.md` 仍保留旧版 `Mandatory Sync-Back Rule`：
  - 只要求 “Finish the reasoning pass” 和 summary sync-back
  - 仍把 `docs/superpowers/plans/**` 视为默认不应跟随的 docs path
  - 缺少 `Companion Plan Model`
- `/Users/jared/.copilot/instructions/harness.instructions.md` 同样还是旧模型。
- `/Users/jared/.claude/CLAUDE.md` 也还是旧模型。
- 这直接说明：Jared 的 user-global Codex / Copilot / Claude Code 入口，并没有跟上 `HarnessTemplate` 里的 companion-plan 新语义。

### 3. Jared 的真实 projected skills：四个平台的 `writing-plans` 都还是旧补丁

- `/Users/jared/.agents/skills/writing-plans/SKILL.md`
- `/Users/jared/.copilot/skills/writing-plans/SKILL.md`
- `/Users/jared/.claude/skills/writing-plans/SKILL.md`
- `/Users/jared/.cursor/skills/writing-plans/SKILL.md`

以上四个真实 skill 文件都还在写：
- `Do not create long-lived files under docs/superpowers/plans/ unless the user explicitly asks for that artifact.`
- 结尾仍写 `Plan complete and saved to docs/superpowers/plans/<filename>.md`

这与 source patch 已经改成：
- “If a Deep-reasoning task actually uses Superpowers, create a companion plan...”
- “write its path, a short summary, and the current sync-back status...”

说明真实 projected skills 没有刷新到当前仓库版本。

### 4. Copilot 特别存在一个实现级裂缝

- `docs/compatibility/copilot-planning-with-files.md` 声称 Copilot materialized `planning-with-files` copy “must also preserve the companion-plan boundary”。
- 但真实 source baseline `harness/upstream/planning-with-files/SKILL.md` 以及 Jared 上的 `/Users/jared/.copilot/skills/planning-with-files/SKILL.md` 仍保留旧句子：
  - `Do not create a parallel long-lived superpowers plan unless the user explicitly requests that file.`
- `harness/core/skills/patches/copilot-planning-with-files.patch.md` 只处理 Copilot skill root / hook 兼容，没有把 companion-plan 新语义补进去。

这说明 Copilot 不是单纯“没 sync”；就算 fresh sync，`planning-with-files` 的 Copilot 物化副本本身也会继续带着旧语义。

### 5. 源文档仍有残余旧表述

- `docs/architecture.md` 还写着：`writing-plans` patch 把 durable plans 写到 `planning/active/<task-id>/` “instead of `docs/superpowers/plans/**`”。
- 同文件和 `docs/compatibility/hooks.md` 还把 `docs/superpowers/plans/*.md` 笼统描述成 warning 路径。
- 这和现在 health/test 的真实语义不完全一致：
  - referenced companion plan = `ok`
  - missing back-reference / orphan companion plan = `warning`

所以不仅投影结果有滞后，源码文档本身也还没有彻底完成新模型收口。

## Scope Boundary

- 我确认了 `HarnessTemplate` 源实现、测试、user-global rendered entries、user-global projected skills。
- 我还抽查了 Jared 下多个 workspace 的 `AGENTS.md`，其中很多并不是 Harness render 产物，而是 OpenSpec 或项目 delta 文件；因此不能据此宣称 “所有 workspace 已同步”，只能说目前没有证据表明 Jared 全部 workspace 都已经统一投射到新模型。

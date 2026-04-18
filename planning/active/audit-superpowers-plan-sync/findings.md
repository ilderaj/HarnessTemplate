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

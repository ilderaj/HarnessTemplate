# Plan Location Consolidation

## Current State
Status: closed
Archive Eligible: yes
Close Reason: Plan location consolidation implemented, documented, verified, and ready for local commit/push.

## Goal

将 Harness 的计划文件逻辑收敛为一个清晰模型：`planning/active/<task-id>/` 是唯一的 agent task memory；`docs/**` 只承载面向人的项目文档；`docs/superpowers/plans/**` 默认不再作为新计划输出路径。

## Scope

- 更新核心 policy、架构文档和 README，明确路径职责。
- 增加机械检查，发现新建或存在的非 canonical plan 文件时给出明确诊断。
- 在 Harness projection 层覆盖 Superpowers `writing-plans` 默认保存路径，不修改 vendored upstream。
- 保持现有历史计划文件可读，不自动移动或删除。
- 完成验证后提交到本地 `dev` 并推送 `origin/dev`。

## Finishing Criteria

- `README.md` 说明新的收敛规则。
- `harness/core/policy/base.md` 和相关文档说明路径职责和禁止默认写入 `docs/superpowers/plans`。
- `doctor`/health 检查能报告非 canonical plan 文件。
- Superpowers `writing-plans` 的投影副本包含 Harness 覆盖说明。
- 相关测试覆盖新增行为。
- `npm run verify` 通过。
- 任务 lifecycle 更新为 `closed` / `Archive Eligible: yes`。
- 变更已 commit 到 `dev` 并 push 到 `origin/dev`。

## Phases

- [x] Phase 1: 读取现有文档、projection、health/doctor 和测试结构。
- [x] Phase 2: 为非 canonical plan 检查和 Superpowers projection 覆盖补测试。
- [x] Phase 3: 实现 health/doctor 检查与 projection patch。
- [x] Phase 4: 更新核心 policy、架构文档、README。
- [x] Phase 5: 运行验证并修复失败。
- [x] Phase 6: 关闭 planning，提交并推送。

## Decisions

| Decision | Rationale |
| --- | --- |
| 不移动现有 `docs/superpowers/plans/**` | 它们是历史上下文，自动迁移会混淆来源和审计记录。 |
| 不修改 `harness/upstream/superpowers/**` | upstream baseline 应保持可替换；Harness 自己的覆盖应放在 core/installer projection 层。 |
| 机械检查默认报告问题而不是自动改写 | plan 路径散落需要人或 agent 做任务上下文判断，不能靠工具盲目合并。 |

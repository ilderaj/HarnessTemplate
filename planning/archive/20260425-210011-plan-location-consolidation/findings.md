# Findings

## 2026-04-16

- 当前分支是 `dev`，远端为 `origin https://github.com/ilderaj/HarnessTemplate.git`。
- 当前 policy 已说明 `planning/active/<task-id>/` 是持久任务状态，且 Superpowers 的 `docs/superpowers/plans/` 默认位置被 Harness 覆盖。
- 上游 Superpowers `writing-plans` 仍在技能正文中要求保存到 `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`；不能直接改 `harness/upstream/superpowers/**`，需要 projection 层覆盖。
- `planning-with-files` skill 已说明任务文件应放在 `planning/active/<task-id>/`。
- `doctor` 目前只检查 projected entry 中的个人路径；health 层目前不检查 plan 文件散落。
- `docs/architecture.md` 已说明 planning hook 只读 `planning/active/<task-id>/`，但 README 还需要更直观地说明计划路径职责。
- `./scripts/harness doctor --check-only` 在当前工作区会因为既有投影状态失败：Codex skill projection 缺失，Copilot/Cursor/Claude Code 多个 skill projection 仍是 symlink 而当前 metadata 期望 materialized directory。本次不运行 `sync` 改写这些工作区投影，避免把安装状态修复混入本次代码改造。
- 新增 `inspectPlanLocations(process.cwd())` 在当前仓库只报告 `docs/superpowers/plans` warning，符合“历史文件可见但不失败”的设计。

## Durable Model

| Path | Role |
| --- | --- |
| `planning/active/<task-id>/task_plan.md` | 当前任务计划和 lifecycle。 |
| `planning/active/<task-id>/findings.md` | 当前任务发现和持久决策。 |
| `planning/active/<task-id>/progress.md` | 当前任务执行日志和验证结果。 |
| `planning/archive/<timestamp>-<task-id>/` | 明确关闭且允许归档的历史任务。 |
| `docs/**` | 面向人的项目文档，不是 agent task memory。 |
| `docs/superpowers/plans/**` | 历史/外部计划位置；Harness 默认不再新建。 |
| `harness/upstream/**` | vendored upstream baseline，不代表当前项目任务状态。 |

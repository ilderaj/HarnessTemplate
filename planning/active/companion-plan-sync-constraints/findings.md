# Findings: Companion Plan Sync Constraints

## Verified Findings

- 当前 `plan-locations.mjs` 只负责扫描和报告 companion-plan 引用关系，主要消费点是 `readHarnessHealth()`。
- 当前 `harness/upstream/planning-with-files/scripts/close-task.sh` 与 `archive-task.sh` 只做 lifecycle / archive 路径处理，不会同步或强校验 companion plan。

## Open Threads

- 约束应该落在 `health`、`close-task`、`archive-task`，还是新增专门的 planning consistency gate，仍待设计决策。
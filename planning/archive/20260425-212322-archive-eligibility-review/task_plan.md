# 任务计划：归档资格执行与剩余任务完成度审查

## Current State
Status: closed
Archive Eligible: yes
Close Reason: Findings were applied to active planning tasks, archive-ready tasks were archived, and review-state tasks were updated.

## Goal

先归档当前 `planning/active/` 中 4 个已明确 `closed` 且 `Archive Eligible: yes` 的任务；随后完整审查其余 active task 对应的实际代码和文档状态，判断哪些任务已经实质完成、只差更新 lifecycle，并向用户输出结论，不对这些剩余任务直接归档。

## Finishing Criteria

- 4 个明确可归档任务已移动到 `planning/archive/`。
- 剩余 active task 已逐个核对 `task_plan.md` 与实际代码/文档/验证证据。
- 输出一份按严重性排序的 review 结论，说明哪些任务可更新为 `closed` 或 `waiting_integration`，以及哪些仍未完成。
- 不对除上述 4 个任务之外的任何 task 执行 archive。

## Phases

- [x] Phase 1: 建立当前任务 planning 并确认归档规则与目标任务。
- [x] Phase 2: 归档 4 个已明确满足条件的任务，并验证移动结果。
- [x] Phase 3: 审查剩余 active task 的计划状态与实际代码完成度。
- [x] Phase 4: 汇总 review 结论与建议状态更新，向用户报告。
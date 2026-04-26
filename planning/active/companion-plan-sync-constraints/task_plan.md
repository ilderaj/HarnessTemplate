# Task Plan: Companion Plan Sync Constraints

## Goal
评估并设计一套更强的 companion-plan 同步约束，覆盖 active task planning 更新与 archive 场景，避免 active plan 与 companion plan 的双向引用、sync-back 状态或归档位置发生漂移而未被及时阻断。

## Current State
Status: active
Archive Eligible: no
Close Reason:

## Current Phase
Phase 1

## Phases

### Phase 1: Context And Gap Analysis
- [ ] 读取 close/archive 与 plan-location 校验入口
- [ ] 确认当前约束是 warn-only 还是存在阻断点
- [ ] 定义这次需要补的场景边界
- **Status:** in_progress

### Phase 2: Constraint Design
- [ ] 比较 warn-only / hard-block / assisted-sync 三种约束方案
- [ ] 给出推荐方案与落点
- [ ] 明确验证与回退策略
- **Status:** not_started

## Notes
- 本任务当前先做设计与约束方案评估，不直接实现代码。
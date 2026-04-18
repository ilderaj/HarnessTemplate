# 任务计划：Cross-IDE Companion Plan Patch

## Goal

检查并修复 HarnessTemplate 中 `planning-with-files` 的 companion-plan 语义投影缺口，重点覆盖 Copilot 的现有 patch，并确认 Codex、Cursor、Claude Code 是否存在同类问题；完成代码、测试与文档一致性验证。

## Current State
Status: active
Archive Eligible: no
Close Reason:

## Current Phase

Phase 3

## Phases

### Phase 1: 现状审计与根因确认
- [x] 审计 `planning-with-files` 上游内容、Harness patch、投影逻辑与现有测试
- [x] 确认 Copilot 是否只处理 root / hook 兼容而未处理 companion-plan 语义
- [x] 确认其它 IDE 是否投影了同样的旧语义
- **Status:** complete

### Phase 2: 测试先行与实现修复
- [x] 先补 failing tests，锁定 companion-plan 语义在 projected skills 中的期望
- [x] 重构 patch 机制，使通用 `planning-with-files` patch 覆盖所有相关 IDE
- [x] 保留 Copilot 的路径与 hook 兼容逻辑，不回退现有行为
- **Status:** complete

### Phase 3: 验证与收尾
- [x] 运行 focused tests
- [x] 运行仓库验证命令
- [x] 更新 findings/progress，记录影响范围、改动与验证结果
- **Status:** complete

## Key Questions
1. Copilot 当前 patch 是否确实只处理 `${CLAUDE_PLUGIN_ROOT}` 和 patch marker，而未覆盖 companion-plan 语义？
2. 其它 IDE 的 `planning-with-files` 投影是否也直接继承了上游旧语义？
3. 最小且正确的修复边界是“扩展 Copilot patch”还是“抽出跨 IDE 通用 patch，再叠加 Copilot 专属 patch”？

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 当前任务作为 tracked task 新建独立 planning 目录 | 需要跨多平台审计、修改与验证，且要保留 durable 决策 |
| 不只扩展 Copilot patch，而是抽出跨 IDE 通用 `planning-with-files` companion-plan patch | 根因来自上游 `planning-with-files` 文案本身；只修 Copilot 会留下 Codex / Cursor / Claude Code 的同类缺口 |
| Copilot 继续保留专属 patch，并在 shared patch 之后叠加 | Copilot 仍需 skill-root 兼容处理，但 companion-plan 语义不应成为 Copilot 特例 |
| skill projection / health 改为支持有序 `patches` 列表 | 需要让同一 skill 在同一 target 上顺序叠加多个 patch，并让 `doctor` 校验全部 marker |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `fd` 命令不存在 | 1 | 改用 `find` 与 `rg` |

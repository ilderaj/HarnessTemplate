# Findings: Session 收尾总结机制

## 1. Repo 已有的可复用能力（事实）

- `harness/core/hooks/planning-with-files/scripts/planning-hot-context.mjs` 已经在做"基于 planning files 的结构化提取"：解析一级标题（任务名）、`## 任务目标` / `## Goal`、`## Current State` 中的 `Status`，以及 `findings.md` / `progress.md` 的项目符号。
  - 提供 `compact()` 工具把每条 ≤180 字符截断 — 直接可复用作为"精炼"的硬约束。
  - 区分 `fromEnd=true`（progress 取最近 3 条），符合"会话末尾"语义。
- `task-scoped-hook.sh` 已实现 4 个 adapter（codex/copilot/cursor/claude-code）的 payload 包装与 `stop / agent-stop / session-end` 分支，但当前这些事件只输出一句静态提示。这是**唯一需要替换**的集成点。
- `harness/upstream/planning-with-files/scripts/task_lifecycle.py` 中 `_count_phase_statuses()` 已经能从 `task_plan.md` 解析 `### Phase` + `**Status:** complete|in_progress|pending` — 这正是 checklist 的权威来源；`format_summary()` 是已存在的"小总结"先例。
- `harness/core/context-budgets.json` 给出 `hookPayload.warn = 12000 chars / 160 lines / 3000 tokens` — summary 的硬上限就该取这个。
- `installer/lib/planning-hot-context.mjs` 是 `harness/core/...` 脚本的薄 re-export，已建立"hook 脚本 ↔ Node 库 ↔ 测试"的桥接模式。新模块沿用同一模式即可。

## 2. 数据源映射（事实 + 设计）

| 输出字段 | 权威来源 | 备注 |
|----------|----------|------|
| Task title | `task_plan.md` 一级标题 | 已实现于 `planning-hot-context` |
| Status | `task_plan.md` `## Current State` 的 `Status:` | 同上 |
| Phases x/y | 解析所有 `### Phase` 与 `**Status:** complete` | 移植 `_count_phase_statuses` 正则到 JS |
| Checklist | 每个 phase 的标题 + status | `[x] complete` / `[~] in_progress` / `[ ] pending` |
| Duration | `.session-start` sidecar epoch ↔ now；fallback 到 `progress.md` 中 `Started:` 行 | sidecar 由 `session-start` 事件写入 |
| Conclusion | progress.md 最后一条 bullet 或 task_plan.md `Close Reason`（如已 closed） | 不让模型自由生成 |
| Findings | `findings.md` 前 3 条 bullet | 已复用 `collectBullets` |
| Tests | `progress.md` 的 `## Test Results` 表行数与 `Status` 列统计 | 简单计数 |
| Errors | `progress.md` 的 `## Error Log` 表行数 | 简单计数 |
| Next | 第一个 `pending` phase 标题 | 取自 phase 解析结果 |

## 3. 不适合的方案（已否决）

- **新增 `summary.md` 持久文件**：违反 "planning files 是单一来源" 的 harness 原则；`progress.md` 已是 session 日志。
- **完全交给模型生成**：违反用户"让结构化数据成为主要来源"的硬约束。
- **接入 superpowers**：superpowers 是 Deep-reasoning 工具，session 收尾是常驻能力，不属于其语义。
- **接入 metadata/state**：state-schema 是安装级状态，跟 task 实例无关。
- **使用 `$XDG_STATE_HOME` 全局缓存 duration**：会引入跨任务串扰；放在 `planning/active/<task-id>/.session-start` 更干净。

## 4. 风险与边界

- **多活动任务**：现有 hook 已对 `task_count > 1` 输出"多任务"提示并退出。Summary 行为应相同（不主观选一个）。
- **Adapter payload 形状差异**：必须沿用现有 `emit_context()`，不要自创 JSON 结构。
- **Budget 命中**：每节硬截断 + 整体 `hookPayload.warn` 校验；测试中加断言。
- **Hook 模式关闭时**：CLI `harness summary` 仍可工作，给出相同输出，便于在 hookMode=off 的 IDE 下手动获取。
- **Sidecar 残留**：Stop hook 应在读完后 `rm -f .session-start`；多次 SessionStart 仅以最近一次为准（覆盖写入）。

## 5. 输出契约（草案）

```
[planning-with-files] SESSION SUMMARY
Task: <title> (<task-id>)
Status: <status>  Phases: <c>/<t>  Duration: <Hh Mm | unavailable>

Conclusion:
- <single line>

Checklist:
- [x] Phase 1: ...
- [~] Phase 2: ...
- [ ] Phase 3: ...

Key findings:
- ... (≤3)

Verification:
- Tests: <pass>/<total> (or "none recorded")
- Errors logged: <n>

Next:
- <first pending phase title>

Sources: planning/active/<task-id>/{task_plan.md,progress.md,findings.md}
```

行数预算：4 + 1 + 2 + (phase 数 + 1) + 4 + 4 + 2 + 1 ≈ 25 行典型情况，远低于 160 行警戒。

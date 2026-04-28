# Findings & Decisions

## Requirements
- 分析 GitHub Copilot 从 PRU/request-based 切到 usage-based billing 后，对当前 Harness 在不同 chat 场景下的成本影响。
- 需要覆盖 input、output、cached token 三类消耗，而不是只看 prompt 大小。
- 需要给出一个“不明显削弱 Harness 效能”的 usage 优化计划。
- 本轮只输出计划，不直接执行改动。

## Research Findings
- GitHub 将从 2026-06-01 起把 Copilot premium request units 替换为 GitHub AI Credits。
- 使用量将按 token 消耗计费，明确包括 input、output、cached tokens。
- code completions 和 Next Edit suggestions 仍包含在套餐内，不消耗 AI Credits；本任务应聚焦 chat / agentic session。
- fallback 低价模型兜底将不再可用，意味着超额 usage 不再由平台默默吸收，而是会直接反映为预算和 spend 控制问题。
- 现有仓库任务 `planning/active/global-rule-context-load-analysis/` 已记录关键基线：
  - shared `base.md` 约 4096 tokens。
  - 各平台 rendered entry 约 4.1k-4.2k tokens，说明 shared policy 是主要固定税来源。
  - Harness 管理的核心 skills 量级约 30k+ tokens；若平台未充分懒加载，会形成显著背景面。
  - superpowers session-start 与 planning-with-files hooks 会把 skill 内容和 task hot context 注入 prompt，这会直接转成 usage-based billing 下的 input/cached 成本。
- `harness/core/context-budgets.json` 已存在预算原语：
  - `entry.warn = 7500 tokens`
  - `hookPayload.warn = 3000 tokens`
  - `planningHotContext.warn = 4000 tokens`
  - `skillProfile.warn = 5500 tokens`
  这些预算已足够作为场景分析的成本边界输入。
- `harness/installer/lib/health.mjs` 在实现前已经有：
  - `context.entries` 和 `context.hooks` 的测量能力
  - `context.planning` 与 `context.skillProfiles` 的容器占位
  - 但 `context.summary` 只汇总了 `entries`
- `harness/core/hooks/planning-with-files/scripts/task-scoped-hook.sh` 的真实 planning 热上下文来源是 `render-hot-context.mjs`，其核心实现通过 `buildPlanningHotContext()` 生成。
- `harness/installer/lib/planning-hot-context.mjs` 已对外 re-export `buildPlanningHotContext`，适合在 installer health 层直接复用。
- 将 `skillProfile` 直接按所有 `SKILL.md` 正文求和会把轻量安装场景也变成预算问题；第一版更合理的定义是“当前 profile 在 hook-enabled 场景下的技能发现面账本”。

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 用“固定税 / 恢复税 / 执行税”作为成本分析主框架 | 与仓库既有分析口径一致，且更适合 usage-based billing 的场景化比较 |
| 将 cached token 单独建模 | 新计费明确 cached token 也消耗 credits，不能被折叠进 input |
| 先做计划，不做代码级整改 | 用户要求先输出计划；当前目标是决策质量而不是实现速度 |
| 第 1 阶段实现只补 context ledger，不重做预算系统 | 现有 `measureText` / `evaluateBudget` / `readHarnessHealth` 已有足够基础 |
| `verify` markdown 报告新增 hooks / planning / skill profile 三类摘要 | 这样 CLI 用户无需翻 JSON 也能看到主要输入成本面 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| 仓库中已有多个上下文治理任务，容易与本次 billing 主题混淆 | 新建独立 task，并把旧任务仅作为证据来源而非执行容器 |
| `~/.agents/skills` 本轮不存在技能文件，真实 skill root 在 workspace `.agents/skills/` | 改为读取 workspace skill 投影，避免错误引用用户目录 |
| `skillProfile` summary 初版会污染 entry-only 预算测试 | 将其测量范围收敛到 `hookMode=on` 场景，保留轻量校验稳定性 |

## Destructive Operations Log
| Command | Target | Checkpoint | Rollback |
|---------|--------|------------|----------|
|         |        |            |          |

## Resources
- GitHub blog: https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/
- 已有基线任务：`planning/active/global-rule-context-load-analysis/`
- 预算配置：`harness/core/context-budgets.json`
- Copilot compatibility note: `docs/compatibility/copilot-planning-with-files.md`
- 关键实现：`harness/installer/lib/health.mjs`
- 关键实现：`harness/installer/commands/verify.mjs`
- 真实 planning helper：`harness/installer/lib/planning-hot-context.mjs`

## Visual/Browser Findings
- GitHub 官方说明明确把 usage-based billing 的对象从“请求单位”切换成“token usage”，并把 input、output、cached token 全部纳入 credits 计算。
- 官方还给出 early May preview bill experience，说明“先建立 usage 可观测性，再做治理”是产品自身推荐路径；这对 Harness 计划意味着第一阶段不该直接重写系统，而应先建立成本可见性与场景预算。
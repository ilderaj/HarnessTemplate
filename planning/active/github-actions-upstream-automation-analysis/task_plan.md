# Task Plan: GitHub Actions Upstream Automation Analysis

## Goal
分析并规划如何用 GitHub Actions 定期检测 Superpowers 和 Planning with Files 主源变更，在本项目内自动刷新 baseline、执行验证，并以 PR 方式把结果落到 `dev`。

## Current State
Status: waiting_review
Archive Eligible: no
Close Reason:

## Current Phase
Phase 10

## Phases

### Phase 1: 仓库上下文与约束确认
- [x] 读取用户问题与仓库工作流约束
- [x] 确认已有 upstream update 能力与 planning 任务状态
- [x] 确认本次只做分析、不改源码
- **Status:** complete

### Phase 2: 外部能力与风险调研
- [x] 查阅 GitHub Actions、PR、auto-merge、权限和相关官方文档
- [x] 结合本项目 upstream source 设计判断可行方案
- [x] 记录关键发现
- **Status:** complete

### Phase 3: 分析结论交付
- [x] 给出推荐架构
- [x] 列出可自动化部分、需人工审批部分、风险与落地条件
- [x] 更新 planning 文件并向用户汇报
- **Status:** complete

### Phase 4: README 精简同步
- [x] 根据已确认的 Git source 状态，精简 README 的 upstream 更新说明
- [x] 确认 README 不再出现旧的本地 `--from` 指令
- **Status:** complete

### Phase 5: GitHub Actions 落地计划评审
- [x] 结合当前仓库与 GitHub 远端状态复核自动化前提
- [x] 审核“每周五拉取 upstream 更新并最终落到 origin dev”的计划路径
- [x] 输出计划风险、缺口和建议执行顺序
- **Status:** complete

### Phase 6: 可执行实现计划编写
- [x] 按 `writing-plans` 规则产出可落地执行的分步实现计划
- [x] 将实现计划写入当前 task 的 durable planning 文件
- [x] 将任务状态切换为 `waiting_review`
- **Status:** complete

### Phase 7: 旧计划有效性复核与修订
- [x] 结合仓库最新更新复核旧计划的技术与流程前提
- [x] 标记旧计划中已失效或需替换的关键假设
- [x] 产出一版修订后的可执行计划供 review
- **Status:** complete

### Phase 8: 计划 review 收口
- [x] 复核当前 GitHub 远端前提是否仍与旧 review 一致
- [x] 基于用户三点目标给出可执行与不可直接执行的边界
- [x] 把最新 review 结论写回 task-scoped planning 文件
- **Status:** complete

### Phase 9: 计划修订与 companion plan 收口
- [x] 按 review 结论重写实施计划
- [x] 把详细执行清单迁移到 companion plan
- [x] 在 task-scoped planning 文件中只保留摘要、决策和引用
- **Status:** complete

### Phase 10: 4 月 30 日方案复核与实施计划更新
- [x] 复核当前仓库是否已有 workflow / CI automation 实现
- [x] 复核远端默认分支、`dev` branch protection 和目标 PR 状态
- [x] 明确 GitHub 云端自动化与本地 `dev` 同步的边界
- [x] 更新 companion plan 的详细实施清单
- **Status:** complete

## Key Questions
1. GitHub Actions 是否能定期检测两个 upstream 主源的变更？
2. Actions 是否能安全触发本项目已有 `fetch` / `update` 流程？
3. 更新后自动代码审查、验证、PR 创建/更新、合并分别能做到什么程度？
4. 哪些环节必须设置权限、分支保护或人工审批，避免供应链和权限风险？

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 本次只做分析与计划修订，不改源码 | 用户先要求 review plan，不直接执行 |
| 复用现有 `github-actions-upstream-automation-analysis` task | 避免制造平行 planning 状态 |
| 自动化入口必须是默认分支 `main` 上的 workflow | GitHub `schedule` 仅在默认分支运行 |
| 真正的 upstream 拉取应映射为 Harness `fetch/update/sync/verify/doctor` 链路 | 仓库没有 git remote `upstream`；上游来源定义在 `harness/upstream/sources.json` |
| refresh 工作分支固定从 `origin/dev` 派生 | 用户目标是最终通过 PR 落到 `dev` |
| 详细实施清单迁移到 companion plan `docs/superpowers/plans/2026-04-19-github-actions-upstream-automation-analysis-plan.md` | 保持 `planning/active/.../task_plan.md` 为 summary-only durable task memory |
| 2026-04-30 修订采用 `Friday 20:00 Asia/Shanghai`，即 GitHub cron `0 12 * * 5` | 用户本轮明确“周五晚上 8 点”；在未另行指定时区时按中文语境默认 UTC+8 |
| v1 的“处理冲突”定义为 fail-fast + artifact/log + 人工接管 | 当前仓库没有安全的 bot 自动解冲突机制 |
| 启用 weekly schedule 前先要求 `dev` branch protection / required checks 就位 | 否则“最终落到 origin dev”的自动化会绕过治理面 |
| v1 不做 auto-merge，也不允许 workflow 直推 `dev` | 先保留审查面，降低供应链与误推风险 |
| upstream 更新探测应先做 `git ls-remote <url> HEAD` 对比 | 用户要求“根据 head 分析有无更新”，可避免无更新时创建分支和 PR |
| GitHub Actions 不能直接同步这台机器的 local `dev` | GitHub runner 只能修改远端仓库；本地 checkout 需要独立 helper、local schedule 或手动触发 |
| local `dev` 同步 v1 只允许 fast-forward | 脏工作区、本地领先、分叉或冲突都必须停止并输出恢复建议，不能无人值守解冲突 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `fd` 不存在 | 1 | 按降级策略改用 `rg --files` |

## Notes
- 需要用中文输出分析；代码相关名称、命令、workflow 字段保持英文。
- 本轮只修订计划与 planning 文件，不创建 workflow、不改 GitHub 设置、不推分支。
- Companion plan 与 task memory 已双向关联；task memory 保留摘要，companion plan 保存详细步骤。

## Current Verdict

- 原始方向仍成立：`main` 上 schedule 触发、先探测 upstream `HEAD`、工作分支从 `origin/dev` 派生、执行 Harness refresh chain、通过 PR 落到 `dev`。
- 原始计划不能按原样执行，核心缺口是：
  1. 缺少具体的 UTC schedule。
  2. 把“处理冲突”描述得过于乐观，没有 fail-fast 分流。
  3. 缺少 `dev` branch protection / required checks 前置条件。
  4. 详细 checklist 直接写在 task memory，违反当前 summary-only sync-back 边界。
- 2026-04-30 复核后新增边界：GitHub 端自动化可行；PR merge 后自动同步 local `dev` 不是 GitHub-only 能力，需要本地 fast-forward helper。
- 修订后计划已经把这些边界收口，并迁移到 companion plan。

## Companion Plan Reference

- Companion plan: `docs/superpowers/plans/2026-04-19-github-actions-upstream-automation-analysis-plan.md`
- Companion plan role: 保存详细实施清单、rollout gates、文件级任务拆分和启用顺序。
- Sync-back status: `2026-04-30` 已完成。

## Revised Execution Plan Summary

### Phase A: Workflow Skeleton And Contracts
- 建立 `.github/workflows/upstream-refresh.yml`，先接通 contract tests 和 `workflow_dispatch` 演练。
- 定时入口默认锁定为 `Friday 20:00 Asia/Shanghai` / `0 12 * * 5`，但只有在 `dev` protection 配好后才启用 schedule。
- 新增 `tests/automation/` 合约测试，锁定 workflow trigger、branch source、result file 和 PR gate。

### Phase A1: Upstream HEAD Probe
- 新增 `scripts/ci/lib/upstream-heads.mjs`，读取 `harness/upstream/sources.json` 并用 `git ls-remote <url> HEAD` 检查两个 Git source。
- 维护 repo-owned source head record，例如 `harness/upstream/.source-heads.json`。
- 无 upstream HEAD 变化时写出 `no_changes` result，不创建 branch、不开 PR。

### Phase B: Refresh Runner
- 用 `scripts/ci/lib/upstream-refresh.mjs` 和 `scripts/ci/run-upstream-refresh.mjs` 执行：
  - `git fetch origin main dev`
  - `git checkout -B automation/upstream-refresh origin/dev`
  - `./scripts/harness install --scope=workspace --targets=all --projection=link`
  - `./scripts/harness fetch`
  - `./scripts/harness update`
  - `npm run verify`
  - `./scripts/harness worktree-preflight`
  - `./scripts/harness sync --dry-run`
  - `./scripts/harness sync`
  - `./scripts/harness doctor`
- 变更检测必须覆盖 tracked + untracked repo-owned files。
- `.harness/projections.json`、`.harness/state.json` 和其他运行态文件继续排除在 commit allowlist 外。
- 冲突、verify 失败、allowlist 失败全部按 fail-fast 处理，不自动修复。

### Phase C: PR Automation
- 用 `scripts/ci/lib/upstream-pr.mjs` 和 `scripts/ci/open-upstream-pr.mjs` 固定：
  - branch：`automation/upstream-refresh`
  - title：`chore: refresh upstream baselines`
  - base：`dev`
- commit 前显式配置 bot git identity。
- 没有 eligible changes 时不创建空 PR。

### Phase D: Docs And Operator Checklist
- 更新 `docs/maintenance.md`，说明：
  - schedule 在 `main` 上运行，但工作基线是 `origin/dev`
  - v1 没有 auto-merge，冲突处理是 fail-fast + 人工接管
  - 失败时查看 workflow artifact 与 `.harness/upstream-refresh-result.json`
  - 启用 schedule 前需要人工确认 `dev` branch protection / required checks

### Phase E: Local Dev Sync Helper
- 新增可选本地命令 `scripts/local/sync-dev-after-upstream-pr.mjs`。
- helper 只在 clean worktree、local `dev` 未领先、可 fast-forward 时同步 `origin/dev`。
- GitHub Actions 不直接触发本地同步；本地同步通过手动命令、macOS LaunchAgent 或后续显式配置的本地 webhook 完成。

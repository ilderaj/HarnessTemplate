# Task Plan: README Upstream Credit and Release 1.0.3

## Goal
收敛并重组 `README.md`，明确说明 `superpowers` 与 `planning-with-files` 的上游授权、原始使用方式、在本项目中的继承方式与使用范围，补充 credit/thanks，并发布下一个 GitHub release。

## Current State
Status: closed
Archive Eligible: yes
Close Reason: README 重构、上游授权与 credit 补充，以及 GitHub release 1.0.3 已完成并验证。

## Current Phase
Phase 3

## Phases

### Phase 1: 现状与上游来源核对
- [x] 检查当前 README 结构问题
- [x] 核对 `superpowers` 与 `planning-with-files` 的上游仓库、license、原始使用方式
- [x] 确认当前最新 release/tag 和待发布差异范围
- **Status:** complete

### Phase 2: README 重构
- [x] 调整 README 章节顺序，先讲核心规则，再讲结构与能力入口
- [x] 写明上游授权、继承方式、使用范围和 credit
- [x] 收敛冗长表格，把细节留给 docs
- **Status:** complete

### Phase 3: 验证与发布
- [x] 运行必要验证
- [x] 整理自上一个版本以来的 release notes
- [x] 创建提交、tag 和 GitHub release
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 为本次 README/release 工作单独开新 task | 这次工作是新的发布与文档收敛任务，不复用仓库更名任务，避免 planning 记录混杂 |
| README 首页只保留规则、上游继承、安装入口和文档导航 | 首页应该先解释行为模型，而不是穷举投影细节 |
| release 说明只覆盖 `1.0.2..HEAD` 的真实差异 | 避免把历史已发布内容重复写进新 release note |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|

## Notes
- 预期 release 版本按最新 tag `1.0.2` 增加 `0.0.1`，即 `1.0.3`。

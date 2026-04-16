# Findings & Decisions

## Requirements
- README 需要更精炼，且把规则层内容从结构/能力介绍中抽离出来。
- README 需要列出 `superpowers` 与 `planning-with-files` 的授权、使用方式、使用范围，以及本项目如何继承它们。
- README 需要明确致谢与 credit。
- 需要发布一个比上一个版本高 `0.0.1` 的 GitHub release。

## Research Findings
- 最新 Git tag 与 GitHub release 都是 `1.0.2`。
- `package.json` 当前版本是 `0.1.0`，与 GitHub release tag 体系独立。
- `harness/upstream/sources.json` 记录的上游来源：
  - `superpowers` -> `https://github.com/obra/superpowers`
  - `planning-with-files` -> `https://github.com/OthmanAdi/planning-with-files`
- GitHub 官方仓库元数据显示：
  - `obra/superpowers` 默认分支 `main`，license 是 `MIT`
  - `OthmanAdi/planning-with-files` 默认分支 `master`，license 是 `MIT`
- `superpowers` README 显示其原始定位是“agentic skills framework & software development methodology”，包含 `brainstorming`、`writing-plans`、`executing-plans`、`subagent-driven-development` 等流程技能，倾向于在复杂规划、实现和审查阶段触发。
- `planning-with-files` README 与 `SKILL.md` 显示其原始定位是“persistent markdown planning”技能，核心是把任务状态持久化到规划文件中，并作为跨会话、跨上下文恢复的任务记忆。
- 当前项目 README 把“Complex Request Mode”“Plan File Locations”等规则层内容夹在结构、skills、hooks 说明之间，阅读路径不稳定。
- 重写后的 README 将规则层前置，并把投影细节缩减为入口说明，详细矩阵留在 `docs/`。
- `./scripts/harness doctor` 当前结果为健康；仅对 `docs/superpowers/plans` 给出历史/人类文档警告，不视为失败。
- 自 `1.0.2` 以来的可发布差异集中在三组内容：
  - active plan location 收敛与相关补丁/检查
  - 仓库改名为 `superpowering-with-files`
  - README 收敛并补充上游 license / inheritance / credit 说明
- GitHub release `1.0.3` 已创建：
  - tag: `1.0.3`
  - URL: `https://github.com/ilderaj/superpowering-with-files/releases/tag/1.0.3`
- 发布过程中第一次 `gh release create` 因 shell 反引号转义导致 release body 被错误截断，但 release 本身已创建；随后通过 `gh release edit --notes-file -` 修正为目标文案。

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| README 首页只保留决策层信息和常用入口 | 细节矩阵已经在 `docs/` 里，首页不需要重复展开 |
| 把“核心规则”独立成一节，提前于安装结构 | 这是用户最关心的行为模型，不应该被结构细节打断 |
| 将上游继承信息写成单独一节 | 便于明确 license、usage model、inheritance mode 与 credit |
| GitHub release 使用 `1.0.3` | 按 `1.0.2 + 0.0.1` 计算 |
| release notes 控制在三条以内 | 用户要求精炼、明确、克制 |

## Resources
- `https://github.com/obra/superpowers`
- `https://github.com/OthmanAdi/planning-with-files`
- `/Users/jared/HarnessTemplate/harness/upstream/sources.json`
- `/Users/jared/HarnessTemplate/harness/upstream/superpowers/README.md`
- `/Users/jared/HarnessTemplate/harness/upstream/planning-with-files/SKILL.md`
- `/Users/jared/HarnessTemplate/README.md`
- `https://github.com/ilderaj/superpowering-with-files/releases/tag/1.0.3`

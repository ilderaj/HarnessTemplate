# 进度记录

## 2026-04-18

- 新建治理规划任务 `harness-adoption-governance-plan`。
- 已确认重点对象：
  - Jared user-global rules / agents / instructions / skills
  - `HarnessTemplate`
  - `AgentPlugins/agent-plugin-marketplace`
  - `TypeMint`
  - `BabyCry`
  - `lullabyApp`
- 已进入重复与冲突面识别阶段。
- 已确认 workspace 分层：
  - `HarnessTemplate` = source-of-truth
  - `lullabyApp` = global-baseline consumer（显式继承 Jared 全局 Harness baseline）
  - `TypeMint` / `BabyCry` = project-canonical autonomous
  - `AgentPlugins/agent-plugin-marketplace` = 暂无项目级 AGENTS 入口的内容仓库
- 已确认重点 workspace 当前没有本地 `.agents/skills/*/SKILL.md` 型重复 skill 副本。
- 当前最大重复/冲突面在：
  - Jared user-global entries 仍旧
  - Jared user-global/shared projected `writing-plans` 仍旧
  - Copilot 的 `planning-with-files` 仍旧
  - 多个 workspace 仍保留历史 `docs/superpowers/plans/**` 执行输入

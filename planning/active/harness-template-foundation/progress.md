# 进展：Harness Template Foundation

## 2026-04-10

- 创建 task-scoped planning 文件
- 确认工作目录为空，尚未初始化 Git
- 开始检查本机 Codex / Cursor / Copilot / Claude Code 配置结构
- 确认现有 Harness 实际上已经是“主源 + 共享技能 + IDE 投影”的多层结构
- 识别出当前最关键的设计决策：未来模板的唯一事实源应该放在哪里
- 用户已确认：主源方案选择 `IDE-neutral`
- 用户已确认：运行模式选择双模式，v1 默认项目内安装
- 用户已确认：v1 必须支持 Codex / Copilot / Cursor / Claude Code
- 用户已确认：superpowers 与 planning-with-files 采用基线副本 + 上游更新的混合集成
- 用户已确认：模板必须完全去个人化
- 用户已确认总体架构：`Core + Adapters + Installer`
- 已完成设计确认：
  - 仓库结构与单一事实源边界
  - core 内容模型与统一规则主源拆分
  - adapter 投影策略与 link / materialize / render 判定
  - installer / CLI 命令分工与状态文件思路
  - README / docs 分层策略

## 2026-04-11

- 用户确认验证策略
- 准备汇总为完整执行计划框架，覆盖抽取、验证、梳理、README、通用化、GitHub 仓库与分支策略
- 写入设计 spec：`docs/superpowers/specs/2026-04-11-harness-template-design.md`
- 完成 spec 自检并修正个人路径示例与开放决策歧义

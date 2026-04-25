# Findings：Cross-IDE Companion Plan Patch

## 审计发现

- `harness/upstream/planning-with-files/SKILL.md` 仍保留旧表述：
  `If superpowers is used, durable planning state still belongs here. Do not create a parallel long-lived superpowers plan unless the user explicitly requests that file.`
- 该表述与当前仓库 policy 已不一致。当前 policy 要求：若 Deep-reasoning task 实际使用 Superpowers，则必须创建 `docs/superpowers/plans/<date>-<task-id>.md` companion plan，并保持与 `planning/active/<task-id>/` 的双向引用。
- `harness/installer/lib/copilot-planning-patch.mjs` 当前只做了两类处理：
  1. `${CLAUDE_PLUGIN_ROOT}` 到 Copilot skill root 的替换
  2. 追加 Copilot patch marker 与 skill-root snippet
- 当前 Copilot patch 没有修改上游 `planning-with-files` 中与 companion-plan 相关的旧语义。
- `harness/installer/lib/skill-projection.mjs` 当前只对 Copilot 的 `planning-with-files` 声明 patch；其它 targets 没有对应 patch，因此会直接 materialize 上游旧语义。

## 初步结论

- 用户判断基本正确：Copilot patch 目前只解决 root / hook 兼容，没有补 companion-plan 新语义。
- 问题不止 Copilot。Codex、Cursor、Claude Code 的 projected `planning-with-files` 也会继承同一段旧语义，属于同类缺口。
- 根因在于 companion-plan 模型升级时，只更新了：
  - core policy rendered entries
  - `writing-plans` patch
  - health / doctor 语义
  但没有同步更新 `planning-with-files` projected skill 的内容层。

## 实施结果

- 新增通用 patch 实现：
  - `harness/installer/lib/planning-with-files-companion-plan-patch.mjs`
- Companion-plan patch 现在会替换上游旧表述，并落入以下新语义：
  - Deep-reasoning task 实际使用 Superpowers 时，必须把详细 implementation plan 持久化到 `docs/superpowers/plans/<date>-<task-id>.md`
  - `planning/active/<task-id>/` 继续作为 authoritative durable task memory
  - active planning files 必须记录 companion plan path、summary、sync-back status
  - companion plan 必须反向指向 `planning/active/<task-id>/`
- `planning-with-files` projection 现在是跨 IDE shared patch：
  - Codex / Cursor / Claude Code：只应用 shared companion-plan patch
  - Copilot：先应用 shared companion-plan patch，再应用 Copilot-specific compatibility patch
- `skill-projection` 与 `sync` 不再假设一个 skill 只能有单个 patch，而是支持有序 `patches` 列表。
- `health` 现在会逐个验证 materialized skill 上声明的全部 patch marker。

## 文档同步

- 已同步更新：
  - `docs/architecture.md`
  - `docs/compatibility/copilot-planning-with-files.md`
  - `harness/core/skills/patches/copilot-planning-with-files.patch.md`
  - `harness/core/skills/patches/planning-with-files-companion-plan.patch.md`

## 额外环境观察

- 仓库中存在与本任务无关的预先变更与未跟踪 planning 目录，包括：
  - `planning/active/audit-superpowers-plan-sync/*`
  - `planning/active/global-rule-context-load-analysis/`
  - `planning/active/harness-adoption-governance-plan/`
- 这些内容没有被本次修复改写，应视为独立上下文。

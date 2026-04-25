# Findings：归档资格执行与剩余任务完成度审查

## 归档规则

- 依据 `harness/upstream/planning-with-files/scripts/task_lifecycle.py`，只有 `Status: closed` 且 `Archive Eligible: yes` 才是 `safe_to_archive`。
- 仅仅 phases 全部完成，不足以直接 archive。

## 初始候选

- `github-release-1-0-1`
- `plan-location-consolidation`
- `planning-entry-rule-clarification`
- `readme-upstream-credit-release-1-0-3`

## 已执行归档

- 四个候选均通过 `task-status.py --require-safe-to-archive` 复核。
- 四个任务已移动到 `planning/archive/20260425-210011-*`。
- `planning/active/` 中已不再出现对应目录。

## 剩余 active task 审查结论

### 已确认可继续收口的任务

- `agent-safety-harness`：已执行 archive。
- `codex-hook-rationale-review`：progress、metadata 与 hook tests 显示目标实现已落地，可更新为 `closed` + `Archive Eligible: yes`。
- `copilot-instructions-path`：Copilot entry 路径、文档、paths 实现与验证都已对齐，可更新为 `closed` + `Archive Eligible: yes`。
- `cross-ide-companion-plan-patch`：shared companion-plan patch、health 校验与测试均已落地，可更新为 `closed` + `Archive Eligible: yes`。
- `cross-ide-hooks-projection`：hook projection 代码、进度记录和 repo verify 均表明实现已完成，可更新为 `closed` + `Archive Eligible: yes`。
- `global-auto-apply-adoption`：`adopt-global` / `adoption-status` 命令与测试已稳定落地，可更新为 `closed` + `Archive Eligible: yes`。
- `harness-init-skill-projection-audit`：task 自身 phases 已 complete，README / metadata / tests 体现新布局已生效，可更新为 `closed` + `Archive Eligible: yes`。
- `installer-platform-hardening`：plan 中 phases 已 complete，repo verify 通过，CLI 和 metadata 行为已在代码中落地，可更新为 `closed` + `Archive Eligible: yes`。
- `superpowers-plan-artifact-model`：policy、patch 与 companion-plan 语义已机械化，可更新为 `closed` + `Archive Eligible: yes`。
- `workflow-constraints-audit`：task 自身最终结果显示审计与自检完成，但 lifecycle 未收口，适合更新为 `closed` + `Archive Eligible: yes`。

### 已执行 lifecycle 更新与 archive

- 已更新为 `closed` + `Archive Eligible: yes` 并归档：
	- `agent-safety-harness`
	- `codex-hook-rationale-review`
	- `copilot-instructions-path`
	- `cross-ide-companion-plan-patch`
	- `cross-ide-hooks-projection`
	- `global-auto-apply-adoption`
	- `harness-init-skill-projection-audit`
	- `installer-platform-hardening`
	- `superpowers-plan-artifact-model`
	- `workflow-constraints-audit`

- 已更新为 `waiting_review`：
	- `audit-superpowers-plan-sync`
	- `cross-ide-projection-audit`
	- `harness-adoption-governance-plan`

### 更适合停在 review / integration 的任务

- `cross-ide-single-source-consolidation`：当前 `waiting_review` 与证据一致。
- `github-actions-upstream-automation-analysis`：分析/计划任务，当前 `waiting_review` 合理。
- `projection-health-analysis`：本质是分析与治理建议任务，当前 `waiting_review` 合理。
- `harness-adoption-governance-plan`：更多依赖 user-global 外部状态，较适合先更新到 `waiting_review`，不宜直接关单归档。
- `audit-superpowers-plan-sync`、`cross-ide-projection-audit`：更像审计/待评审收口任务，倾向 `waiting_review` 而不是直接归档。
- `rename-repo-superpowering-with-files`：从仓库事实看接近“已集成完成，只差 lifecycle 收尾”，至少不应继续停留在 `waiting_review` 太久。

### 仍不应收口的任务

- `cursor-official-load-model-research`：官方证据与最终报告尚未完全收口。
- `rtk-support-feasibility-analysis`：Phase 5 仍为 `in_progress`。
- `typemint-skill-duplication-check`：结论建立在旧 projection 模型上，当前需要重审。
- `global-rule-context-load-analysis`、`harness-template-foundation`：从仓库现状看高度疑似已完成，但本轮仅做抽查，若要更新 lifecycle，建议先补一次 task-local 收尾核对。
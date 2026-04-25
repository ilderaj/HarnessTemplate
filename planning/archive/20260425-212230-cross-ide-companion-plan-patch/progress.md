# Progress：Cross-IDE Companion Plan Patch

## 2026-04-18

### Session Start
- 建立任务目录 `planning/active/cross-ide-companion-plan-patch/`。
- 读取并遵循 `using-superpowers`、`planning-with-files`、`systematic-debugging`、`test-driven-development` 的最小必要流程。
- 扫描相关 active tasks，重点复用：
  - `planning/active/superpowers-plan-artifact-model/`
  - `planning/active/cross-ide-projection-audit/`
  - `planning/active/cross-ide-hooks-projection/`

### Evidence Gathered
- 审计了以下实现与测试：
  - `harness/upstream/planning-with-files/SKILL.md`
  - `harness/installer/lib/copilot-planning-patch.mjs`
  - `harness/installer/lib/superpowers-writing-plans-patch.mjs`
  - `tests/adapters/skill-projection.test.mjs`
  - `tests/adapters/sync-skills.test.mjs`
  - `tests/adapters/templates.test.mjs`
- 已确认当前 projected `planning-with-files` 没有 companion-plan mandatory 语义 patch。

### Working Hypothesis
- 应抽出跨 IDE 通用 `planning-with-files` companion-plan patch，并在 Copilot 上叠加现有 root / hook 兼容 patch。

### Implementation
- 新增 `harness/installer/lib/planning-with-files-companion-plan-patch.mjs`。
- 更新 `harness/installer/lib/copilot-planning-patch.mjs`，先应用 shared companion-plan patch，再叠加 Copilot-specific patch。
- 更新 `harness/installer/lib/skill-projection.mjs`，从单 `patch` 升级为有序 `patches`。
- 更新 `harness/installer/commands/sync.mjs`，按顺序应用 skill patches。
- 更新 `harness/installer/lib/health.mjs`，校验全部 projected patch markers。
- 更新 `harness/core/skills/index.json`，声明 shared `planning-with-files` patch 与 Copilot-specific patch。
- 更新测试：
  - `tests/core/skill-index.test.mjs`
  - `tests/adapters/skill-projection.test.mjs`
  - `tests/adapters/sync-skills.test.mjs`
  - `tests/installer/health.test.mjs`
- 更新文档：
  - `docs/architecture.md`
  - `docs/compatibility/copilot-planning-with-files.md`
  - `harness/core/skills/patches/copilot-planning-with-files.patch.md`
  - `harness/core/skills/patches/planning-with-files-companion-plan.patch.md`

### Verification
- Focused tests passed:
  - `node --test tests/core/skill-index.test.mjs tests/adapters/skill-projection.test.mjs tests/adapters/sync-skills.test.mjs`
  - `node --test tests/installer/health.test.mjs tests/core/skill-index.test.mjs tests/adapters/skill-projection.test.mjs tests/adapters/sync-skills.test.mjs`
- Repository verification passed:
  - `npm run verify`
- Evidence from verification:
  - projected `planning-with-files` companion-plan semantics are now present for Codex, Copilot, Cursor, and Claude Code
  - Copilot still carries its dedicated compatibility marker
  - `doctor` / health now fails when the shared companion-plan patch marker is removed from a materialized skill

### Unrelated Workspace State
- `git status --short` showed unrelated pre-existing planning changes outside this task:
  - `planning/active/audit-superpowers-plan-sync/*`
  - untracked `planning/active/global-rule-context-load-analysis/`
  - untracked `planning/active/harness-adoption-governance-plan/`
- No changes were made to those paths as part of this task.

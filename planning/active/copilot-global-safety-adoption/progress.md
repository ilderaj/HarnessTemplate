# Progress Log

## Session: 2026-04-28

### Phase 1: 现状核对
- **Status:** complete
- Actions taken:
  - 读取流程技能并确认本任务按 tracked task 处理。
  - 扫描 `planning/active/` 现有任务，确认需要新建独立 task id。
  - 初步检索到 README 仍展示 `user-global --profile=safety --hooks=on`，需要与当前 adopt/global 目标重新对齐。
  - 读取 `README.md`、`docs/install/copilot.md`、`harness/installer/commands/adopt-global.mjs`、`harness/installer/lib/adoption.mjs` 与 `tests/installer/adoption.test.mjs`。
  - 形成局部假设：空 user-global bootstrap 默认包含 Copilot，是当前“全局不要开启 Copilot”的唯一实现面冲突。
- Files created/modified:
  - `planning/active/copilot-global-safety-adoption/task_plan.md` (created)
  - `planning/active/copilot-global-safety-adoption/findings.md` (created)
  - `planning/active/copilot-global-safety-adoption/progress.md` (created)

### Phase 2: 收敛方案
- **Status:** complete
- Actions taken:
  - 先在 `tests/installer/adoption.test.mjs` 增加 bootstrap 边界断言，确认默认 targets 应排除 Copilot。
  - 运行 `node --test tests/installer/adoption.test.mjs`，观察红测只失败在 Copilot 默认 target 上。
  - 在 `harness/installer/lib/adoption.mjs` 把空 bootstrap 默认 targets 收敛为非 Copilot 集合。
- Files created/modified:
  - `tests/installer/adoption.test.mjs` (modified)
  - `harness/installer/lib/adoption.mjs` (modified)

### Phase 3: 实施与验证
- **Status:** complete
- Actions taken:
  - 更新 `README.md`：user-global adopt 默认不再暗示全局 Copilot，Safety 段只保留 workspace 推荐路径。
  - 更新 `docs/install/copilot.md`：明确 Copilot repo-local 优先，user-global 仅显式 opt-in。
  - 更新 `harness/installer/commands/adopt-global.mjs` 帮助文本，写明空 bootstrap 排除 Copilot。
  - 运行聚焦验证与静态错误检查。
- Files created/modified:
  - `README.md` (modified)
  - `docs/install/copilot.md` (modified)
  - `harness/installer/commands/adopt-global.mjs` (modified)

### Phase 4: 实机校准与 live 状态收敛
- **Status:** complete
- Actions taken:
  - 首次 disposable HOME 校准误读了仓库已有 `.harness/state.json`，因此走到了 preserve 路径；随后通过清理临时副本中的 `.harness/` 重新执行真正的空 bootstrap 校准。
  - 在干净 disposable HOME 中执行 `adopt-global` 与 `adoption-status`，确认 fresh bootstrap 只启用 `claude-code,codex,cursor`，且状态为 `in_sync`。
  - 盘点真实 HOME 下的 Copilot user-global 路径，确认 `.copilot/instructions/` 与 `.copilot/hooks/` 当前为空，但 repo `.harness/state.json` 仍保留历史 `copilot` target，导致 adoption state 漂移。
  - 在真实 HOME 上执行 `./scripts/harness install --scope=user-global --targets=codex,cursor,claude-code --projection=link --profile=always-on-core --skills-profile=full --hooks=on`、`./scripts/harness sync` 与 `./scripts/harness doctor --check-only`，先把 live state 收敛到不含 Copilot 的 target 集。
  - 因旧 receipt 仍记录 4 个 targets，`adoption-status` 一度显示 `state_mismatch`；随后再次执行 `./scripts/harness adopt-global` 刷新 receipt，最终恢复为 `in_sync`。
  - 最终复核真实 HOME 下的 Harness-managed Copilot 路径，全部不存在。
- Files created/modified:
  - `.harness/state.json` (updated live state)
  - `.harness/adoption/global.json` (updated live receipt)

## Test Results
| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| Red check | `node --test tests/installer/adoption.test.mjs` | 默认 bootstrap 不应带 Copilot；旧实现应失败 | 首轮失败，diff 显示实际多了 `copilot` | ✓ |
| Focused installer/docs validation | `node --test tests/installer/adoption.test.mjs tests/installer/policy-render.test.mjs` | adopt-global 边界与 README / Copilot 文档口径一致 | 13 passing, 0 failing | ✓ |
| Static diagnostics | `get_errors` on changed files | 无新增错误 | No errors found | ✓ |
| Disposable-home bootstrap calibration | clean temp repo without `.harness/`, `HOME=/tmp/... ./scripts/harness adopt-global && ./scripts/harness adoption-status` | fresh bootstrap excludes Copilot and returns `in_sync` | `hookMode=off`, `policyProfile=always-on-core`, targets=`claude-code,codex,cursor`, status=`in_sync` | ✓ |
| Live user-global convergence | `./scripts/harness install --scope=user-global --targets=codex,cursor,claude-code ... && ./scripts/harness sync && ./scripts/harness adopt-global && ./scripts/harness adoption-status` | real user-global state excludes Copilot and final status is `in_sync` | final targets=`claude-code,codex,cursor`, status=`in_sync`, Copilot managed files absent | ✓ |
| Live doctor | `./scripts/harness doctor --check-only` | no health failures after live convergence | `Harness check passed.` | ✓ |

## Error Log
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|

# Copilot 全局 adopt 与 safety profile 收敛

## Goal
根据当前 harness 变更更新 README，并把 user-global adopt 的推荐路径收敛到“Copilot 只保留本项目 workspace safety，全局不默认开启 safety hooks”。

## Current State
Status: closed
Archive Eligible: yes
Close Reason: disposable-home calibration and live user-global Copilot cleanup completed on 2026-04-28.

## Current Phase
Completed

## Phases

### Phase 1: 现状核对
- [x] 读取 README、Copilot 安装文档、adopt-global 实现与 adoption 测试
- [x] 形成一个可证伪判断：当前是否存在“全局 Copilot safety 被推荐或被 adopt 扩散”的文档或实现面
- **Status:** complete

### Phase 2: 收敛方案
- [x] 明确 README 需要删减或改写的段落
- [x] 明确 adopt/global 需要约束的行为与验证点
- [x] 保持 safety profile 仅在显式 workspace 场景启用
- **Status:** complete

### Phase 3: 实施与验证
- [x] 修改文档与必要实现/测试
- [x] 运行聚焦测试或命令验证 README 所述路径与 adoption 行为一致
- [x] 记录最终 authoritative 状态
- **Status:** complete

### Phase 4: 实机校准与 live 状态收敛
- [x] 用 disposable HOME 执行 `adopt-global` 与 `adoption-status`
- [x] 检查真实 HOME 下是否仍有 Harness 管理的 Copilot user-global 安装
- [x] 如存在，则按新边界清理或收敛到 workspace-only
- [x] 记录最终 live 状态与验证结果
- **Status:** complete

## Key Questions
1. `adopt-global` 当前默认会沿用什么 profile / hooks / targets？
2. README 哪些示例会把 Copilot safety 误导为 user-global 常规路径？
3. 是否需要改实现，还是只需收敛文档与测试断言？

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 为本任务单独建立 active task 目录 | 请求同时涉及文档、installer 行为和安全边界，属于 tracked task |
| `adopt-global` 空 bootstrap 默认排除 Copilot | 避免把 Copilot 全局接管变成默认路径，保持 Copilot repo-local 优先 |
| Copilot `safety` 文档只保留 workspace 推荐路径 | 用户要求确认本项目可开、全局不开，且这与 Copilot usage/context 收敛方向一致 |
| live user-global 收敛采用“改 state 后刷新 receipt”而不是直接删 `.copilot` 文件 | 让 adoption-status 与 repo state 保持一致，避免留下新的 state/receipt 漂移 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|

## Risk Assessment
| Command | Target Path | Blast Radius | Checkpoint | Rollback |
|---------|-------------|--------------|------------|----------|
| `./scripts/harness install --scope=user-global --targets=codex,cursor,claude-code --projection=link --profile=always-on-core --skills-profile=full --hooks=on && ./scripts/harness sync && ./scripts/harness adopt-global` | User-global Harness state plus managed roots under `/Users/jared/.codex`, `/Users/jared/.cursor`, `/Users/jared/.claude`, and receipt/state files under the repo | Live user-global Harness-managed files only; goal was to remove Copilot from managed global targets without touching workspace Copilot | Not taken; command is reversible by rerunning `install` with explicit `--targets=copilot` if global Copilot is needed again | Re-run `./scripts/harness install --scope=user-global --targets=codex,cursor,claude-code,copilot --projection=link --profile=always-on-core --skills-profile=full --hooks=on && ./scripts/harness sync && ./scripts/harness adopt-global` |

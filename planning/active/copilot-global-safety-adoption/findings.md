# Findings & Decisions

## Requirements
- README 需要根据近期 harness 变化更新，保持精炼、简洁、克制。
- global adopt 要跟上最新约束。
- 确认 safety profile 的开闭边界：针对本项目的 Copilot 可以开启，user-global 不应默认开启。

## Research Findings
- `adopt-global` 当前在没有既有 user-global state 时，会把 `normalizeTargets(..., ['all'])` 解析成所有平台，其中包含 Copilot。
- README 同时存在两处会误导 user-global adopt / safety 边界的内容：
	- Quick Start 的 user-global 示例默认面向 `targets=all`
	- Safety 段落直接展示 `--scope=user-global --profile=safety --hooks=on`
- `docs/install/copilot.md` 也把 user-global Copilot install 写成常规 adoption 路径，而没有强调 repo-local 优先。
- `tests/installer/adoption.test.mjs` 的 bootstrap case 原本明确断言了 4 个 targets，这证明当前默认行为确实会全局带上 Copilot。
- `adopt-global` 仍然保留显式 `--targets=copilot` 的能力；本次不移除该能力，只移除默认 bootstrap。
- 聚焦 red check 已验证旧行为确实失败在 Copilot 默认 target 上，而不是 hooks/profile 断言写错。
- 干净 disposable HOME 校准结果为：`scope=user-global`、`hookMode=off`、`policyProfile=always-on-core`、targets 仅 `claude-code,codex,cursor`，`adoption-status` 为 `in_sync`。
- 真实 HOME 在执行前处于历史漂移状态：repo `.harness/state.json` 仍声明 `copilot` 为 user-global target，但 `/Users/jared/.copilot/instructions` 与 `/Users/jared/.copilot/hooks` 实际为空。
- live 收敛后，repo `.harness/state.json` 与 `.harness/adoption/global.json` 都只保留 `claude-code,codex,cursor` 三个 user-global targets。
- live 收敛后的真实 HOME 下，以下 Copilot Harness 路径均不存在：`~/.copilot/instructions/harness.instructions.md`、`~/.copilot/hooks/planning-with-files.json`、`~/.copilot/hooks/superpowers.json`、`~/.copilot/hooks/safety.json`、`~/.copilot/hooks/task-scoped-hook.sh`、`~/.copilot/hooks/session-start`、`~/.copilot/hooks/pretool-guard.sh`、`~/.copilot/hooks/session-checkpoint.sh`。
- live `adoption-status` 最终为 `in_sync`，targets 为 `claude-code,codex,cursor`；`doctor --check-only` 返回 `Harness check passed.`。

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 空 user-global bootstrap 默认 targets 改为 `codex,cursor,claude-code` | 满足“Copilot 仅按需全局启用”的新边界，同时最小化实现改动 |
| 保留 Copilot user-global 显式 opt-in 文档 | 平台能力仍存在，只是不再做默认 adoption |
| README 文案收敛到“薄说明 + 单一推荐路径” | 用户要求精炼简洁克制，避免在首页保留过多分支说明 |
| 真实 HOME 的目标状态定义为“无 Harness 管理的 Copilot user-global 文件，repo state/receipt 也不再声明 Copilot” | 这样 workspace Copilot 与 user-global adoption 口径一致，后续 `adoption-status` 不会再因历史 receipt 漂移而误报 |

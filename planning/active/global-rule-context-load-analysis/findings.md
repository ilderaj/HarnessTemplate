# 当前发现

## 可见规则来源

- workspace 级 Codex 入口：`/Users/jared/HarnessTemplate/AGENTS.md`
- user-global 级 Codex 入口：`/Users/jared/.codex/AGENTS.md`
- 共享 policy 源：`/Users/jared/HarnessTemplate/harness/core/policy/base.md`
- 平台 override：
  - `/Users/jared/HarnessTemplate/harness/core/policy/platform-overrides/codex.md`
  - `/Users/jared/HarnessTemplate/harness/core/policy/platform-overrides/copilot.md`
  - `/Users/jared/HarnessTemplate/harness/core/policy/platform-overrides/cursor.md`
  - `/Users/jared/HarnessTemplate/harness/core/policy/platform-overrides/claude-code.md`

## 当前体积基线

- `base.md`：
  - 16384 chars
  - 2381 words
  - 约 4096 tokens（按 chars / 4 粗估）
- workspace `AGENTS.md`：
  - 16751 chars
  - 2432 words
  - 约 4188 tokens
- user-global `~/.codex/AGENTS.md`：
  - 14880 chars
  - 2183 words
  - 约 3720 tokens

## rendered entry 体积

- `rendered:codex`：约 4188 tokens
- `rendered:copilot`：约 4234 tokens
- `rendered:cursor`：约 4195 tokens
- `rendered:claude-code`：约 4181 tokens

结论：四个平台入口体积几乎相同，说明主要负载来自共享 policy，而不是平台差异。

## 重复度

- `base.md` 与 workspace `AGENTS.md` 相似度：0.9889
- workspace `AGENTS.md` 与 user-global `~/.codex/AGENTS.md` 相似度：0.9003
- `base.md` 与 user-global `~/.codex/AGENTS.md` 相似度：0.8874

结论：Codex 当前本地 global + workspace 两份规则文本存在高重复；如果两者在会话启动时都进入上下文，重复成本很高。

## 体积主要来源

按 `base.md` section 粗估，较重的部分包括：

- `Complex Task Orchestration`：约 552 tokens
- `Core Behavioral Guidelines`：约 464 tokens
- `Companion Plan Model`：约 354 tokens
- `Plan Location Boundaries`：约 315 tokens
- `Development Guidelines`：约 289 tokens
- `Output Style`：约 254 tokens
- `Task Classification`：约 240 tokens
- `Mandatory Sync-Back Rule`：约 219 tokens

这些 section 共同决定了大部分上下文体积。

## 结构判断

- 模板壳很薄，几乎不构成优化目标。
- 平台 override 仅几十到一百 token 左右，也不是主要矛盾。
- 真正的上下文成本几乎全部集中在共享 `base.md`。
- 当前 workspace `AGENTS.md` 比 user-global `~/.codex/AGENTS.md` 更长，主要新增内容集中在 deep-reasoning companion-plan 模型与 summary-only sync-back 语义。

## 与既有任务的关系

- `planning/active/harness-init-skill-projection-audit/` 记录了当前四个 IDE 的入口与 skill projection 结构。
- `planning/active/cross-ide-projection-audit/` 记录了各 IDE 入口路径、skills、hooks 的官方/实现差异。
- `planning/active/workflow-constraints-audit/` 记录了 companion-plan、tracked-task precedence、summary-only sync-back 的最近落地情况。

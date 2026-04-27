# Findings

- `finishing-a-development-branch` 当前 Step 2 仍使用上游默认逻辑：`git merge-base HEAD main || git merge-base HEAD master`，并默认询问 “This branch split from main - is that correct?”。
- 仓库治理规则已明确相反约束：`AGENTS.md` 与 `harness/core/policy/base.md` 要求 finishing / merge 决策优先使用 planning 中记录的 `Worktree base: <ref> @ <sha>`，不要依赖 `git merge-base HEAD main` 之类的晚期猜测。
- `docs/release.md` 明确说明本仓库的持续开发入口是 `dev`，只有通过验证后才从 `dev` promote 到 `main`；因此“完成 worktree 后合并回本地 `dev`”在本仓库是符合治理预期的，而不是例外情况。
- `harness/installer/lib/git-base.mjs` 的 base recommendation 逻辑会在当前分支为非 trunk 分支时直接推荐当前分支作为 base，并给出 “preserve the active development context” 的原因。
- `harness/installer/commands/worktree-preflight.mjs` 会把推荐 base 和 `Worktree base: <ref> @ <sha>` 文本显式输出，说明 Harness 已拥有创建阶段的 base contract。
- 目前未发现 Harness 对 `finishing-a-development-branch` 做并行的 child patch、投影后补丁或测试约束；也未发现仓库测试直接覆盖 finishing skill 的 base 决策语义。
- 运行时验证：在当前仓库的 `dev` checkout 上执行 `./scripts/harness worktree-preflight --task finishing-branch-base-alignment-analysis`，推荐结果为 `dev @ 0a923624d7aeff382af90861a0f03180bfdccafc`，而不是 `main`。
- 当前仓库分支分离验证：`git rev-list --left-right --count main...dev` 返回 `7 45`，说明 `dev` 与 `main` 长期承担不同职责；把 worktree 完成后的本地合并目标默认写成 `main` 与本仓库真实工作流不一致。
- 从程序设计角度看，最佳修复点不是改 `worktree-preflight`，而是给 `superpowers:finishing-a-development-branch` 增加 Harness child patch，让 Step 2 优先读取 planning 中记录的 `Worktree base`，只在缺失时才退回到显式询问或保守推断。
- 由于 `harness/core/skills/index.json` 已经支持 `childPatches`，并且 `using-git-worktrees` / `writing-plans` 已有现成模式，所以对 finishing skill 做同类 patch 的实施成本和架构风险都较低。

# Roadmap

This document captures deferred product and workflow work that is intentionally not in the current default baseline.

## Current Direction

- Keep the global Harness baseline broad: Codex, Copilot, Cursor, and Claude Code remain part of `adopt-global`.
- Keep `safety` and `cloud-safe` off by default for global installs.
- Treat safety as a workspace-scoped capability until the overlay model and tool-allowance issues are resolved.

## Active Roadmap Items

### 1. Global Baseline + Workspace Safety Overlay

- Status: planned
- Priority: high
- Problem: the current installer/runtime model uses a single authoritative repo state. Enabling workspace safety rewrites that state instead of layering safety on top of the existing global baseline.
- Goal: allow a workspace to enable safety for one IDE without disrupting the repo's global baseline, shared skills, or other workspace/IDE access patterns.
- Success criteria:
  - user-global baseline remains intact after workspace safety enablement
  - workspace safety is stored as an additive overlay, not as a replacement for the baseline state
  - `sync`, `doctor`, and `adoption-status` report both layers coherently

### 2. Safety Hook False-Positive Reduction

- Status: planned
- Priority: high
- Problem: the current safety hook can block normal read-only agent/tool operations, which makes diagnosis and routine maintenance harder than intended.
- Goal: preserve destructive-action guardrails without aborting normal file reads, searches, verification commands, or other low-risk agent workflows.
- Success criteria:
  - normal read/search/verification flows do not trigger `Hook PreToolUse aborted`
  - dangerous commands still downgrade to `ask` or `deny`
  - Copilot runtime payload variants remain covered by regression tests

### 3. Re-evaluate Default Safety Posture

- Status: deferred
- Priority: medium
- Depends on:
  - Global Baseline + Workspace Safety Overlay
  - Safety Hook False-Positive Reduction
- Decision for now: keep safety available, but default-off. Revisit whether broader default rollout is warranted only after the two items above are complete and verified.
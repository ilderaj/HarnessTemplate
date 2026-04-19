# Global Context Remediation

## Current State
Status: active
Archive Eligible: no
Close Reason:

## Goal
Reduce superpowers hook payload size, add hook payload budget coverage, and surface hook payload measurements in health.

## Scope
- `harness/core/hooks/superpowers/scripts/session-start`
- `harness/installer/lib/health.mjs`
- `tests/hooks/hook-budget.test.mjs`
- `tests/hooks/superpowers-codex-hook.test.mjs`
- Minimal hook/health tests directly tied to payload measurement

## Phases
1. Replace the superpowers session-start payload with a compact startup directive.
2. Add hook payload budget tests for superpowers and planning hot context.
3. Extend health collection to measure known local hook payloads and report budget issues.
4. Run the requested tests and record results.

## Finishing Criteria
- Session-start payload stays under the configured hook payload budget.
- Health includes hook payload measurements in `health.context.hooks`.
- Over-budget hook payloads become warnings or problems according to the configured thresholds.
- Requested tests pass.


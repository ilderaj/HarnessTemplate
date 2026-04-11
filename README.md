# HarnessTemplate

HarnessTemplate is a reusable agent workflow template. It packages a shared policy for `planning-with-files`, optional `superpowers` reasoning, and platform projections for Codex, GitHub Copilot, Cursor, and Claude Code.

## What It Provides

- One platform-neutral Harness policy source.
- Workspace, user-global, and combined installation scopes.
- Adapter projections for Codex, Copilot, Cursor, and Claude Code.
- Vendored baselines for `superpowers` and `planning-with-files`.
- A CLI for install, sync, doctor, status, fetch, and update workflows.

## Quick Start

```bash
./scripts/harness install --scope=workspace --targets=all --projection=link
./scripts/harness sync
./scripts/harness doctor
```

## Installation Scopes

- `workspace`: install Harness projections into the current repository.
- `user-global`: install Harness projections into user-level agent locations.
- `both`: install user-level projections and current workspace projections.

`workspace` is the default. Use `both` when you want one user-level Harness and a project-level entrypoint.

## Supported Targets

- Codex
- GitHub Copilot
- Cursor
- Claude Code

The goal is consistent Harness behavior across supported targets, not identical low-level platform mechanics.

## Common Commands

```bash
./scripts/harness install
./scripts/harness sync
./scripts/harness doctor
./scripts/harness status
./scripts/harness fetch
./scripts/harness update
```

## Documentation

- [Architecture](docs/architecture.md)
- [Maintenance](docs/maintenance.md)
- [Release](docs/release.md)

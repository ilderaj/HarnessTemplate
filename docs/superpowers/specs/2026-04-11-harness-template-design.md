# Harness Template Design

## Summary

HarnessTemplate extracts the current local agent workflow into a reusable GitHub template. The template provides a neutral source of truth for a hybrid agent workflow built around `planning-with-files`, optional `superpowers` reasoning, and per-platform adapter projections for Codex, GitHub Copilot, Cursor, and Claude Code.

The design uses a `Core + Adapters + Installer` architecture:

- `core` defines the platform-neutral workflow semantics.
- `adapters` translate the core into each supported IDE or agent shape.
- `installer` manages interactive setup, projection, health checks, and update state.
- `upstream` stores vendored baselines and source metadata for external skills.

The v1 default is project-local installation. A user-level Harness home is supported as an opt-in mode for people who want one reusable installation across projects.

## Goals

- Provide a reusable GitHub template for projects that want the current Harness workflow.
- Keep one platform-neutral source of truth for shared rules and skill metadata.
- Strongly support Codex, GitHub Copilot, Cursor, and Claude Code in v1.
- Include a working vendored baseline for `superpowers` and `planning-with-files`.
- Preserve the ability to fetch and apply upstream updates later.
- Prefer symlinks to avoid drift, but copy or render where platform compatibility requires it.
- Remove all machine-specific paths so the template works outside the original author environment.
- Provide a clear README and maintenance documentation for both users and maintainers.

## Non-Goals

- v1 will not promise identical behavior across all agent platforms.
- v1 will not force invasive hooks into user environments by default.
- v1 will not support every IDE or agent on day one.
- v1 will not treat Codex, Copilot, Cursor, or Claude Code as the canonical source by itself.
- v1 will not rely on author-specific absolute paths or machine-specific directories.

## Confirmed Constraints

- The repository must use an IDE-neutral source of truth.
- The v1 runtime model must support both project-local mode and optional user-home mode.
- Project-local mode is the default.
- Codex, GitHub Copilot, Cursor, and Claude Code are the required v1 targets.
- `superpowers` and `planning-with-files` use a hybrid integration model:
  - a vendored working baseline lives in the template,
  - upstream fetch and update flows remain available.
- The template must be fully depersonalized.

## Repository Structure

```text
HarnessTemplate/
  harness/
    core/
      policy/
      skills/
      templates/
      metadata/
      state-schema/
    adapters/
      codex/
      copilot/
      cursor/
      claude-code/
    installer/
      commands/
      lib/
      manifests/
    upstream/
      superpowers/
      planning-with-files/
  docs/
    architecture.md
    install/
    compatibility/
    maintenance.md
    release.md
  planning/
  reports/
  scripts/
```

## Core Responsibilities

`harness/core/` is the only place that defines shared Harness semantics.

It must contain:

- `policy/base.md`: shared hybrid workflow rules, planning persistence rules, superpowers boundaries, verification expectations, communication expectations, and token-saving guidance.
- `policy/platform-overrides/`: platform-specific behavioral notes that do not belong in the shared base.
- `policy/snippets/`: reusable policy fragments such as shell guidance or subagent guidance.
- `skills/first-party/`: first-party Harness skills and maintained compatibility skills.
- `skills/mirrors/`: vendored skill baselines copied from upstream sources.
- `skills/patches/`: compatibility patches for platforms that cannot consume an upstream skill directly.
- `skills/index.json`: machine-readable skill metadata, including source, version, projection strategy, and platform exceptions.
- `templates/`: render templates for platform entry files.
- `metadata/`: supported platform definitions, default locations, and projection rules.
- `state-schema/`: schema documentation for installer state files.

Core must not contain platform-specific home paths such as `~/.codex`, `~/.copilot`, `.cursor/rules`, or `.claude` as implementation targets. Those belong in adapters and installer metadata.

## Adapter Responsibilities

Adapters translate core into platform-specific outputs. They must not invent workflow rules or duplicate policy bodies.

Each adapter supports three projection operations:

- `link`: create a symlink or equivalent directory link to a generated or vendored source.
- `materialize`: create a real local copy when a platform needs physical files or patched content.
- `render`: generate a platform entry file from templates and core policy.

### Codex Adapter

Codex is the closest target to the current source behavior.

It should:

- render `AGENTS.md`,
- link skills where reliable,
- avoid Codex-specific policy drift,
- support project-local and user-home installation.

### Copilot Adapter

Copilot needs explicit local instructions and local skill visibility.

It should:

- render `copilot-instructions.md`,
- link compatible `superpowers` skills,
- materialize patched `planning-with-files` content,
- avoid assuming Copilot reads Codex global configuration or shared `.agents/skills`.

### Cursor Adapter

Cursor needs a dual projection model.

It should:

- render rules into Cursor-compatible `.mdc` files,
- expose supported skills through Cursor-readable skill directories,
- keep rules and skills derived from the same core source.

### Claude Code Adapter

Claude Code has stronger native plugin and hook support, but hooks should not be forced by default.

It should:

- render a thin `CLAUDE.md` entry file,
- link compatible skills where reliable,
- document optional hooks separately,
- avoid mutating invasive hook configuration unless explicitly selected.

## Installer and CLI

The CLI is the interface for users and maintainers. It manages installation state rather than acting as a collection of one-off scripts.

Initial command set:

```bash
./scripts/harness install
./scripts/harness doctor
./scripts/harness sync
./scripts/harness fetch
./scripts/harness update
./scripts/harness status
```

### `install`

Interactive first-run setup.

It should:

- detect available target platforms,
- ask which platforms to configure,
- ask whether to use project-local mode or user-home mode,
- ask whether to prefer symlinks or portable materialized files,
- render, link, or materialize platform projections,
- write `.harness/state.json`.

### `doctor`

Health check and repair guidance.

It should verify:

- target entry files exist,
- symlinks are not broken,
- materialized files are current,
- rendered files match the current core,
- no generated files contain personal absolute paths,
- selected platforms are fully configured.

### `sync`

Reproject the current core into already installed targets.

It must be idempotent. Running it twice without changes should not create new diffs.

### `fetch`

Fetch candidate upstream updates into `harness/upstream/` and update source metadata without immediately mutating installed targets.

### `update`

Apply fetched upstream updates to the template baseline, rerun compatibility patches, and resync installed targets.

### `status`

Show installed targets, install mode, projection mode, upstream versions, and sync health.

## State Model

The installer writes local state to:

```text
.harness/state.json
```

State should record:

- selected targets,
- install mode,
- target paths,
- projection mode per target,
- skill source versions,
- patch versions,
- last `sync`, `fetch`, and `update` operations.

The state file is local machine state and should be ignored by Git. If project-level installation metadata is needed later, it should be stored separately in a sanitized committed manifest.

## Documentation Design

README should stay short and conversion-focused.

It should include:

- what HarnessTemplate is,
- who should use it,
- a quick install path,
- supported v1 platforms,
- common CLI commands,
- a realistic compatibility statement.

Detailed documentation should live in:

- `docs/architecture.md`
- `docs/install/codex.md`
- `docs/install/copilot.md`
- `docs/install/cursor.md`
- `docs/install/claude-code.md`
- `docs/compatibility/`
- `docs/maintenance.md`
- `docs/release.md`

## Verification Strategy

Verification covers four layers.

### Structure Verification

Checks:

- core has no hard-coded personal paths,
- adapters do not duplicate shared policy bodies,
- installer behavior is metadata-driven,
- upstream metadata exists,
- required docs exist.

### Projection Verification

Checks for each v1 platform:

- entry files are generated,
- skills use the correct `link` or `materialize` strategy,
- patches are applied where required,
- `sync` is idempotent.

### Experience Verification

Checks:

- a new user can follow README installation,
- selected platforms are configurable in arbitrary combinations,
- generated files are discoverable in expected target locations,
- a planning-related workflow can read the expected instructions.

### Maintenance Verification

Checks:

- `fetch` can retrieve upstream candidates,
- `update` can apply candidates through patches,
- `sync` still works after updates,
- adding a new skill requires metadata and adapter coverage,
- no personal paths leak into generated output.

Verification reports should be generated at:

```text
reports/verification/latest.md
reports/verification/latest.json
```

## Release and Branch Strategy

The local repository should have:

- `main`: verified template baseline,
- `dev`: ongoing development and update work.

The GitHub repository should be named `HarnessTemplate` and configured as a template repository. Local `main` and `dev` should track remote `main` and `dev`.

Automation should update `dev`, run verification, and only promote to `main` after the baseline passes.

## First Implementation Milestone

The first milestone should produce:

- core policy baseline,
- minimal adapters for Codex, Copilot, Cursor, and Claude Code,
- vendored baselines for `superpowers` and `planning-with-files`,
- skill metadata,
- `install`, `doctor`, and `sync`,
- README and architecture docs,
- verification checks for depersonalization and projection idempotence,
- local Git and GitHub repository setup with `main` and `dev`.

`fetch`, `update`, and automation can be delivered after the first milestone, but the repository structure and metadata must reserve space for them from the beginning. The first milestone should still include command stubs or documented command contracts so later work does not change the public interface.

## Risks and Mitigations

### Platform Discovery Drift

Different tools may change how they load global instructions, skills, plugins, or hooks.

Mitigation: keep platform assumptions in adapters and compatibility docs, not in core policy.

### Symlink Fragility

Symlinks can break across machines, cloud sync tools, archives, or Windows setups.

Mitigation: support portable materialized mode and platform-specific link fallbacks.

### Policy Drift

Generated files can drift if platform files are edited manually after installation.

Mitigation: make `sync` idempotent, record generated file fingerprints, and surface drift in `doctor`.

### Upstream Compatibility Changes

Upstream `superpowers` or `planning-with-files` changes may break local patches.

Mitigation: split `fetch` from `update`, require patch reapplication, and generate verification reports before promotion.

### Over-Invasive Installation

Automatically mutating global hooks or IDE settings may surprise users.

Mitigation: default to project-local install and make hooks opt-in.

## Implementation Defaults

- CLI implementation should default to a small Node.js command with no third-party runtime dependencies, invoked through `./scripts/harness`.
- `.harness/state.json` should be local machine state and ignored by Git.
- Upstream versions should be recorded by source URL, commit SHA, fetched timestamp, and optional release tag.
- Initial vendored baselines should be committed as plain copied files, not submodules or subtrees.
- Generated platform outputs should not be committed by default unless they are documentation examples or test fixtures.

import { readFileSync } from 'node:fs';
import path from 'node:path';

const platforms = JSON.parse(
  readFileSync(new URL('../../core/metadata/platforms.json', import.meta.url), 'utf8')
).platforms;

const targetRoots = {
  codex: { workspace: '', global: '.codex' },
  copilot: { workspace: '.copilot', global: '.copilot' },
  cursor: { workspace: '', global: '' },
  'claude-code': { workspace: '', global: '.claude' }
};

function expand(base, values) {
  return values.map((value) => path.join(base, value));
}

function resolveEntryFiles(target) {
  const platform = platforms[target];
  if (!platform) {
    throw new Error(`Unknown target: ${target}`);
  }

  return platform.entryFiles ?? [];
}

function resolveScopedPaths(baseDir, target, scopeKey) {
  const root = targetRoots[target]?.[scopeKey];
  if (root === undefined) {
    throw new Error(`Unknown target: ${target}`);
  }

  const entries = resolveEntryFiles(target);
  const paths = entries.map((entry) => (root ? path.join(root, entry) : entry));
  return expand(baseDir, paths);
}

export function resolveTargetPaths(rootDir, homeDir, scope, target) {
  const results = [];

  if (scope === 'workspace' || scope === 'both') {
    results.push(...resolveScopedPaths(rootDir, target, 'workspace'));
  }

  if (scope === 'user-global' || scope === 'both') {
    results.push(...resolveScopedPaths(homeDir, target, 'global'));
  }

  return results;
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entriesForScope, renderEntry } from '../../harness/installer/lib/adapters.mjs';

test('renderEntry combines base policy and platform override', async () => {
  const rendered = await renderEntry(process.cwd(), 'codex');
  assert.match(rendered, /# Harness Policy For Codex/);
  assert.match(rendered, /Hybrid Workflow Policy/);
  assert.match(rendered, /Codex Platform Notes/);
});

test('entriesForScope uses installer path metadata instead of adapter entry arrays', () => {
  const adapter = {
    target: 'codex',
    workspaceEntries: ['bogus-workspace.md'],
    globalEntries: ['bogus-global.md']
  };

  assert.deepEqual(entriesForScope('/repo', '/home/user', adapter, 'workspace'), ['/repo/AGENTS.md']);
  assert.deepEqual(entriesForScope('/repo', '/home/user', adapter, 'user-global'), ['/home/user/.codex/AGENTS.md']);
  assert.deepEqual(entriesForScope('/repo', '/home/user', adapter, 'both'), [
    '/repo/AGENTS.md',
    '/home/user/.codex/AGENTS.md'
  ]);
});

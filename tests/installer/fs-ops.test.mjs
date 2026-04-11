import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { materializeFile, renderTemplate } from '../../harness/installer/lib/fs-ops.mjs';

test('renderTemplate replaces named tokens', () => {
  assert.equal(renderTemplate('Hello {{name}}', { name: 'Harness' }), 'Hello Harness');
});

test('materializeFile copies content and creates parent dirs', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'harness-fs-'));
  try {
    const source = path.join(dir, 'source.md');
    const target = path.join(dir, 'nested/target.md');
    await writeFile(source, 'content');
    await materializeFile(source, target);
    assert.equal(await readFile(target, 'utf8'), 'content');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

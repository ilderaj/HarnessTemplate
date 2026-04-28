import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { writeState } from '../../harness/installer/lib/state.mjs';
import {
  createHarnessFixture,
  removeHarnessFixture
} from '../helpers/harness-fixture.mjs';

const execFileAsync = promisify(execFile);

function harnessCommand(root, env, ...args) {
  return execFileAsync('node', [path.join(root, 'harness/installer/commands/harness.mjs'), ...args], {
    cwd: root,
    env: { ...process.env, ...env }
  });
}

test('doctor reports Copilot hook ledger detail and overlap as recoverable warnings', async () => {
  const root = await createHarnessFixture();
  const home = path.join(root, 'home');
  try {
    await mkdir(home, { recursive: true });
    await writeState(root, {
      schemaVersion: 1,
      scope: 'both',
      projectionMode: 'link',
      hookMode: 'on',
      targets: {
        copilot: {
          enabled: true,
          paths: [
            path.join(root, '.github/copilot-instructions.md'),
            path.join(home, '.copilot/instructions/harness.instructions.md')
          ]
        }
      },
      upstream: {}
    });

    await mkdir(path.join(root, 'planning/active/compact-task'), { recursive: true });
    await writeFile(
      path.join(root, 'planning/active/compact-task/task_plan.md'),
      [
        '# Compact Task',
        '',
        '## Goal',
        '- Keep Copilot doctor budget output visible.',
        '',
        '## Current State',
        'Status: active',
        'Archive Eligible: no'
      ].join('\n')
    );
    await writeFile(path.join(root, 'planning/active/compact-task/findings.md'), '# Findings\n');
    await writeFile(path.join(root, 'planning/active/compact-task/progress.md'), '# Progress\n');

    await harnessCommand(root, { HOME: home }, 'sync');
    const { stdout } = await harnessCommand(root, { HOME: home }, 'doctor', '--check-only');

    assert.match(stdout, /Hook payload detail:/);
    assert.match(stdout, /copilot \/ planning-brief \/ ok \/ \d+ tokens/);
    assert.match(stdout, /Scope overlap verdict: warning/);
    assert.match(stdout, /Harness check passed\./);
  } finally {
    await removeHarnessFixture(root);
  }
});

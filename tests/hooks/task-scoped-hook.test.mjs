import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

test('task-scoped-hook emits Codex hookSpecificOutput payload', async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'harness-hook-'));
  try {
    const taskRoot = path.join(fixtureRoot, 'planning/active/codex-hooks');
    await mkdir(taskRoot, { recursive: true });
    await writeFile(
      path.join(taskRoot, 'task_plan.md'),
      [
        '# Codex Hooks',
        '',
        '## 任务目标',
        '- Keep hook output compact.',
        '',
        '## Current State',
        'Status: active',
        'Archive Eligible: no'
      ].join('\n')
    );
    await writeFile(path.join(taskRoot, 'findings.md'), '## Notes\n- Use summary-first recovery.\n');
    await writeFile(
      path.join(taskRoot, 'progress.md'),
      ['- Captured planning progress.', '- Added compact hot context.'].join('\n')
    );

    const scriptPath = path.join(
      process.cwd(),
      'harness/core/hooks/planning-with-files/scripts/task-scoped-hook.sh'
    );
    const { stdout } = await execFileAsync('bash', [scriptPath, 'codex', 'user-prompt-submit'], {
      cwd: fixtureRoot
    });

    const payload = JSON.parse(stdout);
    assert.equal(payload.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
    assert.match(payload.hookSpecificOutput.additionalContext, /HOT CONTEXT/);
    assert.match(payload.hookSpecificOutput.additionalContext, /Goal: Keep hook output compact\./);
    assert.doesNotMatch(payload.hookSpecificOutput.additionalContext, /Archive Eligible/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

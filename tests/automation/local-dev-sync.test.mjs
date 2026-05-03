import { test } from 'node:test';
import assert from 'node:assert/strict';

async function loadLocalDevSyncModule() {
  return import('../../scripts/local/sync-dev-after-upstream-pr.mjs');
}

test('buildLocalDevSyncCommandPlan uses only fetch, checkout dev, and ff-only merge', async () => {
  const { buildLocalDevSyncCommandPlan } = await loadLocalDevSyncModule();

  assert.deepEqual(buildLocalDevSyncCommandPlan(), [
    { file: 'git', args: ['fetch', 'origin', 'dev'] },
    { file: 'git', args: ['checkout', 'dev'] },
    { file: 'git', args: ['merge', '--ff-only', 'origin/dev'] }
  ]);
});


test('parseAheadBehindCount parses git rev-list left-right count output', async () => {
  const { parseAheadBehindCount } = await loadLocalDevSyncModule();

  assert.deepEqual(parseAheadBehindCount('0\t3\n'), { ahead: 0, behind: 3 });
  assert.deepEqual(parseAheadBehindCount('2 0'), { ahead: 2, behind: 0 });
  assert.throws(() => parseAheadBehindCount('not counts'), /Unable to parse ahead\/behind counts/);
});

test('analyzeLocalDevPreflight allows a clean worktree that can fast-forward dev', async () => {
  const { analyzeLocalDevPreflight } = await loadLocalDevSyncModule();

  const report = analyzeLocalDevPreflight({
    expectedRepoRoot: '/repo/SuperpoweringWithFiles',
    repoRoot: '/repo/SuperpoweringWithFiles',
    currentBranch: 'feature/current-work',
    worktreeStatus: '',
    localHead: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    originDevHead: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    localDevExists: true,
    originDevExists: true,
    aheadBehind: { ahead: 0, behind: 4 }
  });

  assert.equal(report.canSync, true);
  assert.equal(report.reason, 'ready_to_fast_forward');
  assert.equal(report.currentBranch, 'feature/current-work');
  assert.equal(report.localHead, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  assert.equal(report.originDevHead, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
});

test('analyzeLocalDevPreflight blocks local dev ahead of origin/dev', async () => {
  const { analyzeLocalDevPreflight, formatLocalDevSyncReport } = await loadLocalDevSyncModule();

  const report = analyzeLocalDevPreflight({
    expectedRepoRoot: '/repo/SuperpoweringWithFiles',
    repoRoot: '/repo/SuperpoweringWithFiles',
    currentBranch: 'dev',
    worktreeStatus: '',
    localHead: '1111111111111111111111111111111111111111',
    originDevHead: '2222222222222222222222222222222222222222',
    localDevExists: true,
    originDevExists: true,
    aheadBehind: { ahead: 2, behind: 0 }
  });

  assert.equal(report.canSync, false);
  assert.equal(report.reason, 'local_dev_ahead_of_origin_dev');

  const formatted = formatLocalDevSyncReport(report);
  assert.match(formatted, /Current branch: dev/);
  assert.match(formatted, /Local HEAD: 1111111111111111111111111111111111111111/);
  assert.match(formatted, /origin\/dev HEAD: 2222222222222222222222222222222222222222/);
  assert.match(formatted, /Reason sync stopped: local_dev_ahead_of_origin_dev/);
  assert.match(formatted, /git log --oneline refs\/remotes\/origin\/dev\.\.refs\/heads\/dev/);
});

test('analyzeLocalDevPreflight reports divergence separately from local-only ahead commits', async () => {
  const { analyzeLocalDevPreflight } = await loadLocalDevSyncModule();

  const report = analyzeLocalDevPreflight({
    expectedRepoRoot: '/repo/SuperpoweringWithFiles',
    repoRoot: '/repo/SuperpoweringWithFiles',
    currentBranch: 'feature/current-work',
    worktreeStatus: '',
    localHead: '1111111111111111111111111111111111111111',
    originDevHead: '2222222222222222222222222222222222222222',
    localDevExists: true,
    originDevExists: true,
    aheadBehind: { ahead: 1, behind: 1 }
  });

  assert.equal(report.canSync, false);
  assert.equal(report.reason, 'fast_forward_not_available');
});

test('runLocalDevSync stops before checkout and merge when preflight is blocked', async () => {
  const { runLocalDevSync, formatCommand } = await loadLocalDevSyncModule();
  const commands = [];

  const result = await runLocalDevSync({
    cwd: '/repo/SuperpoweringWithFiles',
    expectedRepoRoot: '/repo/SuperpoweringWithFiles',
    stdout: { write() {} },
    stderr: { write() {} },
    runCommand: async (command) => {
      commands.push(formatCommand(command));

      if (command.args.join(' ') === 'rev-parse --show-toplevel') return { stdout: '/repo/SuperpoweringWithFiles\n' };
      if (command.args.join(' ') === 'branch --show-current') return { stdout: 'dev\n' };
      if (command.args.join(' ') === 'status --porcelain') return { stdout: ' M docs/maintenance.md\n' };
      if (command.args.join(' ') === 'rev-parse --verify refs/heads/dev') return { stdout: '1111111111111111111111111111111111111111\n' };
      if (command.args.join(' ') === 'rev-parse --verify refs/remotes/origin/dev') return { stdout: '2222222222222222222222222222222222222222\n' };
      if (command.args.join(' ') === 'rev-list --left-right --count refs/heads/dev...refs/remotes/origin/dev') return { stdout: '0\t1\n' };
      if (command.args.join(' ') === 'fetch origin dev') return { stdout: '' };
      throw new Error(`Unexpected command: ${formatCommand(command)}`);
    }
  });

  assert.equal(result.status, 'blocked');
  assert.equal(result.report.reason, 'worktree_not_clean');
  assert.equal(commands.includes('git checkout dev'), false);
  assert.equal(commands.includes('git merge --ff-only origin/dev'), false);
});

test('runLocalDevSync rejects a dev tag when refs/heads/dev is missing', async () => {
  const { runLocalDevSync, formatCommand } = await loadLocalDevSyncModule();
  const commands = [];

  const result = await runLocalDevSync({
    cwd: '/repo/SuperpoweringWithFiles',
    expectedRepoRoot: '/repo/SuperpoweringWithFiles',
    stdout: { write() {} },
    stderr: { write() {} },
    runCommand: async (command) => {
      commands.push(formatCommand(command));

      if (command.args.join(' ') === 'rev-parse --show-toplevel') return { stdout: '/repo/SuperpoweringWithFiles\n' };
      if (command.args.join(' ') === 'branch --show-current') return { stdout: '' };
      if (command.args.join(' ') === 'status --porcelain') return { stdout: '' };
      if (command.args.join(' ') === 'rev-parse --verify dev') return { stdout: 'tag-sha-that-must-not-be-used\n' };
      if (command.args.join(' ') === 'rev-parse --verify refs/heads/dev') throw new Error('fatal: Needed a single revision');
      if (command.args.join(' ') === 'rev-parse --verify refs/remotes/origin/dev') return { stdout: '2222222222222222222222222222222222222222\n' };
      if (command.args.join(' ') === 'rev-list --left-right --count refs/heads/dev...refs/remotes/origin/dev') return { stdout: '0\t1\n' };
      if (command.args.join(' ') === 'fetch origin dev') return { stdout: '' };
      throw new Error(`Unexpected command: ${formatCommand(command)}`);
    }
  });

  assert.equal(result.status, 'blocked');
  assert.equal(result.report.reason, 'local_dev_missing');
  assert.equal(commands.includes('git rev-parse --verify refs/heads/dev'), true);
  assert.equal(commands.includes('git rev-parse --verify dev'), false);
  assert.equal(commands.includes('git fetch origin dev'), false);
  assert.equal(commands.includes('git checkout dev'), false);
  assert.equal(commands.includes('git merge --ff-only origin/dev'), false);
});

test('runLocalDevSync fetches, checks out dev, and fast-forwards only after preflight passes', async () => {
  const { runLocalDevSync, formatCommand } = await loadLocalDevSyncModule();
  const commands = [];

  const result = await runLocalDevSync({
    cwd: '/repo/SuperpoweringWithFiles',
    expectedRepoRoot: '/repo/SuperpoweringWithFiles',
    stdout: { write() {} },
    stderr: { write() {} },
    runCommand: async (command) => {
      commands.push(formatCommand(command));

      if (command.args.join(' ') === 'rev-parse --show-toplevel') return { stdout: '/repo/SuperpoweringWithFiles\n' };
      if (command.args.join(' ') === 'branch --show-current') return { stdout: 'feature/current-work\n' };
      if (command.args.join(' ') === 'status --porcelain') return { stdout: '' };
      if (command.args.join(' ') === 'rev-parse --verify refs/heads/dev') return { stdout: '1111111111111111111111111111111111111111\n' };
      if (command.args.join(' ') === 'rev-parse --verify refs/remotes/origin/dev') return { stdout: '2222222222222222222222222222222222222222\n' };
      if (command.args.join(' ') === 'rev-list --left-right --count refs/heads/dev...refs/remotes/origin/dev') return { stdout: '0\t1\n' };
      if (command.args.join(' ') === 'fetch origin dev') return { stdout: '' };
      if (command.args.join(' ') === 'checkout dev') return { stdout: '' };
      if (command.args.join(' ') === 'merge --ff-only origin/dev') return { stdout: 'Updating dev\n' };
      throw new Error(`Unexpected command: ${formatCommand(command)}`);
    }
  });

  assert.equal(result.status, 'synced');
  assert.deepEqual(commands.filter((command) => [
    'git fetch origin dev',
    'git checkout dev',
    'git merge --ff-only origin/dev'
  ].includes(command)), [
    'git fetch origin dev',
    'git checkout dev',
    'git merge --ff-only origin/dev'
  ]);
  assert.ok(commands.indexOf('git rev-list --left-right --count refs/heads/dev...refs/remotes/origin/dev') < commands.indexOf('git fetch origin dev'));
  assert.equal(commands.includes('git rev-parse --verify dev'), false);
  assert.equal(commands.includes('git rev-parse --verify origin/dev'), false);
  assert.equal(commands.includes('git rev-list --left-right --count dev...origin/dev'), false);
  assert.equal(commands.some((command) => /\bstash\b|\brebase\b|\bmerge\b(?! --ff-only)/.test(command)), false);
});

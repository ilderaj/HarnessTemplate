import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { buildSessionSummary } from '../lib/session-summary.mjs';

function hasFlag(args, ...names) {
  return names.some((name) => args.includes(name));
}

function parseTaskId(args) {
  const inline = args.find((arg) => arg.startsWith('--task='));
  if (inline) {
    return inline.slice('--task='.length);
  }

  const taskIndex = args.indexOf('--task');
  if (taskIndex === -1) {
    return undefined;
  }

  const taskId = args[taskIndex + 1];
  if (!taskId || taskId.startsWith('--')) {
    throw new Error('Missing value for --task.');
  }

  return taskId;
}

function usage() {
  return [
    'Usage: ./scripts/harness summary [--task <task-id>]',
    '',
    'Options:',
    '  --task <task-id>  Render the specified task directory under planning/active',
    '  --help, -h        Show this help message'
  ].join('\n');
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listActiveTasks(activeRoot) {
  const entries = await readdir(activeRoot, { withFileTypes: true }).catch(() => []);
  const activeTaskIds = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const taskPlanPath = path.join(activeRoot, entry.name, 'task_plan.md');
    const taskPlan = await readFile(taskPlanPath, 'utf8').catch(() => null);
    if (taskPlan && /^Status:\s*active$/m.test(taskPlan)) {
      activeTaskIds.push(entry.name);
    }
  }

  return activeTaskIds.sort();
}

async function resolveTaskDirectory(rootDir, explicitTaskId) {
  const activeRoot = path.join(rootDir, 'planning/active');
  if (explicitTaskId) {
    const taskDir = path.join(activeRoot, explicitTaskId);
    if (!(await pathExists(taskDir))) {
      throw new Error(`Task "${explicitTaskId}" not found under planning/active.`);
    }
    return taskDir;
  }

  const activeTaskIds = await listActiveTasks(activeRoot);
  if (activeTaskIds.length === 0) {
    throw new Error('No active task found under planning/active.');
  }

  if (activeTaskIds.length > 1) {
    throw new Error(
      `Multiple active tasks found under planning/active: ${activeTaskIds.join(', ')}. Use --task <id>.`
    );
  }

  return path.join(activeRoot, activeTaskIds[0]);
}

async function readSessionStartEpoch(taskDir) {
  const rawValue = await readFile(path.join(taskDir, '.session-start'), 'utf8').catch(() => '');
  const normalized = rawValue.trim();
  if (!normalized) {
    return Number.NaN;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function summary(args = []) {
  if (hasFlag(args, '--help', '-h')) {
    console.log(usage());
    return;
  }

  const rootDir = process.cwd();
  const taskId = parseTaskId(args);
  const taskDir = await resolveTaskDirectory(rootDir, taskId);
  const output = await buildSessionSummary({
    taskPlanPath: path.join(taskDir, 'task_plan.md'),
    findingsPath: path.join(taskDir, 'findings.md'),
    progressPath: path.join(taskDir, 'progress.md'),
    sessionStartEpoch: await readSessionStartEpoch(taskDir),
    now: Date.now()
  });

  process.stdout.write(`${output}\n`);
}

import { access, readdir } from 'node:fs/promises';
import path from 'node:path';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function markdownFilesIn(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => path.join(dirPath, entry.name))
      .sort();
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  }
}

function relative(rootDir, targetPath) {
  return path.relative(rootDir, targetPath) || path.basename(targetPath);
}

export async function inspectPlanLocations(rootDir) {
  const results = [];

  for (const fileName of ['task_plan.md', 'findings.md', 'progress.md']) {
    const filePath = path.join(rootDir, fileName);
    if (await exists(filePath)) {
      results.push({
        path: relative(rootDir, filePath),
        severity: 'warning',
        message: `${fileName} is outside planning/active/<task-id>/. Move durable task state into planning/active/<task-id>/.`
      });
    }
  }

  for (const dirName of ['docs/superpowers/plans', 'docs/plans']) {
    const dirPath = path.join(rootDir, dirName);
    const files = await markdownFilesIn(dirPath);
    if (files.length > 0) {
      results.push({
        path: dirName,
        severity: 'warning',
        message: `${dirName} contains plan files outside planning/active/<task-id>/. Treat these as human-facing or historical docs, not active agent task memory.`
      });
    }
  }

  return results;
}

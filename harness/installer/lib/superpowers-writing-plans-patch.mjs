import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MARKER = 'Harness Superpowers writing-plans location patch';

const UPSTREAM_SAVE_BLOCK = [
  '**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`',
  '- (User preferences for plan location override this default)'
].join('\n');

const HARNESS_SAVE_BLOCK = [
  `## ${MARKER}`,
  '',
  'Harness overrides the upstream Superpowers plan location.',
  '',
  '**Save durable task state to:** `planning/active/<task-id>/task_plan.md`',
  '',
  'Also keep `planning/active/<task-id>/findings.md` and `planning/active/<task-id>/progress.md` updated.',
  'Do not create long-lived files under `docs/superpowers/plans/` unless the user explicitly asks for that artifact.'
].join('\n');

export async function applySuperpowersWritingPlansPatch(targetDir) {
  const skillPath = path.join(targetDir, 'SKILL.md');
  const original = await readFile(skillPath, 'utf8');
  const patched = original.includes(MARKER)
    ? original
    : original.replace(UPSTREAM_SAVE_BLOCK, HARNESS_SAVE_BLOCK);

  if (patched === original && !original.includes(MARKER)) {
    throw new Error(`Unable to apply ${MARKER} to ${skillPath}`);
  }

  await writeFile(skillPath, patched);
}

export { MARKER as SUPERPOWERS_WRITING_PLANS_PATCH_MARKER };

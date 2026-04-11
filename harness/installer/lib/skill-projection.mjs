import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function projectionForSkill(rootDir, skillName, target) {
  const index = JSON.parse(await readFile(path.join(rootDir, 'harness/core/skills/index.json'), 'utf8'));
  const skill = index.skills[skillName];

  if (!skill) {
    throw new Error(`Unknown skill: ${skillName}`);
  }

  return {
    skillName,
    target,
    strategy: skill.projection[target] || skill.projection.default,
    source: path.join(rootDir, skill.baselinePath),
    patch: skill.patches ? skill.patches[target] : undefined
  };
}

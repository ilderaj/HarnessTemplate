import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { resolveSkillTargetPaths } from './paths.mjs';

const strategies = new Set(['link', 'materialize']);

function normalizePatches(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function resolvePatches(patchConfig, target) {
  if (!patchConfig) return [];
  return [
    ...normalizePatches(patchConfig.default),
    ...normalizePatches(patchConfig[target])
  ];
}

async function loadSkillIndex(rootDir) {
  return JSON.parse(await readFile(path.join(rootDir, 'harness/core/skills/index.json'), 'utf8'));
}

async function loadPlatformsMetadata(rootDir) {
  return JSON.parse(await readFile(path.join(rootDir, 'harness/core/metadata/platforms.json'), 'utf8'));
}

function strategyFor(skill, target) {
  const strategy = skill.projection[target] || skill.projection.default;
  if (!strategies.has(strategy)) {
    throw new Error(`Unsupported projection strategy: ${strategy}`);
  }
  return strategy;
}

async function collectionChildNames(sourcePath) {
  const entries = await readdir(sourcePath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export async function projectionForSkill(rootDir, skillName, target) {
  const [index, metadata] = await Promise.all([
    loadSkillIndex(rootDir),
    loadPlatformsMetadata(rootDir)
  ]);

  if (!metadata.platforms[target]) {
    throw new Error(`Unknown target: ${target}`);
  }

  const skill = index.skills[skillName];

  if (!skill) {
    throw new Error(`Unknown skill: ${skillName}`);
  }

  const strategy = strategyFor(skill, target);

  return {
    skillName,
    target,
    strategy,
    source: path.join(rootDir, skill.baselinePath),
    patches: resolvePatches(skill.patches, target)
  };
}

export async function planSkillProjections({ rootDir, homeDir, scope, target }) {
  const [index, metadata] = await Promise.all([
    loadSkillIndex(rootDir),
    loadPlatformsMetadata(rootDir)
  ]);

  if (!metadata.platforms[target]) {
    throw new Error(`Unknown target: ${target}`);
  }

  const projections = [];

  for (const [parentSkillName, skill] of Object.entries(index.skills).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    const sourceRoot = path.join(rootDir, skill.baselinePath);
    const strategy = strategyFor(skill, target);

    if (skill.layout === 'collection') {
      const childNames = await collectionChildNames(sourceRoot);
      const targetPaths = resolveSkillTargetPaths(rootDir, homeDir, scope, target, {
        layout: 'collection',
        childNames
      });

      for (const childName of childNames) {
        for (const targetPath of targetPaths.filter((candidate) => path.basename(candidate) === childName)) {
          const patches = normalizePatches(skill.childPatches?.[childName]);
          projections.push({
            kind: 'skill',
            parentSkillName,
            skillName: childName,
            target,
            strategy,
            sourcePath: path.join(sourceRoot, childName),
            targetPath,
            patches
          });
        }
      }
      continue;
    }

    if (skill.layout === 'single') {
      for (const targetPath of resolveSkillTargetPaths(rootDir, homeDir, scope, target, skill)) {
        const patches = resolvePatches(skill.patches, target);
        projections.push({
          kind: 'skill',
          parentSkillName,
          skillName: skill.targetName,
          target,
          strategy,
          sourcePath: sourceRoot,
          targetPath,
          patches
        });
      }
      continue;
    }

    throw new Error(`Unsupported skill layout: ${skill.layout}`);
  }

  return projections;
}

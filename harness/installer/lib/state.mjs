import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function defaultState() {
  return {
    schemaVersion: 1,
    scope: 'workspace',
    projectionMode: 'link',
    targets: {},
    upstream: {}
  };
}

export function statePath(rootDir) {
  return path.join(rootDir, '.harness', 'state.json');
}

export async function readState(rootDir) {
  try {
    return JSON.parse(await readFile(statePath(rootDir), 'utf8'));
  } catch (error) {
    if (error && error.code === 'ENOENT') return defaultState();
    throw error;
  }
}

export async function writeState(rootDir, state) {
  await mkdir(path.dirname(statePath(rootDir)), { recursive: true });
  await writeFile(statePath(rootDir), `${JSON.stringify(state, null, 2)}\n`);
}

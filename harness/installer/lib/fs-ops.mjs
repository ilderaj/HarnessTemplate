import { copyFile, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

export function renderTemplate(template, values) {
  return template.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (_, key) => {
    if (!(key in values)) {
      throw new Error(`Missing template value: ${key}`);
    }
    return values[key];
  });
}

export async function writeRenderedFile(targetPath, content) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content);
}

export async function materializeFile(sourcePath, targetPath) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);
}

export async function linkPath(sourcePath, targetPath) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await rm(targetPath, { recursive: true, force: true });
  await symlink(sourcePath, targetPath);
}

export async function readText(filePath) {
  return readFile(filePath, 'utf8');
}

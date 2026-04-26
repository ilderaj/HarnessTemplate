import crypto from 'node:crypto';
import { lstat, mkdir, readFile, readdir, readlink, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const BACKUP_INDEX_SCHEMA_VERSION = 1;

const DEFAULT_REASON = 'non-harness-owned-conflict';

export function backupArchiveRoot(homeDir = os.homedir()) {
  return path.join(homeDir, '.harness/backups');
}

export function backupIndexPath(homeDir = os.homedir()) {
  return path.join(homeDir, '.harness/backup-index.json');
}

export function encodeTargetPath(targetPath) {
  const segments = path.resolve(targetPath).split(path.sep).filter(Boolean);
  if (segments.length === 0) return 'root';
  return path.join(...segments.map((segment) => segment.replaceAll(/[^a-zA-Z0-9._-]/g, '_')));
}

async function digestPath(targetPath, hash) {
  const targetStat = await lstat(targetPath);

  if (targetStat.isSymbolicLink()) {
    hash.update('symlink\0');
    hash.update(await readlink(targetPath));
    return;
  }

  if (targetStat.isDirectory()) {
    hash.update('directory\0');
    const entries = await readdir(targetPath, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      hash.update(entry.name);
      hash.update('\0');
      await digestPath(path.join(targetPath, entry.name), hash);
    }
    return;
  }

  hash.update('file\0');
  hash.update(await readFile(targetPath));
}

export async function digestTarget(targetPath) {
  const hash = crypto.createHash('sha256');
  await digestPath(targetPath, hash);
  return `sha256:${hash.digest('hex')}`;
}

export async function archiveConflictTarget({ homeDir, targetPath, now, source }) {
  return {
    backupPath: path.join(backupArchiveRoot(homeDir), now(), source, encodeTargetPath(targetPath)),
    digest: await digestTarget(targetPath)
  };
}

export function defaultBackupIndex() {
  return { schemaVersion: BACKUP_INDEX_SCHEMA_VERSION, entries: [] };
}

function normalizeBackupIndex(index) {
  if (!index || typeof index !== 'object' || Array.isArray(index)) {
    return defaultBackupIndex();
  }

  return {
    schemaVersion: BACKUP_INDEX_SCHEMA_VERSION,
    entries: Array.isArray(index.entries) ? index.entries : []
  };
}

export async function readBackupIndex(homeDir = os.homedir()) {
  try {
    return normalizeBackupIndex(JSON.parse(await readFile(backupIndexPath(homeDir), 'utf8')));
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return defaultBackupIndex();
    }
    throw error;
  }
}

export async function writeBackupIndex(homeDir, index) {
  const filePath = backupIndexPath(homeDir);
  const directoryPath = path.dirname(filePath);
  const tempPath = path.join(
    directoryPath,
    `${path.basename(filePath)}.${process.pid}.${Date.now()}.${crypto.randomUUID()}.tmp`
  );
  await mkdir(directoryPath, { recursive: true });
  await writeFile(tempPath, `${JSON.stringify(normalizeBackupIndex(index), null, 2)}\n`);
  await rename(tempPath, filePath);
}

export async function recordBackupIndexEntry(homeDir, entry) {
  const index = await readBackupIndex(homeDir);
  const entries = index.entries.filter(
    (current) =>
      !(
        current.originalPath === entry.originalPath &&
        current.digest === entry.digest &&
        current.reason === entry.reason
      )
  );
  entries.push(entry);
  await writeBackupIndex(homeDir, { schemaVersion: BACKUP_INDEX_SCHEMA_VERSION, entries });
}

function defaultArchiveTimestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function createBackupArchiveService({
  homeDir = os.homedir(),
  now = defaultArchiveTimestamp,
  source = 'harness',
  reason = DEFAULT_REASON
} = {}) {
  return {
    async backupHandler({ targetPath }) {
      const archivedAt = new Date().toISOString();
      const { backupPath, digest } = await archiveConflictTarget({ homeDir, targetPath, now, source });
      await mkdir(path.dirname(backupPath), { recursive: true });
      await rename(targetPath, backupPath);
      await recordBackupIndexEntry(homeDir, {
        originalPath: targetPath,
        archivedAt,
        digest,
        archivePath: backupPath,
        reason
      });
      return { backupPath, digest };
    }
  };
}

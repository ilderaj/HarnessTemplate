#!/usr/bin/env node

import { pathToFileURL } from 'node:url';
import {
  buildSourceHeadsRecord,
  probeUpstreamHeads,
  writeSourceHeadsRecord
} from './lib/upstream-heads.mjs';
import {
  captureChangedFiles,
  createAllowlistViolationError,
  createFailureRefreshResult,
  createRefreshResult,
  filterEligibleChanges,
  runRefreshCommandChain,
  UpstreamRefreshBlockedError,
  writeRefreshResult
} from './lib/upstream-refresh.mjs';

export async function runUpstreamRefresh({
  cwd = process.cwd(),
  now = () => new Date(),
  probeHeads = probeUpstreamHeads,
  runRefresh = runRefreshCommandChain,
  captureChanges = captureChangedFiles,
  filterChanges = filterEligibleChanges,
  writeSourceHeads = writeSourceHeadsRecord,
  writeResult = writeRefreshResult
} = {}) {
  let probeResult = { sourceHeads: {} };
  let eligibleFiles = [];
  let shouldCaptureFailureChanges = false;
  let changedFilesCaptured = false;

  try {
    probeResult = await probeHeads({ cwd });

    if (probeResult.status === 'no_changes') {
      const result = createRefreshResult({
        status: 'no_changes',
        sourceHeads: probeResult.sourceHeads,
        eligibleFiles: []
      });
      await writeResult(result, { cwd });
      return result;
    }

    shouldCaptureFailureChanges = true;
    await runRefresh({ cwd });

    const timestamp = now().toISOString();
    await writeSourceHeads(buildSourceHeadsRecord({
      sources: probeResult.sources,
      observedHeads: probeResult.sourceHeads,
      timestamp
    }), { cwd });

    const changedFiles = await captureChanges({ cwd });
    changedFilesCaptured = true;
    const filteredChanges = filterChanges(changedFiles);
    eligibleFiles = filteredChanges.eligibleFiles;

    if ((filteredChanges.excludedFiles ?? []).length > 0) {
      throw createAllowlistViolationError(filteredChanges.excludedFiles);
    }

    const result = createRefreshResult({
      status: 'success',
      sourceHeads: probeResult.sourceHeads,
      eligibleFiles
    });
    await writeResult(result, { cwd });
    return result;
  } catch (error) {
    let resultError = error;

    if (shouldCaptureFailureChanges && !changedFilesCaptured) {
      try {
        const changedFiles = await captureChanges({ cwd });
        const filteredChanges = filterChanges(changedFiles);
        eligibleFiles = filteredChanges.eligibleFiles;

        if ((filteredChanges.excludedFiles ?? []).length > 0) {
          resultError = new Error(`${error instanceof Error ? error.message : String(error)}\n\n${createAllowlistViolationError(filteredChanges.excludedFiles).message}`, {
            cause: error
          });
        }
      } catch (captureError) {
        resultError = new Error(`${error instanceof Error ? error.message : String(error)}\n\nUnable to capture changed files after failure: ${captureError instanceof Error ? captureError.message : String(captureError)}`, {
          cause: error
        });
      }
    }

    const result = createFailureRefreshResult({
      error: resultError,
      sourceHeads: probeResult.sourceHeads,
      eligibleFiles
    });
    await writeResult(result, { cwd });
    throw new UpstreamRefreshBlockedError(result, { cause: error });
  }
}

async function main() {
  try {
    await runUpstreamRefresh();
  } catch (error) {
    if (!(error instanceof UpstreamRefreshBlockedError)) {
      throw error;
    }

    console.error(error.message);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
import { test } from 'node:test';
import assert from 'node:assert/strict';

const upstreamSources = [
  {
    name: 'superpowers',
    url: 'https://github.com/obra/superpowers'
  },
  {
    name: 'planning-with-files',
    url: 'https://github.com/OthmanAdi/planning-with-files'
  }
];

async function loadUpstreamHeadsModule() {
  return import('../../scripts/ci/lib/upstream-heads.mjs');
}

test('probeUpstreamHeads probes each provided upstream source URL', async () => {
  const { probeUpstreamHeads } = await loadUpstreamHeadsModule();
  const probedUrls = [];

  await probeUpstreamHeads({
    sources: upstreamSources,
    recordedHeads: {},
    lsRemoteHead: async (url) => {
      probedUrls.push(url);
      return `head-for-${url}`;
    }
  });

  assert.deepEqual(probedUrls, [
    'https://github.com/obra/superpowers',
    'https://github.com/OthmanAdi/planning-with-files'
  ]);
});

test('probeUpstreamHeads returns no_changes and skips branch and PR work when heads match', async () => {
  const { probeUpstreamHeads } = await loadUpstreamHeadsModule();
  const currentHeads = {
    superpowers: '1111111111111111111111111111111111111111',
    'planning-with-files': '2222222222222222222222222222222222222222'
  };

  const result = await probeUpstreamHeads({
    sources: upstreamSources,
    recordedHeads: currentHeads,
    lsRemoteHead: async (url) => {
      if (url === 'https://github.com/obra/superpowers') return currentHeads.superpowers;
      if (url === 'https://github.com/OthmanAdi/planning-with-files') return currentHeads['planning-with-files'];
      throw new Error(`Unexpected upstream URL: ${url}`);
    }
  });

  assert.equal(result.status, 'no_changes');
  assert.equal(result.shouldCreateBranch, false);
  assert.equal(result.shouldOpenPullRequest, false);
});

test('probeUpstreamHeads marks changes_detected and continues the refresh chain when any head changes', async () => {
  const { probeUpstreamHeads } = await loadUpstreamHeadsModule();

  const result = await probeUpstreamHeads({
    sources: upstreamSources,
    recordedHeads: {
      superpowers: '1111111111111111111111111111111111111111',
      'planning-with-files': '2222222222222222222222222222222222222222'
    },
    lsRemoteHead: async (url) => {
      if (url === 'https://github.com/obra/superpowers') return '1111111111111111111111111111111111111111';
      if (url === 'https://github.com/OthmanAdi/planning-with-files') return '3333333333333333333333333333333333333333';
      throw new Error(`Unexpected upstream URL: ${url}`);
    }
  });

  assert.equal(result.status, 'changes_detected');
  assert.equal(result.shouldRunRefreshChain, true);
  assert.deepEqual(result.changedSources, ['planning-with-files']);
});
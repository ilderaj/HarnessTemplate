import { readState } from '../lib/state.mjs';

export async function sync() {
  const state = await readState(process.cwd());
  const targets = Object.keys(state.targets);
  console.log(`Sync contract ready for ${targets.length} target(s): ${targets.join(', ')}`);
}

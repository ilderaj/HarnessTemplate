import { access, readFile } from 'node:fs/promises';
import { readState } from '../lib/state.mjs';

export async function doctor(args = []) {
  const checkOnly = args.includes('--check-only');
  const state = await readState(process.cwd());
  const problems = [];

  for (const [target, config] of Object.entries(state.targets)) {
    for (const filePath of config.paths) {
      try {
        await access(filePath);
        const text = await readFile(filePath, 'utf8').catch(() => '');
        const authorPath = `/Users/${'jared'}/`;
        if (text.includes(authorPath)) {
          problems.push(`${target}: personal path found in ${filePath}`);
        }
      } catch {
        problems.push(`${target}: missing ${filePath}`);
      }
    }
  }

  if (problems.length) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
    return;
  }

  console.log(checkOnly ? 'Harness check passed.' : 'Harness installation is healthy.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await doctor(process.argv.slice(2));
}

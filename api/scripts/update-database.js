#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const args = new Set(process.argv.slice(2));
const isHelp = args.has('--help') || args.has('-h');
const isDevMode = args.has('--dev');

if (isHelp) {
  console.log('Usage: node scripts/update-database.js [--dev]');
  console.log('');
  console.log('  --dev   Run prisma migrate dev then prisma generate');
  console.log('          Default mode runs prisma migrate deploy then generate');
  process.exit(0);
}

const runner = process.execPath;
const wrapperScript = 'scripts/with-database-url.js';

const commands = isDevMode
  ? [
      ['migrate', 'dev'],
      ['generate'],
    ]
  : [
      ['migrate', 'deploy'],
      ['generate'],
    ];

for (const commandArgs of commands) {
  const result = spawnSync(runner, [wrapperScript, ...commandArgs], {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(
  isDevMode
    ? 'Database updated in dev mode (migrate dev + generate).'
    : 'Database updated (migrate deploy + generate).',
);

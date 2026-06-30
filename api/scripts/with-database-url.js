#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { loadEnvFile } = require('node:process');

const prismaArgs = process.argv.slice(2);

if (typeof loadEnvFile === 'function' && existsSync('.env')) {
  try {
    loadEnvFile('.env');
  } catch (error) {
    if (!['ENOENT', 'EACCES', 'EPERM'].includes(error?.code)) {
      throw error;
    }
  }
}

function requireEnvValue(key) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

try {
  process.env.DATABASE_URL = requireEnvValue('DATABASE_URL');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const prismaBinary = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const result = spawnSync(prismaBinary, prismaArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

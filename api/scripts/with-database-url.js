#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { loadEnvFile } = require('node:process');

const DEFAULT_DB_CONNECTION = 'postgresql';
const DEFAULT_DB_PORT = '5432';
const DEFAULT_GENERATE_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/neaklork';
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
    throw new Error(`${key} is required when DATABASE_URL is not set`);
  }

  return value;
}

function normalizeDbConnection(value) {
  const connection = value.trim().toLowerCase();

  if (connection === 'postgres') {
    return 'postgresql';
  }

  if (connection === 'postgresql') {
    return connection;
  }

  throw new Error(`Unsupported DB_CONNECTION: ${value}`);
}

function buildDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    return databaseUrl;
  }

  // `prisma generate` only needs a syntactically valid URL to generate types.
  // Real DB values are still required for migrate and other database commands.
  if (
    prismaArgs[0] === 'generate' &&
    (!process.env.DB_HOST || !process.env.DB_USERNAME || !process.env.DB_DATABASE)
  ) {
    return DEFAULT_GENERATE_DATABASE_URL;
  }

  const connection = normalizeDbConnection(
    process.env.DB_CONNECTION || DEFAULT_DB_CONNECTION,
  );
  const host = requireEnvValue('DB_HOST');
  const port = process.env.DB_PORT?.trim() || DEFAULT_DB_PORT;
  const username = requireEnvValue('DB_USERNAME');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnvValue('DB_DATABASE');

  const url = new URL(`${connection}://${host}`);
  url.port = port;
  url.username = username;
  url.password = password;
  url.pathname = database.startsWith('/') ? database : `/${database}`;

  return url.toString();
}

try {
  process.env.DATABASE_URL = buildDatabaseUrl();
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

# NEAKLORK API

NestJS backend for the NEAKLORK app.

## Setup

```bash
npm install
npm run prisma:generate
npm run start:dev
```

The API listens on `PORT`, defaulting to `3001`.

## Required Environment

Create a local `.env` file from the safe example keys below. Do not commit real
secret values.

```env
DB_CONNECTION=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=neaklork
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
TELEGRAM_BOT_TOKEN=
NUXT_WEB_ORIGIN=http://localhost:3000
PORT=3001
```

`DATABASE_URL` is still supported as an optional fallback. If it is not set, the
API and Prisma scripts build the PostgreSQL URL from the separate `DB_*` keys.
`npm run build` runs `prisma:generate` first so generated Prisma model and enum
types stay in sync before TypeScript compiles.

## Database

Prisma schema and migrations live in `prisma/`.

```bash
npm run prisma:generate
npm run prisma:migrate
```

The first migration is `init_auth` and creates users, social accounts, refresh
tokens, and auth enums.

## Auth Endpoints

All auth responses return a safe user object plus an access token and refresh
token. Sensitive fields such as `passwordHash` and `tokenHash` are never
returned.

```txt
POST /auth/register
POST /auth/signup
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
POST /auth/google
POST /auth/facebook
POST /auth/telegram
```

`POST /auth/signup` is an alias for email/password registration. If the email
already belongs to a social-only user with no password, the API attaches the
password credential to that user instead of creating a duplicate account.

`GET /auth/me` requires an `Authorization: Bearer <accessToken>` header.

`POST /auth/logout` accepts either an access token or a refresh token. When a
refresh token is provided, only that token is revoked. When only an access token
is provided, all active refresh tokens for that user are revoked.

## Validation And CORS

Global validation is enabled with whitelist, unknown-field rejection, and DTO
transformation. CORS allows `NUXT_WEB_ORIGIN`, defaulting to
`http://localhost:3000`.

## Useful Commands

```bash
npm run build
npm run lint
npm run test
```

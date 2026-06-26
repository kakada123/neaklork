# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Deploy To Vercel

This project is initialized for Vercel deployment.

Vercel settings:

- Framework Preset: `Nuxt.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Development Command: `npm run dev`
- Node.js Version: `22.x`

Deploy from the Vercel dashboard by importing this repository, or deploy with the Vercel CLI:

```bash
npm install
npm run build
vercel
```

Do not commit real `.env` files. Add required production variables in the Vercel project settings.

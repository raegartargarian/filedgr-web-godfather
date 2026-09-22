# filedgr-web-godfather

GAMBINO – The Real Godfather: a Filedgr template web app (Vite + React + TypeScript)
that renders a vault's movie content (trailer, stills, documents) and lets
visitors connect via Web3Auth.

The vault it shows is configured in `src/json/ledger.json` (`vault.nftId`,
`vault.ledger`, `vault.streams`, and `env`: `DEVELOPMENT` | `TESTNET` |
`MAINNET`). `env` selects the Filedgr template API, the Web3Auth network/client
ID and the chain.

Shared Filedgr functionality (Web3Auth session lifecycle, API endpoints, zip
extraction, formatting, explorer links) comes from
[`@filedgr/web-core`](https://github.com/Filedgr/filedgr-web-core).

## Setup

Requires Node 20+.

`@filedgr/web-core` is published to **GitHub Packages** (private), so installing
needs a token with `read:packages`, exposed as `NODE_AUTH_TOKEN` (read by
`.npmrc`):

```sh
gh auth refresh -s read:packages
export NODE_AUTH_TOKEN=$(gh auth token)
npm ci --legacy-peer-deps
```

`--legacy-peer-deps` matches CI: `@filedgr/web-core` declares each optional
feature module's dependency as a peer (`pdfjs-dist`, `three`, `xlsx`, ...) and
this app only uses a few subpaths, so those peers are deliberately not installed.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over `src` |
| `npm test` | Unit tests (Vitest) |
| `npm run format` | Prettier over `src` |

## CI and deploy

- `.github/workflows/pr-iso-compliance.yml` runs the unit tests on every pull
  request (`iso-compliance` status check). It needs the `PACKAGES_GHCR_TOKEN`
  secret to install `@filedgr/web-core`.
- Deploys go through **Netlify** (`netlify.toml`: `npm run build`, publish
  `dist`, SPA fallback to `index.html`, `NPM_FLAGS=--legacy-peer-deps`). Set `NODE_AUTH_TOKEN` in the Netlify
  site's environment variables so the install can reach GitHub Packages.

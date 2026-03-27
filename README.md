# FICS Design System Documentation Platform

A Next.js 14 design system documentation platform for the **FICS** multi-library Figma design system — built to feel like Shopify Polaris but powered by your own Figma files.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/fics-design-system)

---

## Features

- **Design Token Browser** — full token viewer with mode tabs (Default/Inverse, Desktop/Tablet/Mobile), colour swatches, visual scale bars, and copy-as-CSS/SCSS/JS
- **Figma Integration** — live component previews, sync from Figma REST API, automatic thumbnail generation
- **Auth with Roles** — viewer/editor access via NextAuth.js, env-based users (no database needed)
- **JSON Uploader** — editors can upload new token files with validation, diff preview, and version history
- **Changelog** — auto-generated changelog on every token publish
- **Dark Mode** — uses FICS Inverse tokens
- **Vercel-ready** — ISR caching, Blob storage, one-command deploy

---

## Quick start

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

The defaults in `.env.local` work out of the box for local development:
- **Viewer** login: `viewer@fics.com` / `viewer123`
- **Editor** login: `editor@fics.com` / `editor123`

### 3. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Figma integration

### Getting your Figma Access Token

1. Go to Figma → Account Settings → Personal Access Tokens
2. Create a token with `File content` read permission
3. Add to `.env.local` as `FIGMA_ACCESS_TOKEN`

### Finding Figma File IDs

From a Figma file URL: `https://www.figma.com/file/`**`XXXXXXXXXXXX`**`/My-File-Name`

The bold part is the file ID. Add the three file IDs to `.env.local`:

```
FIGMA_FOUNDATION_FILE_ID=your_foundation_file_id
FIGMA_COMPONENTS_FILE_ID=your_components_file_id
FIGMA_MODULES_FILE_ID=your_modules_file_id
```

### Running the sync

```bash
pnpm figma-sync
```

This fetches all components, downloads PNG previews (2×), and writes `data/figma-components.json`. It runs automatically before `pnpm build`.

---

## Design tokens

### Token format

The platform accepts JSON following the W3C Design Token Community Group format. See `data/tokens.json` for the full example.

```json
{
  "metadata": { "version": "1.0.0", "lastUpdated": "2025-01-15", "source": "Figma" },
  "collections": [
    {
      "name": "Color",
      "modes": ["Default", "Inverse"],
      "tokens": [
        {
          "name": "fi-action-primary-fill",
          "category": "action",
          "type": "color",
          "values": { "Default": "#f6b540", "Inverse": "#e5a430" },
          "description": "Primary action fill colour"
        }
      ]
    }
  ]
}
```

### Updating tokens (via UI)

1. Sign in as an **editor** (`editor@fics.com`)
2. Go to **Foundation → Design Tokens**
3. Click **Update Tokens**
4. Upload a new JSON file, review the diff, and click **Publish**

### Updating tokens (programmatically)

Replace `data/tokens.json` and redeploy. Or `POST /api/tokens/upload` with an editor session.

---

## Adding/changing users

Edit the `AUTH_USERS` environment variable. It's a JSON array:

```json
[
  { "email": "viewer@company.com", "password": "securepassword", "role": "viewer" },
  { "email": "editor@company.com", "password": "securepassword", "role": "editor" }
]
```

**Note:** Passwords are stored in plain text in env vars (acceptable for v1 internal tools). For production, consider hashing with bcrypt or switching to an OAuth provider.

---

## Deploying to Vercel

### One-click deploy

1. Push this repo to GitHub
2. Click the Deploy button above (or import at [vercel.com/new](https://vercel.com/new))
3. Set the environment variables in the Vercel dashboard

### Environment variables to set in Vercel

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your deployment URL, e.g. `https://fics.vercel.app` |
| `AUTH_USERS` | JSON array of users (see above) |
| `FIGMA_ACCESS_TOKEN` | Figma personal access token |
| `FIGMA_FOUNDATION_FILE_ID` | Figma Foundation file ID |
| `FIGMA_COMPONENTS_FILE_ID` | Figma Components file ID |
| `FIGMA_MODULES_FILE_ID` | Figma Modules file ID |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (optional — for cloud token storage) |

### Build command

The `vercel.json` uses `pnpm run build:next` (skips the Figma sync step). To run sync on Vercel:
- Add `pnpm figma-sync && pnpm run build:next` as the build command, or
- Run sync locally and commit `data/figma-components.json`

---

## Project structure

```
app/
  (auth)/login/          — Login page
  (platform)/            — Main app shell (sidebar + topbar)
    page.tsx             — Dashboard
    foundation/          — Foundation section
      tokens/            — Full token browser
      colour/            — Colour palette
      typography/        — Type scale
      spacing/           — Spacing scale
      border/            — Border & radius
      elevation/         — Box shadows
      icons/             — Icon set
    components/[slug]/   — Component detail pages
    modules/[slug]/      — Module detail pages
    changelog/           — Token changelog
  api/
    auth/                — NextAuth handler
    tokens/              — Token CRUD routes
    figma/               — Figma sync routes

components/
  layout/                — Sidebar, Topbar
  tokens/                — TokenTable, TokenCard, ModesTabs, ColourSwatch
  figma/                 — ComponentPreview, ComponentMeta
  editor/                — JsonUploader
  ui/                    — StatusBadge, etc.

lib/
  auth.ts               — NextAuth config
  figma.ts              — Figma API helpers
  tokens.ts             — Client-safe token utilities
  tokens.server.ts      — Server-only token I/O (uses fs)
  utils.ts              — Shared utilities

data/
  tokens.json           — Active token file (committed)
  figma-components.json — Figma component metadata (committed, updated by sync)

scripts/
  figma-sync.ts         — Figma sync script (runs at build time)
```

---

## Component status convention

In Figma, add `[status: beta]` at the end of a component description to set its badge:

- `[status: stable]` — green badge
- `[status: beta]` — blue badge
- `[status: new]` — amber badge
- `[status: deprecated]` — grey badge with strikethrough

---

## Tech stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **NextAuth.js** (credentials provider)
- **Vercel Blob** (token file storage)
- **Figma REST API** (component sync)
- **pnpm** (package manager)

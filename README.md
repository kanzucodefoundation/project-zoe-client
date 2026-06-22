# Project Zoe — Client

Project Zoe is a church relationship management system (RMS) centred on people. The platform simplifies managing people and their relationships within a church, tracking data across the organisation, and provides a foundation for church-specific features.

This repo holds the React client, built with Vite and Material UI.

## Tech stack

- **Framework:** React 19, TypeScript
- **Build tool:** Vite
- **UI:** Material UI (MUI v7)
- **State:** Redux Toolkit, TanStack Query
- **Routing:** React Router v6

## Getting started

### Prerequisites

- Node.js 20+ — [nodejs.org](https://nodejs.org/en/)
- The Project Zoe server running locally — [project-zoe-server](https://github.com/kanzucodefoundation/project-zoe-server)

### Setup

1. Clone the repository and check out `develop`:

   ```bash
   git clone https://github.com/kanzucodefoundation/project-zoe-client.git
   cd project-zoe-client
   git checkout develop
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file from the sample:

   ```bash
   cp .env.sample .env
   ```

   Set `VITE_API_URL` to point at your local server (default: `http://localhost:4002`).

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app runs on `http://localhost:5173` by default.

## Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server with hot-reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the codebase |

## Deployment

| Branch | Environment |
|--------|-------------|
| `master` | Production — auto-deploys on push |
| `develop` | Staging — auto-deploys on push |

The CI pipeline sets `VITE_API_URL` via an environment variable at build time. To encode a local `.env` for CI use:

```bash
openssl base64 -A -in .env -out .env.encrypted
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Commitizen friendly

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![Build & Deploy workflow](https://github.com/kanzucodefoundation/project-zoe-client/actions/workflows/main.yml/badge.svg)

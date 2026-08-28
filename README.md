# Micro SaaS

AI-powered multi-tenant dashboards and workflow automation platform.

## Stack

- React, Vite, TypeScript, Mantine, and TanStack Query
- NestJS, Better Auth, and OpenAI tools
- PostgreSQL and Prisma
- pnpm workspaces and Turborepo

## Development

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
docker compose up -d postgres
pnpm db:generate
pnpm dev
```

The web app runs on `http://localhost:5173` and the API on `http://localhost:3000`.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See [`docs/architecture.md`](docs/architecture.md) for system boundaries and planned modules.

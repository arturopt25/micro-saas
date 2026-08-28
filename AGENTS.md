# Repository Instructions

## Language

- Write source code, commit messages, and technical documentation in English.
- Keep comments minimal and explain only non-obvious decisions.
- Use ASCII unless a user-facing requirement needs another character set.

## Workspace

- This repository root is `/home/arturopt25/repos/micro-saas`.
- Use pnpm for dependency management and scripts.
- Use Turbo for cross-workspace tasks.
- Keep each application and package independently buildable.
- Prefer workspace dependencies for internal packages.

## TypeScript

- Strict mode is mandatory across the repository.
- Do not use `any`; use `unknown` and narrow it when needed.
- Prefer explicit types for exported APIs and public contracts.
- Keep shared API contracts in `packages/shared-types`.

## Architecture

- Keep feature boundaries in `apps/api/src` modules and `apps/web/src/features`.
- Access PostgreSQL through `packages/db`; do not instantiate Prisma clients in feature modules.
- Enforce tenant scope at service and data-access boundaries.
- Validate external input with DTOs or Zod schemas.
- Agent tools must be explicit, validated, auditable, and tenant-scoped.
- Never expose secrets, tokens, or personal data in logs.

## UI

- Reuse primitives from `packages/ui` before creating local equivalents.
- Keep Mantine theme and shared visual tokens centralized.
- Ensure interactive UI works on desktop and mobile.
- Use accessible labels and keyboard-accessible controls.

## Quality

Run these checks before submitting changes:

```bash
pnpm exec turbo run lint
pnpm typecheck
pnpm test
pnpm build
```

- Add tests for critical behavior and regressions.
- Keep environment variables documented in the relevant `.env.example`.
- Use Prisma migrations for database schema changes.
- Do not commit `.env` files, credentials, generated secrets, or build output.

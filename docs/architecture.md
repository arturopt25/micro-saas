# Architecture

The repository is a pnpm workspace orchestrated by Turborepo. Runtime applications live under `apps/`; reusable contracts, UI primitives, configuration, and database access live under `packages/`.

The API is organized by bounded feature modules. Tenant context is resolved at the request boundary and passed into services so every query and agent tool can enforce tenant isolation. The agent runner validates tool inputs, records each run and event, and emits progress over Server-Sent Events.

The initial implementation deliberately keeps the database schema minimal. Auth, tenant membership, dashboard entities, notifications, reports, and agent runs will be added through reviewed Prisma migrations.

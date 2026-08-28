FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile
COPY apps/api apps/api
RUN pnpm --filter api build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/api/dist apps/api/dist
CMD ["node", "apps/api/dist/main.js"]

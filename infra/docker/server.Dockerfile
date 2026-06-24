# syntax=docker/dockerfile:1.7
# Build context must be the repository root:
#   docker build -f infra/docker/server.Dockerfile -t mico-server .
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# --- install + build the workspace (only what the server needs) ---
FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY packages/net/package.json packages/net/
COPY services/server/package.json services/server/
RUN pnpm install --frozen-lockfile

COPY packages ./packages
COPY services ./services
RUN pnpm --filter @mico/core build \
 && pnpm --filter @mico/net build \
 && pnpm --filter @mico/server build

# Produce a self-contained deployment of just the server + its prod deps.
RUN pnpm --filter @mico/server deploy --prod --legacy /app/out

# --- minimal runtime image ---
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=8787
WORKDIR /app
COPY --from=build /app/out ./
EXPOSE 8787
USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]

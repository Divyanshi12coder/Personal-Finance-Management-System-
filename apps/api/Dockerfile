# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/package.json
RUN npm install --workspace=apps/api --include-workspace-root

COPY apps/api ./apps/api
RUN npm run prisma:generate --workspace=apps/api
RUN npm run build --workspace=apps/api

# ── Production stage ─────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/package.json
RUN npm install --workspace=apps/api --include-workspace-root --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]

# Frontend Dockerfile - Production Mode
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@latest

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY apps/frontend/package.json ./
RUN npm install --legacy-peer-deps --production=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage first
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (excluding node_modules via .dockerignore)
COPY apps/frontend/package.json apps/frontend/package-lock.json* ./
COPY apps/frontend/next.config.js ./
COPY apps/frontend/tsconfig.json ./
COPY apps/frontend/tailwind.config.js ./
COPY apps/frontend/postcss.config.mjs ./
COPY apps/frontend/src ./src
COPY apps/frontend/public ./public
COPY apps/frontend/scripts ./scripts

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV ENABLE_STANDALONE true
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

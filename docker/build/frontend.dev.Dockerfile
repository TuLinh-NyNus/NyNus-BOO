# syntax=docker/dockerfile:1.4
# Frontend Dockerfile - Development Mode with Hot-Reload Support
# Build context: workspace root (.)
# Package Manager: pnpm (consistent with monorepo)

FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm@latest

# Set working directory
WORKDIR /app

# Set NODE_ENV to development
ENV NODE_ENV=development

# Disable Next.js telemetry to reduce unnecessary network calls
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files first for better layer caching
# Include .pnpmrc for pnpm configuration (shamefully-hoist, node-linker)
COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml* apps/frontend/.pnpmrc* ./

# Install dependencies with BuildKit cache mount for pnpm store
# This significantly speeds up rebuilds by caching pnpm packages
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code (excluding files in .dockerignore)
# Note: In development with volume mount, this will be overridden
COPY apps/frontend .

# Expose port
EXPOSE 3000

# Start the application in development mode with Turbopack
# Turbopack provides 10x faster HMR and 5x faster initial compile
CMD ["pnpm", "run", "dev:fast"]

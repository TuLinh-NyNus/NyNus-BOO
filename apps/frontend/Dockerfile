# Frontend Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/frontend .

# Build the application
RUN pnpm build

# Production image
FROM node:18-alpine AS runner

RUN npm install -g pnpm
WORKDIR /app

# Copy built application
COPY --from=base /app/next.config.js ./
COPY --from=base /app/package.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]

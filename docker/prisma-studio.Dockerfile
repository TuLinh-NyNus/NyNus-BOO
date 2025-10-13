# Dockerfile for running Prisma Studio in Docker
# =================================================
# ⚠️ DEPRECATION WARNING: Prisma Studio is being phased out
# Please migrate to pgAdmin 4 for database management
#
# Why deprecated:
#   - Creates dual database access anti-pattern
#   - Direct database access bypasses backend security layers
#   - Limited features compared to pgAdmin 4
#   - Increases frontend bundle size
#
# Migration Guide: docs/database/PGADMIN_SETUP.md
# Use pgAdmin 4 instead: .\scripts\pgadmin.ps1 start
#
# This file is kept for backward compatibility only
# This allows Prisma Studio to run inside Docker network and connect to PostgreSQL container

FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy Prisma schema
COPY apps/frontend/prisma ./prisma

# Generate Prisma Client
RUN pnpm prisma generate

# Expose Prisma Studio port
EXPOSE 5555

# Set environment variable for database connection
# This will be overridden by docker-compose
ENV DATABASE_URL="postgresql://exam_bank_user:exam_bank_password@postgres:5432/exam_bank_db?schema=public&sslmode=disable"

# Start Prisma Studio
CMD ["pnpm", "prisma", "studio", "--port", "5555", "--browser", "none"]


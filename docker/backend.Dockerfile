# Backend Dockerfile - Development Mode
# Build context: workspace root (.)
# This file is centralized in docker/ directory for better organization

FROM golang:1.23.0-alpine AS builder

WORKDIR /app
COPY apps/backend .
COPY packages/database ./packages/database

# Install dependencies (no need for go mod tidy - go.mod is already correct)
RUN go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/main.go

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user for security
# Using UID/GID 1001 to avoid conflicts with system users
RUN addgroup -g 1001 -S nynus && \
    adduser -u 1001 -S nynus -G nynus

# Set working directory
WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy migration files
COPY --from=builder /app/internal/database/migrations ./internal/database/migrations

# Set ownership to non-root user
RUN chown -R nynus:nynus /app

# Switch to non-root user
USER nynus:nynus

# Expose ports
EXPOSE 50051 8080

# Run the binary
CMD ["./main"]


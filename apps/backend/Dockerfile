# Backend Dockerfile
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

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy migration files
COPY --from=builder /app/internal/database/migrations ./internal/database/migrations

# Expose ports
EXPOSE 50051 8080

# Run the binary
CMD ["./main"]

# Backend Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY apps/backend .

# Install dependencies
RUN go mod download
RUN go mod tidy

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main cmd/main.go

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Expose ports
EXPOSE 50051 8080

# Run the binary
CMD ["./main"]

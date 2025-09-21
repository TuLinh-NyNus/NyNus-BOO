# gRPC-Only Policy for Production Environment

## Overview

The Exam Bank System follows a **gRPC-first architecture** with the following deployment guidelines:

## Development Environment

### ✅ Development Setup (Current)
- **gRPC Services**: Primary interface running on port 8080
- **gRPC-Gateway**: HTTP/REST wrapper for convenience (port 8081)
- **Use Case**: Frontend development, API testing, debugging

### ⚙️ Configuration
```yaml
# Development
grpc:
  port: 8080
  
http:
  port: 8081
  gateway_enabled: true  # Enable for development
```

## Production Environment

### 🚀 Production Setup (Recommended)
- **gRPC Services**: Primary and ONLY interface
- **gRPC-Gateway**: **DISABLED** for security and performance
- **Communication**: Pure gRPC with gRPC-Web for browsers

### ⚙️ Production Configuration
```yaml
# Production
grpc:
  port: 8080
  
http:
  gateway_enabled: false  # Disable HTTP gateway
  port: 8081              # Not used when gateway disabled
```

### 🔒 Benefits of gRPC-Only in Production

1. **Security**: 
   - No HTTP/REST surface area for attacks
   - Binary protocol reduces attack vectors
   - Built-in TLS support

2. **Performance**:
   - HTTP/2 multiplexing
   - Binary serialization (protobuf)
   - Streaming support
   - Lower latency and bandwidth

3. **Reliability**:
   - Strong typing
   - Built-in error handling
   - Connection management
   - Automatic retries

## Client Integration

### 🌐 Frontend (gRPC-Web)
```typescript
// Use gRPC-Web client directly
import { UserServiceClient } from './generated/v1/user_grpc_web_pb';

const client = new UserServiceClient('https://api.example.com:8080');
```

### 🔧 Backend Services (gRPC)
```go
// Use native gRPC client
conn, err := grpc.Dial("api.example.com:8080", grpc.WithTransportCredentials(credentials.NewTLS(&tls.Config{})))
client := v1.NewUserServiceClient(conn)
```

### 📱 Mobile Apps (gRPC)
- iOS: Use Swift gRPC
- Android: Use gRPC-Java
- React Native: Use gRPC-Web or native bridges

## Environment Variables

### Development
```bash
# Enable gateway for development
HTTP_GATEWAY_ENABLED=true
HTTP_PORT=8081

# gRPC server
GRPC_PORT=8080
```

### Production
```bash
# Disable gateway in production
HTTP_GATEWAY_ENABLED=false

# gRPC server only
GRPC_PORT=8080
```

## Migration Path

### Phase 1: Development (Current)
- ✅ Both gRPC and HTTP/REST available
- ✅ Frontend uses gRPC-Web
- ✅ Gateway available for debugging

### Phase 2: Staging
- 🟡 Gateway disabled by default
- 🟡 Can be enabled for testing if needed
- 🟡 Full gRPC integration testing

### Phase 3: Production
- 🔴 Gateway completely disabled
- 🔴 Pure gRPC communication only
- 🔴 Monitor performance and reliability

## Implementation Details

### Server Configuration

```go
// app.go
func (a *App) Run() error {
    // Always start gRPC server
    if err := a.startGRPCServer(); err != nil {
        return err
    }
    
    // Conditionally start HTTP gateway
    if a.config.HTTP.GatewayEnabled {
        go func() {
            if err := a.startHTTPGateway(); err != nil {
                log.Printf("HTTP gateway error: %v", err)
            }
        }()
    }
    
    return nil
}
```

### Dockerfile for Production

```dockerfile
# Production Dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .

# Only expose gRPC port in production
EXPOSE 8080

# Set production environment
ENV HTTP_GATEWAY_ENABLED=false
ENV GRPC_PORT=8080

CMD ["./main"]
```

### Kubernetes Deployment

```yaml
# production-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: exam-bank-api
spec:
  template:
    spec:
      containers:
      - name: api
        image: exam-bank-api:latest
        env:
        - name: HTTP_GATEWAY_ENABLED
          value: "false"  # Disable gateway
        - name: GRPC_PORT
          value: "8080"
        ports:
        - containerPort: 8080  # Only gRPC port
          name: grpc
---
apiVersion: v1
kind: Service
metadata:
  name: exam-bank-api-service
spec:
  ports:
  - port: 8080
    targetPort: 8080
    name: grpc  # Only gRPC service
  selector:
    app: exam-bank-api
```

## Monitoring & Observability

### Metrics
- gRPC request/response metrics
- Connection pool statistics
- Stream lifecycle metrics
- Error rate monitoring

### Logging
- Structured logging for gRPC calls
- Request/response tracing
- Security event logging
- Performance metrics

### Health Checks
```go
// gRPC health check
rpc HealthCheck(HealthCheckRequest) returns (HealthCheckResponse);
```

## Security Considerations

### Authentication
- JWT tokens in gRPC metadata
- mTLS for service-to-service communication
- Rate limiting per service method

### Authorization
- Role-based access control (RBAC)
- Method-level permissions
- Context-aware authorization

### Data Protection
- TLS encryption in transit
- Data validation with protobuf schemas
- Input sanitization

## Testing Strategy

### Development Testing
- gRPC unit tests
- Integration tests with gRPC client
- HTTP gateway tests (optional)

### Production Testing
- Pure gRPC integration tests
- Load testing with gRPC
- Security testing (no HTTP surface)

## Troubleshooting

### Common Issues
1. **Client Connection Errors**: Check TLS certificates and port configuration
2. **Authentication Failures**: Verify JWT token in gRPC metadata
3. **Performance Issues**: Enable gRPC compression and connection pooling

### Debug Commands
```bash
# Test gRPC connectivity
grpcurl -plaintext localhost:8080 list

# Call specific method
grpcurl -plaintext -d '{"email":"test@example.com"}' \
  localhost:8080 v1.UserService/GetUser
```

---

**Last Updated**: 2025-01-07
**Policy Version**: 1.0
**Environment**: Production Ready
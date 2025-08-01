# 🚀 Complete System Deployment Guide

## Full Monorepo Structure for Deployment

```
exam-bank-system/
├── apps/
│   ├── backend/              # Go gRPC API server
│   └── frontend/             # React web application
├── packages/
│   ├── proto/               # Shared API definitions
│   └── database/            # Database schemas & migrations
├── tools/
│   ├── scripts/             # Build and deployment scripts
│   └── docker/              # Docker configurations
├── Makefile                 # Build commands
├── docker-compose.yml       # Full system orchestration
├── .env.example             # Environment template
└── README.md                # Setup instructions
```

## Docker Compose for Complete System

```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: exam_bank_db
      POSTGRES_USER: exam_bank_user
      POSTGRES_PASSWORD: exam_bank_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./packages/database/migrations:/docker-entrypoint-initdb.d

  # Backend gRPC Server
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "50051:50051"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: exam_bank_user
      DB_PASSWORD: exam_bank_password
      DB_NAME: exam_bank_db
      JWT_SECRET: your-super-secret-jwt-key
    depends_on:
      - postgres

  # gRPC-Web Proxy
  envoy:
    image: envoyproxy/envoy:v1.28-latest
    ports:
      - "8080:8080"
    volumes:
      - ./apps/frontend/envoy.yaml:/etc/envoy/envoy.yaml
    depends_on:
      - backend

  # Frontend Web App
  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    ports:
      - "3000:80"
    environment:
      VITE_GRPC_WEB_URL: http://localhost:8080
    depends_on:
      - envoy

volumes:
  postgres_data:
```

## Environment Variables

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=exam_bank_user
DB_PASSWORD=exam_bank_password
DB_NAME=exam_bank_db

# Backend
GRPC_PORT=50051
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend
VITE_GRPC_WEB_URL=http://localhost:8080
```

## Deployment Commands

```bash
# 1. Clone repository
git clone <your-repo-url>
cd exam-bank-system

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Generate proto files
make proto

# 4. Start complete system
docker-compose up -d

# 5. Check services
docker-compose ps
```

## Service URLs

- **Frontend**: http://localhost:3000
- **gRPC-Web Proxy**: http://localhost:8080
- **Backend gRPC**: localhost:50051
- **Database**: localhost:5432

## Health Checks

```bash
# Check backend health
grpcurl -plaintext localhost:50051 list

# Check frontend
curl http://localhost:3000

# Check proxy
curl http://localhost:8080

# Check database
docker exec -it postgres psql -U exam_bank_user -d exam_bank_db -c "\dt"
```

## Production Considerations

1. **Security**:
   - Change default passwords
   - Use proper JWT secrets
   - Enable HTTPS/TLS
   - Configure firewall rules

2. **Scaling**:
   - Use load balancers
   - Scale backend horizontally
   - Use CDN for frontend
   - Database read replicas

3. **Monitoring**:
   - Add health check endpoints
   - Configure logging
   - Set up metrics collection
   - Error tracking

4. **Backup**:
   - Database backups
   - Configuration backups
   - Disaster recovery plan

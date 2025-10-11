# Docker Compose Configuration

## 📋 Overview

This directory contains Docker Compose configurations for the NyNus Exam Bank System using the **Docker Compose override pattern** for environment-specific configurations.

## 🏗️ File Structure

```
docker/compose/
├── docker-compose.yml           # Base configuration (common services)
├── docker-compose.override.yml  # Development overrides (auto-loaded)
├── docker-compose.prod.yml      # Production overrides (explicit)
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🎯 Configuration Pattern

### **Base Configuration** (`docker-compose.yml`)
Contains common service definitions:
- **postgres**: PostgreSQL database
- **backend**: Go gRPC backend service
- **frontend**: Next.js frontend application

All services use environment variables for flexibility.

### **Development Overrides** (`docker-compose.override.yml`)
Automatically loaded in development, adds:
- **redis**: Redis cache service
- **opensearch**: OpenSearch search engine
- **opensearch-dashboards**: OpenSearch UI

### **Production Overrides** (`docker-compose.prod.yml`)
Production-specific configurations:
- Production Dockerfiles
- Production environment variables
- Secure defaults
- No development tools

## 🚀 Usage

### **Development Environment**

```bash
# Start all services (base + override automatically)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

**Services available in development:**
- Frontend: http://localhost:3000
- Backend HTTP: http://localhost:8080
- Backend gRPC: http://localhost:50051
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- OpenSearch: http://localhost:9200
- OpenSearch Dashboards: http://localhost:5601
- Prisma Studio: http://localhost:5555 (run `pnpm prisma:studio` in apps/frontend)

### **Production Environment**

```bash
# Start with production overrides
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Rebuild and start
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

**Services available in production:**
- Frontend: http://localhost:3000
- Backend HTTP: http://localhost:8080
- Backend gRPC: http://localhost:50051
- PostgreSQL: localhost:5432

## ⚙️ Environment Variables

### **Setup**

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update values in `.env` for your environment

### **Key Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Environment (development/production) | `development` |
| `POSTGRES_PASSWORD` | Database password | `exam_bank_password` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-here` |
| `NEXTAUTH_SECRET` | NextAuth secret | `your-nextauth-secret-here` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `BACKEND_GRPC_PORT` | Backend gRPC port | `50051` |
| `BACKEND_HTTP_PORT` | Backend HTTP port | `8080` |
| `FRONTEND_PORT` | Frontend port | `3000` |

See `.env.example` for complete list.

## 🔧 Customization

### **Override Development Services**

Create `docker-compose.override.local.yml` for local customizations:

```yaml
services:
  backend:
    environment:
      - DEBUG=true
```

Then use:
```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose.override.local.yml up
```

### **Custom Production Configuration**

Modify `docker-compose.prod.yml` or create additional override files.

## 📊 Service Dependencies

```
frontend → backend → postgres
                  ↓
            redis (dev only)
                  ↓
          opensearch (dev only)
                  ↓
    opensearch-dashboards (dev only)
```

## 🛠️ Troubleshooting

### **Services not starting**

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]
```

### **Port conflicts**

Update ports in `.env`:
```bash
DB_PORT=5433
BACKEND_HTTP_PORT=8081
FRONTEND_PORT=3001
```

### **Clean restart**

```bash
# Stop and remove all containers, networks, volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## 📝 Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong secrets in production** - Update `JWT_SECRET`, `NEXTAUTH_SECRET`, `DB_PASSWORD`
3. **Review logs regularly** - `docker-compose logs -f`
4. **Backup volumes** - Especially `postgres_data` in production
5. **Use specific image tags** - Avoid `latest` in production

## 🔒 Security Notes

- Change all default passwords before production deployment
- Use environment-specific secrets
- Enable TLS/SSL in production
- Restrict network access appropriately
- Regular security updates for base images

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Compose Override Pattern](https://docs.docker.com/compose/extends/)
- [Environment Variables in Compose](https://docs.docker.com/compose/environment-variables/)


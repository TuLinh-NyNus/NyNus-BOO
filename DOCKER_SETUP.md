# 🐳 Docker Setup Guide - Exam Bank System

## 🚀 Quick Start

### 1. Run the Docker setup script:
```powershell
.\setup-docker.ps1
```

This will automatically:
- ✅ Check Docker installation
- ✅ Create all necessary Dockerfile and docker-compose.yml
- ✅ Build Docker images for Backend (Go) and Frontend (Next.js)
- ✅ Start PostgreSQL database
- ✅ Start all services
- ✅ Wait for services to be ready
- ✅ Show service status

### 2. Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **gRPC Server**: http://localhost:50051
- **Database**: localhost:5432

## 📋 Available Commands

```powershell
# Start all services (default)
.\setup-docker.ps1

# Force rebuild all images
.\setup-docker.ps1 -Build

# Show service logs
.\setup-docker.ps1 -Logs

# Show service status
.\setup-docker.ps1 -Status

# Stop all services
.\setup-docker.ps1 -Stop

# Clean up everything (containers, images, volumes)
.\setup-docker.ps1 -Clean

# Show help
.\setup-docker.ps1 -Help
```

## 🏗️ Docker Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend          │    │   Backend           │    │   PostgreSQL        │
│   (Next.js)         │    │   (Go gRPC)         │    │   (Database)         │
│   Port: 3000        │────│   Port: 8080/50051  │────│   Port: 5432         │
│   Container         │    │   Container         │    │   Container          │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
             │                           │                           │
             └───────────────────────────┼───────────────────────────┘
                                        │
                               exam_bank_network
```

## 📦 Generated Files

The script automatically creates:

### 1. **apps/backend/Dockerfile**
- Multi-stage build for Go application
- Uses golang:1.21-alpine for building
- Final image based on alpine:latest
- Exposes ports 50051 (gRPC) and 8080 (HTTP)

### 2. **apps/frontend/Dockerfile**
- Multi-stage build for Next.js application
- Uses node:18-alpine with pnpm
- Production-optimized build
- Exposes port 3000

### 3. **docker-compose.yml**
- Complete orchestration for all services
- Network configuration
- Health checks for all services
- Volume persistence for PostgreSQL

### 4. **.dockerignore files**
- Optimized for both frontend and backend
- Excludes unnecessary files from Docker context

## 🔧 Environment Variables

### Backend Environment:
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=exam_bank_db
DB_USER=exam_bank_user
DB_PASSWORD=exam_bank_password
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
```

### Frontend Environment:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRPC_URL=http://localhost:8080
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

## 🛠️ Troubleshooting

### Docker not running:
```powershell
# Check if Docker Desktop is running
docker info
```

### Services not starting:
```powershell
# Check logs for errors
.\setup-docker.ps1 -Logs

# Rebuild images
.\setup-docker.ps1 -Build
```

### Port conflicts:
```powershell
# Stop all services first
.\setup-docker.ps1 -Stop

# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8080
netstat -ano | findstr :50051
```

### Clean restart:
```powershell
# Complete cleanup and restart
.\setup-docker.ps1 -Clean
.\setup-docker.ps1 -Build
```

## 🔍 Health Checks

The setup includes automatic health checks:

- **PostgreSQL**: `pg_isready` command
- **Backend**: HTTP GET to `/health` endpoint
- **Frontend**: HTTP GET to root `/` endpoint

## 📊 Monitoring

### View real-time logs:
```powershell
.\setup-docker.ps1 -Logs
```

### Check service status:
```powershell
.\setup-docker.ps1 -Status
```

### Manual Docker commands:
```powershell
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec postgres psql -U exam_bank_user -d exam_bank_db
```

## 🎯 Demo Credentials

```
Admin:    admin@exambank.com / password123
Teacher:  teacher@exambank.com / password123  
Student:  student@exambank.com / password123
```

## 💡 Tips

1. **First run**: May take 5-10 minutes to build all images
2. **Development**: Use `.\setup-docker.ps1 -Logs` to monitor all services
3. **Performance**: Docker Desktop should have at least 4GB RAM allocated
4. **Updates**: Run `.\setup-docker.ps1 -Build` after code changes
5. **Storage**: Use `.\setup-docker.ps1 -Clean` to free up space

## 🆘 Support

If you encounter issues:

1. Check Docker Desktop is running
2. Ensure no other services are using ports 3000, 8080, 50051, 5432
3. Check logs with `.\setup-docker.ps1 -Logs`
4. Try clean rebuild with `.\setup-docker.ps1 -Clean` then `.\setup-docker.ps1 -Build`

---

**Happy Dockerizing! 🐳**
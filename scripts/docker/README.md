# NyNus Docker Management Scripts
## Scripts quản lý Docker cho NyNus Exam Bank System

### 📁 Cấu trúc
```
scripts/docker/
├── docker-dev.ps1       # Development Docker environment
├── docker-prod.ps1      # Production Docker environment
├── setup-docker.ps1     # Advanced Docker setup
└── README.md           # File này
```

## 🚀 Scripts chính

### **1. docker-dev.ps1**
**Mục đích**: Quản lý Docker development environment

**Sử dụng**:
```powershell
.\scripts\docker\docker-dev.ps1                  # Start development services
.\scripts\docker\docker-dev.ps1 -Build           # Force rebuild and start
.\scripts\docker\docker-dev.ps1 -Stop            # Stop all services
.\scripts\docker\docker-dev.ps1 -Logs            # Show service logs
.\scripts\docker\docker-dev.ps1 -Status          # Show service status
.\scripts\docker\docker-dev.ps1 -Clean           # Clean up everything
.\scripts\docker\docker-dev.ps1 -Help            # Show help
```

**Services**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- gRPC Server: http://localhost:50051
- Database: localhost:5432

**Docker Compose File**: `docker/compose/docker-compose.yml`

### **2. docker-prod.ps1**
**Mục đích**: Quản lý Docker production environment

**Sử dụng**:
```powershell
.\scripts\docker\docker-prod.ps1                 # Start production services
.\scripts\docker\docker-prod.ps1 -Build          # Force rebuild and start
.\scripts\docker\docker-prod.ps1 -Stop           # Stop all services
.\scripts\docker\docker-prod.ps1 -Logs           # Show service logs
.\scripts\docker\docker-prod.ps1 -Status         # Show service status
.\scripts\docker\docker-prod.ps1 -Clean          # Clean up everything
.\scripts\docker\docker-prod.ps1 -Help           # Show help
```

**Environment Variables Required**:
```powershell
$env:DB_PASSWORD = "your_secure_password"
$env:JWT_SECRET = "your_jwt_secret"
$env:NEXTAUTH_SECRET = "your_nextauth_secret"
$env:NEXT_PUBLIC_API_URL = "your_api_url"
```

**Docker Compose File**: `docker/compose/docker-compose.prod.yml`

### **3. setup-docker.ps1**
**Mục đích**: Advanced Docker setup và configuration

**Sử dụng**:
```powershell
.\scripts\docker\setup-docker.ps1                # Interactive setup
.\scripts\docker\setup-docker.ps1 -Build         # Build and start
.\scripts\docker\setup-docker.ps1 -Stop          # Stop services
.\scripts\docker\setup-docker.ps1 -Clean         # Clean environment
.\scripts\docker\setup-docker.ps1 -Logs          # Show logs
.\scripts\docker\setup-docker.ps1 -Status        # Show status
.\scripts\docker\setup-docker.ps1 -Help          # Show help
```

**Chức năng**:
- Tự động tạo Dockerfiles nếu chưa có
- Cập nhật docker-compose.yml
- Tạo .dockerignore files
- Health checks và validation
- Advanced configuration options

## 🎯 Khi nào sử dụng script nào?

| Tình huống | Script sử dụng | Lý do |
|------------|----------------|-------|
| **Development thông thường** | `docker-dev.ps1` | Quick start development environment |
| **Production deployment** | `docker-prod.ps1` | Production-ready configuration |
| **First time setup** | `setup-docker.ps1` | Tạo Dockerfiles và configuration |
| **Advanced configuration** | `setup-docker.ps1` | Custom setup và troubleshooting |

## 🔧 Yêu cầu hệ thống

### **Dependencies**:
- **Docker Desktop 4.0+**
- **Docker Compose 2.0+**
- **PowerShell 5.1+** hoặc **PowerShell Core 7+**

### **Verification**:
```powershell
# Check Docker
docker --version
docker-compose --version
docker info

# Check if Docker is running
docker ps
```

## 📋 Docker Compose Files

### **Development (docker-compose.yml)**:
- **Database**: PostgreSQL 15 với development settings
- **Backend**: Go application với hot-reload
- **Frontend**: Next.js với development server
- **Networks**: Internal communication
- **Volumes**: Persistent database storage

### **Production (docker-compose.prod.yml)**:
- **Database**: PostgreSQL 15 với production settings
- **Backend**: Optimized Go binary
- **Frontend**: Static build với Nginx
- **Environment**: Production environment variables
- **Security**: Enhanced security settings

## 🔄 Workflow thông thường

### **Development**:
1. **First time setup**:
   ```powershell
   .\scripts\docker\setup-docker.ps1
   ```

2. **Daily development**:
   ```powershell
   .\scripts\docker\docker-dev.ps1
   ```

3. **Check logs**:
   ```powershell
   .\scripts\docker\docker-dev.ps1 -Logs
   ```

4. **Stop when done**:
   ```powershell
   .\scripts\docker\docker-dev.ps1 -Stop
   ```

### **Production**:
1. **Set environment variables**:
   ```powershell
   $env:DB_PASSWORD = "secure_password"
   $env:JWT_SECRET = "jwt_secret_key"
   $env:NEXTAUTH_SECRET = "nextauth_secret"
   $env:NEXT_PUBLIC_API_URL = "https://api.yourdomain.com"
   ```

2. **Deploy**:
   ```powershell
   .\scripts\docker\docker-prod.ps1 -Build
   ```

3. **Monitor**:
   ```powershell
   .\scripts\docker\docker-prod.ps1 -Status
   .\scripts\docker\docker-prod.ps1 -Logs
   ```

## 📝 Troubleshooting

### **Common Issues**:

1. **Port conflicts**:
   ```powershell
   # Check ports
   netstat -ano | findstr :3000
   netstat -ano | findstr :8080
   netstat -ano | findstr :50051
   netstat -ano | findstr :5432
   ```

2. **Docker not running**:
   ```powershell
   # Start Docker Desktop
   # Or restart Docker service
   ```

3. **Build failures**:
   ```powershell
   # Clean rebuild
   .\scripts\docker\docker-dev.ps1 -Clean
   .\scripts\docker\docker-dev.ps1 -Build
   ```

4. **Database connection issues**:
   ```powershell
   # Check database logs
   docker logs exam_bank_postgres
   
   # Reset database
   .\scripts\docker\docker-dev.ps1 -Clean
   ```

## 🔒 Security Notes

### **Development**:
- Default passwords được sử dụng (không secure)
- Debug mode enabled
- Hot-reload và development tools

### **Production**:
- **PHẢI** set environment variables
- Secure passwords và secrets
- Production optimizations
- No debug information exposed

## 📊 Monitoring

### **Health Checks**:
- Database: `pg_isready` command
- Backend: HTTP health endpoint
- Frontend: HTTP response check

### **Logs**:
```powershell
# All services
.\scripts\docker\docker-dev.ps1 -Logs

# Specific service
docker logs exam_bank_backend
docker logs exam_bank_frontend
docker logs exam_bank_postgres
```

### **Status**:
```powershell
# Service status
.\scripts\docker\docker-dev.ps1 -Status

# Resource usage
docker stats
```

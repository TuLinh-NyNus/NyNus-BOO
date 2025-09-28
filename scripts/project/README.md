# NyNus Project Management Scripts
## Scripts quản lý dự án NyNus Exam Bank System

### 📁 Cấu trúc
```
scripts/project/
├── quick-start.ps1      # Hybrid mode: Docker DB + Local apps
├── start-project.ps1    # Local development mode
├── stop-project.ps1     # Stop all services
└── README.md           # File này
```

## 🚀 Scripts chính

### **1. quick-start.ps1**
**Mục đích**: Hybrid development mode - Docker database + Local applications

**Sử dụng**:
```powershell
.\scripts\project\quick-start.ps1                # Start hybrid mode
.\scripts\project\quick-start.ps1 -Stop          # Stop all services
.\scripts\project\quick-start.ps1 -Status        # Show service status
.\scripts\project\quick-start.ps1 -Clean         # Clean database container
.\scripts\project\quick-start.ps1 -Help          # Show help
```

**Chức năng**:
- Start PostgreSQL database trong Docker container
- Start Go backend server locally (gRPC + HTTP Gateway)
- Start Next.js frontend locally
- Tự động check dependencies và ports
- Health checks cho tất cả services

**Ports**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- gRPC Server: http://localhost:50051
- Database: localhost:5432

### **2. start-project.ps1**
**Mục đích**: Full local development mode - tất cả services chạy locally

**Sử dụng**:
```powershell
.\scripts\project\start-project.ps1              # Start all services
.\scripts\project\start-project.ps1 -Backend     # Start only backend
.\scripts\project\start-project.ps1 -Frontend    # Start only frontend
.\scripts\project\start-project.ps1 -Database    # Start only database
.\scripts\project\start-project.ps1 -Help        # Show help
```

**Chức năng**:
- Start PostgreSQL database locally hoặc Docker
- Start Go backend server với auto-reload
- Start Next.js frontend với hot-reload
- Selective service starting
- Dependency management

### **3. stop-project.ps1**
**Mục đích**: Stop tất cả running services

**Sử dụng**:
```powershell
.\scripts\project\stop-project.ps1               # Stop all services
```

**Chức năng**:
- Stop Node.js processes (Frontend)
- Stop Go processes (Backend)
- Kill processes on specific ports (3000, 8080, 50051, 5432)
- Clean shutdown với proper cleanup

## 🎯 Khi nào sử dụng script nào?

| Tình huống | Script sử dụng | Lý do |
|------------|----------------|-------|
| **Development thông thường** | `quick-start.ps1` | Hybrid mode - nhanh và ổn định |
| **Backend development** | `start-project.ps1 -Backend` | Chỉ cần backend service |
| **Frontend development** | `start-project.ps1 -Frontend` | Chỉ cần frontend với hot-reload |
| **Full local development** | `start-project.ps1` | Tất cả services local |
| **Stop tất cả** | `stop-project.ps1` | Clean shutdown |

## 🔧 Yêu cầu hệ thống

### **Dependencies**:
- **PowerShell 5.1+** hoặc **PowerShell Core 7+**
- **Docker Desktop** (cho database container)
- **Go 1.21+** (cho backend)
- **Node.js 18+** và **pnpm** (cho frontend)
- **PostgreSQL 15** (nếu chạy local database)

### **Ports cần thiết**:
- `3000` - Frontend (Next.js)
- `8080` - Backend HTTP Gateway
- `50051` - Backend gRPC Server
- `5432` - PostgreSQL Database

## 📋 Troubleshooting

### **Port conflicts**:
```powershell
# Check port usage
netstat -ano | findstr :3000
netstat -ano | findstr :8080
netstat -ano | findstr :50051
netstat -ano | findstr :5432

# Kill process on port
taskkill /f /pid <PID>
```

### **Docker issues**:
```powershell
# Check Docker status
docker --version
docker info

# Restart Docker Desktop if needed
```

### **Dependencies issues**:
```powershell
# Backend dependencies
cd apps/backend
go mod download
go mod tidy

# Frontend dependencies
cd apps/frontend
pnpm install
```

## 🔄 Workflow thông thường

1. **Start development**:
   ```powershell
   .\scripts\project\quick-start.ps1
   ```

2. **Check status**:
   ```powershell
   .\scripts\project\quick-start.ps1 -Status
   ```

3. **Stop when done**:
   ```powershell
   .\scripts\project\stop-project.ps1
   ```

## 📝 Notes

- Scripts tự động tạo new PowerShell windows cho backend và frontend
- Health checks đảm bảo services start properly
- Auto-install dependencies nếu chưa có
- Support both PowerShell 5.1 và PowerShell Core
- Paths được tính relative từ project root

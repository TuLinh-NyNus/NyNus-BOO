# 🐳 Docker Management Scripts - NyNus Exam Bank System

## 📁 Scripts Directory

All Docker management scripts are centralized in `docker/scripts/` for easy access and maintenance.

## 📋 Available Scripts

### **docker-dev.ps1** - Development Environment
**Purpose:** Quick start and manage development Docker environment

**Usage:**
```powershell
# Start development services (default)
.\docker\scripts\docker-dev.ps1

# Start with rebuild
.\docker\scripts\docker-dev.ps1 -Build

# View logs
.\docker\scripts\docker-dev.ps1 -Logs

# Check status
.\docker\scripts\docker-dev.ps1 -Status

# Stop services
.\docker\scripts\docker-dev.ps1 -Stop

# Clean up everything
.\docker\scripts\docker-dev.ps1 -Clean

# Show help
.\docker\scripts\docker-dev.ps1 -Help
```

**Services Started:**
- Frontend: http://localhost:3000
- Backend HTTP: http://localhost:8080
- Backend gRPC: http://localhost:50051
- PostgreSQL: localhost:5432
- Redis: localhost:6379 (dev only)
- OpenSearch: http://localhost:9200 (dev only)

**Docker Compose File:** `docker/compose/docker-compose.yml`

---

### **docker-prod.ps1** - Production Environment
**Purpose:** Deploy and manage production Docker environment

**Usage:**
```powershell
# Start production services (validates env first)
.\docker\scripts\docker-prod.ps1

# Start with rebuild
.\docker\scripts\docker-prod.ps1 -Build

# View logs
.\docker\scripts\docker-prod.ps1 -Logs

# Check status
.\docker\scripts\docker-prod.ps1 -Status

# Stop services
.\docker\scripts\docker-prod.ps1 -Stop

# Clean up everything
.\docker\scripts\docker-prod.ps1 -Clean

# Show help
.\docker\scripts\docker-prod.ps1 -Help
```

**Required Environment Variables:**
```powershell
$env:DB_PASSWORD = "secure_password"
$env:JWT_SECRET = "your_jwt_secret"
$env:NEXTAUTH_SECRET = "your_nextauth_secret"
$env:NEXT_PUBLIC_API_URL = "https://api.yourdomain.com"
```

**Services:**
- Frontend: http://localhost:3000
- Backend HTTP: http://localhost:8080
- Backend gRPC: http://localhost:50051
- PostgreSQL: localhost:5432

**Docker Compose File:** `docker/compose/docker-compose.prod.yml`

**Features:**
- ✅ Environment variable validation
- ✅ Production-optimized images
- ✅ Security checks
- ✅ Database persistence

---

### **pgadmin.ps1** - Database Management
**Purpose:** Manage pgAdmin 4 container for database administration

**Usage:**
```powershell
# Start pgAdmin 4
.\docker\scripts\pgadmin.ps1 start

# Stop pgAdmin 4
.\docker\scripts\pgadmin.ps1 stop

# Restart pgAdmin 4
.\docker\scripts\pgadmin.ps1 restart

# View logs
.\docker\scripts\pgadmin.ps1 logs

# Check status
.\docker\scripts\pgadmin.ps1 status

# Show help
.\docker\scripts\pgadmin.ps1 help
```

**Access:**
- URL: http://localhost:5050
- Email: admin@nynus.com
- Password: admin123

**Docker Compose File:** `docker/compose/docker-compose.pgadmin.yml`

---

### **seed-database.ps1** - Database Seeding
**Purpose:** Seed database with test data

**Usage:**
```powershell
# Seed database
.\docker\scripts\seed-database.ps1

# Seed with specific dataset
.\docker\scripts\seed-database.ps1 -Seed "development"

# Reset and reseed
.\docker\scripts\seed-database.ps1 -Reset
```

**Seeds Directory:** `docker/init/seeds/`

---

### **prisma-studio.ps1** - Database UI (Deprecated)
**Purpose:** ⚠️ Deprecated - Use pgAdmin 4 instead

**Status:** Kept for backward compatibility only

**Migration:** See `docs/database/PGADMIN_SETUP.md`

---

## 🔧 Quick Reference

### Common Workflows

**1. First-time Setup**
```powershell
# Navigate to project root
cd D:\exam-bank-system

# Start development environment
.\docker\scripts\docker-dev.ps1

# Wait for services (~ 2-3 minutes)
# Then access: http://localhost:3000
```

**2. Daily Development**
```powershell
# Start services
.\docker\scripts\docker-dev.ps1

# View logs
.\docker\scripts\docker-dev.ps1 -Logs

# When done, stop services
.\docker\scripts\docker-dev.ps1 -Stop
```

**3. Production Deployment**
```powershell
# Set environment variables first
$env:DB_PASSWORD = "secure_password"
$env:JWT_SECRET = "jwt_secret"
$env:NEXTAUTH_SECRET = "nextauth_secret"
$env:NEXT_PUBLIC_API_URL = "https://api.yourdomain.com"

# Deploy
.\docker\scripts\docker-prod.ps1

# Monitor
.\docker\scripts\docker-prod.ps1 -Logs
```

**4. Database Management**
```powershell
# Start pgAdmin
.\docker\scripts\pgadmin.ps1 start

# Access: http://localhost:5050

# Stop when done
.\docker\scripts\pgadmin.ps1 stop
```

---

## 🛠️ Troubleshooting

### **Script not found error**
```powershell
# Ensure you're in project root
pwd  # Should show: D:\exam-bank-system

# Try with full path
.\docker\scripts\docker-dev.ps1
```

### **Permission denied error**
```powershell
# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run PowerShell as Administrator
```

### **Docker not found**
```powershell
# Ensure Docker Desktop is installed and running
docker --version
docker ps

# Start Docker Desktop if not running
```

### **Services not starting**
```powershell
# Check Docker status
.\docker\scripts\docker-dev.ps1 -Status

# View logs
.\docker\scripts\docker-dev.ps1 -Logs

# Restart
.\docker\scripts\docker-dev.ps1 -Clean
.\docker\scripts\docker-dev.ps1
```

---

## 📊 Script Locations

| Script | Location | Purpose |
|--------|----------|---------|
| docker-dev.ps1 | docker/scripts/ | Development |
| docker-prod.ps1 | docker/scripts/ | Production |
| pgadmin.ps1 | docker/scripts/ | Database admin |
| seed-database.ps1 | docker/scripts/ | Database seeding |
| prisma-studio.ps1 | docker/scripts/ | ⚠️ Deprecated |

---

## 🔒 Security Best Practices

### Development
- Default passwords are weak (by design)
- Don't commit `.env` files
- Use `docker/compose/.env.example` as template

### Production
- **MUST** set strong environment variables
- Use Kubernetes secrets or secure vault
- Never commit credentials
- Enable TLS/SSL

```powershell
# ✅ GOOD - Secure password
$env:DB_PASSWORD = "x7#$%mK9&@pL2qRt*Yx8vN4w"

# ❌ BAD - Weak password
$env:DB_PASSWORD = "password123"
```

---

## 🔄 Integration with Other Tools

### **Makefile**
Docker targets in `Makefile` reference these scripts:
```makefile
docker-build:
  docker build -t exam-bank-backend:latest .

db-up:
  docker-compose -f docker/compose/docker-compose.yml up -d postgres
```

### **CI/CD Pipelines**
Scripts can be called from GitHub Actions:
```yaml
- name: Start Docker environment
  run: .\docker\scripts\docker-dev.ps1
```

---

## 📚 Related Documentation

- [Docker Overview](../README.md) - Master Docker documentation
- [Docker Development Guide](../DEVELOPMENT_GUIDE.md) - Detailed dev setup
- [Docker Compose Configuration](../compose/README.md) - Compose files explained
- [Database Initialization](../init/README.md) - Database setup
- [Dockerfiles Guide](../build/README.md) - Dockerfile documentation

---

## ✅ Checklist: First-time User

- [ ] Docker Desktop installed and running
- [ ] Project cloned to `D:\exam-bank-system`
- [ ] PowerShell execution policy set
- [ ] Ran `.\docker\scripts\docker-dev.ps1`
- [ ] Services running (check with -Status flag)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Read [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md) for hot-reload tips

---

**Last Updated:** 2025-01-19  
**Version:** 2.0.0 (Centralized Scripts)

# 🐳 Docker - NyNus Exam Bank System

## Welcome! This is your Docker Central Hub

All Docker-related files, scripts, configurations, and documentation are centralized here for easy discovery and maintenance.

---

## 📚 Quick Navigation

### 🚀 **I want to start developing now!**
→ **[Quick Start (3 Steps)](./QUICK_START.md)** - Get running in 5 minutes

### 📖 **I want to understand the setup**
→ **[Development Guide](./DEVELOPMENT_GUIDE.md)** - Comprehensive dev environment guide

### 🔧 **I want to use Docker scripts**
→ **[Scripts Documentation](./scripts/README.md)** - docker-dev, docker-prod, pgadmin, etc.

### 🏭 **I want to deploy to production**
→ **[Production Deployment](./docs/PRODUCTION_GUIDE.md)** - Production-ready deployment

### 🐛 **I have an issue**
→ **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

### 📋 **I want architecture details**
→ **[Docker Architecture](./docs/ARCHITECTURE.md)** - Technical deep-dive

---

## 📁 Directory Structure

```
docker/
├── README_MASTER.md              # ← You are here (Navigation hub)
├── QUICK_START.md                # 3-step quick start
├── DEVELOPMENT_GUIDE.md          # Dev environment guide
├── TROUBLESHOOTING.md            # Common issues & fixes
│
├── build/                        # ✨ All Dockerfiles (centralized)
│   ├── backend.dev.Dockerfile
│   ├── backend.prod.Dockerfile
│   ├── frontend.dev.Dockerfile
│   ├── frontend.prod.Dockerfile
│   ├── prisma-studio.Dockerfile
│   └── README.md                 # Dockerfile guide
│
├── scripts/                      # ✨ All Docker scripts (centralized)
│   ├── docker-dev.ps1            # Start dev environment
│   ├── docker-prod.ps1           # Start prod environment
│   ├── pgadmin.ps1               # Database management
│   ├── seed-database.ps1         # Database seeding
│   ├── prisma-studio.ps1         # ⚠️ Deprecated
│   └── README.md                 # Scripts guide
│
├── compose/                      # Docker Compose files
│   ├── docker-compose.yml        # Base config
│   ├── docker-compose.override.yml # Dev overrides
│   ├── docker-compose.dev.yml    # Explicit dev
│   ├── docker-compose.prod.yml   # Production
│   ├── docker-compose.seed.yml   # Seeding
│   ├── docker-compose.pgadmin.yml # pgAdmin 4
│   ├── .env.example              # Environment template
│   └── README.md                 # Compose guide
│
├── init/                         # ✨ Database initialization (centralized)
│   ├── init.sql                  # Main init script
│   ├── seeds/                    # Database seeds
│   │   ├── 01-core-data.sql
│   │   ├── 02-relationships.sql
│   │   └── 03-seed-users.sql
│   └── README.md                 # Database guide
│
├── opensearch/                   # OpenSearch configuration
│   ├── opensearch.yml
│   ├── opensearch-dashboards.yml
│   ├── index-templates/
│   ├── synonyms/
│   └── README.md
│
├── docs/                         # ✨ Detailed documentation
│   ├── ARCHITECTURE.md           # Architecture details
│   ├── PRODUCTION_GUIDE.md       # Production deployment
│   ├── MIGRATION_GUIDE.md        # Migration from old setup
│   └── FAQ.md                    # Frequently asked questions
│
└── .dockerignore                 # Centralized Docker ignore rules
```

### **✨ = Newly Centralized**

---

## 🎯 Common Tasks

### **Development**
```powershell
# Start development
.\docker\scripts\docker-dev.ps1

# View logs
.\docker\scripts\docker-dev.ps1 -Logs

# Stop
.\docker\scripts\docker-dev.ps1 -Stop
```

### **Production**
```powershell
# Set secrets first
$env:DB_PASSWORD = "xxx"
$env:JWT_SECRET = "xxx"
$env:NEXTAUTH_SECRET = "xxx"

# Deploy
.\docker\scripts\docker-prod.ps1

# Monitor
.\docker\scripts\docker-prod.ps1 -Logs
```

### **Database Management**
```powershell
# Start pgAdmin 4
.\docker\scripts\pgadmin.ps1 start

# Access: http://localhost:5050
# Login: admin@nynus.com / admin123
```

### **Build Images**
```bash
# Dev build
docker build -f docker/build/backend.dev.Dockerfile -t backend:dev .

# Prod build
docker build -f docker/build/backend.prod.Dockerfile -t backend:prod .
```

---

## ⚡ What's New in This Version?

✅ **All Docker files centralized** in `/docker/` directory
✅ **Better organization** - build/, scripts/, init/, compose/, docs/
✅ **Clear naming** - `backend.dev.Dockerfile` vs `backend.prod.Dockerfile`
✅ **Single documentation hub** - No more scattered docs
✅ **Easier onboarding** - New devs: "Docker = docker/ folder"
✅ **Better maintainability** - All scripts in one place
✅ **No more duplicates** - One Dockerfile per purpose

### Migration from Old Structure

| Old Location | New Location | Status |
|------------|------------|--------|
| `apps/backend/Dockerfile` | `docker/build/backend.dev.Dockerfile` | ✅ Moved |
| `apps/frontend/Dockerfile` | `docker/build/frontend.dev.Dockerfile` | ✅ Moved |
| `docker/backend.Dockerfile` | `docker/build/backend.dev.Dockerfile` | ✅ Consolidated |
| `docker/backend.prod.Dockerfile` | `docker/build/backend.prod.Dockerfile` | ✅ Already there |
| `scripts/docker/*.ps1` | `docker/scripts/*.ps1` | ✅ Moved |
| `scripts/pgadmin.ps1` | `docker/scripts/pgadmin.ps1` | ✅ Moved |
| `docker/database/` | `docker/init/` | ✅ Renamed |
| `.dockerignore` (root) | `docker/.dockerignore` | ✅ Moved |

---

## 🔍 File Reference

### Dockerfiles

| File | Purpose | Size | Base Image |
|------|---------|------|-----------|
| `build/backend.dev.Dockerfile` | Backend development | 80MB | golang:1.23.0 → alpine |
| `build/backend.prod.Dockerfile` | Backend production | 50MB | golang:1.23.0 → scratch/alpine |
| `build/frontend.dev.Dockerfile` | Frontend development | 1.2GB | node:20-alpine |
| `build/frontend.prod.Dockerfile` | Frontend production | 200MB | node:20-alpine (multi-stage) |
| `build/prisma-studio.Dockerfile` | DB UI (deprecated) | - | node:20-alpine |

### Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/docker-dev.ps1` | Start dev environment | `.\docker\scripts\docker-dev.ps1` |
| `scripts/docker-prod.ps1` | Start prod environment | `.\docker\scripts\docker-prod.ps1` |
| `scripts/pgadmin.ps1` | Manage pgAdmin | `.\docker\scripts\pgadmin.ps1 start` |
| `scripts/seed-database.ps1` | Seed database | `.\docker\scripts\seed-database.ps1` |

---

## 📖 Documentation Index

### Core Docs
- **[README_MASTER.md](./README_MASTER.md)** - This file (navigation hub)
- **[QUICK_START.md](./QUICK_START.md)** - 3-step getting started
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Detailed dev setup
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues

### Component Docs
- **[build/README.md](./build/README.md)** - Dockerfile reference
- **[scripts/README.md](./scripts/README.md)** - Scripts documentation
- **[init/README.md](./init/README.md)** - Database initialization
- **[compose/README.md](./compose/README.md)** - Docker Compose configuration

### Advanced Docs
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture
- **[docs/PRODUCTION_GUIDE.md](./docs/PRODUCTION_GUIDE.md)** - Production deployment
- **[docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)** - Migration from old setup
- **[docs/FAQ.md](./docs/FAQ.md)** - Frequently asked questions

---

## 🚀 Getting Started Paths

### **Path 1: I just want to run it** (5 min)
1. Read: [QUICK_START.md](./QUICK_START.md)
2. Run: `.\docker\scripts\docker-dev.ps1`
3. Access: http://localhost:3000

### **Path 2: I want to understand it** (30 min)
1. Read: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
2. Explore: `docker/compose/docker-compose.yml`
3. Learn: `docker/build/` and `docker/scripts/`

### **Path 3: I want to deploy to production** (1 hour)
1. Read: [docs/PRODUCTION_GUIDE.md](./docs/PRODUCTION_GUIDE.md)
2. Configure: Environment variables
3. Deploy: `.\docker\scripts\docker-prod.ps1`

### **Path 4: I have a problem** (5-15 min)
1. Check: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Or: [docs/FAQ.md](./docs/FAQ.md)
3. Search: Issue in logs: `.\docker\scripts\docker-dev.ps1 -Logs`

---

## 🛠️ Tools & Utilities

### Docker Commands
```bash
# Build
docker build -f docker/build/backend.dev.Dockerfile .

# Run
docker run -p 8080:8080 exam-bank-backend:dev

# Compose
docker-compose -f docker/compose/docker-compose.yml up -d
```

### Management
```bash
# View images
docker images | grep exam-bank

# View containers
docker ps -a

# View logs
docker logs exam_bank_backend

# Enter container
docker exec -it exam_bank_backend sh
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Docker Desktop installed and running
- [ ] Scripts accessible from project root
- [ ] `.\docker\scripts\docker-dev.ps1` starts services
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:8080
- [ ] Database healthy (check compose status)
- [ ] No errors in logs
- [ ] pgAdmin works at http://localhost:5050 (development)

---

## 🔒 Security Notes

### Development
- Default credentials used (by design)
- Don't commit `.env` files
- Use `.env.example` as template

### Production
- **MUST** set secure environment variables
- Use Kubernetes secrets or vault
- Never commit credentials to git
- Enable TLS/SSL
- Regular security updates

---

## 📊 System Requirements

- **Docker Desktop 4.0+** - https://www.docker.com/products/docker-desktop
- **Docker Compose 2.0+** - Included with Docker Desktop
- **PowerShell 5.1+** or **PowerShell Core 7+**
- **4GB RAM minimum** (8GB recommended)
- **20GB disk space** for images

---

## 🔄 Common Workflows

### Daily Development
```powershell
# Morning: Start services
.\docker\scripts\docker-dev.ps1

# Work: Make code changes (hot-reload works)

# Evening: Stop services
.\docker\scripts\docker-dev.ps1 -Stop
```

### Code Review
```powershell
# Pull changes
git pull

# Rebuild services
.\docker\scripts\docker-dev.ps1 -Build

# Review in browser
# http://localhost:3000
```

### Troubleshooting
```powershell
# Clean everything
.\docker\scripts\docker-dev.ps1 -Clean

# Start fresh
.\docker\scripts\docker-dev.ps1

# Check logs
.\docker\scripts\docker-dev.ps1 -Logs
```

---

## 📚 External Resources

- **[Docker Documentation](https://docs.docker.com/)** - Official Docker docs
- **[Docker Compose](https://docs.docker.com/compose/)** - Compose reference
- **[Best Practices](https://docs.docker.com/develop/dev-best-practices/)** - Docker best practices
- **[PostgreSQL Docs](https://www.postgresql.org/docs/)** - PostgreSQL documentation

---

## 🤝 Contributing

When modifying Docker configuration:

1. **Update Dockerfiles** in `docker/build/`
2. **Update compose files** in `docker/compose/`
3. **Update scripts** in `docker/scripts/`
4. **Update docs** accordingly
5. **Test changes** with all environments (dev + prod)
6. **Document** any breaking changes

---

## 📞 Support

### Finding Help

1. **Quick answers**: [docs/FAQ.md](./docs/FAQ.md)
2. **Errors**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. **Setup issues**: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
4. **Production**: [docs/PRODUCTION_GUIDE.md](./docs/PRODUCTION_GUIDE.md)
5. **Logs**: `.\docker\scripts\docker-dev.ps1 -Logs`

### Reporting Issues

Include:
- Error message (full output)
- Steps to reproduce
- Log output (if applicable)
- Your environment (Docker version, OS, etc.)

---

## 📝 Version History

### v2.0.0 (2025-01-19) - Centralization
✅ **Major update:** All Docker files consolidated to `/docker/`
- Moved `apps/backend/Dockerfile` → `docker/build/backend.dev.Dockerfile`
- Moved `apps/frontend/Dockerfile` → `docker/build/frontend.dev.Dockerfile`
- Moved `scripts/docker/*.ps1` → `docker/scripts/`
- Renamed `docker/database/` → `docker/init/`
- Centralized `.dockerignore` in `docker/`
- Created unified documentation hub

### v1.x.x - Legacy
Original scattered setup (before consolidation)

---

**Last Updated:** 2025-01-19  
**Current Version:** 2.0.0  
**Status:** ✅ Production Ready

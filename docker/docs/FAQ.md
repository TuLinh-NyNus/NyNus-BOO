# ❓ Docker FAQ - Frequently Asked Questions

Quick answers to common Docker setup and usage questions.

---

## 🚀 Getting Started

### Q: How do I start Docker development?
**A:** Run this single command:
```powershell
.\docker\scripts\docker-dev.ps1
```
Done! Access app at http://localhost:3000

### Q: What if I'm using Linux/Mac instead of Windows?
**A:** Replace `.\docker\scripts\docker-dev.ps1` with:
```bash
docker-compose -f docker/compose/docker-compose.yml up -d
```

### Q: How long does it take to start?
**A:** 
- First run: ~2-3 minutes (pulls images, builds)
- Subsequent runs: ~10-20 seconds

### Q: Do I need to install anything besides Docker?
**A:** Only Docker Desktop. Everything else runs in containers.

---

## 🔧 Configuration

### Q: How do I change the port?
**A:** Edit `.env` file in `docker/compose/`:
```env
FRONTEND_PORT=3001          # Change 3000 → 3001
BACKEND_HTTP_PORT=8081     # Change 8080 → 8081
```
Then restart: `.\docker\scripts\docker-dev.ps1 -Clean` + `.\docker\scripts\docker-dev.ps1`

### Q: Where's my database password?
**A:** Default for development:
- User: `exam_bank_user`
- Password: `exam_bank_password`
- Host: `localhost` (from host machine)
- Port: `5432`

### Q: Can I use production images locally?
**A:** Yes, use:
```powershell
docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.prod.yml up -d
```

### Q: What environment variables are required for production?
**A:** Minimum:
```powershell
$env:DB_PASSWORD = "strong_password"
$env:JWT_SECRET = "secret_key"
$env:NEXTAUTH_SECRET = "auth_secret"
```

---

## 🐛 Troubleshooting

### Q: Port already in use?
**A:** Find what's using it:
```powershell
netstat -ano | findstr :3000  # Check port 3000
```
Either stop that service or change Docker port (see above).

### Q: Docker won't start?
**A:** Try:
```powershell
.\docker\scripts\docker-dev.ps1 -Clean    # Full cleanup
.\docker\scripts\docker-dev.ps1           # Restart
```

### Q: Hot-reload not working?
**A:** 
1. Restart frontend: `.\docker\scripts\docker-dev.ps1 -Logs` (check errors)
2. If still broken:
```powershell
docker-compose restart frontend
```

### Q: Database connection failed?
**A:** Check if postgres is healthy:
```powershell
docker-compose ps postgres          # Should say "healthy"
docker-compose logs postgres        # Check logs
```

### Q: Out of memory errors?
**A:** Increase Docker Desktop memory:
- Docker Desktop → Settings → Resources → Memory → 8GB

### Q: Permission denied when running scripts?
**A:** Run PowerShell as Administrator, or:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📁 Files & Locations

### Q: Where are my Dockerfiles?
**A:** All in `docker/build/`:
- Backend dev: `docker/build/backend.dev.Dockerfile`
- Backend prod: `docker/build/backend.prod.Dockerfile`
- Frontend dev: `docker/build/frontend.dev.Dockerfile`
- Frontend prod: `docker/build/frontend.prod.Dockerfile`

### Q: Where are database init scripts?
**A:** In `docker/init/`:
- Main init: `docker/init/init.sql`
- Seed data: `docker/init/seeds/`

### Q: Where are compose files?
**A:** In `docker/compose/`:
- Main: `docker-compose.yml`
- Dev overrides: `docker-compose.override.yml`
- Production: `docker-compose.prod.yml`

### Q: Where are management scripts?
**A:** In `docker/scripts/`:
- Dev environment: `docker-dev.ps1`
- Production: `docker-prod.ps1`
- Database: `pgadmin.ps1`
- Seeding: `seed-database.ps1`

---

## 🔐 Security

### Q: Is it safe to use default credentials?
**A:** Only for development. Production requires:
```powershell
# Change all these
$env:POSTGRES_PASSWORD = "secure_password_here"
$env:JWT_SECRET = "long_random_secret"
$env:NEXTAUTH_SECRET = "another_random_secret"
```

### Q: How do I access the database from outside Docker?
**A:** Connection string for external tools:
```
postgresql://exam_bank_user:exam_bank_password@localhost:5432/exam_bank_db
```

### Q: Can I restrict network access?
**A:** Docker containers communicate over `exam_bank_network`. For production:
- Use Kubernetes network policies
- Or firewall rules on your infrastructure

---

## 🎯 Development

### Q: How do I add a new service to Docker?
**A:**
1. Create Dockerfile in `docker/build/`
2. Add service to `docker-compose.yml`
3. Update init scripts if needed
4. Restart: `.\docker\scripts\docker-dev.ps1 -Clean` → `.\docker\scripts\docker-dev.ps1`

### Q: How do I update dependencies?
**A:** Backend:
```bash
cd apps/backend && go get -u ./...
```
Frontend:
```bash
cd apps/frontend && pnpm update
```
Then rebuild: `docker-compose up --build`

### Q: Can I run just the backend without frontend?
**A:** Yes:
```powershell
docker-compose -f docker/compose/docker-compose.backend-only.yml up -d
```

### Q: How do I view logs?
**A:**
```powershell
.\docker\scripts\docker-dev.ps1 -Logs     # All services
docker-compose logs backend               # Just backend
docker-compose logs -f frontend           # Follow frontend logs
```

---

## 📦 Images & Builds

### Q: How big are the images?
**A:** Typical sizes:
- Backend dev: ~80MB
- Backend prod: ~50MB  
- Frontend dev: ~1.2GB (includes devDependencies)
- Frontend prod: ~200MB
- Database: ~200MB

### Q: How do I rebuild images?
**A:**
```powershell
.\docker\scripts\docker-dev.ps1 -Build    # Rebuild and restart
docker-compose up --build                 # Also works
```

### Q: Can I use my own Dockerfile?
**A:** Yes, set environment variable:
```powershell
$env:BACKEND_DOCKERFILE = "path/to/your/Dockerfile"
docker-compose up
```

---

## 🚀 Production

### Q: How do I deploy to production?
**A:** See [Production Deployment Guide](./PRODUCTION_GUIDE.md)

### Q: What's different in production?
**A:**
- Uses production Dockerfiles (optimized, smaller)
- No Redis, OpenSearch (optional services)
- Different environment variables
- Security hardened
- Scalable configuration

### Q: Can I test production locally?
**A:** Yes, use prod compose:
```powershell
$env:DB_PASSWORD = "testpass"
$env:JWT_SECRET = "test_secret"
docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.prod.yml up
```

---

## 🆘 When Nothing Works

### Q: My app still doesn't work after trying everything?
**A:** Try nuclear option:
```powershell
.\docker\scripts\docker-dev.ps1 -Clean    # Remove everything
docker system prune -a --volumes          # Clean docker
.\docker\scripts\docker-dev.ps1           # Start fresh
```

### Q: How do I get help?
**A:** Check these resources:
1. [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. [Development Guide](./DEVELOPMENT_GUIDE.md)
3. Docker logs: `.\docker\scripts\docker-dev.ps1 -Logs`
4. Container shell: `docker exec -it exam_bank_backend sh`

### Q: How do I report a Docker issue?
**A:** Include:
- Error message (full)
- Steps to reproduce
- Output of `docker-compose ps`
- Output of `docker version`
- Your OS and Docker version

---

## 💡 Pro Tips

### Tip: Access container shell
```powershell
docker exec -it exam_bank_backend sh          # Backend
docker exec -it exam_bank_frontend sh         # Frontend
docker exec -it exam_bank_postgres psql -U exam_bank_user -d exam_bank_db  # Database
```

### Tip: Clear Docker cache
```powershell
docker builder prune  # Clear build cache
docker system prune   # Clean up unused resources
```

### Tip: Database backup
```powershell
docker exec exam_bank_postgres pg_dump -U exam_bank_user exam_bank_db > backup.sql
```

### Tip: Watch logs
```powershell
docker-compose logs -f       # Follow all logs
docker-compose logs -f backend  # Follow just backend
```

### Tip: Stop all containers
```powershell
docker stop $(docker ps -q)  # Stop all running
docker-compose down          # Stop and remove
```

---

## 📞 More Questions?

- Check other docs in `docker/docs/`
- See [Troubleshooting Guide](./TROUBLESHOOTING.md) for error solutions
- Ask team or check project wiki

---

**Last Updated**: January 19, 2025

Don't see your question? Add it by updating this FAQ!

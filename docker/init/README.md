# 🗄️ Database Initialization - NyNus Exam Bank System

## 📁 Directory Structure

```
docker/init/
├── init.sql                    # Main database initialization
├── seeds/
│   ├── 01-core-data.sql       # Core reference data (categories, settings)
│   ├── 02-relationships.sql   # Relationships & constraints
│   └── 03-seed-users.sql      # Default users (admin, teachers, students)
├── README.md                   # This file
└── MIGRATION_GUIDE.md          # Migration from old database
```

---

## 📜 Initialization Flow

When PostgreSQL container starts:

1. **PostgreSQL creates:**
   - Database: `exam_bank_db` (from `POSTGRES_DB` env var)
   - User: `exam_bank_user` (from `POSTGRES_USER` env var)

2. **Executes `init.sql`:**
   - Sets timezone to Asia/Ho_Chi_Minh
   - Enables required extensions (uuid-ossp, pgcrypto)
   - Logs initialization status

3. **Executes seed files (if using seeding):**
   - Seed scripts in `seeds/` directory add test data

---

## 🔧 Configuration in Docker Compose

### **Development**
```yaml
postgres:
  volumes:
    - ../init/init.sql:/docker-entrypoint-initdb.d/01-init.sql
    - ../init/seeds/01-core-data.sql:/docker-entrypoint-initdb.d/02-core-data.sql
    - ../init/seeds/02-relationships.sql:/docker-entrypoint-initdb.d/03-relationships.sql
```

### **Production**
```yaml
postgres:
  volumes:
    - ../init/init.sql:/docker-entrypoint-initdb.d/01-init.sql
    - postgres_data:/var/lib/postgresql/data
```

---

## 📝 Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTGRES_DB` | `exam_bank_db` | Database name |
| `POSTGRES_USER` | `exam_bank_user` | Database user |
| `POSTGRES_PASSWORD` | `exam_bank_password` | Database password |

Set in `.env` or environment:
```bash
export POSTGRES_DB=exam_bank_db
export POSTGRES_USER=exam_bank_user
export POSTGRES_PASSWORD=your_secure_password
```

---

## 🚀 Usage

### **Start with Initialization**
```bash
docker-compose up -d postgres
```

PostgreSQL will:
1. Create database and user
2. Run `init.sql`
3. Load seed files (if configured)

### **Reset Database**
```bash
# Stop and remove volumes
docker-compose down -v

# Restart (will re-initialize)
docker-compose up -d postgres
```

### **Connect Directly**
```bash
# From host (if exposed on 5432)
psql -h localhost -U exam_bank_user -d exam_bank_db

# From docker container
docker exec -it exam_bank_postgres psql -U exam_bank_user -d exam_bank_db
```

---

## ⚙️ Init Scripts Best Practices

### **Naming Convention**
```
01-init.sql              # Initial setup (extensions, roles)
02-core-data.sql        # Reference data (static)
03-relationships.sql    # Constraints & relationships
04-seed-users.sql       # Test/demo users
```

Numbers ensure execution order.

### **Idempotent Operations**
```sql
-- ✅ GOOD - Won't fail if already exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA IF NOT EXISTS public;

-- ❌ BAD - Will fail if already exists
CREATE EXTENSION "uuid-ossp";
```

### **Comments**
```sql
-- Clear comments for each section
-- Helps debugging when scripts are executed

SELECT 'Initialized XYZ' AS status;
```

---

## 🔒 Security Notes

1. **Development Only:**
   - Use weak passwords for dev
   - Don't commit `.env` with real credentials

2. **Production:**
   - **MUST** change `POSTGRES_PASSWORD`
   - Use strong, random passwords
   - Store secrets in secure vault
   - Never commit credentials

3. **Permissions:**
   - User `exam_bank_user` has full privileges on `exam_bank_db`
   - PostgreSQL default security roles applied

---

## 📊 Database Schema

Generated from Prisma schema: `apps/frontend/prisma/schema.prisma`

Tables include:
- Users (profiles, roles, authentication)
- Exams (exam definitions, metadata)
- Questions (question content, types)
- Answers (student responses)
- Submissions (exam attempts)
- etc.

---

## 🔄 Migration Guide

If migrating from old database setup:

1. **Export old data:**
   ```bash
   pg_dump old_db > backup.sql
   ```

2. **Start new container:**
   ```bash
   docker-compose up -d postgres
   ```

3. **Restore if needed:**
   ```bash
   docker exec -i exam_bank_postgres psql -U exam_bank_user -d exam_bank_db < backup.sql
   ```

See `MIGRATION_GUIDE.md` for detailed steps.

---

## 🛠️ Troubleshooting

### **Database not initializing**
```bash
# Check logs
docker logs exam_bank_postgres

# Restart with clean state
docker-compose down -v
docker-compose up -d postgres
```

### **Connection refused**
```bash
# Verify container is running
docker ps | grep postgres

# Wait for healthcheck (30 seconds)
docker-compose ps postgres  # Check STATUS = "healthy"
```

### **Init scripts not executing**
- Ensure volume paths are correct
- Check file permissions (must be readable)
- Verify naming convention (01-, 02-, etc.)

---

## 📚 Related Files

- [Docker Compose Configuration](../compose/README.md)
- [pgAdmin Setup Guide](../../docs/database/PGADMIN_SETUP.md)
- [Prisma Schema](../../apps/frontend/prisma/schema.prisma)

---

**Last Updated:** 2025-01-19

# pgAdmin 4 Setup Guide - NyNus Exam Bank System

## 📋 Overview

**pgAdmin 4** là công cụ quản lý PostgreSQL database chính thức, thay thế Prisma Studio trong NyNus system để giải quyết dual database access anti-pattern.

### Why pgAdmin 4?

**Advantages over Prisma Studio:**
- ✅ **Full SQL Editor**: Syntax highlighting, autocomplete, query history
- ✅ **ER Diagrams**: Visualize database schema và relationships
- ✅ **Backup/Restore**: Built-in tools cho database backup và restore
- ✅ **Query Analysis**: EXPLAIN plans, query optimization tools
- ✅ **Data Export**: Multiple formats (CSV, JSON, SQL, Excel)
- ✅ **Security**: Không bypass backend security layers như Prisma direct access
- ✅ **Professional Tool**: Industry-standard database management tool

**Business Value:**
- Giải quyết dual database access anti-pattern
- Maintain single source of truth cho database access (qua Backend Go)
- Improve team productivity với better database management experience
- Reduce security risks

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start pgAdmin 4 Container

```powershell
# Using management script (recommended)
.\scripts\pgadmin.ps1 start

# Or using docker-compose directly
cd docker/compose
docker-compose -f docker-compose.yml -f docker-compose.pgadmin.yml up -d pgadmin
```

**Expected output:**
```
[START] Starting pgAdmin 4...
[INFO] PostgreSQL is running: exam_bank_postgres
[SUCCESS] pgAdmin 4 is starting...
[INFO] pgAdmin 4 should be accessible at:
  http://localhost:5050
```

### Step 2: Access pgAdmin Web Interface

1. Open browser: **http://localhost:5050**
2. Login with credentials:
   - **Email**: `admin@nynus.com`
   - **Password**: `admin123`

### Step 3: Add PostgreSQL Server Connection

1. Click **"Add New Server"** button
2. Fill in connection details:

**General Tab:**
- **Name**: `NyNus PostgreSQL`

**Connection Tab:**
- **Host name/address**: `postgres`
- **Port**: `5432`
- **Maintenance database**: `exam_bank_db`
- **Username**: `exam_bank_user`
- **Password**: `exam_bank_password`
- **Save password**: ✅ (check this)

3. Click **Save**

**✅ Done!** You can now browse all 30+ tables, run queries, and manage database.

---

## 🔧 Connection Setup (Detailed)

### PostgreSQL Server Configuration

**Connection Details:**
```
Host:     postgres          # Docker network internal name
Port:     5432              # PostgreSQL default port
Database: exam_bank_db      # NyNus database name
Username: exam_bank_user    # Database user
Password: exam_bank_password # Database password
```

### Adding Server in pgAdmin

1. **Right-click "Servers"** in left sidebar → **Register** → **Server**

2. **General Tab:**
   - Name: `NyNus PostgreSQL` (or any name you prefer)
   - Server group: `Servers` (default)
   - Comments: `NyNus Exam Bank System Database`

3. **Connection Tab:**
   - Host name/address: `postgres`
   - Port: `5432`
   - Maintenance database: `exam_bank_db`
   - Username: `exam_bank_user`
   - Password: `exam_bank_password`
   - Save password: ✅ **Check this** to avoid re-entering password

4. **SSL Tab:** (optional for development)
   - SSL mode: `Prefer` (default)

5. **Advanced Tab:** (optional)
   - DB restriction: `exam_bank_db` (to show only NyNus database)

6. Click **Save**

### Verifying Connection

After adding server, you should see:
```
Servers
└── NyNus PostgreSQL
    └── Databases (1)
        └── exam_bank_db
            ├── Schemas (1)
            │   └── public
            │       ├── Tables (30+)
            │       ├── Views
            │       ├── Functions
            │       └── ...
            └── ...
```

---

## 📊 Basic Operations

### 1. View Database Tables

**Navigate:**
```
Servers → NyNus PostgreSQL → Databases → exam_bank_db → Schemas → public → Tables
```

**Available Tables:**
- **Users System**: users, sessions, refresh_tokens, oauth_accounts
- **Question System**: question, question_code, question_image, question_tag, question_feedback
- **Exam System**: exams, exam_questions, exam_attempts, exam_answers, exam_results
- **Admin System**: audit_logs, resource_access, user_preferences
- **Communication**: contact_submissions, newsletter_subscriptions

### 2. View Table Data

**Method 1: Right-click table**
- Right-click table → **View/Edit Data** → **All Rows**

**Method 2: Query Tool**
- Click **Tools** → **Query Tool** (or press `Alt+Shift+Q`)
- Run query:
```sql
SELECT * FROM users LIMIT 100;
```

### 3. Run SQL Queries

**Open Query Tool:**
- Click **Tools** → **Query Tool**
- Or press `Alt+Shift+Q`

**Example Queries:**
```sql
-- View all users
SELECT id, email, first_name, last_name, role 
FROM users 
ORDER BY created_at DESC;

-- Count questions by difficulty
SELECT difficulty, COUNT(*) as count
FROM question
GROUP BY difficulty
ORDER BY count DESC;

-- View recent exam attempts
SELECT ea.id, u.email, e.title, ea.status, ea.score
FROM exam_attempts ea
JOIN users u ON ea.user_id = u.id
JOIN exams e ON ea.exam_id = e.id
ORDER BY ea.started_at DESC
LIMIT 20;
```

**Query Features:**
- ✅ Syntax highlighting
- ✅ Autocomplete (Ctrl+Space)
- ✅ Query history
- ✅ EXPLAIN plan visualization
- ✅ Download results as CSV/JSON

### 4. Export Data

**Export Table Data:**
1. Right-click table → **View/Edit Data** → **All Rows**
2. Click **Download** icon (arrow down)
3. Choose format: **CSV**, **JSON**, **Excel**
4. Click **Download**

**Export Query Results:**
1. Run query in Query Tool
2. Click **Download** icon in results panel
3. Choose format and download

### 5. View ER Diagram

**Generate ERD:**
1. Right-click database `exam_bank_db`
2. Select **ERD For Database**
3. pgAdmin generates visual diagram showing:
   - All tables
   - Columns and data types
   - Primary keys (yellow key icon)
   - Foreign key relationships (lines connecting tables)

**ERD Features:**
- Zoom in/out
- Auto-arrange tables
- Export as image (PNG, SVG)
- Show/hide columns

### 6. Backup Database

**Create Backup:**
1. Right-click database `exam_bank_db`
2. Select **Backup...**
3. Configure:
   - Filename: `nynus_backup_2025-01-19.sql`
   - Format: `Plain` (SQL script) or `Custom` (compressed)
   - Encoding: `UTF8`
4. Click **Backup**

**Restore Backup:**
1. Right-click database `exam_bank_db`
2. Select **Restore...**
3. Choose backup file
4. Click **Restore**

---

## 🛠️ Troubleshooting

### Issue 1: Cannot access http://localhost:5050

**Symptoms:**
- Browser shows "This site can't be reached"
- Connection refused error

**Solutions:**
```powershell
# Check if container is running
.\scripts\pgadmin.ps1 status

# Check container logs
.\scripts\pgadmin.ps1 logs

# Restart container
.\scripts\pgadmin.ps1 restart

# Verify port is not in use
netstat -ano | findstr :5050
```

### Issue 2: Cannot connect to PostgreSQL server

**Symptoms:**
- "could not connect to server: Connection refused"
- "FATAL: password authentication failed"

**Solutions:**

**Check PostgreSQL is running:**
```powershell
docker ps --filter "name=exam_bank_postgres"
```

**Verify connection details:**
- Host: `postgres` (NOT `localhost` - use Docker network name)
- Port: `5432`
- Database: `exam_bank_db`
- Username: `exam_bank_user`
- Password: `exam_bank_password`

**Check network connection:**
```powershell
# Ensure both containers are in same network
docker network inspect compose_exam_bank_network
```

### Issue 3: pgAdmin shows "Application Server could not be contacted"

**Symptoms:**
- pgAdmin web interface loads but shows error message
- Cannot access any features

**Solutions:**
```powershell
# Restart pgAdmin container
.\scripts\pgadmin.ps1 restart

# Check container logs for errors
.\scripts\pgadmin.ps1 logs

# If persists, remove volume and restart
docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.pgadmin.yml down -v
.\scripts\pgadmin.ps1 start
```

### Issue 4: Forgot pgAdmin login password

**Solution:**
```powershell
# Stop pgAdmin
.\scripts\pgadmin.ps1 stop

# Remove pgAdmin data volume (resets configuration)
docker volume rm nynus_pgadmin_data

# Start pgAdmin (will use default credentials)
.\scripts\pgadmin.ps1 start

# Login with: admin@nynus.com / admin123
```

---

## 📚 Comparison: pgAdmin vs Prisma Studio

| Feature | pgAdmin 4 | Prisma Studio |
|---------|-----------|---------------|
| **SQL Editor** | ✅ Full-featured với syntax highlighting | ❌ No SQL editor |
| **Query Autocomplete** | ✅ Yes | ❌ No |
| **ER Diagrams** | ✅ Auto-generated | ❌ No |
| **Backup/Restore** | ✅ Built-in tools | ❌ No |
| **Query Analysis** | ✅ EXPLAIN plans | ❌ No |
| **Data Export** | ✅ CSV, JSON, Excel, SQL | ⚠️ Limited |
| **Security** | ✅ No direct DB access | ❌ Direct DB access |
| **Bundle Size** | ✅ No impact on frontend | ❌ +2MB frontend bundle |
| **Architecture** | ✅ Separate tool | ❌ Embedded in frontend |
| **Learning Curve** | ⚠️ Moderate | ✅ Easy |

**Recommendation:** Use **pgAdmin 4** for all database management tasks. Prisma Studio is deprecated in NyNus system.

---

## 🎯 Best Practices

### 1. Security
- ⚠️ **Change default password** in production: `admin123` → strong password
- ✅ Use environment variables for credentials
- ✅ Enable SSL for production connections
- ✅ Restrict network access appropriately

### 2. Performance
- ✅ Use **LIMIT** clause for large tables
- ✅ Use **EXPLAIN** to analyze slow queries
- ✅ Create indexes for frequently queried columns
- ✅ Monitor query execution time

### 3. Data Management
- ✅ **Backup regularly** before schema changes
- ✅ Test queries on development database first
- ✅ Use transactions for multiple related changes
- ✅ Document complex queries with comments

### 4. Team Collaboration
- ✅ Share server connection configurations
- ✅ Document custom queries in team wiki
- ✅ Use consistent naming conventions
- ✅ Review schema changes with team

---

## 📖 Additional Resources

### Official Documentation
- [pgAdmin 4 Documentation](https://www.pgadmin.org/docs/pgadmin4/latest/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)

### NyNus System Documentation
- Database Schema: `packages/database/README.md`
- Migration Guide: `packages/database/AGENT.md`
- Docker Setup: `docker/compose/README.md`

### Management Scripts
- Start pgAdmin: `.\scripts\pgadmin.ps1 start`
- Stop pgAdmin: `.\scripts\pgadmin.ps1 stop`
- View logs: `.\scripts\pgadmin.ps1 logs`
- Check status: `.\scripts\pgadmin.ps1 status`

---

## 🆘 Support

**Issues or Questions?**
1. Check troubleshooting section above
2. Review container logs: `.\scripts\pgadmin.ps1 logs`
3. Consult team documentation
4. Contact DevOps team

**Quick Commands:**
```powershell
# Start pgAdmin
.\scripts\pgadmin.ps1 start

# Check status
.\scripts\pgadmin.ps1 status

# View logs
.\scripts\pgadmin.ps1 logs

# Restart if issues
.\scripts\pgadmin.ps1 restart
```

---

**Last Updated:** 2025-01-19  
**Version:** 1.0.0  
**Maintained by:** NyNus DevOps Team


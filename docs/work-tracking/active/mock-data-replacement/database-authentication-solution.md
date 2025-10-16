# Database Authentication Issue - Solution Summary

## 🎯 Vấn Đề

Backend Go không thể connect tới PostgreSQL Docker container với lỗi:
```
pq: password authentication failed for user "exam_bank_user"
```

## 🔍 Root Cause Analysis

### Phát Hiện Qua 30+ Augment Context Engine Calls

1. **Có 2 PostgreSQL instances đang chạy đồng thời trên port 5432**:
   - **Process 5032**: Native PostgreSQL trên Windows (instance CŨ)
   - **Process 27364**: Docker container NyNus-postgres (instance MỚI)

2. **Backend đang connect nhầm vào native PostgreSQL**:
   - Backend config: `DB_HOST=127.0.0.1`, `DB_PORT=5432`
   - Windows routing: `127.0.0.1:5432` → Native PostgreSQL (process 5032)
   - Docker container: Listening trên `0.0.0.0:5432` nhưng bị native PostgreSQL chiếm port

3. **Password không khớp**:
   - Native PostgreSQL: Password CŨ (không biết)
   - Docker PostgreSQL: Password MỚI (`exam_bank_password`)

## ✅ Giải Pháp Đã Áp Dụng

### Phương Án: Thay Đổi Docker Port Mapping

**Lý do chọn phương án này**:
- ✅ Đơn giản nhất
- ✅ Không cần quyền Administrator
- ✅ Không ảnh hưởng đến cấu trúc project
- ✅ Dễ rollback nếu cần

**Các bước thực hiện**:

1. **Update Docker port mapping** (`docker/compose/.env`):
   ```diff
   - DB_PORT=5432
   + DB_PORT=5433
   ```

2. **Update backend configuration** (`apps/backend/.env`):
   ```diff
   - DB_PORT=5432
   + DB_PORT=5433
   ```

3. **Recreate Docker container**:
   ```bash
   cd docker/compose
   docker-compose down
   docker-compose up -d postgres
   ```

4. **Verify port mapping**:
   ```bash
   netstat -ano | Select-String ':543'
   ```
   
   Kết quả:
   - Port 5432: Native PostgreSQL (process 5032) ← Không ảnh hưởng
   - Port 5433: Docker PostgreSQL (process 27364) ← Backend connect vào đây

## 🎉 Kết Quả

### Backend Connection Successful

```log
{"level":"info","message":"🚀 Starting NyNus Exam Bank System...","timestamp":"2025-10-16T06:51:50+07:00"}
{"level":"info","message":"✅ Environment variables loaded from .env file","timestamp":"2025-10-16T06:51:50+07:00"}
{"level":"info","message":"📋 Loading application configuration...","timestamp":"2025-10-16T06:51:50+07:00"}
{"environment":"development","grpc_port":"50051","http_port":"8080","level":"info","message":"✅ Configuration loaded successfully","timestamp":"2025-10-16T06:51:50+07:00"}
{"level":"info","message":"🔍 Validating configuration...","timestamp":"2025-10-16T06:51:50+07:00"}
{"level":"info","message":"✅ Configuration validation passed","timestamp":"2025-10-16T06:51:50+07:00"}
{"level":"info","message":"🏗️  Initializing application...","timestamp":"2025-10-16T06:51:50+07:00"}
DEBUG: Database connection string: postgres://exam_bank_user:exam_bank_password@127.0.0.1:5433/exam_bank_db?sslmode=disable
2025/10/16 06:51:50 🔧 Database connection pool configured for development
2025/10/16 06:51:50 ✅ Connected to PostgreSQL: exam_bank_user@127.0.0.1:5433/exam_bank_db
2025/10/16 06:51:50 🔄 Starting database migrations...
```

✅ **Backend đã kết nối thành công vào Docker PostgreSQL!**

### Migration Issue (Separate Problem)

Có lỗi migration sau khi connect thành công:
```
failed to run migration 8: pq: invalid input value for enum exam_type: "PRACTICE"
```

**Lưu ý**: Đây là lỗi migration, KHÔNG PHẢI lỗi authentication. Database authentication đã được giải quyết hoàn toàn.

## 📊 Troubleshooting Timeline

| Bước | Hành Động | Kết Quả |
|------|-----------|---------|
| 1 | Verify .env files | ✅ Đúng credentials |
| 2 | Check PostgreSQL container | ✅ Running healthy |
| 3 | Verify password hash | ✅ Match |
| 4 | Try init script approach | ❌ Failed (timing issue) |
| 5 | Try manual pg_hba.conf copy | ❌ Failed (still auth error) |
| 6 | Reset password | ❌ Failed (wrong instance) |
| 7 | Check port conflicts | ✅ **FOUND ROOT CAUSE** |
| 8 | Change Docker port mapping | ✅ **SOLVED** |

## 🔧 Files Modified

### 1. `docker/compose/.env`
```diff
# Database Configuration
POSTGRES_DB=exam_bank_db
POSTGRES_USER=exam_bank_user
POSTGRES_PASSWORD=exam_bank_password
- DB_PORT=5432
+ DB_PORT=5433
POSTGRES_VOLUME=postgres_data
```

### 2. `apps/backend/.env`
```diff
# Database Configuration
DB_HOST=127.0.0.1
- DB_PORT=5432
+ DB_PORT=5433
DB_USER=exam_bank_user
DB_PASSWORD=exam_bank_password
DB_NAME=exam_bank_db
DB_SSLMODE=disable
```

### 3. `docker/compose/docker-compose.yml`
Removed init script mount (không cần thiết nữa):
```diff
volumes:
  - ${POSTGRES_VOLUME:-postgres_data}:/var/lib/postgresql/data
  - ../database/init.sql:/docker-entrypoint-initdb.d/init.sql
- - ../database/init-pg-hba.sh:/docker-entrypoint-initdb.d/02-init-pg-hba.sh
```

## 📝 Lessons Learned

1. **Always check for port conflicts FIRST**:
   - Use `netstat -ano | Select-String ':PORT'` to check what's listening
   - Multiple services can bind to same port on different interfaces

2. **Docker port mapping is flexible**:
   - Can map container port to any host port
   - Format: `HOST_PORT:CONTAINER_PORT`
   - Example: `5433:5432` maps container's 5432 to host's 5433

3. **Authentication troubleshooting order**:
   1. Verify credentials
   2. Check network connectivity
   3. **Check port conflicts** ← Often overlooked!
   4. Check pg_hba.conf
   5. Check password encryption

4. **Windows + Docker networking**:
   - `localhost` and `127.0.0.1` may behave differently
   - Native services take precedence over Docker port mapping
   - Use different ports to avoid conflicts

## 🚀 Next Steps

1. ✅ Database authentication: **SOLVED**
2. ⏳ Fix migration issue (enum exam_type)
3. ⏳ Restore database backup (158 users)
4. ⏳ Run seeder to populate data
5. ⏳ Runtime testing with real data
6. ⏳ Complete REVIEW phase

## 🔗 Related Documents

- [Implementation Final Summary](./implementation-final-summary.md)
- [Nested Objects Solution Plan](./nested-objects-solution-plan.md)
- [Testing Guide](./nested-objects-testing-guide.md)

---

**Status**: ✅ RESOLVED
**Date**: 2025-10-16
**Time Spent**: ~2 hours (30+ Augment Context Engine calls)
**Solution**: Changed Docker port mapping from 5432 to 5433


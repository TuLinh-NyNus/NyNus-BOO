# 🗄️ Database Scripts

Scripts để setup và quản lý database cho NyNus Exam Bank System.

## Scripts có sẵn

### `setup-db.sh`
**Mục đích**: Setup database cho development environment

**Sử dụng**:
```bash
./scripts/database/setup-db.sh
```

**Chức năng**:
- Khởi tạo PostgreSQL database
- Chạy migrations
- Setup initial data
- Tạo user accounts

### `setup-simple-db.sh`
**Mục đích**: Setup simple database configuration

**Sử dụng**:
```bash
./scripts/database/setup-simple-db.sh
```

**Chức năng**:
- Lightweight database setup
- Minimal configuration
- Quick development start

### `gen-db.sh`
**Mục đích**: Generate database schemas và migrations

**Sử dụng**:
```bash
./scripts/database/gen-db.sh
```

**Chức năng**:
- Generate database schemas
- Create migration files
- Update database structure

## Requirements

- **PostgreSQL** 15+
- **Bash** (Linux/WSL/Git Bash)
- **Database credentials** configured

## Environment Variables

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=nynus_exam_bank
export DB_USER=postgres
export DB_PASSWORD=your_password
```

---
**Last Updated**: 21/09/2025

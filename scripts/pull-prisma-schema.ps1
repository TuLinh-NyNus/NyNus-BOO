# Pull Prisma Schema from Database
# =================================================
# ⚠️ DEPRECATION WARNING: Prisma is being phased out in NyNus system
# Backend uses Go with raw SQL, not Prisma ORM
# Frontend should NOT have direct database access
#
# This script is kept for backward compatibility only
# For database schema inspection, use pgAdmin 4 instead:
#   .\scripts\pgadmin.ps1 start
#   Migration guide: docs/database/PGADMIN_SETUP.md
#
# This script pulls the actual database schema into Prisma schema file

Write-Host ""
Write-Host "⚠️  DEPRECATION WARNING ⚠️" -ForegroundColor Yellow
Write-Host "Prisma is being phased out in NyNus system." -ForegroundColor Yellow
Write-Host "Please use pgAdmin 4 for database management:" -ForegroundColor Cyan
Write-Host "  .\scripts\pgadmin.ps1 start" -ForegroundColor Green
Write-Host "  Migration guide: docs/database/PGADMIN_SETUP.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "Pulling Prisma Schema from Database..." -ForegroundColor Cyan

# Check if containers are running
$postgresRunning = docker ps --filter "name=NyNus-postgres" --format "{{.Names}}"
if (-not $postgresRunning) {
    Write-Host "Error: NyNus-postgres container is not running!" -ForegroundColor Red
    exit 1
}

Write-Host "PostgreSQL container is running" -ForegroundColor Green
Write-Host ""

# Run prisma db pull from Docker
Write-Host "Running prisma db pull..." -ForegroundColor Cyan

docker-compose -f docker/compose/docker-compose.yml -f docker/compose/docker-compose.seed.yml run --rm seed sh -c "
  npm install -g pnpm &&
  pnpm install &&
  DATABASE_URL='postgresql://exam_bank_user:exam_bank_password@postgres:5432/exam_bank_db?schema=public&sslmode=disable' pnpx prisma db pull --force
"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Schema pulled successfully!" -ForegroundColor Green
    Write-Host "Please check apps/frontend/prisma/schema.prisma" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Failed to pull schema!" -ForegroundColor Red
    exit 1
}


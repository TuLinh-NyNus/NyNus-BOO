# NyNus Database Seed Script
# Runs database seeding using Docker Compose

Write-Host "NyNus Database Seed" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Check if NyNus-postgres container is running
$postgresRunning = docker ps --filter "name=NyNus-postgres" --format "{{.Names}}"
if (-not $postgresRunning) {
    Write-Host "Error: NyNus-postgres container is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the containers first:" -ForegroundColor Yellow
    Write-Host "  cd docker/compose" -ForegroundColor White
    Write-Host "  docker-compose up -d" -ForegroundColor White
    exit 1
}

Write-Host "PostgreSQL container is running" -ForegroundColor Green
Write-Host ""

# Run seed service
Write-Host "Starting seed service..." -ForegroundColor Cyan
Write-Host ""

$composeFile1 = "docker/compose/docker-compose.yml"
$composeFile2 = "docker/compose/docker-compose.seed.yml"

docker-compose -f $composeFile1 -f $composeFile2 run --rm seed

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Database seeded successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test Data Created:" -ForegroundColor Cyan
    Write-Host "  - 12 Users (2 ADMIN, 3 TEACHER, 4 STUDENT, 2 TUTOR, 1 GUEST)" -ForegroundColor White
    Write-Host "  - 7 Questions (Math, Physics, Chemistry)" -ForegroundColor White
    Write-Host "  - 2 Exams (Official + Practice)" -ForegroundColor White
    Write-Host "  - 2 Exam Attempts" -ForegroundColor White
    Write-Host "  - Authentication tokens and sessions" -ForegroundColor White
    Write-Host ""
    Write-Host "Test Credentials:" -ForegroundColor Cyan
    Write-Host "  Admin:   admin@nynus.com / password123" -ForegroundColor White
    Write-Host "  Teacher: teacher1@nynus.com / password123" -ForegroundColor White
    Write-Host "  Student: student1@nynus.com / password123" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. View data: cd apps/frontend && pnpm prisma:studio" -ForegroundColor White
    Write-Host "  2. Test API: http://localhost:3000/api/test-prisma" -ForegroundColor White
    Write-Host "  3. Login: http://localhost:3000" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Seed failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}


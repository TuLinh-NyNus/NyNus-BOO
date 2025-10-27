@echo off
REM ============================================================================
REM NyNus Exam Bank System - Unified Startup Script
REM ============================================================================
REM Khởi động Backend (Local) + Frontend (Local) + Docker Services
REM
REM Usage:
REM   start.bat              - Start all services
REM   start.bat fix-postgres - Fix PostgreSQL recovery issues
REM ============================================================================

setlocal enabledelayedexpansion

REM Check for fix-postgres command
if "%1"=="fix-postgres" goto FIX_POSTGRES

echo.
echo ============================================================================
echo    NyNus Exam Bank System - Starting...
echo ============================================================================
echo.

REM ============================================================================
REM Check Docker
REM ============================================================================
echo [1/5] Checking Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not running!
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

REM ============================================================================
REM Start Docker Services
REM ============================================================================
echo [2/5] Starting Docker services (PostgreSQL + Redis)...
cd docker\compose
docker-compose -f docker-compose.dev.yml --profile redis --profile prisma --profile full up -d
if errorlevel 1 (
    echo [ERROR] Failed to start Docker services!
    pause
    exit /b 1
)
echo [OK] Docker services started
cd ..\..
echo.

REM ============================================================================
REM Wait for PostgreSQL
REM ============================================================================
echo [3/5] Waiting for PostgreSQL...
set /a count=0
:WAIT_POSTGRES
timeout /t 2 /nobreak >nul
docker exec NyNus-postgres pg_isready -U exam_bank_user -d exam_bank_db >nul 2>&1
if errorlevel 1 (
    set /a count+=1
    if !count! lss 15 (
        echo   Waiting... !count!/15
        goto WAIT_POSTGRES
    ) else (
        echo [ERROR] PostgreSQL failed to start!
        pause
        exit /b 1
    )
)
echo [OK] PostgreSQL is ready
echo.

REM ============================================================================
REM Start Backend
REM ============================================================================
echo [4/5] Starting Backend (Go gRPC Server)...

REM Check Go
where go >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Go is not installed!
    pause
    exit /b 1
)

REM Kill old processes
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":50051"') do (
    if "%%a" neq "0" (
        taskkill /F /PID %%a >nul 2>&1
    )
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do (
    if "%%a" neq "0" (
        taskkill /F /PID %%a >nul 2>&1
    )
)
timeout /t 2 /nobreak >nul

REM Start backend
start "NyNus Backend" cmd /k "cd apps\backend && echo [BE] NyNus Backend Server && echo =============================== && echo gRPC: localhost:50051 && echo HTTP: http://localhost:8080 && echo. && go run cmd/main.go"

echo [OK] Backend started
echo.

REM ============================================================================
REM Start Frontend
REM ============================================================================
echo [5/5] Starting Frontend (Next.js)...

REM Kill old processes
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    if "%%a" neq "0" (
        taskkill /F /PID %%a >nul 2>&1
    )
)
timeout /t 2 /nobreak >nul

REM Check dependencies
if not exist "apps\frontend\node_modules" (
    echo Installing frontend dependencies...
    cd apps\frontend
    call pnpm install
    cd ..\..
)

REM Start frontend
start "NyNus Frontend" cmd /k "cd apps\frontend && echo [FE] NyNus Frontend && echo =============================== && echo Server: http://localhost:3000 && echo. && pnpm dev"

echo [OK] Frontend started
echo.

REM ============================================================================
REM Display URLs
REM ============================================================================
echo ============================================================================
echo    Services Ready!
echo ============================================================================
echo.
echo    Frontend:       http://localhost:3000
echo    Backend HTTP:   http://localhost:8080
echo    Backend gRPC:   localhost:50051
echo    PostgreSQL:     localhost:5433
echo.
echo    Close Backend/Frontend windows to stop them
echo    To stop Docker: docker-compose -f docker\compose\docker-compose.dev.yml down
echo.
pause
exit /b 0

REM ============================================================================
REM FIX POSTGRESQL RECOVERY
REM ============================================================================
:FIX_POSTGRES
echo.
echo ============================================================================
echo    PostgreSQL Recovery Fix
echo ============================================================================
echo.
echo This will fix PostgreSQL recovery issues by:
echo   1. Stopping PostgreSQL container gracefully
echo   2. Removing the container
echo   3. Optionally cleaning volumes (DELETES ALL DATA!)
echo   4. Restarting PostgreSQL
echo.

set /p CONFIRM="Continue? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo [CANCELLED] Operation cancelled
    pause
    exit /b 0
)

echo.
cd docker\compose

REM Step 1: Stop PostgreSQL
echo [1/4] Stopping PostgreSQL...
docker-compose -f docker-compose.dev.yml stop postgres
if errorlevel 1 (
    echo [WARN] Graceful stop failed, forcing...
    docker-compose -f docker-compose.dev.yml kill postgres
)
echo [OK] PostgreSQL stopped
echo.

REM Step 2: Remove container
echo [2/4] Removing container...
docker-compose -f docker-compose.dev.yml rm -f postgres
echo [OK] Container removed
echo.

REM Step 3: Check volumes
echo [3/4] Checking volumes...
for /f %%v in ('docker volume ls -q ^| findstr postgres') do (
    echo Found volume: %%v
    set /p CLEAN="Clean this volume? This DELETES ALL DATA! (y/N): "
    if /i "!CLEAN!"=="y" (
        docker volume rm %%v -f
        echo [DELETED] Volume %%v removed
    )
)
echo [OK] Volume check complete
echo.

REM Step 4: Restart PostgreSQL
echo [4/4] Starting PostgreSQL...
docker-compose -f docker-compose.dev.yml up -d postgres
if errorlevel 1 (
    echo [ERROR] Failed to start PostgreSQL
    cd ..\..
    pause
    exit /b 1
)
echo [OK] PostgreSQL started
echo.

REM Wait for PostgreSQL
echo Waiting for PostgreSQL to be ready...
set /a count=0
:WAIT_PG_FIX
timeout /t 2 /nobreak >nul
docker exec NyNus-postgres pg_isready -U exam_bank_user -d exam_bank_db >nul 2>&1
if errorlevel 1 (
    set /a count+=1
    if !count! lss 30 (
        echo   Attempt !count!/30...
        goto WAIT_PG_FIX
    ) else (
        echo [ERROR] PostgreSQL not ready
        docker-compose -f docker-compose.dev.yml logs postgres --tail=20
        cd ..\..
        pause
        exit /b 1
    )
)
echo [OK] PostgreSQL is ready!
echo.

cd ..\..

echo ============================================================================
echo    PostgreSQL Recovery Complete!
echo ============================================================================
echo.
echo You can now run: start.bat
echo.
pause
exit /b 0

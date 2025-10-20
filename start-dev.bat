@echo off
REM ============================================================================
REM NyNus Exam Bank System - Development Startup Script
REM ============================================================================
REM Khởi động Backend (Local) + Frontend (Local) cho development
REM
REM Services:
REM   - PostgreSQL (Docker) - Port 5433 [Required]
REM   - Redis (Docker) - Port 6379 [Optional]
REM   - Prisma Studio (Docker) - Port 5555 [Optional]
REM   - Backend API (Local) - gRPC: 50051, HTTP: 8080
REM   - Frontend (Local) - Port 3000
REM
REM Usage:
REM   start-dev.bat                    - Start PostgreSQL only
REM   start-dev.bat redis              - Start PostgreSQL + Redis
REM   start-dev.bat prisma             - Start PostgreSQL + Prisma Studio
REM   start-dev.bat full               - Start all services (PostgreSQL + Redis + Prisma Studio)
REM   start-dev.bat stop               - Stop all services
REM ============================================================================

setlocal enabledelayedexpansion

REM Check for Administrator privileges (optional - for firewall config)
set HAS_ADMIN=0
net session >nul 2>&1
if %errorlevel% equ 0 (
    set HAS_ADMIN=1
)

REM Parse command line arguments
set DOCKER_PROFILE=
if "%1"=="stop" goto STOP_SERVICES
if "%1"=="redis" set DOCKER_PROFILE=--profile redis
if "%1"=="prisma" set DOCKER_PROFILE=--profile prisma
if "%1"=="full" set DOCKER_PROFILE=--profile full

echo.
echo ============================================================================
echo    NyNus Exam Bank System - Development Environment
echo ============================================================================
echo.

REM ============================================================================
REM STEP 1: Check Docker Desktop
REM ============================================================================
echo [1/5] Checking Docker Desktop...

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker Desktop is running
echo.

REM ============================================================================
REM STEP 2: Start Docker Services (PostgreSQL + Redis + Prisma Studio)
REM ============================================================================
echo [2/7] Starting Docker services ^(PostgreSQL + Redis + Prisma Studio^)...

cd docker\compose
REM Start all services with profiles: redis, prisma, full
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
REM STEP 3: Wait for PostgreSQL to be healthy
REM ============================================================================
echo [3/6] Waiting for PostgreSQL to be healthy...

REM Wait for PostgreSQL
echo Waiting for PostgreSQL (max 30s)...
set /a count=0
:WAIT_POSTGRES
timeout /t 2 /nobreak >nul
docker exec NyNus-postgres pg_isready -U exam_bank_user -d exam_bank_db >nul 2>&1
if errorlevel 1 (
    set /a count+=1
    if !count! lss 15 (
        echo PostgreSQL not ready yet... !count!/15
        goto WAIT_POSTGRES
    ) else (
        echo [ERROR] PostgreSQL failed to start!
        goto SHOW_LOGS
    )
)
echo [OK] PostgreSQL is ready
echo.

REM ============================================================================
REM STEP 4: Configure Windows Firewall for Backend (Optional)
REM ============================================================================
echo [4/7] Configuring Windows Firewall for Backend...

if "%HAS_ADMIN%"=="1" (
    REM Check if firewall rules already exist
    netsh advfirewall firewall show rule name="NyNus Backend gRPC" >nul 2>&1
    if errorlevel 1 (
        echo Creating Windows Firewall rules...

        REM Create firewall rules for gRPC ^(50051^) and HTTP Gateway ^(8080^)
        netsh advfirewall firewall add rule name="NyNus Backend gRPC" dir^=in action^=allow protocol^=TCP localport^=50051 >nul 2>&1
        netsh advfirewall firewall add rule name="NyNus Backend HTTP" dir^=in action^=allow protocol^=TCP localport^=8080 >nul 2>&1

        if errorlevel 1 (
            echo [WARN] Failed to create firewall rules
        ) else (
            echo [OK] Firewall rules created successfully
        )
    ) else (
        echo [OK] Firewall rules already exist
    )
) else (
    echo [SKIP] No administrator privileges - firewall rules not configured
    echo       You may need to manually allow Backend ports ^(50051, 8080^) in Windows Firewall
)
echo.

REM ============================================================================
REM STEP 5: Start Backend (Local - Go)
REM ============================================================================
echo [5/7] Starting Backend (Go gRPC Server)...

REM Check if Go is installed
where go >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Go is not installed!
    echo Please install Go 1.23.0+ from https://go.dev/dl/
    pause
    exit /b 1
)

REM Check if backend directory exists
if not exist "apps\backend" (
    echo [ERROR] Backend directory not found!
    pause
    exit /b 1
)

REM Check if port 50051 (gRPC) is in use
echo Checking if port 50051 (gRPC) is available...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":50051"') do (
    set "PID=%%a"
    if defined PID (
        echo Port 50051 is in use by PID !PID!
        echo Killing process !PID!...
        taskkill /F /PID !PID! >nul 2>&1
        timeout /t 2 /nobreak >nul
        echo [OK] Port 50051 is now free
    )
)

REM Check if port 8080 (HTTP Gateway) is in use
echo Checking if port 8080 (HTTP) is available...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do (
    set "PID=%%a"
    if defined PID (
        echo Port 8080 is in use by PID !PID!
        echo Killing process !PID!...
        taskkill /F /PID !PID! >nul 2>&1
        timeout /t 2 /nobreak >nul
        echo [OK] Port 8080 is now free
    )
)

REM Start backend in new window
echo Starting Go gRPC server...
start "NyNus Backend" cmd /k "cd apps\backend && echo [BE] NyNus Backend Server && echo ======================== && echo gRPC Server: localhost:50051 && echo HTTP Gateway: http://localhost:8080 && echo. && go run cmd/main.go"

echo [OK] Backend started in new window
echo.

REM ============================================================================
REM STEP 6: Start Frontend (Local - Next.js)
REM ============================================================================
echo [6/7] Starting Frontend (Next.js)...

REM Check if port 3000 is in use
echo Checking if port 3000 is available...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    set "PID=%%a"
    if defined PID (
        echo Port 3000 is in use by PID !PID!
        echo Killing process !PID!...
        taskkill /F /PID !PID! >nul 2>&1
        timeout /t 2 /nobreak >nul
        echo [OK] Port 3000 is now free
    )
)

REM Remove duplicate lockfile if exists (monorepo should use root lockfile only)
if exist "apps\frontend\pnpm-lock.yaml" (
    echo Removing duplicate lockfile in frontend...
    del /f /q "apps\frontend\pnpm-lock.yaml" >nul 2>&1
)

REM Check if node_modules exists
if not exist "apps\frontend\node_modules" (
    echo Installing frontend dependencies...
    cd apps\frontend
    call pnpm install
    cd ..\..
)

REM Start frontend in new window
echo Starting Next.js development server...
start "NyNus Frontend" cmd /k "cd apps\frontend && echo [FE] NyNus Frontend Application && echo =============================== && echo Development Server: http://localhost:3000 && echo. && pnpm dev"

echo [OK] Frontend started in new window
echo.

REM ============================================================================
REM STEP 7: Display Access URLs
REM ============================================================================
echo [7/7] Services Ready!
echo.
echo ============================================================================
echo    Access URLs:
echo ============================================================================
echo.
echo    Frontend:          http://localhost:3000
echo    Admin Dashboard:   http://localhost:3000/3141592654/admin
echo    Backend HTTP:      http://localhost:8080
echo    Backend gRPC:      localhost:50051
echo    PostgreSQL:        localhost:5433
echo.
echo ============================================================================
echo    Useful Commands:
echo ============================================================================
echo.
echo    Stop all services:        start-dev.bat stop
echo    View Docker logs:         docker-compose -f docker\compose\docker-compose.dev.yml logs -f
echo    Restart PostgreSQL:       docker-compose -f docker\compose\docker-compose.dev.yml restart postgres
echo    Database shell:           docker exec -it NyNus-postgres psql -U exam_bank_user -d exam_bank_db
echo    Redis CLI:                docker exec -it NyNus-redis redis-cli -a exam_bank_redis_password
echo    Prisma Studio:            http://localhost:5555
echo.
echo    Note: Backend and Frontend are running locally in separate windows.
echo          Close those windows to stop Backend/Frontend services.
echo.
echo Development environment is ready! Happy coding!
echo.
pause
exit /b 0

REM ============================================================================
REM STOP SERVICES
REM ============================================================================
:STOP_SERVICES
echo.
echo ============================================================================
echo    Stopping NyNus Development Environment
echo ============================================================================
echo.

echo [1/2] Stopping Docker services...
cd docker\compose
docker-compose -f docker-compose.dev.yml --profile redis --profile prisma --profile full down
cd ..\..
echo [OK] Docker services stopped
echo.

echo [2/2] Stopping Backend and Frontend...
echo Please close the Backend and Frontend terminal windows manually
echo.

echo All services stopped!
echo.
pause
exit /b 0

REM ============================================================================
REM SHOW LOGS ON ERROR
REM ============================================================================
:SHOW_LOGS
echo.
echo Showing Docker logs (last 50 lines):
echo.
cd docker\compose
docker-compose -f docker-compose.dev.yml logs --tail=50
cd ..\..
echo.
echo Please check the logs above for errors
echo.
pause
exit /b 1


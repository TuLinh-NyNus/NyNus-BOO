# pgAdmin 4 Management Script
# ================================
# Quản lý pgAdmin 4 trong Docker container
# pgAdmin 4 là công cụ database management thay thế Prisma Studio
#
# Usage:
#   .\scripts\pgadmin.ps1 start   # Khởi động pgAdmin 4
#   .\scripts\pgadmin.ps1 stop    # Dừng pgAdmin 4
#   .\scripts\pgadmin.ps1 restart # Khởi động lại
#   .\scripts\pgadmin.ps1 logs    # Xem logs
#   .\scripts\pgadmin.ps1 status  # Kiểm tra trạng thái

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "logs", "status", "help")]
    [string]$Action = "help"
)

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Get workspace root (where this script is located)
$scriptPath = $PSScriptRoot
if (-not $scriptPath) {
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
}
$workspaceRoot = Split-Path -Parent $scriptPath
Set-Location $workspaceRoot

Write-ColorOutput "[DEBUG] Workspace root: $workspaceRoot" "Gray"

# Docker Compose files (absolute paths)
$baseComposeFile = Join-Path $workspaceRoot "docker\compose\docker-compose.yml"
$pgadminComposeFile = Join-Path $workspaceRoot "docker\compose\docker-compose.pgadmin.yml"

Write-ColorOutput "[DEBUG] Base compose: $baseComposeFile" "Gray"
Write-ColorOutput "[DEBUG] pgAdmin compose: $pgadminComposeFile" "Gray"

# Check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-ColorOutput "[ERROR] Docker is not running. Please start Docker Desktop." "Red"
        return $false
    }
}

# Start pgAdmin 4
function Start-PgAdmin {
    Write-ColorOutput "`n[START] Starting pgAdmin 4..." "Blue"

    if (-not (Test-DockerRunning)) {
        exit 1
    }

    # Detect PostgreSQL container name (support both naming conventions)
    $postgresContainer = docker ps --filter "name=postgres" --filter "status=running" --format "{{.Names}}" | Select-Object -First 1
    if (-not $postgresContainer) {
        Write-ColorOutput "[ERROR] PostgreSQL container is not running. Start it first with:" "Red"
        Write-ColorOutput "  cd docker/compose && docker-compose up -d postgres" "Yellow"
        exit 1
    }

    Write-ColorOutput "[INFO] PostgreSQL is running: $postgresContainer" "Green"

    # Ensure PostgreSQL is connected to exam_bank_network
    Write-ColorOutput "[INFO] Ensuring PostgreSQL is connected to compose_exam_bank_network..." "Cyan"
    $networkCheck = docker network inspect compose_exam_bank_network --format "{{range .Containers}}{{.Name}} {{end}}" 2>$null
    if ($networkCheck -notmatch $postgresContainer) {
        Write-ColorOutput "[FIX] Connecting $postgresContainer to compose_exam_bank_network..." "Yellow"
        docker network connect compose_exam_bank_network $postgresContainer 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "[SUCCESS] $postgresContainer connected to network" "Green"
        } else {
            Write-ColorOutput "[WARNING] Failed to connect network (may already be connected)" "Yellow"
        }
    } else {
        Write-ColorOutput "[OK] $postgresContainer already in compose_exam_bank_network" "Green"
    }

    # Start pgAdmin 4
    docker-compose -f $baseComposeFile -f $pgadminComposeFile up -d pgadmin

    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "`n[SUCCESS] pgAdmin 4 is starting..." "Green"
        Write-ColorOutput "[INFO] Waiting for pgAdmin 4 to be ready..." "Cyan"
        Start-Sleep -Seconds 10

        Write-ColorOutput "`n[INFO] pgAdmin 4 should be accessible at:" "Cyan"
        Write-ColorOutput "  http://localhost:5050" "Yellow"
        Write-ColorOutput "`n[LOGIN] Use these credentials:" "Cyan"
        Write-ColorOutput "  Email: admin@nynus.com" "Yellow"
        Write-ColorOutput "  Password: admin123" "Yellow"
        Write-ColorOutput "`n[NEXT] Add PostgreSQL server connection:" "Cyan"
        Write-ColorOutput "  Host: postgres" "Yellow"
        Write-ColorOutput "  Port: 5432" "Yellow"
        Write-ColorOutput "  Database: exam_bank_db" "Yellow"
        Write-ColorOutput "  Username: exam_bank_user" "Yellow"
        Write-ColorOutput "  Password: exam_bank_password" "Yellow"
        Write-ColorOutput "`n[TIP] View logs with: .\scripts\pgadmin.ps1 logs" "Cyan"
        Write-ColorOutput "[TIP] Full setup guide: docs/database/PGADMIN_SETUP.md" "Cyan"
    } else {
        Write-ColorOutput "`n[ERROR] Failed to start pgAdmin 4" "Red"
        exit 1
    }
}

# Stop pgAdmin 4
function Stop-PgAdmin {
    Write-ColorOutput "`n[STOP] Stopping pgAdmin 4..." "Blue"
    
    docker-compose -f $baseComposeFile -f $pgadminComposeFile stop pgadmin
    docker-compose -f $baseComposeFile -f $pgadminComposeFile rm -f pgadmin
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "[SUCCESS] pgAdmin 4 stopped" "Green"
    } else {
        Write-ColorOutput "[ERROR] Failed to stop pgAdmin 4" "Red"
        exit 1
    }
}

# Restart pgAdmin 4
function Restart-PgAdmin {
    Write-ColorOutput "`n[RESTART] Restarting pgAdmin 4..." "Blue"
    Stop-PgAdmin
    Start-Sleep -Seconds 2
    Start-PgAdmin
}

# View logs
function Show-Logs {
    Write-ColorOutput "`n[LOGS] Showing pgAdmin 4 logs (Ctrl+C to exit)..." "Blue"
    docker-compose -f $baseComposeFile -f $pgadminComposeFile logs -f --tail=100 pgadmin
}

# Check status
function Show-Status {
    Write-ColorOutput "`n[STATUS] pgAdmin 4 Status:" "Cyan"
    Write-ColorOutput "====================================" "Cyan"
    
    $container = docker ps -a --filter "name=nynus-pgadmin" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    if ($container) {
        Write-Host $container
        
        # Check if accessible
        Write-ColorOutput "`n[INFO] Testing connection to http://localhost:5050..." "Cyan"
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5050" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-ColorOutput "[SUCCESS] pgAdmin 4 is accessible!" "Green"
                Write-ColorOutput "  URL: http://localhost:5050" "Yellow"
                Write-ColorOutput "  Login: admin@nynus.com / admin123" "Yellow"
            }
        } catch {
            Write-ColorOutput "[WARNING] pgAdmin 4 container is running but not accessible yet" "Yellow"
            Write-ColorOutput "  It may still be starting up. Wait a few seconds and try again." "Cyan"
        }
    } else {
        Write-ColorOutput "[INFO] pgAdmin 4 is not running" "Yellow"
        Write-ColorOutput "[TIP] Start it with: .\scripts\pgadmin.ps1 start" "Cyan"
    }
}

# Show help
function Show-Help {
    Write-ColorOutput "`npgAdmin 4 Management Script" "Cyan"
    Write-ColorOutput "================================" "Cyan"
    Write-ColorOutput "`nUsage:" "White"
    Write-ColorOutput "  .\scripts\pgadmin.ps1 <action>" "Yellow"
    Write-ColorOutput "`nActions:" "White"
    Write-ColorOutput "  start   - Start pgAdmin 4 in Docker" "Green"
    Write-ColorOutput "  stop    - Stop pgAdmin 4" "Red"
    Write-ColorOutput "  restart - Restart pgAdmin 4" "Yellow"
    Write-ColorOutput "  logs    - View pgAdmin 4 logs" "Cyan"
    Write-ColorOutput "  status  - Check pgAdmin 4 status" "Magenta"
    Write-ColorOutput "  help    - Show this help message" "White"
    Write-ColorOutput "`nExamples:" "White"
    Write-ColorOutput "  .\scripts\pgadmin.ps1 start" "Gray"
    Write-ColorOutput "  .\scripts\pgadmin.ps1 logs" "Gray"
    Write-ColorOutput "`nAccess:" "White"
    Write-ColorOutput "  http://localhost:5050" "Yellow"
    Write-ColorOutput "`nDocumentation:" "White"
    Write-ColorOutput "  docs/database/PGADMIN_SETUP.md" "Yellow"
}

# Main execution
switch ($Action) {
    "start"   { Start-PgAdmin }
    "stop"    { Stop-PgAdmin }
    "restart" { Restart-PgAdmin }
    "logs"    { Show-Logs }
    "status"  { Show-Status }
    "help"    { Show-Help }
    default   { Show-Help }
}


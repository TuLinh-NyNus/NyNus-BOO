# Prisma Studio Management Script
# ================================
# Quản lý Prisma Studio trong Docker container
#
# Usage:
#   .\scripts\prisma-studio.ps1 start   # Khởi động Prisma Studio
#   .\scripts\prisma-studio.ps1 stop    # Dừng Prisma Studio
#   .\scripts\prisma-studio.ps1 restart # Khởi động lại
#   .\scripts\prisma-studio.ps1 logs    # Xem logs
#   .\scripts\prisma-studio.ps1 status  # Kiểm tra trạng thái

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
$prismaComposeFile = Join-Path $workspaceRoot "docker\compose\docker-compose.prisma-studio.yml"

Write-ColorOutput "[DEBUG] Base compose: $baseComposeFile" "Gray"
Write-ColorOutput "[DEBUG] Prisma compose: $prismaComposeFile" "Gray"

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

# Start Prisma Studio
function Start-PrismaStudio {
    Write-ColorOutput "`n⚠️  DEPRECATION WARNING ⚠️" "Yellow"
    Write-ColorOutput "Prisma Studio is being phased out. Please migrate to pgAdmin 4." "Yellow"
    Write-ColorOutput "Migration guide: docs/database/PGADMIN_SETUP.md" "Cyan"
    Write-ColorOutput "Start pgAdmin 4: .\scripts\pgadmin.ps1 start" "Cyan"
    Write-ColorOutput "" "White"

    Write-ColorOutput "`n[START] Starting Prisma Studio..." "Blue"

    if (-not (Test-DockerRunning)) {
        exit 1
    }

    # Check if PostgreSQL is running
    $postgresRunning = docker ps --filter "name=NyNus-postgres" --filter "status=running" --format "{{.Names}}"
    if (-not $postgresRunning) {
        Write-ColorOutput "[ERROR] PostgreSQL container is not running. Start it first with:" "Red"
        Write-ColorOutput "  cd docker/compose && docker-compose up -d postgres" "Yellow"
        exit 1
    }

    Write-ColorOutput "[INFO] PostgreSQL is running: $postgresRunning" "Green"

    # Ensure PostgreSQL is connected to exam_bank_network
    Write-ColorOutput "[INFO] Ensuring PostgreSQL is connected to compose_exam_bank_network..." "Cyan"
    $networkCheck = docker network inspect compose_exam_bank_network --format "{{range .Containers}}{{.Name}} {{end}}" 2>$null
    if ($networkCheck -notmatch "exam_bank_postgres") {
        Write-ColorOutput "[FIX] Connecting exam_bank_postgres to compose_exam_bank_network..." "Yellow"
        docker network connect compose_exam_bank_network exam_bank_postgres 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "[SUCCESS] exam_bank_postgres connected to network" "Green"
        } else {
            Write-ColorOutput "[WARNING] Failed to connect network (may already be connected)" "Yellow"
        }
    } else {
        Write-ColorOutput "[OK] exam_bank_postgres already in compose_exam_bank_network" "Green"
    }

    # Start Prisma Studio
    docker-compose -f $baseComposeFile -f $prismaComposeFile up -d prisma-studio

    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "`n[SUCCESS] Prisma Studio is starting..." "Green"
        Write-ColorOutput "[INFO] Waiting for Prisma Studio to be ready..." "Cyan"
        Start-Sleep -Seconds 10

        Write-ColorOutput "`n[INFO] Prisma Studio should be accessible at:" "Cyan"
        Write-ColorOutput "  http://localhost:5555" "Yellow"
        Write-ColorOutput "`n[TIP] View logs with: .\scripts\prisma-studio.ps1 logs" "Cyan"
    } else {
        Write-ColorOutput "`n[ERROR] Failed to start Prisma Studio" "Red"
        exit 1
    }
}

# Stop Prisma Studio
function Stop-PrismaStudio {
    Write-ColorOutput "`n[STOP] Stopping Prisma Studio..." "Blue"
    
    docker-compose -f $baseComposeFile -f $prismaComposeFile stop prisma-studio
    docker-compose -f $baseComposeFile -f $prismaComposeFile rm -f prisma-studio
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "[SUCCESS] Prisma Studio stopped" "Green"
    } else {
        Write-ColorOutput "[ERROR] Failed to stop Prisma Studio" "Red"
        exit 1
    }
}

# Restart Prisma Studio
function Restart-PrismaStudio {
    Write-ColorOutput "`n[RESTART] Restarting Prisma Studio..." "Blue"
    Stop-PrismaStudio
    Start-Sleep -Seconds 2
    Start-PrismaStudio
}

# View logs
function Show-Logs {
    Write-ColorOutput "`n[LOGS] Showing Prisma Studio logs (Ctrl+C to exit)..." "Blue"
    docker-compose -f $baseComposeFile -f $prismaComposeFile logs -f --tail=100 prisma-studio
}

# Check status
function Show-Status {
    Write-ColorOutput "`n[STATUS] Prisma Studio Status:" "Cyan"
    Write-ColorOutput "====================================" "Cyan"
    
    $container = docker ps -a --filter "name=nynus-prisma-studio" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    if ($container) {
        Write-Host $container
        
        # Check if accessible
        Write-ColorOutput "`n[INFO] Testing connection to http://localhost:5555..." "Cyan"
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5555" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-ColorOutput "[SUCCESS] Prisma Studio is accessible!" "Green"
                Write-ColorOutput "  URL: http://localhost:5555" "Yellow"
            }
        } catch {
            Write-ColorOutput "[WARNING] Prisma Studio container is running but not accessible yet" "Yellow"
            Write-ColorOutput "  It may still be starting up. Wait a few seconds and try again." "Cyan"
        }
    } else {
        Write-ColorOutput "[INFO] Prisma Studio is not running" "Yellow"
        Write-ColorOutput "[TIP] Start it with: .\scripts\prisma-studio.ps1 start" "Cyan"
    }
}

# Show help
function Show-Help {
    Write-ColorOutput "`n⚠️  DEPRECATION WARNING ⚠️" "Yellow"
    Write-ColorOutput "Prisma Studio is being phased out in NyNus system." "Yellow"
    Write-ColorOutput "" "White"
    Write-ColorOutput "Please migrate to pgAdmin 4 for database management:" "Cyan"
    Write-ColorOutput "  .\scripts\pgadmin.ps1 start" "Green"
    Write-ColorOutput "  Migration guide: docs/database/PGADMIN_SETUP.md" "Cyan"
    Write-ColorOutput "" "White"
    Write-ColorOutput "Why pgAdmin 4?" "White"
    Write-ColorOutput "  ✅ Full SQL editor với syntax highlighting" "Gray"
    Write-ColorOutput "  ✅ ER diagrams để visualize schema" "Gray"
    Write-ColorOutput "  ✅ Backup/restore tools" "Gray"
    Write-ColorOutput "  ✅ Query analysis và EXPLAIN plans" "Gray"
    Write-ColorOutput "  ✅ No dual database access anti-pattern" "Gray"
    Write-ColorOutput "" "White"

    Write-ColorOutput "`nPrisma Studio Management Script (Deprecated)" "Cyan"
    Write-ColorOutput "=============================================" "Cyan"
    Write-ColorOutput "`nUsage:" "White"
    Write-ColorOutput "  .\scripts\prisma-studio.ps1 <action>" "Yellow"
    Write-ColorOutput "`nActions:" "White"
    Write-ColorOutput "  start   - Start Prisma Studio in Docker" "Green"
    Write-ColorOutput "  stop    - Stop Prisma Studio" "Red"
    Write-ColorOutput "  restart - Restart Prisma Studio" "Yellow"
    Write-ColorOutput "  logs    - View Prisma Studio logs" "Cyan"
    Write-ColorOutput "  status  - Check Prisma Studio status" "Magenta"
    Write-ColorOutput "  help    - Show this help message" "White"
    Write-ColorOutput "`nExamples:" "White"
    Write-ColorOutput "  .\scripts\prisma-studio.ps1 start" "Gray"
    Write-ColorOutput "  .\scripts\prisma-studio.ps1 logs" "Gray"
    Write-ColorOutput "`nAccess:" "White"
    Write-ColorOutput "  http://localhost:5555" "Yellow"
}

# Main execution
switch ($Action) {
    "start"   { Start-PrismaStudio }
    "stop"    { Stop-PrismaStudio }
    "restart" { Restart-PrismaStudio }
    "logs"    { Show-Logs }
    "status"  { Show-Status }
    "help"    { Show-Help }
    default   { Show-Help }
}


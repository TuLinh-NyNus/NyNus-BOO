# Test Metrics History System
# Verify database migration, scheduler, and data collection

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Metrics History System - Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database connection
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_USER = "postgres"
$DB_NAME = "nynus_exam_system"
$env:PGPASSWORD = "nynus2024"

Write-Host "Database: $DB_USER@$DB_HOST / $DB_NAME" -ForegroundColor Gray
Write-Host ""

# Test 1: Check migration
Write-Host "Test 1: Checking migration 000039..." -ForegroundColor Yellow
$migrationQuery = "SELECT version, applied_at FROM schema_migrations WHERE version = 39;"
try {
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $migrationQuery 2>&1
    if ($LASTEXITCODE -eq 0 -and $result) {
        Write-Host "[OK] Migration 000039 applied" -ForegroundColor Green
        Write-Host "     $result" -ForegroundColor Gray
    } else {
        Write-Host "[SKIP] Migration not applied yet - run backend first" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Could not check migration" -ForegroundColor Red
}

Write-Host ""

# Test 2: Check table exists
Write-Host "Test 2: Checking metrics_history table..." -ForegroundColor Yellow
$tableQuery = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'metrics_history';"
try {
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $tableQuery 2>&1
    $count = $result.Trim()
    if ($count -eq "1") {
        Write-Host "[OK] Table metrics_history exists" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] Table not created yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Could not check table" -ForegroundColor Red
}

Write-Host ""

# Test 3: Check data
Write-Host "Test 3: Checking recorded metrics..." -ForegroundColor Yellow
$countQuery = "SELECT COUNT(*) FROM metrics_history;"
try {
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $countQuery 2>&1
    $recordCount = $result.Trim()
    
    if ([int]$recordCount -gt 0) {
        Write-Host "[OK] Found $recordCount metrics records" -ForegroundColor Green
        
        # Show latest
        Write-Host ""
        Write-Host "Latest metrics snapshot:" -ForegroundColor Cyan
        $latestQuery = "SELECT recorded_at, total_users, active_users, active_sessions FROM metrics_history ORDER BY recorded_at DESC LIMIT 1;"
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $latestQuery
    } else {
        Write-Host "[WAIT] No metrics recorded yet" -ForegroundColor Yellow
        Write-Host "       Start backend and wait 5 minutes for first recording" -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] Could not query metrics" -ForegroundColor Red
}

Write-Host ""

# Test 4: Show sparkline data
Write-Host "Test 4: Sparkline data (last 7 points)..." -ForegroundColor Yellow
$sparklineQuery = "SELECT total_users, active_users FROM metrics_history ORDER BY recorded_at DESC LIMIT 7;"
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $sparklineQuery
} catch {
    Write-Host "[INFO] Not enough data yet" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Start backend: cd apps\backend; .\backend.exe" -ForegroundColor Gray
Write-Host "  2. Wait 5 minutes for first metrics recording" -ForegroundColor Gray
Write-Host "  3. Visit dashboard: http://localhost:3000/3141592654/admin" -ForegroundColor Gray
Write-Host "  4. See beautiful sparklines with REAL DATA!" -ForegroundColor Gray
Write-Host ""

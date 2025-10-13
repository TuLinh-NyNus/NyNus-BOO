# NyNus System Connectivity Test Script
# Kiểm tra kết nối giữa Frontend, Backend và Database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NYNUS CONNECTIVITY TEST REPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to test port connectivity
function Test-Port {
    param(
        [string]$HostName,
        [int]$Port,
        [string]$ServiceName
    )

    $result = Test-NetConnection -ComputerName $HostName -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue

    if ($result) {
        Write-Host "✅ $ServiceName (${HostName}:${Port}): CONNECTED" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $ServiceName (${HostName}:${Port}): FAILED" -ForegroundColor Red
        return $false
    }
}

# Function to test HTTP endpoint
function Test-HttpEndpoint {
    param(
        [string]$Url,
        [string]$ServiceName
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $ServiceName ($Url): HEALTHY" -ForegroundColor Green
            Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host "❌ $ServiceName ($Url): FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

Write-Host "1. DOCKER CONTAINERS STATUS" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Out-String | Write-Host
Write-Host ""

Write-Host "2. PORT CONNECTIVITY TESTS" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
$portTests = @(
    @{HostName="localhost"; Port=5432; Name="PostgreSQL Database"},
    @{HostName="localhost"; Port=50051; Name="Backend gRPC Server"},
    @{HostName="localhost"; Port=8080; Name="Backend HTTP Gateway"},
    @{HostName="localhost"; Port=3000; Name="Frontend Next.js"}
)

$portResults = @{}
foreach ($test in $portTests) {
    $portResults[$test.Name] = Test-Port -HostName $test.HostName -Port $test.Port -ServiceName $test.Name
}
Write-Host ""

Write-Host "3. HTTP HEALTH CHECKS" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
$httpTests = @(
    @{Url="http://localhost:8080/health"; Name="Backend Health Endpoint"}
)

$httpResults = @{}
foreach ($test in $httpTests) {
    $httpResults[$test.Name] = Test-HttpEndpoint -Url $test.Url -ServiceName $test.Name
}
Write-Host ""

Write-Host "4. DATABASE CONNECTION TEST" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
try {
    $dbTest = docker exec exam_bank_postgres psql -U exam_bank_user -d exam_bank_db -c "SELECT COUNT(*) as total_users FROM users;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database Query: SUCCESS" -ForegroundColor Green
        Write-Host "   $dbTest" -ForegroundColor Gray
    } else {
        Write-Host "❌ Database Query: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Database Query: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "5. DOCKER NETWORK INSPECTION" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
try {
    $networkInfo = docker network inspect compose_exam_bank_network --format "{{range .Containers}}{{.Name}}: {{.IPv4Address}}`n{{end}}" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Network Configuration:" -ForegroundColor Green
        Write-Host $networkInfo -ForegroundColor Gray
    } else {
        Write-Host "❌ Network Inspection: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Network Inspection: FAILED" -ForegroundColor Red
}
Write-Host ""

Write-Host "6. BACKEND LOGS (Last 10 lines)" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
docker logs exam_bank_backend --tail 10 2>&1 | Write-Host -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$totalTests = $portResults.Count + $httpResults.Count
$passedTests = ($portResults.Values | Where-Object {$_ -eq $true}).Count + ($httpResults.Values | Where-Object {$_ -eq $true}).Count

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "✅ ALL TESTS PASSED - System is fully operational!" -ForegroundColor Green
} else {
    Write-Host "⚠️  SOME TESTS FAILED - Please check the details above" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not $portResults["Frontend Next.js"]) {
    Write-Host "❌ Frontend is not running" -ForegroundColor Red
    Write-Host "   To start Frontend:" -ForegroundColor Yellow
    Write-Host "   cd docker/compose" -ForegroundColor Gray
    Write-Host "   docker-compose up -d frontend" -ForegroundColor Gray
    Write-Host ""
}

if (-not $portResults["Backend gRPC Server"] -or -not $portResults["Backend HTTP Gateway"]) {
    Write-Host "❌ Backend is not fully operational" -ForegroundColor Red
    Write-Host "   Check backend logs:" -ForegroundColor Yellow
    Write-Host "   docker logs exam_bank_backend" -ForegroundColor Gray
    Write-Host ""
}

if (-not $portResults["PostgreSQL Database"]) {
    Write-Host "❌ Database is not accessible" -ForegroundColor Red
    Write-Host "   Check database logs:" -ForegroundColor Yellow
    Write-Host "   docker logs exam_bank_postgres" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan


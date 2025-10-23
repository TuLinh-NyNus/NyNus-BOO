# ========================================
# Login Test Script
# ========================================
# Purpose: Test login functionality with various accounts
# Usage: .\scripts\test-login.ps1
# ========================================

$ErrorActionPreference = "Stop"

# Configuration
$BACKEND_URL = "http://localhost:8080"
$LOGIN_ENDPOINT = "$BACKEND_URL/v1.UserService/Login"

# Test accounts
$testAccounts = @(
    @{
        Name = "Student Account (.edu.vn)"
        Email = "student1@nynus.edu.vn"
        Password = "Abd8stbcs!"
        ExpectedSuccess = $true
    },
    @{
        Name = "Student Account (.com)"
        Email = "student@exambank.com"
        Password = "Abd8stbcs!"
        ExpectedSuccess = $true
    },
    @{
        Name = "Admin Account"
        Email = "admin1@nynus.edu.vn"
        Password = "Abd8stbcs!"
        ExpectedSuccess = $true
    },
    @{
        Name = "Teacher Account"
        Email = "teacher1@nynus.edu.vn"
        Password = "Abd8stbcs!"
        ExpectedSuccess = $true
    },
    @{
        Name = "Tutor Account"
        Email = "tutor1@nynus.edu.vn"
        Password = "Abd8stbcs!"
        ExpectedSuccess = $true
    },
    @{
        Name = "Previously SUSPENDED Account"
        Email = "student1@nynus.edu.vn"
        Password = "Abd8stbcs!"
        ExpectedSuccess = $true
    },
    @{
        Name = "Previously INACTIVE Account"
        Email = "student16@nynus.edu.vn"
        Password = "Abd8stbcs!"
        ExpectedSuccess = $true
    },
    @{
        Name = "Wrong Password"
        Email = "student1@nynus.edu.vn"
        Password = "WrongPassword123!"
        ExpectedSuccess = $false
    },
    @{
        Name = "Non-existent Email"
        Email = "nonexistent@nynus.edu.vn"
        Password = "Abd8stbcs!"
        ExpectedSuccess = $false
    }
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LOGIN TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor Yellow
Write-Host "Login Endpoint: $LOGIN_ENDPOINT" -ForegroundColor Yellow
Write-Host ""

# Test results
$totalTests = $testAccounts.Count
$passedTests = 0
$failedTests = 0
$results = @()

foreach ($account in $testAccounts) {
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host "Test: $($account.Name)" -ForegroundColor White
    Write-Host "Email: $($account.Email)" -ForegroundColor Gray
    Write-Host "Expected: $(if ($account.ExpectedSuccess) { 'SUCCESS' } else { 'FAILURE' })" -ForegroundColor Gray
    
    try {
        # Prepare request body
        $body = @{
            email = $account.Email
            password = $account.Password
        } | ConvertTo-Json
        
        # Make login request
        $response = Invoke-WebRequest -Uri $LOGIN_ENDPOINT `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        # Parse response
        $data = $response.Content | ConvertFrom-Json
        
        # Check if login succeeded
        if ($response.StatusCode -eq 200 -and $data.accessToken) {
            if ($account.ExpectedSuccess) {
                Write-Host "✅ PASS - Login successful" -ForegroundColor Green
                Write-Host "   Access Token: $($data.accessToken.Substring(0, 20))..." -ForegroundColor DarkGray
                Write-Host "   User ID: $($data.user.id)" -ForegroundColor DarkGray
                Write-Host "   User Role: $($data.user.role)" -ForegroundColor DarkGray
                $passedTests++
                $results += @{
                    Test = $account.Name
                    Status = "PASS"
                    Message = "Login successful"
                }
            } else {
                Write-Host "❌ FAIL - Login succeeded but should have failed" -ForegroundColor Red
                $failedTests++
                $results += @{
                    Test = $account.Name
                    Status = "FAIL"
                    Message = "Login succeeded but should have failed"
                }
            }
        } else {
            Write-Host "❌ FAIL - Unexpected response" -ForegroundColor Red
            Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Red
            $failedTests++
            $results += @{
                Test = $account.Name
                Status = "FAIL"
                Message = "Unexpected response: $($response.StatusCode)"
            }
        }
    } catch {
        $errorMessage = $_.Exception.Message
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if (-not $account.ExpectedSuccess) {
            Write-Host "✅ PASS - Login failed as expected" -ForegroundColor Green
            Write-Host "   Status Code: $statusCode" -ForegroundColor DarkGray
            Write-Host "   Error: $errorMessage" -ForegroundColor DarkGray
            $passedTests++
            $results += @{
                Test = $account.Name
                Status = "PASS"
                Message = "Login failed as expected (HTTP $statusCode)"
            }
        } else {
            Write-Host "❌ FAIL - Login failed but should have succeeded" -ForegroundColor Red
            Write-Host "   Status Code: $statusCode" -ForegroundColor Red
            Write-Host "   Error: $errorMessage" -ForegroundColor Red
            $failedTests++
            $results += @{
                Test = $account.Name
                Status = "FAIL"
                Message = "Login failed: HTTP $statusCode - $errorMessage"
            }
        }
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })
Write-Host ""

# Detailed results
Write-Host "Detailed Results:" -ForegroundColor Yellow
foreach ($result in $results) {
    $color = if ($result.Status -eq "PASS") { "Green" } else { "Red" }
    $icon = if ($result.Status -eq "PASS") { "✅" } else { "❌" }
    Write-Host "$icon $($result.Test): $($result.Message)" -ForegroundColor $color
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Exit with appropriate code
if ($failedTests -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️ SOME TESTS FAILED!" -ForegroundColor Red
    exit 1
}


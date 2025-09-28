# Safe Cleanup Script for Exam Bank System
# Generated: 2025-01-19
# Purpose: Remove unnecessary files safely

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

Write-Host "Exam Bank System - Safe Cleanup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be deleted" -ForegroundColor Yellow
}

$FilesRemoved = 0
$SpaceSaved = 0

function Remove-FileIfExists {
    param(
        [string]$FilePath,
        [string]$Description
    )
    
    if (Test-Path $FilePath) {
        $FileSize = (Get-Item $FilePath).Length
        
        if ($Verbose) {
            Write-Host "  Found: $FilePath ($([math]::Round($FileSize/1KB, 2)) KB)" -ForegroundColor Gray
        }

        if (-not $DryRun) {
            try {
                Remove-Item $FilePath -Force
                Write-Host "  Removed: $Description" -ForegroundColor Green
                $script:FilesRemoved++
                $script:SpaceSaved += $FileSize
            }
            catch {
                Write-Host "  Failed to remove: $FilePath - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "  Would remove: $Description" -ForegroundColor Yellow
            $script:FilesRemoved++
            $script:SpaceSaved += $FileSize
        }
    }
    else {
        if ($Verbose) {
            Write-Host "  Not found: $FilePath" -ForegroundColor Gray
        }
    }
}

function Remove-DirectoryIfExists {
    param(
        [string]$DirectoryPath,
        [string]$Description
    )
    
    if (Test-Path $DirectoryPath) {
        $DirSize = (Get-ChildItem $DirectoryPath -Recurse | Measure-Object -Property Length -Sum).Sum
        
        if ($Verbose) {
            Write-Host "  Found: $DirectoryPath ($([math]::Round($DirSize/1MB, 2)) MB)" -ForegroundColor Gray
        }

        if (-not $DryRun) {
            try {
                Remove-Item $DirectoryPath -Recurse -Force
                Write-Host "  Removed: $Description" -ForegroundColor Green
                $script:FilesRemoved++
                $script:SpaceSaved += $DirSize
            }
            catch {
                Write-Host "  Failed to remove: $DirectoryPath - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "  Would remove: $Description" -ForegroundColor Yellow
            $script:FilesRemoved++
            $script:SpaceSaved += $DirSize
        }
    }
    else {
        if ($Verbose) {
            Write-Host "  Not found: $DirectoryPath" -ForegroundColor Gray
        }
    }
}

# Phase 1: Remove Executable Files
Write-Host "`nPhase 1: Removing Executable Files" -ForegroundColor Red
Remove-FileIfExists "apps\backend\bin\backend.exe" "Backend executable"
Remove-FileIfExists "apps\backend\cmd.exe" "Command executable"
Remove-FileIfExists "apps\backend\main.exe" "Main executable"

# Phase 2: Remove Backup Files
Write-Host "`nPhase 2: Removing Backup Files" -ForegroundColor Yellow
Remove-FileIfExists "apps\backend\internal\grpc\preference_service.go.bak" "Preference service backup"
Remove-FileIfExists "apps\backend\internal\service\domain_service\auth\auth.go.backup" "Auth service backup"

# Phase 3: Remove Generated Files
Write-Host "`nPhase 3: Removing Generated Files" -ForegroundColor Green
Remove-FileIfExists "complete-tree-full.txt" "Complete tree file"
Remove-FileIfExists "complete-tree.txt" "Tree file"
Remove-FileIfExists "tree-output.txt" "Tree output file"
Remove-FileIfExists "tree-structure.txt" "Tree structure file"
Remove-FileIfExists "full-file-list.txt" "Full file list"
Remove-FileIfExists "test-files-list.txt" "Test files list"
Remove-FileIfExists "cleanup-files-list.txt" "Cleanup files list"

# Phase 4: Clear Jest Cache
Write-Host "`nPhase 4: Clearing Jest Cache" -ForegroundColor Blue
Remove-DirectoryIfExists "apps\frontend\.jest-cache" "Jest cache directory"

# Phase 5: Remove Test Temp Directories
Write-Host "`nPhase 5: Removing Test Temp Directories" -ForegroundColor Magenta
Remove-DirectoryIfExists "apps\backend\internal\service\service_mgmt\image_processing\test_cache" "Test cache directory"
Remove-DirectoryIfExists "apps\backend\internal\service\service_mgmt\image_processing\test_output" "Test output directory"
Remove-DirectoryIfExists "apps\backend\internal\service\service_mgmt\image_processing\test_tmp" "Test temp directory"

# Summary
Write-Host "`nCleanup Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Files/Directories processed: $FilesRemoved" -ForegroundColor White
Write-Host "Space saved: $([math]::Round($SpaceSaved/1MB, 2)) MB" -ForegroundColor White

if ($DryRun) {
    Write-Host "`nThis was a dry run. To actually remove files, run:" -ForegroundColor Yellow
    Write-Host "   .\scripts\cleanup\safe-cleanup.ps1" -ForegroundColor White
}
else {
    Write-Host "`nCleanup completed successfully!" -ForegroundColor Green
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Update .gitignore to prevent these files from being committed again" -ForegroundColor White
Write-Host "2. Run git status to see changes" -ForegroundColor White
Write-Host "3. Commit the cleanup changes" -ForegroundColor White

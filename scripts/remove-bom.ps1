# Remove UTF-8 BOM from Go files
# This script safely removes UTF-8 BOM (Byte Order Mark) from all Go files in the backend
# BOM is sometimes added by Windows text editors and causes "invalid BOM in the middle of the file" errors

param(
    [string]$Path = "apps/backend",
    [int]$Count = 0
)

Write-Host "🧹 Removing UTF-8 BOM from Go files in $Path..." -ForegroundColor Green

Get-ChildItem -Path $Path -Recurse -Filter "*.go" -ErrorAction SilentlyContinue | ForEach-Object {
    $filePath = $_.FullName
    $content = [System.IO.File]::ReadAllBytes($filePath)
    
    # Check if file has UTF-8 BOM (0xEF 0xBB 0xBF)
    if ($content.Length -gt 3 -and $content[0] -eq 0xEF -and $content[1] -eq 0xBB -and $content[2] -eq 0xBF) {
        try {
            # Remove BOM by keeping only bytes from position 3 onwards
            $newContent = $content[3..($content.Length-1)]
            [System.IO.File]::WriteAllBytes($filePath, $newContent)
            Write-Host "  ✓ Removed BOM: $($_.Name)" -ForegroundColor Yellow
            $Count++
        } catch {
            Write-Host "  ✗ Error processing $($_.Name): $_" -ForegroundColor Red
        }
    }
}

Write-Host "✅ Removed BOM from $Count files" -ForegroundColor Green

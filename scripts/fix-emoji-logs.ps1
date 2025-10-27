# Fix emoji in log messages for Windows PowerShell compatibility

param(
    [string]$TargetFile = ""
)

function Fix-EmojiInFile {
    param([string]$FilePath)
    
    Write-Host "Processing: $FilePath"
    
    # Read file content
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    
    # Replace emojis with text-based prefixes using Unicode codepoints
    $replacements = @{
        # Using literal emoji characters
        "`u{1F680}" = "[STARTUP]" # Rocket
        "`u{1F527}" = "[CONFIG]"  # Wrench  
        "`u{2705}" = "[OK]"       # Check mark
        "`u{274C}" = "[ERROR]"    # Cross mark
        "`u{26A0}" = "[WARN]"     # Warning
        "`u{1F310}" = "[NETWORK]" # Globe
        "`u{1F512}" = "[SECURITY]" # Lock
        "`u{1F50D}" = "[NETWORK]" # Magnifying glass
        "`u{1F5C4}" = "[DATABASE]" # File cabinet
        "`u{1F4CB}" = "[PUBLIC]"  # Clipboard
        "`u{1F514}" = "[SERVICE]" # Bell
        "`u{1F50C}" = "[SHUTDOWN]" # Electric plug
        "`u{1F6D1}" = "[SHUTDOWN]" # Stop sign
        "`u{1F9F9}" = "[CLEANUP]" # Broom
        "`u{1F4C4}" = "[MIGRATION]" # Page
        "`u{1F504}" = "[MIGRATION]" # Counterclockwise arrows
    }
    
    foreach ($emoji in $replacements.Keys) {
        $replacement = $replacements[$emoji]
        $content = $content -replace [regex]::Escape($emoji), $replacement
    }
    
    # Additional cleanup for garbled text
    $content = $content -replace '[ðŸšðŸâœ…âŒâš ]', ''
    
    # Write back to file
    Set-Content $FilePath $content -Encoding UTF8 -NoNewline
    
    Write-Host "Fixed emojis in: $FilePath"
}

# Main execution
if ($TargetFile) {
    Fix-EmojiInFile $TargetFile
} else {
    # Fix all Go files with emojis
    $files = @(
        "apps\backend\cmd\main.go",
        "apps\backend\internal\app\app.go",
        "apps\backend\internal\migration\migration.go"
    )
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            Fix-EmojiInFile $file
        }
    }
}

Write-Host "Done!"


# Bump Version Script (PowerShell)

# Get current version from pubspec.yaml
$content = Get-Content pubspec.yaml
$versionLine = $content | Select-String "version:"
$currentVersion = $versionLine.ToString().Split()[1]
$versionParts = $currentVersion.Split('+')
$versionName = $versionParts[0]
$buildNumber = [int]$versionParts[1]

# Increment build number
$newBuildNumber = $buildNumber + 1
$newVersion = "$versionName+$newBuildNumber"

# Update pubspec.yaml
(Get-Content pubspec.yaml) -replace "version: .*", "version: $newVersion" | Set-Content pubspec.yaml

Write-Host "Version bumped from $currentVersion to $newVersion" -ForegroundColor Green
Write-Host "NEW_VERSION=$newVersion"


Set-Location 'D:\exam-bank-system\apps\backend'
$ErrorActionPreference = 'Continue'
.\backend.exe 2>&1 | Tee-Object -FilePath backend-startup.log

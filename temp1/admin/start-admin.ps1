# NyNus Admin System Startup Script
# Script khởi động hệ thống admin NyNus

Write-Host "🚀 Starting NyNus Admin System..." -ForegroundColor Green

# Start Backend API
Write-Host "📡 Starting Admin Backend API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\BE'; pnpm install; pnpm start:dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Dashboard
Write-Host "🎨 Starting Admin Frontend Dashboard..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\FE'; pnpm install; pnpm dev"

Write-Host "✅ Admin System is starting up!" -ForegroundColor Green
Write-Host "📊 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔐 Admin Panel: http://localhost:3000/3141592654" -ForegroundColor Cyan
Write-Host "📡 Backend API: http://localhost:4000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:4000/api/docs" -ForegroundColor Cyan

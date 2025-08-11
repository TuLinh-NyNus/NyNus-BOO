@echo off
REM LaTeX Question Parser - Quick Start
REM Fast startup with minimal setup

title LaTeX Parser - Quick Start

cd /d "%~dp0"

echo.
echo LaTeX Question Parser - Quick Start
echo ===================================
echo.

REM Quick Python check
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found! Install from: https://python.org
    pause
    exit /b 1
)

REM Quick Streamlit check & install
python -c "import streamlit" >nul 2>&1
if errorlevel 1 (
    echo Installing Streamlit...
    python -m pip install streamlit
)

REM Kill old processes
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8501" 2^>nul') do taskkill /f /pid %%a >nul 2>&1

REM Start
echo Starting... Browser will open automatically
echo URL: http://localhost:8501
echo Press Ctrl+C to stop
echo.

streamlit run streamlit_app.py --server.port=8501 --browser.gatherUsageStats=false

echo.
echo Stopped. Double-click to restart.
pause
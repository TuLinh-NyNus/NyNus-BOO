@echo off
REM LaTeX Question Parser - Simple Launcher
REM Auto setup and run Streamlit app

title LaTeX Question Parser

REM Change to script directory
cd /d "%~dp0"

echo.
echo ====================================================================
echo                    LaTeX Question Parser
echo ====================================================================
echo.

REM Check Python
echo [1/4] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python from https://python.org
    pause
    exit /b 1
)
echo OK: Python found

REM Check pip and install dependencies
echo [2/4] Installing dependencies...
python -m pip install streamlit pandas numpy
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo OK: Dependencies installed

REM Check files
echo [3/4] Checking files...
if not exist "streamlit_app.py" (
    echo ERROR: streamlit_app.py not found!
    pause
    exit /b 1
)
if not exist "src" (
    echo ERROR: src directory not found!
    pause
    exit /b 1
)
echo OK: Files found

REM Create output directory
if not exist "output" mkdir output

REM Kill old processes on port 8501
echo [4/4] Starting application...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8501" 2^>nul') do taskkill /f /pid %%a >nul 2>&1

echo.
echo ====================================================================
echo                          STARTING...
echo.
echo  URL: http://localhost:8501
echo  Press Ctrl+C to stop
echo ====================================================================
echo.

REM Start Streamlit
streamlit run streamlit_app.py --server.port=8501

echo.
echo Application stopped.
pause
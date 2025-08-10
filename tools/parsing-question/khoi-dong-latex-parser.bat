@echo off
chcp 65001 >nul 2>&1
REM ============================================================================
REM LaTeX Question Parser - Simple Launcher
REM File don gian de khoi dong ung dung
REM ============================================================================

title LaTeX Question Parser

REM Chuyen den thu muc script
cd /d "%~dp0"

REM Header dep
echo.
echo  ================================================================
echo                      LaTeX Question Parser                     
echo                     Dang khoi dong ung dung...                       
echo  ================================================================
echo.

REM Kiem tra Python nhanh
python --version >nul 2>&1
if errorlevel 1 (
    echo  [X] Python chua duoc cai dat!
    echo  [!] Vui long tai Python tu: https://python.org
    echo.
    pause
    exit /b 1
)

echo  [OK] Python OK
echo  [INFO] Dang kiem tra Streamlit...

REM Cai dat Streamlit neu chua co
python -c "import streamlit" >nul 2>&1
if errorlevel 1 (
    echo  [INSTALL] Dang cai dat Streamlit...
    pip install streamlit >nul 2>&1
)

echo  [OK] Streamlit OK
echo  [START] Dang khoi dong ung dung...
echo.

REM Kill process cu neu co
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8501" 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Khoi dong Streamlit
echo  [URL] http://localhost:8501
echo  [STOP] Nhan Ctrl+C de dung
echo.
echo  ================================================================
echo    Ung dung da san sang! Browser se tu dong mo...
echo  ================================================================
echo.

streamlit run streamlit_app.py --server.port=8501 --browser.gatherUsageStats=false

REM Khi dung
echo.
echo  ================================================================
echo                      Ung dung da dung                       
echo                  Double-click de chay lai                     
echo  ================================================================
echo.
pause

@echo off
chcp 65001 >nul 2>&1
REM ============================================================================
REM LaTeX Question Parser - Streamlit Launcher
REM Tu dong khoi dong ung dung parsing LaTeX questions
REM ============================================================================

title LaTeX Question Parser - Starting...

echo.
echo ========================================
echo   LaTeX Question Parser
echo   Streamlit Launcher v1.0
echo ========================================
echo.

REM Chuyen den thu muc script
cd /d "%~dp0"

echo [INFO] Dang kiem tra moi truong Python...

REM Kiem tra Python co ton tai khong
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python khong duoc tim thay!
    echo [INFO] Vui long cai dat Python tu: https://python.org
    echo.
    pause
    exit /b 1
)

echo [INFO] Python da duoc tim thay.

REM Kiem tra pip
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip khong duoc tim thay!
    echo [INFO] Vui long cai dat pip hoac cai lai Python.
    echo.
    pause
    exit /b 1
)

echo [INFO] pip da duoc tim thay.

REM Kiem tra Streamlit
echo [INFO] Dang kiem tra Streamlit...
python -c "import streamlit" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Streamlit chua duoc cai dat.
    echo [INFO] Dang cai dat Streamlit...
    pip install streamlit
    if errorlevel 1 (
        echo [ERROR] Khong the cai dat Streamlit!
        echo [INFO] Vui long chay: pip install streamlit
        echo.
        pause
        exit /b 1
    )
    echo [INFO] Streamlit da duoc cai dat thanh cong.
)

REM Kiem tra cac dependencies khac
echo [INFO] Dang kiem tra dependencies...
python -c "import pandas, numpy" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Mot so dependencies chua duoc cai dat.
    echo [INFO] Dang cai dat dependencies...
    pip install pandas numpy
)

REM Kiem tra file streamlit_app.py
if not exist "streamlit_app.py" (
    echo [ERROR] Khong tim thay file streamlit_app.py!
    echo [INFO] Vui long dam bao file nay ton tai trong thu muc hien tai.
    echo.
    pause
    exit /b 1
)

echo [INFO] Tat ca dependencies da san sang.
echo.

REM Kiem tra port 8501 co bi chiem dung khong
echo [INFO] Dang kiem tra port 8501...
netstat -an | find ":8501" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 8501 dang duoc su dung.
    echo [INFO] Dang co gang dung process cu...
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":8501"') do (
        taskkill /f /pid %%a >nul 2>&1
    )
    timeout /t 2 >nul
)

echo [INFO] Port 8501 da san sang.
echo.

REM Khoi dong Streamlit
echo ========================================
echo   Dang khoi dong Streamlit...
echo ========================================
echo.
echo [INFO] URL: http://localhost:8501
echo [INFO] Nhan Ctrl+C de dung ung dung
echo.

REM Khoi dong Streamlit voi cau hinh toi uu
streamlit run streamlit_app.py ^
    --server.port=8501 ^
    --server.address=localhost ^
    --server.headless=false ^
    --browser.gatherUsageStats=false ^
    --server.fileWatcherType=none

REM Neu Streamlit bi dung
echo.
echo ========================================
echo   Streamlit da dung
echo ========================================
echo.
echo [INFO] Ung dung da duoc dong.
echo [INFO] Ban co the chay lai file nay de khoi dong lai.
echo.
pause

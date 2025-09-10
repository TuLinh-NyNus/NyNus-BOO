@echo off
chcp 65001 >nul
echo ========================================
echo   LaTeX Image Processor
echo ========================================
echo.
echo Đang khởi động server...
echo Truy cập tại: http://localhost:8501
echo.
echo Nhấn Ctrl+C để dừng server
echo.

:: Tìm Python command
set PYTHON_CMD=python
python --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if errorlevel 1 (
        if exist "C:\Python313\python.exe" (
            set PYTHON_CMD=C:\Python313\python.exe
        ) else if exist "C:\Python312\python.exe" (
            set PYTHON_CMD=C:\Python312\python.exe
        ) else (
            echo ❌ Không tìm thấy Python! Vui lòng chạy setup.bat trước
            pause
            exit /b 1
        )
    ) else (
        set PYTHON_CMD=py
    )
)

%PYTHON_CMD% -m streamlit run app.py --server.port 8501 --server.headless true

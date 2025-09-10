@echo off
chcp 65001 >nul
echo ========================================
echo   Clear Cache & Restart Streamlit
echo ========================================
echo.

echo [1/3] Dọn dẹp Python cache...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
del /s /q *.pyc >nul 2>&1
echo ✅ Đã xóa Python cache

echo.
echo [2/3] Clear Streamlit cache...
if exist "%USERPROFILE%\.streamlit" (
    rmdir /s /q "%USERPROFILE%\.streamlit" >nul 2>&1
    echo ✅ Đã xóa Streamlit cache
)

echo.
echo [3/3] Restart Streamlit với force reload...

:: Tìm Python command
set PYTHON_CMD=python
python --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if not errorlevel 1 set PYTHON_CMD=py
)

echo.
echo 🚀 Khởi động Streamlit...
echo Truy cập tại: http://localhost:8501
echo.
echo Nhấn Ctrl+C để dừng server
echo.

%PYTHON_CMD% -m streamlit run app.py --server.runOnSave=true --server.fileWatcherType=auto

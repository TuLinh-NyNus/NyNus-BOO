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

streamlit run app.py --server.port 8501 --server.headless true

@echo off
chcp 65001 >nul
echo ========================================
echo   LaTeX Image Processor - Setup
echo ========================================
echo.

echo [1/4] Kiểm tra Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Không tìm thấy Python! Vui lòng cài đặt Python 3.9+
    echo Tải từ: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python đã được cài đặt

echo.
echo [2/4] Kiểm tra pdflatex...
pdflatex --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Cảnh báo: pdflatex chưa được cài đặt!
    echo Tool vẫn có thể chạy nhưng không thể compile TikZ
    echo Tải MiKTeX từ: https://miktex.org/download
    echo.
)

echo [3/4] Cài đặt dependencies Python...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Lỗi khi cài đặt dependencies!
    pause
    exit /b 1
)
echo ✅ Dependencies đã được cài đặt

echo.
echo [4/4] Kiểm tra poppler-utils...
where pdftoppm >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Cảnh báo: poppler-utils chưa được cài đặt!
    echo Cần thiết để convert PDF sang hình ảnh
    echo.
    echo Hướng dẫn cài đặt:
    echo 1. Tải từ: https://github.com/oschwartz10612/poppler-windows/releases/
    echo 2. Giải nén vào C:\poppler
    echo 3. Thêm C:\poppler\Library\bin vào PATH
    echo.
)

echo.
echo ========================================
echo   Cài đặt hoàn tất!
echo ========================================
echo.
echo Đang khởi động LaTeX Image Processor...
echo Truy cập tại: http://localhost:8501
echo.
echo Nhấn Ctrl+C để dừng server
echo.

streamlit run app.py

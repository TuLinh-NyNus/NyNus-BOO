@echo off
chcp 65001 >nul
echo ========================================
echo   LaTeX Image Processor - Setup
echo ========================================
echo.

echo [1/4] Kiểm tra Python...
set PYTHON_CMD=python

:: Kiểm tra python command
python --version >nul 2>&1
if errorlevel 1 (
    :: Thử với py command
    py --version >nul 2>&1
    if errorlevel 1 (
        :: Thử tìm Python trong các thư mục phổ biến
        if exist "C:\Python313\python.exe" (
            set PYTHON_CMD=C:\Python313\python.exe
            echo ✅ Tìm thấy Python tại C:\Python313
        ) else if exist "C:\Python312\python.exe" (
            set PYTHON_CMD=C:\Python312\python.exe
            echo ✅ Tìm thấy Python tại C:\Python312
        ) else if exist "C:\Python311\python.exe" (
            set PYTHON_CMD=C:\Python311\python.exe
            echo ✅ Tìm thấy Python tại C:\Python311
        ) else (
            echo ❌ Không tìm thấy Python! Vui lòng cài đặt Python 3.9+
            echo Tải từ: https://www.python.org/downloads/
            echo Hoặc cài từ Microsoft Store: ms-windows-store://detail/9NCVDN91XZQP
            pause
            exit /b 1
        )
    ) else (
        set PYTHON_CMD=py
        echo ✅ Python đã được cài đặt (py command)
    )
) else (
    echo ✅ Python đã được cài đặt
)

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
%PYTHON_CMD% -m pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Lỗi khi cài đặt dependencies!
    echo Thử cài đặt thủ công: %PYTHON_CMD% -m pip install streamlit pillow pdf2image
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

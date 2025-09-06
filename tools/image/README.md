# LaTeX Image Processor 🖼️

Tool xử lý hình ảnh trong file LaTeX - Chuyển đổi TikZ thành hình ảnh và tổ chức lại hình ảnh theo chuẩn.

## 🎯 Tính năng chính

- ✅ **Parse file LaTeX** để tìm các câu hỏi trong `\begin{ex}...\end{ex}`
- ✅ **Compile TikZ** thành hình ảnh WEBP chất lượng cao
- ✅ **Xử lý hình có sẵn**: Copy và rename theo subcount
- ✅ **Backup tự động** file gốc với prefix `GOC-`
- ✅ **Báo cáo chi tiết** về quá trình xử lý
- ✅ **Giao diện Streamlit** thân thiện, dễ sử dụng

## 📋 Yêu cầu hệ thống

- **Python 3.9+**
- **LaTeX distribution** (MiKTeX hoặc TeX Live)
- **poppler-utils** (cho pdf2image)
- **Windows/Linux/MacOS**

## 🚀 Cài đặt

### Windows

1. **Cài đặt nhanh:**
```bash
cd tools/image
setup.bat
```

2. **Cài đặt thủ công:**
```bash
# Cài đặt Python packages
pip install -r requirements.txt

# Cài đặt MiKTeX (nếu chưa có)
# Tải từ: https://miktex.org/download

# Cài đặt poppler
# Tải từ: https://github.com/oschwartz10612/poppler-windows/releases/
# Giải nén vào C:\poppler và thêm C:\poppler\Library\bin vào PATH
```

### Linux/MacOS

```bash
# Cài đặt dependencies
pip install -r requirements.txt

# Cài đặt TeX Live
sudo apt-get install texlive-full  # Ubuntu/Debian
brew install --cask mactex  # MacOS

# Cài đặt poppler
sudo apt-get install poppler-utils  # Ubuntu/Debian
brew install poppler  # MacOS
```

## 💻 Sử dụng

### Khởi động nhanh

**Windows:**
```bash
run-image.bat
```

**Linux/MacOS:**
```bash
streamlit run app.py
```

Truy cập: http://localhost:8501

### Quy trình xử lý

1. **Upload file .tex** qua giao diện web
2. **Tool sẽ tự động:**
   - Backup file gốc (GOC-filename.tex)
   - Parse để tìm các câu hỏi
   - Compile TikZ thành hình ảnh
   - Copy và rename hình có sẵn
   - Cập nhật path trong file .tex
3. **Download kết quả:**
   - File .tex đã xử lý
   - Thư mục images/ với hình đã convert
   - Báo cáo xử lý (report.txt)

## 📝 Quy tắc đặt tên hình ảnh

### Với subcount [XX.N]
- Câu hỏi: `XXN-QUES.webp`
- Lời giải: `XXN-SOL.webp`
- Nhiều hình: `XXN-QUES-1.webp`, `XXN-QUES-2.webp`

### Không có subcount
- Format: `tênfile_cau1-QUES.webp`

## 🔧 Cấu hình

File cấu hình: `config/settings.py`

```python
# Format hình ảnh output
IMAGE_FORMAT = "webp"  # png, jpg, webp

# Chất lượng hình (1-100)
IMAGE_QUALITY = 95

# DPI cho convert PDF
IMAGE_DPI = 300

# LaTeX compiler
LATEX_COMPILER = "pdflatex"  # hoặc xelatex

# Timeout compile (giây)
LATEX_TIMEOUT = 30
```

## 📂 Cấu trúc thư mục

```
tools/image/
├── app.py              # Streamlit UI chính
├── processor.py        # Main processor
├── setup.bat          # Script cài đặt (Windows)
├── run-image.bat      # Khởi động nhanh (Windows)
├── requirements.txt   # Python dependencies
├── config/
│   └── settings.py    # Cấu hình hệ thống
├── core/              # Core modules
│   ├── latex_parser.py
│   ├── tikz_compiler.py
│   ├── image_processor.py
│   └── file_manager.py
├── utils/             # Utilities
│   └── logger.py
├── temp/              # Thư mục tạm
└── output/            # Output mặc định
```

## ⚠️ Lưu ý

- File gốc luôn được backup trước khi xử lý
- Nếu compile TikZ thất bại, code TikZ được giữ nguyên trong file
- Hình ảnh output mặc định là WEBP 95% quality
- Cần đủ RAM để xử lý file lớn (khuyến nghị 4GB+)

## 🐛 Xử lý lỗi thường gặp

### Lỗi "pdflatex not found"
- Cài đặt MiKTeX hoặc TeX Live
- Đảm bảo pdflatex trong PATH

### Lỗi "poppler not installed"
- Windows: Tải và cài poppler theo hướng dẫn
- Linux: `sudo apt-get install poppler-utils`

### Lỗi compile TikZ
- Kiểm tra syntax TikZ
- Đảm bảo các package cần thiết đã được cài trong LaTeX

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra file log trong thư mục output
2. Xem báo cáo lỗi chi tiết (report.txt)
3. Liên hệ team phát triển

## 📄 License

© 2025 NyNus System - LaTeX Question Bank

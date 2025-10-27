# LaTeX Image Processor 🖼️

Tool xử lý hình ảnh trong file LaTeX - Chuyển đổi TikZ thành hình ảnh và tổ chức lại hình ảnh theo chuẩn.

## 🎆 Tính năng chính

### 📁 LaTeX Image Processing
- ✅ **Parse file LaTeX** để tìm các câu hỏi trong `\\begin{ex}...\\end{ex}`
- ✅ **Compile TikZ** thành hình ảnh WEBP chất lượng cao
- ✅ **Xử lý hình có sẵn**: Copy và rename theo subcount
- ✅ **Backup tự động** file gốc với prefix `GOC-`
- ✅ **Báo cáo chi tiết** về quá trình xử lý
- ✅ **Giao diện Streamlit** thân thiện, dễ sử dụng
- ✅ **Chọn folder và scan files** - Duyệt toàn bộ thư mục để tìm file .tex
- ✅ **Xử lý nhiều files** - Chọn và xử lý đồng loạt
- ✅ **Enhanced Processor** - Xử lý resilient, không dừng khi gặp lỗi
- ✅ **Error Recovery & Timeout Protection** - Tự động bỏ qua file lỗi và tiếp tục
- ✅ **Windows File Locking Fix** - Giải quyết lỗi WinError 32 với retry mechanism
- ✅ **Memory Management** - Tự động cleanup memory và resources
- ✅ **Chế độ streaming** cho file cực lớn (>300k câu hỏi)
- ✅ **Checkpoint & Resume** - tự động lưu tiến trình và tiếp tục khi gian đoạn
- ✅ **Adaptive Performance** - tự động tối ưu theo RAM và CPU

### 🏷️ Image Renaming Tool (MỚI!)
- ✅ **Đổi tên hàng loạt** hình ảnh theo pattern
- ✅ **Preview trước khi rename** - Xem trước kết quả
- ✅ **Validation** - Phát hiện tên trùng lặp và lỗi
- ✅ **Backup tự động** - Tạo backup trước khi rename
- ✅ **Undo functionality** - Hoàn tác rename cuối cùng
- ✅ **Pattern linh hoạt** - Hỗ trợ {n}, {nn}, {nnn}, subcount

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

#### Cách 1: Chọn file lẻ
1. **Chọn file .tex** qua giao diện web
2. **Tool sẽ tự động:**
   - Backup file gốc (GOC-filename.tex)
   - Parse để tìm các câu hỏi
   - Compile TikZ thành hình ảnh
   - Copy và rename hình có sẵn
   - Cập nhật path trong file .tex

#### Cách 2: Chọn folder để scan nhiều file
1. **Chọn folder** chứa các file .tex
2. **Scan và chọn files** muốn xử lý
   - Chọn scan đệ quy hoặc chỉ trong thư mục hiện tại
   - Xem danh sách tất cả file .tex tìm được
   - Chọn các files cần xử lý
3. **Thêm vào danh sách xử lý** và bắt đầu xử lý

#### Cách 3: Sử dụng Enhanced Processor (🛡️ Không dừng khi gặp lỗi)
1. **Kích hoạt Enhanced Processor** - Tích checkbox để sử dụng chế độ nâng cao
2. **Xử lý an toàn:**
   - Tự động bỏ qua files gặp lỗi và tiếp tục xử lý
   - Timeout protection (30 phút/file)
   - Memory cleanup sau mỗi file
   - Chi tiết lỗi đầy đủ cho debug
3. **Kết quả đáng tin cậy** - Đảm bảo xử lý hết tất cả files có thể

#### 🚪 Windows File Locking Fix
Tool đã được cập nhật để giải quyết lỗi **WinError 32** phổ biến trên Windows:
- **Retry mechanism** - Tự động retry khi gặp file locking
- **Exponential backoff** - Tang dần thời gian chờ giữa các lần thử
- **Smart delays** - Thêm delay giữa các file operations
- **File handle management** - Đảm bảo close file handles đúng cách

#### Kết quả cuối cùng:
- File .tex đã xử lý
- Thư mục images/ với hình đã convert
- Báo cáo xử lý (report.txt)

### Cách 3: Image Renaming Tool (MỚI!)
1. **Chọn tab "🏷️ Đổi tên hình ảnh"**
2. **Nhập đường dẫn folder** chứa hình ảnh
3. **Click "Scan hình ảnh"** để tìm tất cả hình
4. **Cấu hình pattern đặt tên:**
   - Pattern: `image_{nn}`, `{nnn}-QUES`, etc.
   - Số bắt đầu: 1, 10, 100, ...
   - Subcount (optional): `12.{n}` → 12.1, 12.2, ...
5. **Click "Preview kết quả"** để xem trước
6. **Kiểm tra validation** - Tool sẽ cảnh báo nếu có lỗi
7. **Click "Thực hiện rename"** để đổi tên
8. **Undo nếu cần** - Click "Undo rename cuối"

#### Pattern Examples:
- `image_{n}` → image_1.webp, image_2.webp, ...
- `{nn}-QUES` → 01-QUES.webp, 02-QUES.webp, ...
- `photo_{nnn}` → photo_001.webp, photo_002.webp, ...
- `{subcount}-SOL` (với subcount=12.{n}) → 12.1-SOL.webp, 12.2-SOL.webp, ...

## 🔄 Chế độ Checkpoint & Resume

Đối với file cực lớn (>10,000 câu hỏi), tool sẽ tự động:

- **Lưu checkpoint** mỗi 10 batch (có thể config)
- **Tự động resume** khi khởi động lại
- **Adaptive batch size** dựa trên memory usage
- **Concurrent processing** cho TikZ và images
- **Memory monitoring** và cảnh báo

### Cấu hình tối ưu:
```python
CHECKPOINT_ENABLED = True
CHECKPOINT_INTERVAL = 10
ADAPTIVE_BATCH_SIZE = True
CONCURRENT_IMAGE_PROCESSING = True
```

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
├── app.py              # Streamlit UI chính (với Image Renaming Tool)
├── processor.py        # Main processor (legacy - sẽ deprecated)
├── setup.bat          # Script cài đặt (Windows)
├── run-image.bat      # Khởi động nhanh (Windows)
├── clear_cache.bat    # Dọn dẹp cache
├── requirements.txt   # Python dependencies
├── README.md          # Documentation
├── .gitignore         # Git ignore rules
│
├── core/              # Core modules
│   ├── __init__.py
│   ├── main_processor.py      # Main LaTeX processor
│   ├── latex_parser.py        # LaTeX parser
│   ├── tikz_compiler.py       # TikZ compiler
│   ├── image_processor.py     # Image processor
│   ├── image_renamer.py       # 🆕 Image Renaming Tool
│   ├── streaming_processor.py # Large file processor
│   ├── enhanced_processor.py  # Enhanced processor
│   └── file_manager.py        # File manager
│
├── config/            # Configuration
│   ├── __init__.py
│   └── settings.py    # System settings
│
├── utils/             # Utilities
│   ├── __init__.py
│   ├── logger.py      # Logging utilities
│   └── file_operations.py  # File operations
│
├── output/            # 🆕 Output directory
│   ├── .gitkeep
│   └── README.md      # Output guide
│
├── temp/              # Temporary files
├── checkpoints/       # Checkpoint data
├── state/             # Application state
└── docs/              # Documentation
    └── LARGE_FILE_PROCESSING.md

# Output structure (tạo trong output/):
output/
└── [filename]/
    ├── images/            # Hình ảnh đã xử lý
    ├── [filename].tex     # File LaTeX đã cập nhật
    └── GOC-[filename].tex # Backup file gốc
```

## ⚠️ Lưu ý quan trọng

### Đối với file thường (<10K câu):
- File gốc luôn được backup trước khi xử lý
- Nếu compile TikZ thất bại, code TikZ được giữ nguyên trong file
- Hình ảnh output mặc định là WEBP 95% quality

### Đối với file cực lớn (>300K câu):
- **RAM khuyến nghị**: 16GB+ cho hiệu suất tốt nhất
- **CPU khuyến nghị**: 8 cores+ cho xử lý song song
- **Disk space**: ít nhất 20GB free cho temp files
- **Thời gian xử lý**: có thể mất 10-20 giờ
- **Checkpoint tự động**: có thể dừng và tiếp tục bất cứ lúc nào

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

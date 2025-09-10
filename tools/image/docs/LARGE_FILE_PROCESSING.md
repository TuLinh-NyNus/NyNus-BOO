# Xử lý File LaTeX Lớn (>300,000 câu hỏi)

Tài liệu này mô tả cách sử dụng và cấu hình chế độ xử lý tối ưu cho file LaTeX lớn.

## Tính năng của chế độ tối ưu

Chế độ tối ưu được thiết kế đặc biệt để xử lý file LaTeX có số lượng câu hỏi rất lớn (>300,000 câu), với các tính năng:

- **Batch processing**: Xử lý theo batch thay vì load toàn bộ file vào memory
- **Multi-threading**: Compile TikZ song song với nhiều thread
- **Memory management**: Tối ưu hóa sử dụng memory và giám sát để tránh crash
- **Progress tracking**: Hiển thị tiến trình chi tiết, ETA và thống kê real-time
- **Graceful error handling**: Tiếp tục xử lý khi gặp lỗi ở một số câu hỏi
- **Stop/resume capability**: Có thể dừng và tiếp tục quá trình xử lý

## Cấu hình tối ưu

Các tham số cấu hình cho chế độ tối ưu nằm trong `config/settings.py`:

```python
# Batch processing settings
BATCH_SIZE = 100  # Số câu hỏi mỗi batch
MAX_WORKERS = min(4, (os.cpu_count() or 1) + 1)  # Số thread cho processing
LARGE_FILE_THRESHOLD = 10000  # Ngưỡng số câu hỏi để dùng chế độ tối ưu
MEMORY_WARNING_THRESHOLD = 85  # Ngưỡng cảnh báo memory usage (%)
MEMORY_CRITICAL_THRESHOLD = 90  # Ngưỡng critical memory usage (%)
PROGRESS_UPDATE_INTERVAL = 5  # Cập nhật progress bar mỗi X giây
```

Bạn có thể điều chỉnh các tham số này để phù hợp với hệ thống của mình:

- **BATCH_SIZE**: Tăng nếu máy có nhiều RAM, giảm nếu bị OOM errors
- **MAX_WORKERS**: Tăng nếu CPU nhiều core, giảm nếu CPU yếu
- **LARGE_FILE_THRESHOLD**: Ngưỡng để tự động kích hoạt chế độ tối ưu

## Yêu cầu hệ thống

Để xử lý file cực lớn (~300,000 câu), khuyến nghị:

- **RAM**: Tối thiểu 8GB, khuyến nghị 16GB+
- **CPU**: Tối thiểu 4 cores, khuyến nghị 8 cores+
- **Disk space**: Tối thiểu 10GB free space
- **LaTeX**: MiKTeX hoặc TeX Live với đầy đủ packages
- **Python**: Python 3.9+ với packages trong requirements.txt

## Cách sử dụng

Giao diện Streamlit sẽ tự động phát hiện file lớn và chuyển sang chế độ tối ưu:

1. Nhập đường dẫn file .tex cần xử lý
2. UI sẽ tự động phát hiện số lượng câu hỏi và đề xuất chế độ xử lý
3. Nếu file lớn (>10,000 câu), chế độ tối ưu sẽ được kích hoạt tự động
4. Progress bar sẽ hiển thị theo dõi tiến trình xử lý
5. Các thống kê được cập nhật real-time (Memory, TikZ, Images, Errors)
6. Nút "Dừng xử lý" có thể được sử dụng để dừng quá trình bất cứ lúc nào

## Ước tính thời gian xử lý

Thời gian xử lý phụ thuộc vào số lượng câu hỏi và phức tạp của TikZ diagrams:

| Số câu hỏi | TikZ / câu (trung bình) | RAM | CPU | Thời gian ước tính |
|------------|--------------------------|-----|-----|-------------------|
| 10,000     | 1-2                     | 8GB | 4C  | ~1 giờ            |
| 50,000     | 1-2                     | 8GB | 4C  | ~5 giờ            |
| 100,000    | 1-2                     | 16GB| 8C  | ~8 giờ            |
| 300,000    | 1-2                     | 32GB| 16C | ~20 giờ           |

## Xử lý lỗi

Khi xử lý file lớn, một số lỗi phổ biến và cách khắc phục:

1. **Out of memory**: Giảm BATCH_SIZE trong config
2. **LaTeX compilation timeout**: Tăng LATEX_TIMEOUT trong config
3. **Disk space full**: Dọn dẹp disk space hoặc chuyển output sang ổ khác
4. **Process hangs**: Có thể dừng và khởi động lại từ batch cuối cùng

## Logging và báo cáo

Quá trình xử lý sẽ tạo logs và báo cáo chi tiết:

- **Log files**: Lưu tại `logs/streaming_processor.log`
- **Report file**: Tạo trong thư mục output với thống kê chi tiết
- **Performance metrics**: Tốc độ xử lý, memory usage, thời gian trung bình/câu

## Command line usage

Ngoài Streamlit UI, bạn có thể sử dụng test_large_file.py để xử lý từ command line:

```bash
python test_large_file.py
```

Điều này hữu ích khi cần chạy process trong background hoặc qua SSH.

## Lưu ý quan trọng

- **Backup**: File gốc luôn được backup trước khi xử lý
- **Memory management**: Đảm bảo không có ứng dụng khác sử dụng nhiều RAM
- **TikZ packages**: Tất cả TikZ packages cần thiết phải được cài đặt
- **Temp space**: Đảm bảo ổ đĩa temp có đủ dung lượng trống

---

© 2025 NyNus System - LaTeX Image Processor

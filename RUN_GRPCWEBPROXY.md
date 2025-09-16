# Run gRPC-Web Proxy

## Hướng dẫn chạy gRPC-Web Proxy

Để frontend có thể gọi gRPC-Web, cần chạy một proxy server. 

### Bước 1: Mở Terminal mới
Mở một terminal PowerShell mới (không đóng terminal hiện tại)

### Bước 2: Chạy proxy
```powershell
cd C:\Users\tu120\Downloads\Documents\exam-bank-system
powershell.exe -File .\tools\scripts\run-grpcwebproxy.ps1
```

### Thông tin kết nối:
- Backend gRPC server: `localhost:50051` 
- gRPC-Web proxy: `localhost:8081`
- Frontend sẽ kết nối tới: `http://localhost:8081`

### Kiểm tra:
- Proxy phải chạy cùng lúc với backend và frontend
- Nếu thấy lỗi "connection refused", kiểm tra backend đang chạy ở port 50051
- Proxy log sẽ hiển thị các request từ frontend

### Dừng proxy:
Nhấn `Ctrl+C` trong terminal đang chạy proxy
# Development Scripts

## Development Server

### 🚀 Cách sử dụng

#### Chạy development server
```bash
# Chạy dev server (Next.js với Turbopack)
pnpm dev

# Clean build cache và node_modules
pnpm run clean
```

### 📝 Mô tả Scripts

#### `dev`
- Chạy Next.js development server với Turbopack
- Port: 3000
- URL: http://localhost:3000

#### `clean`
- Xóa thư mục .next (build cache)
- Xóa node_modules
- Xóa tsconfig.tsbuildinfo

### 🔧 Troubleshooting

#### Port 3000 bị chiếm dụng (EADDRINUSE)
Nếu gặp lỗi "address already in use :::3000":
1. Kiểm tra process đang sử dụng port:
   ```powershell
   netstat -ano | findstr :3000
   ```
2. Kill process thủ công:
   ```powershell
   taskkill /PID <process_id> /F
   ```
3. Chạy lại dev server:
   ```bash
   pnpm dev
   ```

#### Build cache bị corrupt
Nếu gặp lỗi ENOENT với _buildManifest.js:
1. Clean build cache:
   ```bash
   pnpm run clean
   ```
2. Reinstall dependencies (nếu cần):
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### 💡 Tips

- Luôn sử dụng `pnpm run dev:clean` thay vì `pnpm run dev` để tránh lỗi port conflict
- Script sẽ tự động đợi 2 giây sau khi kill port để đảm bảo port được giải phóng hoàn toàn
- Nếu không có process nào đang sử dụng port 3000, script sẽ báo và tiếp tục chạy dev server bình thường

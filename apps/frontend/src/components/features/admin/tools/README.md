# Admin Tools - Streamlit Launcher

Hệ thống button và component để khởi động ứng dụng Streamlit LaTeX Question Parser từ giao diện admin.

## 🎯 Tính năng

- **Khởi động Streamlit**: Khởi động ứng dụng parsing LaTeX questions
- **Kiểm tra trạng thái**: Theo dõi trạng thái running/stopped
- **Tự động mở**: Mở Streamlit trong tab mới sau khi khởi động
- **UI thân thiện**: Giao diện đẹp với icons và trạng thái rõ ràng

## 📁 Cấu trúc Files

```
apps/frontend/src/
├── components/
│   ├── features/admin/tools/
│   │   ├── streamlit-launcher.tsx     # Component đầy đủ với card UI
│   │   └── README.md                  # File này
│   └── ui/buttons/
│       └── streamlit-button.tsx       # Button components đơn giản
├── app/
│   ├── admin/tools/
│   │   └── page.tsx                   # Trang admin tools
│   └── api/admin/tools/streamlit/
│       ├── start/route.ts             # API khởi động Streamlit
│       ├── stop/route.ts              # API dừng Streamlit
│       └── status/route.ts            # API kiểm tra trạng thái
```

## 🚀 Cách sử dụng

### 1. Component đầy đủ (StreamlitLauncher)

```tsx
import { StreamlitLauncher } from "@/components/features/admin/tools/streamlit-launcher";

export function AdminPage() {
  return (
    <div>
      <StreamlitLauncher className="w-full max-w-md" />
    </div>
  );
}
```

### 2. Button đơn giản

```tsx
import { 
  StreamlitButton, 
  QuickStreamlitButton, 
  StreamlitLaunchButton 
} from "@/components/ui/buttons/streamlit-button";

export function Toolbar() {
  return (
    <div className="flex gap-2">
      {/* Icon button nhỏ */}
      <QuickStreamlitButton />
      
      {/* Button với label */}
      <StreamlitLaunchButton />
      
      {/* Button tùy chỉnh */}
      <StreamlitButton 
        variant="outline" 
        size="sm"
        showLabel={true}
        autoOpen={false}
      />
    </div>
  );
}
```

### 3. Tích hợp vào Enhanced Search

Button đã được tích hợp sẵn vào component Enhanced Search:

```tsx
// Trong enhanced-search.tsx
<QuickStreamlitButton className="h-6 w-6 p-0" />
```

## 🔧 API Endpoints

### POST /api/admin/tools/streamlit/start
Khởi động Streamlit service

**Response:**
```json
{
  "success": true,
  "message": "Streamlit started successfully",
  "url": "http://localhost:8501",
  "status": "running",
  "pid": 12345
}
```

### POST /api/admin/tools/streamlit/stop
Dừng Streamlit service

**Response:**
```json
{
  "success": true,
  "message": "Streamlit stopped successfully",
  "status": "stopped"
}
```

### GET /api/admin/tools/streamlit/status
Kiểm tra trạng thái Streamlit

**Response:**
```json
{
  "success": true,
  "status": "running",
  "url": "http://localhost:8501",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Props và Customization

### StreamlitLauncher Props
```tsx
interface StreamlitLauncherProps {
  className?: string;
}
```

### StreamlitButton Props
```tsx
interface StreamlitButtonProps {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;     // Hiển thị text label
  autoOpen?: boolean;      // Tự động mở sau khi khởi động
}
```

## 🔄 Workflow

1. **User click button** → Gọi API kiểm tra trạng thái
2. **Nếu đã chạy** → Mở Streamlit trực tiếp
3. **Nếu chưa chạy** → Khởi động Streamlit → Đợi 1s → Mở tab mới
4. **Hiển thị toast** → Thông báo trạng thái cho user

## 🛠️ Yêu cầu hệ thống

- **Python**: Có cài đặt Python và Streamlit
- **Port 8501**: Port mặc định cho Streamlit (có thể thay đổi)
- **Tools directory**: Thư mục `tools/parsing-question` phải tồn tại
- **Permissions**: Quyền execute để chạy Streamlit

## 🐛 Troubleshooting

### Lỗi "Failed to start Streamlit"
- Kiểm tra Python và Streamlit đã được cài đặt
- Kiểm tra port 8501 có bị chiếm dụng không
- Kiểm tra đường dẫn đến thư mục `tools/parsing-question`

### Button không hoạt động
- Kiểm tra API endpoints đã được tạo đúng
- Kiểm tra console browser để xem lỗi
- Kiểm tra network tab để xem API calls

### Streamlit không mở được
- Kiểm tra URL có đúng không (mặc định: http://localhost:8501)
- Kiểm tra firewall/antivirus có block không
- Thử mở manual trong browser

## 📝 Notes

- Component sử dụng `sonner` cho toast notifications
- API sử dụng Node.js `child_process` để spawn Streamlit
- Hỗ trợ cả Windows và Linux/Mac
- Auto-cleanup process khi dừng service

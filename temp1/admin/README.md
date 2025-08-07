# NyNus Admin System

Hệ thống quản trị riêng biệt cho NyNus Learning Platform với frontend và backend độc lập.

## 🏗️ Cấu trúc

```
admin/
├── FE/                     # Frontend Admin Dashboard (Next.js 14)
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # API client & utilities
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── next.config.ts
├── BE/                     # Backend Admin API (NestJS)
│   ├── src/
│   │   ├── modules/      # NestJS modules
│   │   │   ├── admin/    # Core admin functionality
│   │   │   └── auth/     # Authentication
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
└── README.md
```

## 🚀 Chức năng

### ✅ **Đã có sẵn**
- **Dashboard** - Trang tổng quan với metrics và charts
- **User Management** - Quản lý người dùng với CRUD operations
- **Security** - Bảo mật và audit logs
- **Settings** - Cài đặt hệ thống
- **Notifications** - Quản lý thông báo
- **Level Progression** - Quản lý cấp độ/tiến trình
- **Sessions** - Quản lý phiên đăng nhập
- **Audit** - Kiểm toán hệ thống
- **Resources** - Quản lý tài nguyên
- **Roles** - Quản lý vai trò

### 🔧 **Backend API**
- RESTful API với NestJS
- JWT Authentication
- Role-based access control
- Swagger API documentation
- CORS enabled cho frontend

## 🛠️ Cài đặt và chạy

### Frontend (FE)
```bash
cd admin/FE
pnpm install
pnpm dev
```
- Chạy trên: http://localhost:3000
- Secret path: http://localhost:3000/3141592654

### Backend (BE)
```bash
cd admin/BE
pnpm install
pnpm start:dev
```
- API chạy trên: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

## 🔗 API Endpoints

### Core Admin
- `GET /api/v1/admin/dashboard` - Dashboard data
- `GET /api/v1/admin/health` - System health
- `GET /api/v1/admin/analytics` - Analytics data

### User Management
- `GET /api/v1/admin/users` - Get users with pagination
- `GET /api/v1/admin/users/:id` - Get user by ID
- `POST /api/v1/admin/users` - Create user
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user
- `POST /api/v1/admin/users/:id/suspend` - Suspend user
- `POST /api/v1/admin/users/:id/activate` - Activate user

### Authentication
- JWT-based authentication
- Role-based access control (ADMIN role required)
- Bearer token authorization

## 🔧 Cấu hình

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:4000
NEXT_PUBLIC_ADMIN_SECRET_PATH=3141592654
```

**Backend (.env)**
```env
PORT=4000
JWT_SECRET=admin-secret-key
NODE_ENV=development
```

## 🎯 Tech Stack

### Frontend
- **Framework**: Next.js 14 với App Router
- **Language**: TypeScript 5.5+
- **UI**: Shadcn UI + Radix UI + Tailwind CSS
- **State**: Zustand
- **API Client**: Axios với retry logic

### Backend
- **Framework**: NestJS 10+
- **Language**: TypeScript 5.1+
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator + class-transformer

## 🔐 Bảo mật

- JWT authentication với refresh tokens
- Role-based access control
- CORS protection
- Input validation và sanitization
- Rate limiting (planned)
- Secret admin paths

## 📊 Monitoring

- System health endpoints
- Performance metrics
- Error tracking
- Audit logging
- Real-time dashboard updates

## 🚧 Development

### Adding New Features
1. Create module trong `BE/src/modules/admin/`
2. Add controller và service
3. Update admin module imports
4. Create corresponding frontend components
5. Update API client configurations

### Testing
```bash
# Backend tests
cd admin/BE
pnpm test

# Frontend tests
cd admin/FE
pnpm test
```

## 📝 Notes

- Admin system hoạt động độc lập với main application
- Frontend call API từ admin backend (port 4000)
- Sử dụng secret paths để bảo mật admin access
- Mock data được sử dụng cho development
- Production cần connect với real database

## 🔄 Next Steps

1. **Database Integration**: Connect với PostgreSQL/Prisma
2. **Real Authentication**: Implement proper JWT auth
3. **Advanced Features**: Add more admin functionalities
4. **Production Setup**: Docker containers và deployment
5. **Monitoring**: Add logging và monitoring tools

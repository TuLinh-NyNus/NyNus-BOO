# Exam Bank System - Frontend

A React TypeScript frontend for the Exam Bank System that integrates with the gRPC backend via gRPC-Web.

## Features

- 🔐 **Authentication**: Login with JWT tokens
- 👥 **User Management**: List and view users with role-based access
- 🎨 **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- 🌐 **gRPC Integration**: Direct integration with gRPC backend via gRPC-Web
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js 18+ and npm
- Docker (for running the gRPC-Web proxy)
- Backend gRPC server running on port 50051

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate proto files:**
   ```bash
   npm run proto
   ```

3. **Start the development environment:**
   ```bash
   npm start
   ```
   This will start both the Envoy proxy (port 8080) and the React dev server (port 5173).

## Manual Setup

If you prefer to run components separately:

1. **Start the gRPC-Web proxy:**
   ```bash
   npm run proxy
   ```

2. **Start the React development server:**
   ```bash
   npm run dev
   ```

3. **Stop the proxy:**
   ```bash
   npm run proxy:down
   ```

## Architecture

### gRPC-Web Integration

```
Browser → Envoy Proxy (8080) → gRPC Server (50051)
```

The frontend uses gRPC-Web to communicate with the backend:
- **Envoy Proxy**: Translates HTTP/1.1 and HTTP/2 requests to gRPC
- **Generated Clients**: TypeScript clients generated from proto files
- **Authentication**: JWT tokens passed in request headers

### Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # Authentication component
│   └── UserList.tsx    # User management component
├── services/           # gRPC client services
│   └── grpcClient.ts   # Main gRPC client wrapper
├── generated/          # Generated proto files
│   ├── common/         # Common proto types
│   └── v1/            # API v1 proto files
└── App.tsx            # Main application component
```

## Demo Credentials

The system comes with demo users for testing:

- **Admin**: `admin@exambank.com` / `password123`
- **Teacher**: `teacher@exambank.com` / `password123`  
- **Student**: `student@exambank.com` / `password123`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run proxy` - Start gRPC-Web proxy
- `npm run proxy:down` - Stop gRPC-Web proxy
- `npm start` - Start both proxy and dev server
- `npm run proto` - Regenerate proto files

## API Integration

The frontend integrates with these gRPC services:

### UserService
- `Register` - Create new user account
- `Login` - Authenticate and get JWT token
- `GetUser` - Get user details (authenticated)
- `ListUsers` - Get paginated user list (admin/teacher only)

### Authentication
JWT tokens are automatically included in gRPC requests:
```typescript
const metadata = {
  'authorization': `Bearer ${token}`
};
```

## Development

### Adding New Components
1. Create component in `src/components/`
2. Import and use in `App.tsx` or other components
3. Use Tailwind CSS for styling

### Adding New gRPC Services
1. Update proto files in `packages/proto/`
2. Run `npm run proto` to regenerate clients
3. Add service methods to `src/services/grpcClient.ts`
4. Use in React components

### Styling
The project uses Tailwind CSS for styling. Key classes:
- Layout: `flex`, `grid`, `container`, `mx-auto`
- Spacing: `p-4`, `m-2`, `space-x-4`
- Colors: `bg-blue-500`, `text-gray-900`
- Interactive: `hover:bg-blue-700`, `focus:ring-2`

## Troubleshooting

### gRPC Connection Issues
- Ensure backend server is running on port 50051
- Check Envoy proxy is running on port 8080
- Verify CORS settings in envoy.yaml

### Proto Generation Issues
- Ensure protoc and protoc-gen-grpc-web are installed
- Check proto file syntax
- Verify import paths in proto files

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify Tailwind CSS configuration

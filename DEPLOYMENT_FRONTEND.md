# 🌐 Frontend Deployment Guide

## Required Files for Frontend Deployment

### **Core Application**
```
apps/frontend/
├── src/
│   ├── components/            # React components
│   │   ├── Login.tsx         # Authentication UI
│   │   └── UserList.tsx      # User management UI
│   ├── services/             # API integration
│   │   └── grpcClient.ts     # gRPC-Web client
│   ├── generated/            # Generated proto files
│   │   ├── common/           # Common types
│   │   └── v1/               # API v1 clients
│   ├── App.tsx               # Main application
│   ├── App.css               # Tailwind CSS
│   └── main.tsx              # Entry point
├── public/                   # Static assets
├── index.html                # HTML template
├── package.json              # Dependencies
├── package-lock.json         # Dependency lock
├── vite.config.ts            # Build configuration
├── tailwind.config.js        # CSS framework config
├── postcss.config.js         # CSS processing
├── tsconfig.json             # TypeScript config
└── Dockerfile                # Container configuration
```

### **gRPC-Web Proxy**
```
apps/frontend/
├── envoy.yaml                # Proxy configuration
├── docker-compose.yml        # Proxy deployment
└── README.md                 # Setup instructions
```

### **Shared Dependencies**
```
packages/proto/               # Proto definitions (for client generation)
├── common/common.proto
└── v1/
    ├── user.proto
    ├── question.proto
    └── exam.proto
```

### **Build Tools**
```
tools/scripts/gen-proto.sh    # Proto generation script
```

## Environment Variables Needed

```bash
# API Configuration
VITE_GRPC_WEB_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080

# Optional
VITE_APP_TITLE="Exam Bank System"
VITE_LOG_LEVEL=info
```

## Deployment Commands

```bash
# 1. Install dependencies
npm install

# 2. Generate proto files
npm run proto

# 3. Build for production
npm run build

# 4. Start gRPC-Web proxy (required)
npm run proxy

# 5. Serve built files
npm run preview
# OR use any static file server
```

## Docker Deployment

```dockerfile
# Multi-stage build for frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run proto
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## gRPC-Web Proxy Setup

The frontend requires an Envoy proxy to communicate with the gRPC backend:

```yaml
# docker-compose.yml for proxy
version: '3.8'
services:
  envoy:
    image: envoyproxy/envoy:v1.28-latest
    ports:
      - "8080:8080"
    volumes:
      - ./envoy.yaml:/etc/envoy/envoy.yaml
```

## What the Frontend Provides

- **React Web Application** with modern UI
- **User Authentication** with JWT tokens
- **User Management Interface** with pagination
- **Responsive Design** works on mobile/desktop
- **gRPC-Web Integration** communicates with backend API

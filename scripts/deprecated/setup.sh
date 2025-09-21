#!/bin/bash

# Exam Bank System Setup Script

set -e

echo "🚀 Setting up Exam Bank System..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Go
if command -v go &> /dev/null; then
    print_success "Go is installed: $(go version | awk '{print $3}')"
else
    echo "❌ Go is not installed. Please install Go 1.21+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    print_success "Node.js is installed: $(node --version)"
else
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check protoc (optional)
if command -v protoc &> /dev/null; then
    print_success "protoc is installed: $(protoc --version)"
else
    print_warning "protoc is not installed. Please install manually:"
    echo "  Ubuntu/Debian: sudo apt-get install protobuf-compiler"
    echo "  macOS: brew install protobuf"
    echo "  Or download from: https://github.com/protocolbuffers/protobuf/releases"
fi

# Setup backend
print_status "Setting up backend..."
cd apps/backend

if [ ! -f "go.mod" ]; then
    go mod init exam-bank-system/backend
fi

# Create basic main.go if not exists
if [ ! -f "cmd/main.go" ]; then
    mkdir -p cmd
    cat > cmd/main.go << 'GOEOF'
package main

import (
    "fmt"
    "log"
    "net"
    "net/http"
    
    "google.golang.org/grpc"
)

func main() {
    // Start gRPC server
    go func() {
        lis, err := net.Listen("tcp", ":50051")
        if err != nil {
            log.Fatalf("Failed to listen: %v", err)
        }
        
        s := grpc.NewServer()
        log.Println("gRPC server listening on :50051")
        
        if err := s.Serve(lis); err != nil {
            log.Fatalf("Failed to serve: %v", err)
        }
    }()
    
    // Start HTTP server
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "OK")
    })
    
    log.Println("HTTP server listening on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
GOEOF
fi

# Install Go dependencies
go get google.golang.org/grpc
go get google.golang.org/protobuf/cmd/protoc-gen-go
go get google.golang.org/grpc/cmd/protoc-gen-go-grpc

print_success "Backend setup completed"
cd ../..

# Setup frontend
print_status "Setting up frontend..."
cd apps/frontend

if [ ! -f "package.json" ]; then
    npm init -y
    
    # Update package.json with basic React setup
    cat > package.json << 'JSONEOF'
{
  "name": "exam-bank-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "echo \"No tests yet\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
JSONEOF
fi

# Create basic React app structure
if [ ! -f "index.html" ]; then
    cat > index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exam Bank System</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
HTMLEOF
fi

if [ ! -d "src" ]; then
    mkdir -p src
    
    cat > src/main.tsx << 'TSXEOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
TSXEOF

    cat > src/App.tsx << 'TSXEOF'
import React from 'react'

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🎓 Exam Bank System</h1>
      <p>Welcome to the Exam Bank Management System!</p>
      <div>
        <h2>🚀 Quick Links</h2>
        <ul>
          <li><a href="http://localhost:8080/health">Backend Health Check</a></li>
          <li><a href="http://localhost:50051">gRPC Server (port 50051)</a></li>
        </ul>
      </div>
    </div>
  )
}

export default App
TSXEOF

    cat > vite.config.ts << 'VITEEOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
VITEEOF
fi

print_success "Frontend setup completed"
cd ../..

# Create environment files
print_status "Creating environment files..."

cat > apps/backend/.env.example << 'ENVEOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=exam_bank_user
DB_PASSWORD=exam_bank_password
DB_NAME=exam_bank_db
DB_SSLMODE=disable

# Server Configuration
GRPC_PORT=50051
HTTP_PORT=8080
ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h
ENVEOF

cat > apps/frontend/.env.example << 'ENVEOF'
VITE_API_URL=http://localhost:8080
VITE_GRPC_URL=http://localhost:50051
ENVEOF

print_success "Environment files created"

echo ""
echo "================================================================"
echo "🎉 Exam Bank System Setup Complete!"
echo "================================================================"
echo ""
echo "Next steps:"
echo "  1. Copy environment files:"
echo "     cp apps/backend/.env.example apps/backend/.env"
echo "     cp apps/frontend/.env.example apps/frontend/.env"
echo ""
echo "  2. Install frontend dependencies:"
echo "     cd apps/frontend && npm install"
echo ""
echo "  3. Start development:"
echo "     make dev"
echo ""
echo "  4. Generate protobuf code (if protoc is installed):"
echo "     make proto"
echo ""
echo "Happy coding! 🚀"

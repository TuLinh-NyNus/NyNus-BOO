# Generate TypeScript protobuf files
Write-Host "Generating TypeScript protobuf files..." -ForegroundColor Green

$PROTO_DIR = "packages\proto"
$OUT_DIR = "apps\frontend\src\generated"
$PROJECT_ROOT = (Get-Location).Path

# Create output directory
New-Item -ItemType Directory -Force -Path $OUT_DIR | Out-Null

# Check if protoc is installed
try {
    $protocVersion = & protoc --version 2>&1
    Write-Host "Found $protocVersion" -ForegroundColor Cyan
} catch {
    Write-Host "protoc is not installed or not in PATH. Trying to use local protoc..." -ForegroundColor Yellow
    $PROTOC = "$PROJECT_ROOT\tools\protoc\bin\protoc.exe"
    if (-not (Test-Path $PROTOC)) {
        Write-Host "Local protoc not found. Please install protoc first." -ForegroundColor Red
        exit 1
    }
}

# Use local protoc if available
if (Test-Path "$PROJECT_ROOT\tools\protoc\bin\protoc.exe") {
    $PROTOC = "$PROJECT_ROOT\tools\protoc\bin\protoc.exe"
    Write-Host "Using local protoc from tools directory" -ForegroundColor Cyan
} else {
    $PROTOC = "protoc"
}

# Check for grpc-web plugin
$GRPC_WEB_PLUGIN = "$PROJECT_ROOT\node_modules\.bin\protoc-gen-grpc-web.cmd"
if (-not (Test-Path $GRPC_WEB_PLUGIN)) {
    Write-Host "Installing grpc-web plugin..." -ForegroundColor Yellow
    npm install -g protoc-gen-grpc-web
}

# Install TypeScript protobuf dependencies if needed
Push-Location "$PROJECT_ROOT\apps\frontend"
if (-not (Test-Path "node_modules\google-protobuf")) {
    Write-Host "Installing google-protobuf..." -ForegroundColor Yellow
    pnpm add google-protobuf
}
if (-not (Test-Path "node_modules\grpc-web")) {
    Write-Host "Installing grpc-web..." -ForegroundColor Yellow
    pnpm add grpc-web
}
Pop-Location

# Generate JavaScript files
Write-Host "Generating JavaScript protobuf files..." -ForegroundColor Cyan
& $PROTOC `
    --proto_path="$PROTO_DIR" `
    --proto_path="tools\protoc\include" `
    --js_out=import_style=commonjs,binary:"$OUT_DIR" `
    "$PROTO_DIR\common\*.proto" `
    "$PROTO_DIR\v1\*.proto"

# Generate TypeScript definitions
Write-Host "Generating TypeScript definitions..." -ForegroundColor Cyan
& $PROTOC `
    --proto_path="$PROTO_DIR" `
    --proto_path="tools\protoc\include" `
    --plugin=protoc-gen-ts="$PROJECT_ROOT\node_modules\.bin\protoc-gen-ts.cmd" `
    --ts_out="$OUT_DIR" `
    "$PROTO_DIR\common\*.proto" `
    "$PROTO_DIR\v1\*.proto"

# Generate gRPC-Web service stubs
Write-Host "Generating gRPC-Web service stubs..." -ForegroundColor Cyan
& $PROTOC `
    --proto_path="$PROTO_DIR" `
    --proto_path="tools\protoc\include" `
    --plugin=protoc-gen-grpc-web="$GRPC_WEB_PLUGIN" `
    --grpc-web_out=import_style=typescript,mode=grpcwebtext:"$OUT_DIR" `
    "$PROTO_DIR\v1\*.proto"

Write-Host "TypeScript protobuf files generated in $OUT_DIR" -ForegroundColor Green
# Generate gRPC-Web Code for Frontend (Windows-friendly)
# ======================================================

$ErrorActionPreference = "Stop"

Write-Host "Generating gRPC-Web Code for Frontend" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Resolve paths
$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$ProtoDir = Join-Path $Root "packages\proto"
$FrontendGen = Join-Path $Root "apps\frontend\src\generated"
$GoOut = Join-Path $Root "apps\backend\pkg\proto"
$ToolProtoc = Join-Path $Root "tools\protoc\bin\protoc.exe"
$GrpcWebPlugin = Join-Path $Root "tools\bin\protoc-gen-grpc-web.exe"

if (!(Test-Path $ToolProtoc)) { throw "protoc not found at $ToolProtoc. Run tools/scripts/install-protoc.ps1" }
if (!(Test-Path $GrpcWebPlugin)) { throw "protoc-gen-grpc-web not found at $GrpcWebPlugin. Run tools/scripts/setup-grpc-web.ps1" }

# Ensure output directories
New-Item -ItemType Directory -Force -Path $FrontendGen | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $GoOut "common") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $GoOut "v1") | Out-Null

# Define proto files
$protoFiles = @(
  "common/common.proto",
  "v1/user.proto",
  "v1/profile.proto",
  "v1/admin.proto",
  "v1/question.proto",
  "v1/question_filter.proto",
  "v1/exam.proto"
)

# Generate Go code
Write-Host "Generating Go gRPC code..." -ForegroundColor Blue
& $ToolProtoc --proto_path=$ProtoDir --go_out=$GoOut --go_opt=paths=source_relative --go-grpc_out=$GoOut --go-grpc_opt=paths=source_relative $protoFiles
Write-Host "Go code generated" -ForegroundColor Green

# Generate JS messages and gRPC-Web clients
Write-Host "Generating gRPC-Web (JS + client) ..." -ForegroundColor Blue
& $ToolProtoc --proto_path=$ProtoDir --plugin=protoc-gen-grpc-web=$GrpcWebPlugin --js_out=import_style=commonjs:$FrontendGen --grpc-web_out=import_style=commonjs,mode=grpcwebtext:$FrontendGen $protoFiles
Write-Host "gRPC-Web code generated" -ForegroundColor Green

# Create index file
$indexPath = Join-Path $FrontendGen "index.js"
$index = @()
$index += "// Auto-generated index for gRPC-Web"
$index += "export * from './common/common_pb';"
$index += "export * from './v1/user_pb';"
$index += "export * from './v1/user_grpc_web_pb';"
$index += "export * from './v1/profile_pb';"
$index += "export * from './v1/profile_grpc_web_pb';"
$index += "export * from './v1/admin_pb';"
$index += "export * from './v1/admin_grpc_web_pb';"
$index += "export * from './v1/question_pb';"
$index += "export * from './v1/question_grpc_web_pb';"
$index += "export * from './v1/question_filter_pb';"
$index += "export * from './v1/question_filter_grpc_web_pb';"
$index += "export * from './v1/exam_pb';"
$index += "export * from './v1/exam_grpc_web_pb';"
$index | Out-File -FilePath $indexPath -Encoding UTF8
Write-Host "Index file created at $indexPath" -ForegroundColor Green

Write-Host "Done." -ForegroundColor Green

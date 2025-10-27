#!/usr/bin/env node

/**
 * Generate gRPC-Web code for frontend using grpc-tools
 * Compatible with google-protobuf 3.21.2
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Generating gRPC-Web code for frontend...\n');

// Paths
const projectRoot = path.join(__dirname, '..', '..');
const protoDir = path.join(projectRoot, 'packages', 'proto');
const outputDir = path.join(projectRoot, 'apps', 'frontend', 'src', 'generated');
const protocGenGrpcWeb = path.join(projectRoot, 'tools', 'protoc-gen-grpc-web.exe');

// Check if protoc-gen-grpc-web exists
if (!fs.existsSync(protocGenGrpcWeb)) {
    console.error(`❌ protoc-gen-grpc-web.exe not found at: ${protocGenGrpcWeb}`);
    process.exit(1);
}

// Clean old generated files
if (fs.existsSync(outputDir)) {
    console.log('🗑️  Cleaning old generated files...');
    fs.rmSync(outputDir, { recursive: true, force: true });
}

// Create output directory
fs.mkdirSync(outputDir, { recursive: true });

// Proto files to compile
const protoFiles = [
    // Common
    'common/common.proto',
    // Google API
    'google/api/annotations.proto',
    'google/api/http.proto',
    // V1 Services
    'v1/user.proto',
    'v1/question.proto',
    'v1/question_filter.proto',
    'v1/exam.proto',
    'v1/library.proto',
    'v1/book.proto',
    'v1/analytics.proto',
    'v1/admin.proto',
    'v1/profile.proto',
    'v1/notification.proto',
    'v1/search.proto',
    'v1/import.proto',
    'v1/mapcode.proto',
    'v1/blog.proto',
    'v1/contact.proto',
    'v1/faq.proto',
    'v1/newsletter.proto',
    'v1/tikz.proto'
];

console.log('⚙️  Generating JavaScript + TypeScript definitions...\n');

// Use grpc_tools_node_protoc from grpc-tools
const grpcToolsNodeProtoc = `node "${path.join(
    projectRoot,
    'node_modules',
    'grpc-tools',
    'bin',
    'protoc.js'
)}"`;

try {
    // Generate JS files
    protoFiles.forEach(protoFile => {
        const fullPath = path.join(protoDir, protoFile);
        if (fs.existsSync(fullPath)) {
            console.log(`   Processing: ${protoFile}`);
            
            const cmd = [
                grpcToolsNodeProtoc,
                `--proto_path=${protoDir}`,
                `--js_out=import_style=commonjs,binary:${outputDir}`,
                fullPath
            ].join(' ');
            
            execSync(cmd, { stdio: 'inherit', shell: true });
        }
    });

    console.log('\n⚙️  Generating gRPC-Web TypeScript clients...\n');

    // Generate gRPC-Web client stubs
    protoFiles.forEach(protoFile => {
        const fullPath = path.join(protoDir, protoFile);
        if (fs.existsSync(fullPath)) {
            console.log(`   Processing: ${protoFile}`);
            
            const cmd = [
                grpcToolsNodeProtoc,
                `--proto_path=${protoDir}`,
                `--plugin=protoc-gen-grpc-web=${protocGenGrpcWeb}`,
                `--grpc-web_out=import_style=typescript,mode=grpcwebtext:${outputDir}`,
                fullPath
            ].join(' ');
            
            execSync(cmd, { stdio: 'inherit', shell: true });
        }
    });

    console.log('\n✅ gRPC-Web code generated successfully!');
    console.log(`\n📁 Generated files location: ${outputDir}`);
    console.log('\n📝 Next steps:');
    console.log('   1. cd apps/frontend');
    console.log('   2. rm -rf .next');
    console.log('   3. pnpm dev:webpack\n');

} catch (error) {
    console.error('\n❌ Error generating protobuf code:', error.message);
    process.exit(1);
}


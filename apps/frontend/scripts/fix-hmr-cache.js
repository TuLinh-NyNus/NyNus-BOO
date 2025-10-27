#!/usr/bin/env node

/**
 * Script to fix HMR cache issues with google-protobuf
 * Clears Next.js cache and node_modules cache
 */

const fs = require('fs');
const path = require('path');

const CACHE_DIRS = [
  '.next/cache',
  '.next/server',
  '.next/static',
  'node_modules/.cache'
];

function deleteDirectory(dir) {
  const fullPath = path.join(process.cwd(), dir);
  
  if (fs.existsSync(fullPath)) {
    console.log(`🗑️  Deleting ${dir}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`✅ Deleted ${dir}`);
  } else {
    console.log(`⏭️  ${dir} does not exist, skipping...`);
  }
}

console.log('🔧 Fixing HMR cache issues...\n');

CACHE_DIRS.forEach(deleteDirectory);

console.log('\n✨ Cache cleared successfully!');
console.log('\n📝 Next steps:');
console.log('   1. Run: pnpm dev');
console.log('   2. Wait for the dev server to fully start');
console.log('   3. Refresh your browser\n');


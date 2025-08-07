#!/usr/bin/env node

/**
 * Script để sửa MapID decoder type issues
 * Fix index signature problems với dynamic objects
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  sourceDir: 'apps/web/src',
  extensions: ['.tsx', '.ts'],
  excludeDirs: ['node_modules', '.git', '.next', 'dist', 'build']
};

// Mapping các MapID decoder fixes
const MAPID_FIXES = [
  // Fix index signature access for grades
  {
    pattern: /sampleMapIDData\.grades\[([^\]]+)\]/g,
    replacement: '(sampleMapIDData.grades as any)[$1]',
    description: 'Fix grades index signature access'
  },
  // Fix index signature access for subjects
  {
    pattern: /sampleMapIDData\.subjects\[([^\]]+)\]/g,
    replacement: '(sampleMapIDData.subjects as any)[$1]',
    description: 'Fix subjects index signature access'
  },
  // Fix index signature access for difficultyLevels
  {
    pattern: /sampleMapIDData\.difficultyLevels\[([^\]]+)\]/g,
    replacement: '(sampleMapIDData.difficultyLevels as any)[$1]',
    description: 'Fix difficultyLevels index signature access'
  },
  // Fix chapters access
  {
    pattern: /chapters\[([^\]]+)\]/g,
    replacement: '(chapters as any)[$1]',
    description: 'Fix chapters index signature access'
  },
  // Fix lessons access
  {
    pattern: /lessons\[([^\]]+)\]/g,
    replacement: '(lessons as any)[$1]',
    description: 'Fix lessons index signature access'
  },
  // Fix forms access
  {
    pattern: /forms\[([^\]]+)\]/g,
    replacement: '(forms as any)[$1]',
    description: 'Fix forms index signature access'
  },
  // Fix roleColors access
  {
    pattern: /roleColors\[([^\]]+)\]/g,
    replacement: '(roleColors as any)[$1]',
    description: 'Fix roleColors index signature access'
  },
  // Fix roleLabels access
  {
    pattern: /roleLabels\[([^\]]+)\]/g,
    replacement: '(roleLabels as any)[$1]',
    description: 'Fix roleLabels index signature access'
  }
];

let stats = {
  filesProcessed: 0,
  filesUpdated: 0,
  totalFixes: 0
};

/**
 * Sửa MapID decoder type issues trong một file
 */
function fixMapIDDecoderTypes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let fileUpdated = false;
    let fileFixes = 0;
    
    MAPID_FIXES.forEach(({ pattern, replacement, description }) => {
      const matches = updatedContent.match(pattern);
      if (matches) {
        updatedContent = updatedContent.replace(pattern, replacement);
        fileUpdated = true;
        fileFixes += matches.length;
        console.log(`  ✅ ${description}: ${matches.length} fixes`);
      }
    });
    
    if (fileUpdated) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      stats.filesUpdated++;
      stats.totalFixes += fileFixes;
      console.log(`✅ Fixed ${fileFixes} MapID decoder type issues in: ${filePath}`);
    }
    
    stats.filesProcessed++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Tìm tất cả files cần xử lý
 */
function findFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!CONFIG.excludeDirs.includes(item)) {
          scanDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (CONFIG.extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scanDir(dir);
  return files;
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting MapID decoder type fixes...\n');
  
  const files = findFiles(CONFIG.sourceDir);
  console.log(`📁 Found ${files.length} files to process\n`);
  
  // Chỉ xử lý files có chứa MapID decoder type issues
  const relevantFiles = files.filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return MAPID_FIXES.some(fix => fix.pattern.test(content));
    } catch {
      return false;
    }
  });
  
  console.log(`🎯 Found ${relevantFiles.length} files with MapID decoder type issues\n`);
  
  relevantFiles.forEach(fixMapIDDecoderTypes);
  
  console.log('\n📊 Fix Summary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files updated: ${stats.filesUpdated}`);
  console.log(`Total fixes: ${stats.totalFixes}`);
  console.log('\n✅ MapID decoder type fixes completed!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixMapIDDecoderTypes };

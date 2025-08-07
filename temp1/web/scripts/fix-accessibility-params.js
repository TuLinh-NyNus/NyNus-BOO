#!/usr/bin/env node

/**
 * Script để sửa accessibility utils parameter scope issues
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  sourceDir: 'apps/web/src',
  extensions: ['.tsx', '.ts'],
  excludeDirs: ['node_modules', '.git', '.next', 'dist', 'build']
};

// Mapping các accessibility parameter fixes
const ACCESSIBILITY_FIXES = [
  // Fix missing parameter definitions in function signatures
  {
    pattern: /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*options\./g,
    replacement: (match, funcName) => {
      return match.replace(/\([^)]*\)/, '(options: any)');
    },
    description: 'Add missing options parameter to functions'
  },
  // Fix parameter scope issues - add parameter to function signature
  {
    pattern: /export\s+function\s+(\w+)\s*\(\s*\)\s*\{[\s\S]*?options\./g,
    replacement: (match, funcName) => {
      return match.replace(/\(\s*\)/, '(options: any)');
    },
    description: 'Add options parameter to exported functions'
  },
  // Fix arrow function parameter issues
  {
    pattern: /const\s+(\w+)\s*=\s*\(\s*\)\s*=>\s*\{[\s\S]*?options\./g,
    replacement: (match, funcName) => {
      return match.replace(/\(\s*\)/, '(options: any)');
    },
    description: 'Add options parameter to arrow functions'
  },
  // Fix specific accessibility function signatures
  {
    pattern: /export\s+function\s+manageFocus\s*\(\s*\)/g,
    replacement: 'export function manageFocus(options: any)',
    description: 'Fix manageFocus function signature'
  },
  {
    pattern: /export\s+function\s+createFormFieldAria\s*\(\s*\)/g,
    replacement: 'export function createFormFieldAria(options: any)',
    description: 'Fix createFormFieldAria function signature'
  },
  {
    pattern: /export\s+function\s+createInteractiveAria\s*\(\s*\)/g,
    replacement: 'export function createInteractiveAria(options: any)',
    description: 'Fix createInteractiveAria function signature'
  },
  {
    pattern: /export\s+function\s+createCombinedAria\s*\(\s*\)/g,
    replacement: 'export function createCombinedAria(options: any)',
    description: 'Fix createCombinedAria function signature'
  },
  // Fix lazy loader parameter issues
  {
    pattern: /export\s+function\s+createLazyComponent\s*\(\s*\)/g,
    replacement: 'export function createLazyComponent(options: any)',
    description: 'Fix createLazyComponent function signature'
  },
  {
    pattern: /export\s+function\s+createLazyRoute\s*\(\s*\)/g,
    replacement: 'export function createLazyRoute(options: any)',
    description: 'Fix createLazyRoute function signature'
  },
  // Fix logger parameter issues
  {
    pattern: /export\s+const\s+configureLogger\s*=\s*\(\s*\)\s*=>/g,
    replacement: 'export const configureLogger = (Options: any) =>',
    description: 'Fix configureLogger function signature'
  },
  // Fix SEO optimizer parameter issues
  {
    pattern: /export\s+function\s+optimizeSEO\s*\(\s*\)/g,
    replacement: 'export function optimizeSEO(options: any)',
    description: 'Fix optimizeSEO function signature'
  }
];

let stats = {
  filesProcessed: 0,
  filesUpdated: 0,
  totalFixes: 0
};

/**
 * Sửa accessibility parameter issues trong một file
 */
function fixAccessibilityParams(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let fileUpdated = false;
    let fileFixes = 0;
    
    ACCESSIBILITY_FIXES.forEach(({ pattern, replacement, description }) => {
      if (typeof replacement === 'function') {
        const matches = [...updatedContent.matchAll(pattern)];
        if (matches.length > 0) {
          matches.forEach(match => {
            const newContent = replacement(match[0], match[1]);
            updatedContent = updatedContent.replace(match[0], newContent);
          });
          fileUpdated = true;
          fileFixes += matches.length;
          console.log(`  ✅ ${description}: ${matches.length} fixes`);
        }
      } else {
        const matches = updatedContent.match(pattern);
        if (matches) {
          updatedContent = updatedContent.replace(pattern, replacement);
          fileUpdated = true;
          fileFixes += matches.length;
          console.log(`  ✅ ${description}: ${matches.length} fixes`);
        }
      }
    });
    
    if (fileUpdated) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      stats.filesUpdated++;
      stats.totalFixes += fileFixes;
      console.log(`✅ Fixed ${fileFixes} accessibility parameter issues in: ${filePath}`);
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
  console.log('🚀 Starting accessibility parameter fixes...\n');
  
  const files = findFiles(CONFIG.sourceDir);
  console.log(`📁 Found ${files.length} files to process\n`);
  
  // Chỉ xử lý files có chứa accessibility parameter issues
  const relevantFiles = files.filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('options.') && (
        content.includes('accessibility') || 
        content.includes('lazy-loader') || 
        content.includes('logger') ||
        content.includes('seo-optimizer')
      );
    } catch {
      return false;
    }
  });
  
  console.log(`🎯 Found ${relevantFiles.length} files with accessibility parameter issues\n`);
  
  relevantFiles.forEach(fixAccessibilityParams);
  
  console.log('\n📊 Fix Summary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files updated: ${stats.filesUpdated}`);
  console.log(`Total fixes: ${stats.totalFixes}`);
  console.log('\n✅ Accessibility parameter fixes completed!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixAccessibilityParams };

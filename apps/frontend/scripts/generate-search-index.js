#!/usr/bin/env node

/**
 * Generate Search Index Script
 * Build-time script để generate theory search index
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

// Temporarily disable search index generation during build
// const { SearchIndexGenerator } = require('../src/lib/search/search-index-generator.ts');
const path = require('path');
const fs = require('fs').promises;

// ===== CONFIGURATION =====

const CONFIG = {
  outputPath: path.join(__dirname, '../public/theory-search-index.json'),
  enableCompression: true,
  includeMetadata: true,
  optimizeForMobile: true,
  maxContentLength: 2000,
  enableDebugLogging: true
};

// ===== MAIN FUNCTION =====

async function generateSearchIndex() {
  console.log('🚀 Starting search index generation...');
  console.log('📁 Output path:', CONFIG.outputPath);

  const startTime = Date.now();

  try {
    // Temporarily create empty index file
    const emptyIndex = {
      searchIndex: [],
      totalItems: 0,
      subjects: {},
      metadata: {
        version: '1.0.0',
        buildTime: new Date().toISOString(),
        gradeRange: [10, 12],
        indexSize: 0,
        compressedSize: 0,
        compressionRatio: 1
      }
    };

    await fs.writeFile(CONFIG.outputPath, JSON.stringify(emptyIndex, null, 2));

    console.log('\n✅ Empty search index created successfully!');
    
  } catch (error) {
    console.error('\n❌ Search index generation failed:');
    console.error(error);
    process.exit(1);
  }
}

// ===== VALIDATION =====

async function validateSearchIndex(searchIndex) {
  console.log('\n🔍 Validating search index...');
  
  // Check basic structure
  if (!searchIndex.searchIndex || !Array.isArray(searchIndex.searchIndex)) {
    throw new Error('Invalid search index structure');
  }
  
  if (searchIndex.totalItems !== searchIndex.searchIndex.length) {
    throw new Error('Total items count mismatch');
  }
  
  // Check subjects
  const subjectCount = Object.keys(searchIndex.subjects).length;
  if (subjectCount === 0) {
    throw new Error('No subjects found in search index');
  }
  
  // Check grades
  const gradeCount = Object.keys(searchIndex.grades).length;
  if (gradeCount === 0) {
    throw new Error('No grades found in search index');
  }
  
  // Validate sample items
  const sampleSize = Math.min(10, searchIndex.searchIndex.length);
  for (let i = 0; i < sampleSize; i++) {
    const item = searchIndex.searchIndex[i];
    
    if (!item.id || !item.title || !item.subject || !item.url) {
      throw new Error(`Invalid item structure at index ${i}`);
    }
    
    if (typeof item.grade !== 'number' || item.grade < 3 || item.grade > 12) {
      throw new Error(`Invalid grade at index ${i}: ${item.grade}`);
    }
  }
  
  console.log('✅ Search index validation passed');
}

// ===== EXECUTION =====

if (require.main === module) {
  generateSearchIndex().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateSearchIndex, validateSearchIndex };

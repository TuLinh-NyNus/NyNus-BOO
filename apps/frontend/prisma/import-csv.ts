/**
 * NyNus - Import Questions from CSV
 * 
 * Import questions từ docs/question_new_fixed.csv vào database
 * Tự động tạo subcount theo format TL.1 -> TL.10000
 * 
 * Usage: tsx prisma/import-csv.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Type for parsed answer
interface ParsedAnswer {
  id: string;
  content: string;
}

// Helper function to generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Helper function to parse answers for TF type
function parseTFAnswers(answersStr: string): ParsedAnswer[] {
  if (!answersStr) return [];

  // Split by semicolon
  const parts = answersStr.split(';').map(s => s.trim()).filter(s => s);

  return parts.map((content, index) => ({
    id: (index + 1).toString(),
    content: content
  }));
}

// Helper function to parse correct answers for TF type
function parseTFCorrectAnswers(correctStr: string): ParsedAnswer[] {
  if (!correctStr) return [];

  // Split by semicolon
  const parts = correctStr.split(';').map(s => s.trim()).filter(s => s);

  return parts.map((content, index) => ({
    id: (index + 1).toString(),
    content: content
  }));
}

// Helper function to parse answers for MC type
function parseMCAnswers(answersStr: string): ParsedAnswer[] {
  if (!answersStr) return [];

  // Split by semicolon
  const parts = answersStr.split(';').map(s => s.trim()).filter(s => s);

  return parts.map((content, index) => ({
    id: (index + 1).toString(),
    content: content
  }));
}

// Helper function to parse correct answer for MC type
function parseMCCorrectAnswer(correctStr: string): any {
  if (!correctStr) return null;

  return {
    id: '1',
    content: correctStr.trim()
  };
}

// CSV parser that handles quoted strings properly
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator (only when not in quotes)
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Push last field
  result.push(current.trim());
  return result;
}

async function main() {
  console.log('📥 Starting CSV import...\n');

  // Read CSV file
  const csvPath = path.join(process.cwd(), '../../docs/question_new_fixed.csv');
  console.log(`📂 Reading CSV from: ${csvPath}`);

  const fileContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV with proper quoted string handling
  const lines = fileContent.split('\n');
  const headers = parseCSVLine(lines[0]);

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);
    const record: any = {};

    for (let j = 0; j < headers.length && j < values.length; j++) {
      record[headers[j]] = values[j];
    }

    records.push(record);
  }

  console.log(`✅ Found ${records.length} questions in CSV\n`);

  // Get existing question_codes
  const existingCodes = await prisma.question_code.findMany();
  const existingCodeIds = new Set(existingCodes.map(c => c.code));
  
  console.log(`📝 Existing question codes: ${existingCodeIds.size}\n`);

  // Track new question_codes to create
  const newQuestionCodes = new Map<string, any>();

  // Get first admin user for creator
  const adminUser = await prisma.users.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    throw new Error('No admin user found in database');
  }

  // Process each record
  let successCount = 0;
  let errorCount = 0;
  const questionsToInsert: any[] = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNumber = i + 2; // +2 because CSV header is line 1, data starts at line 2

    try {
      // Generate subcount: TL.1, TL.2, ..., TL.10000
      const subcount = `TL.${i + 1}`;

      // Get question_code_id from CSV
      const questionCodeId = record.question_code_id || record.code;

      if (!questionCodeId) {
        console.warn(`⚠️  Row ${rowNumber}: Missing question_code_id, skipping...`);
        errorCount++;
        continue;
      }

      // Create question_code if not exists
      if (!existingCodeIds.has(questionCodeId) && !newQuestionCodes.has(questionCodeId)) {
        newQuestionCodes.set(questionCodeId, {
          code: questionCodeId,
          format: record.format || 'ID6',
          grade: record.grade || '0',
          subject: record.subject || 'P',
          chapter: record.chapter || '1',
          lesson: record.lesson || '1',
          level: record.level || 'N',
          form: record.form || null,
        });
      }

      // Parse answers and correct_answer based on type
      let answers: any = null;
      let correctAnswer: any = null;

      const questionType = record.type;

      if (questionType === 'TF') {
        // True/False: answers is array, correct_answer is array
        answers = parseTFAnswers(record.answers);
        correctAnswer = parseTFCorrectAnswers(record.correct_answer);
      } else if (questionType === 'MC') {
        // Multiple Choice: answers is array, correct_answer is single object
        answers = parseMCAnswers(record.answers);
        correctAnswer = parseMCCorrectAnswer(record.correct_answer);
      } else if (questionType === 'SA') {
        // Short Answer: answers is null, correct_answer is string
        answers = null;
        correctAnswer = record.correct_answer || null;
      } else if (questionType === 'ES') {
        // Essay: both null
        answers = null;
        correctAnswer = null;
      }

      // Prepare question data
      const questionData = {
        id: generateId(),
        raw_content: record.raw_content || '',
        content: record.content || '',
        subcount: subcount,
        type: questionType,
        source: record.source || null,
        answers: answers ? JSON.stringify(answers) : null,
        correct_answer: correctAnswer ? JSON.stringify(correctAnswer) : null,
        solution: record.solution || null,
        status: 'ACTIVE',
        difficulty: record.difficulty?.toUpperCase() || 'MEDIUM',
        grade: record.grade || null,
        subject: record.subject || null,
        chapter: record.chapter || null,
        level: record.level || null,
        question_code_id: questionCodeId,
        creator: adminUser.id,
      };

      questionsToInsert.push(questionData);

      // Progress indicator
      if ((i + 1) % 100 === 0) {
        console.log(`⏳ Processed ${i + 1}/${records.length} questions...`);
      }

      successCount++;
    } catch (error) {
      console.error(`❌ Error processing row ${rowNumber}:`, error);
      errorCount++;
    }
  }

  console.log(`\n✅ CSV parsing completed!`);
  console.log(`   - Success: ${successCount}`);
  console.log(`   - Errors: ${errorCount}`);
  console.log(`   - New question codes to create: ${newQuestionCodes.size}\n`);

  // Create new question_codes first
  if (newQuestionCodes.size > 0) {
    console.log('📝 Creating new question codes...');
    for (const [code, data] of newQuestionCodes) {
      await prisma.question_code.create({ data });
    }
    console.log(`✅ Created ${newQuestionCodes.size} question codes\n`);
  }

  // Insert questions in batches of 100
  console.log(`📥 Inserting ${questionsToInsert.length} questions into database...`);
  const batchSize = 100;
  let insertedCount = 0;

  for (let i = 0; i < questionsToInsert.length; i += batchSize) {
    const batch = questionsToInsert.slice(i, i + batchSize);

    try {
      await prisma.question.createMany({
        data: batch,
        skipDuplicates: true,
      });

      insertedCount += batch.length;
      console.log(`⏳ Inserted ${insertedCount}/${questionsToInsert.length} questions...`);
    } catch (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
    }
  }

  console.log(`\n✅ Import completed successfully!`);
  console.log(`📊 Final Summary:`);
  console.log(`   - Total CSV records: ${records.length}`);
  console.log(`   - Successfully parsed: ${successCount}`);
  console.log(`   - Errors: ${errorCount}`);
  console.log(`   - Questions inserted: ${insertedCount}`);
  console.log(`   - New question codes created: ${newQuestionCodes.size}`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


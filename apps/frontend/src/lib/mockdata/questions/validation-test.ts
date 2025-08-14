/**
 * Validation Test for Questions Mockdata
 * Test file để validate các mockdata questions theo đúng specification
 */

import {
  mockMultipleChoiceQuestions,
  mockTrueFalseQuestions,
  mockShortAnswerQuestions,
  mockEssayQuestions,
  mockQuestionCodes,
  parseQuestionCode,
  generateQuestionCode
} from './index';
import { QuestionType } from '../shared/core-types';

// Test validation functions
export function validateQuestionDataStructure() {
  console.log('🔍 Validating Question Data Structure...\n');

  // Test Multiple Choice Questions
  console.log('📝 Multiple Choice Questions:');
  mockMultipleChoiceQuestions.forEach((question, index) => {
    console.log(`  ${index + 1}. ${question.id}`);
    console.log(`     Type: ${question.type} (Expected: ${QuestionType.MC})`);
    console.log(`     Answers: ${Array.isArray(question.answers) ? 'Array ✅' : 'Not Array ❌'}`);
    console.log(`     CorrectAnswer: ${typeof question.correctAnswer === 'string' ? 'String ✅' : 'Not String ❌'}`);
    console.log(`     Subcount: ${question.subcount?.startsWith('[') ? 'Format OK ✅' : 'Format Wrong ❌'}`);
    console.log(`     QuestionCodeId: ${question.questionCodeId}`);
    console.log('');
  });

  // Test True/False Questions
  console.log('✅❌ True/False Questions:');
  mockTrueFalseQuestions.forEach((question, index) => {
    console.log(`  ${index + 1}. ${question.id}`);
    console.log(`     Type: ${question.type} (Expected: ${QuestionType.TF})`);
    console.log(`     Answers: ${Array.isArray(question.answers) ? 'Array ✅' : 'Not Array ❌'}`);
    console.log(`     CorrectAnswer: ${Array.isArray(question.correctAnswer) ? 'Array ✅' : 'Not Array ❌'}`);
    console.log(`     Subcount: ${question.subcount?.startsWith('[') ? 'Format OK ✅' : 'Format Wrong ❌'}`);
    console.log(`     QuestionCodeId: ${question.questionCodeId}`);
    console.log('');
  });

  // Test Short Answer Questions
  console.log('📝 Short Answer Questions:');
  mockShortAnswerQuestions.forEach((question, index) => {
    console.log(`  ${index + 1}. ${question.id}`);
    console.log(`     Type: ${question.type} (Expected: ${QuestionType.SA})`);
    console.log(`     Answers: ${question.answers === null ? 'null ✅' : 'Not null ❌'}`);
    console.log(`     CorrectAnswer: ${typeof question.correctAnswer === 'string' ? 'String ✅' : 'Not String ❌'}`);
    console.log(`     Subcount: ${question.subcount?.startsWith('[') ? 'Format OK ✅' : 'Format Wrong ❌'}`);
    console.log(`     QuestionCodeId: ${question.questionCodeId}`);
    console.log('');
  });

  // Test Essay Questions
  console.log('📄 Essay Questions:');
  mockEssayQuestions.forEach((question, index) => {
    console.log(`  ${index + 1}. ${question.id}`);
    console.log(`     Type: ${question.type} (Expected: ${QuestionType.ES})`);
    console.log(`     Answers: ${question.answers === null ? 'null ✅' : 'Not null ❌'}`);
    console.log(`     CorrectAnswer: ${question.correctAnswer === null ? 'null ✅' : 'Not null ❌'}`);
    console.log(`     Subcount: ${question.subcount?.startsWith('[') ? 'Format OK ✅' : 'Format Wrong ❌'}`);
    console.log(`     QuestionCodeId: ${question.questionCodeId}`);
    console.log('');
  });
}

export function validateQuestionCodeStructure() {
  console.log('🏷️ Validating Question Code Structure...\n');

  mockQuestionCodes.forEach((qCode, index) => {
    console.log(`  ${index + 1}. ${qCode.code}`);
    console.log(`     Format: ${qCode.format}`);
    
    const parsed = parseQuestionCode(qCode.code);
    console.log(`     Parsed - Grade: ${parsed.grade}, Subject: ${parsed.subject}, Chapter: ${parsed.chapter}`);
    console.log(`     Parsed - Level: ${parsed.level}, Lesson: ${parsed.lesson}, Form: ${parsed.form || 'N/A'}`);
    console.log(`     Names - ${parsed.gradeName}, ${parsed.subjectName}, ${parsed.levelName}`);
    
    // Test regeneration
    const regenerated = generateQuestionCode({
      grade: qCode.grade,
      subject: qCode.subject,
      chapter: qCode.chapter,
      level: qCode.level,
      lesson: qCode.lesson,
      form: qCode.form
    });
    console.log(`     Regenerated: ${regenerated} ${regenerated === qCode.code ? '✅' : '❌'}`);
    console.log('');
  });
}

export function validateAnswerFormats() {
  console.log('💡 Validating Answer Formats According to Specification...\n');

  // MC: answers = array, correctAnswer = single string
  console.log(`Multiple Choice (${QuestionType.MC}):`);
  console.log('  Expected: answers = array, correctAnswer = single string');
  mockMultipleChoiceQuestions.forEach(q => {
    const answersOK = Array.isArray(q.answers);
    const correctOK = typeof q.correctAnswer === 'string';
    console.log(`  ${q.id}: answers=${answersOK ? '✅' : '❌'}, correctAnswer=${correctOK ? '✅' : '❌'}`);
  });
  console.log('');

  // TF: answers = array, correctAnswer = array
  console.log(`True/False (${QuestionType.TF}):`);
  console.log('  Expected: answers = array, correctAnswer = array');
  mockTrueFalseQuestions.forEach(q => {
    const answersOK = Array.isArray(q.answers);
    const correctOK = Array.isArray(q.correctAnswer);
    console.log(`  ${q.id}: answers=${answersOK ? '✅' : '❌'}, correctAnswer=${correctOK ? '✅' : '❌'}`);
  });
  console.log('');

  // SA: answers = null, correctAnswer = string
  console.log(`Short Answer (${QuestionType.SA}):`);
  console.log('  Expected: answers = null, correctAnswer = string');
  mockShortAnswerQuestions.forEach(q => {
    const answersOK = q.answers === null;
    const correctOK = typeof q.correctAnswer === 'string';
    console.log(`  ${q.id}: answers=${answersOK ? '✅' : '❌'}, correctAnswer=${correctOK ? '✅' : '❌'}`);
  });
  console.log('');

  // ES: answers = null, correctAnswer = null
  console.log(`Essay (${QuestionType.ES}):`);
  console.log('  Expected: answers = null, correctAnswer = null');
  mockEssayQuestions.forEach(q => {
    const answersOK = q.answers === null;
    const correctOK = q.correctAnswer === null;
    console.log(`  ${q.id}: answers=${answersOK ? '✅' : '❌'}, correctAnswer=${correctOK ? '✅' : '❌'}`);
  });
  console.log('');
}

export function validateRequiredFields() {
  console.log('🔍 Validating Required Fields...\n');

  const allQuestions = [
    ...mockMultipleChoiceQuestions,
    ...mockTrueFalseQuestions,
    ...mockShortAnswerQuestions,
    ...mockEssayQuestions
  ];

  const requiredFields = [
    'id', 'rawContent', 'content', 'subcount', 'type', 'source',
    'tag', 'usageCount', 'creator', 'status', 'feedback', 'questionCodeId',
    'createdAt', 'updatedAt'
  ];

  allQuestions.forEach(question => {
    console.log(`Checking ${question.id}:`);
    requiredFields.forEach(field => {
      const hasField = question.hasOwnProperty(field) && question[field as keyof typeof question] !== undefined;
      console.log(`  ${field}: ${hasField ? '✅' : '❌'}`);
    });
    console.log('');
  });
}

export function runAllValidations() {
  console.log('🚀 Running All Validations for Questions Mockdata\n');
  console.log('='.repeat(60));
  
  validateQuestionDataStructure();
  console.log('='.repeat(60));
  
  validateQuestionCodeStructure();
  console.log('='.repeat(60));
  
  validateAnswerFormats();
  console.log('='.repeat(60));
  
  validateRequiredFields();
  console.log('='.repeat(60));
  
  console.log('✅ All validations completed!');
}

// Export for testing
export const validationSummary = {
  totalQuestions: {
    [QuestionType.MC]: mockMultipleChoiceQuestions.length,
    [QuestionType.TF]: mockTrueFalseQuestions.length,
    [QuestionType.SA]: mockShortAnswerQuestions.length,
    [QuestionType.ES]: mockEssayQuestions.length
  },
  totalQuestionCodes: mockQuestionCodes.length,
  specificationCompliance: {
    answerFormats: 'Updated according to IMPLEMENT_QUESTION.md',
    questionCodeStructure: 'Fixed parameter order: [grade][subject][chapter][level][lesson][-form]',
    subcountFormat: 'Fixed to [XX.N] format',
    requiredFields: 'Added questionCodeId, feedback, proper status enum'
  }
};

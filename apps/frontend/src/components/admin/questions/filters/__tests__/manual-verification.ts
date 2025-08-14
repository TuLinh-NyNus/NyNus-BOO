/**
 * Manual Verification Script for Comprehensive Question Filters
 * Script để verify tất cả functionality của comprehensive filtering system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { parseQuestionCode, getQuestionCodeLabel, getFilterOptions } from '@/lib/utils/question-code';
import { QuestionType, QuestionStatus, QuestionDifficulty } from '@/lib/types/question';

// ===== VERIFICATION FUNCTIONS =====

/**
 * Verify QuestionCode parsing functionality
 */
export function verifyQuestionCodeParsing() {
  console.log('🔍 Verifying QuestionCode Parsing...');
  
  const testCases = [
    { code: '0P1N1', expected: { format: 'ID5', grade: '0', subject: 'P', chapter: '1', level: 'N', lesson: '1' } },
    { code: '1L2V2-1', expected: { format: 'ID6', grade: '1', subject: 'L', chapter: '2', level: 'V', lesson: '2', form: '1' } },
    { code: '[2H3C3]', expected: { format: 'ID5', grade: '2', subject: 'H', chapter: '3', level: 'C', lesson: '3' } },
    { code: 'invalid', expected: { isValid: false } }
  ];
  
  let passed = 0;
  const total = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const result = parseQuestionCode(testCase.code);
    
    if (testCase.expected.isValid === false) {
      if (!result.isValid) {
        console.log(`✅ Test ${index + 1}: Invalid code correctly rejected`);
        passed++;
      } else {
        console.log(`❌ Test ${index + 1}: Invalid code should be rejected`);
      }
    } else {
      if (result.isValid && 
          result.format === testCase.expected.format &&
          result.grade === testCase.expected.grade &&
          result.subject === testCase.expected.subject &&
          result.chapter === testCase.expected.chapter &&
          result.level === testCase.expected.level &&
          result.lesson === testCase.expected.lesson &&
          result.form === testCase.expected.form) {
        console.log(`✅ Test ${index + 1}: Code parsed correctly`);
        passed++;
      } else {
        console.log(`❌ Test ${index + 1}: Code parsing failed`, { result, expected: testCase.expected });
      }
    }
  });
  
  console.log(`📊 QuestionCode Parsing: ${passed}/${total} tests passed\n`);
  return passed === total;
}

/**
 * Verify QuestionCode label generation
 */
export function verifyQuestionCodeLabels() {
  console.log('🏷️ Verifying QuestionCode Labels...');
  
  const testCases = [
    { code: '0P1N1', shouldContain: ['Lớp 10', 'Toán học', 'Chương 1', 'Nhận biết', 'Bài 1'] },
    { code: '1L2V2-1', shouldContain: ['Lớp 11', 'Vật lý', 'Chương 2', 'Vận dụng', 'Bài 2', 'Dạng 1'] },
    { code: '2H3C3', shouldContain: ['Lớp 12', 'Hóa học', 'Chương 3', 'Vận dụng cao', 'Bài 3'] }
  ];
  
  let passed = 0;
  const total = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const label = getQuestionCodeLabel(testCase.code);
    const allContained = testCase.shouldContain.every(text => label.includes(text));
    
    if (allContained) {
      console.log(`✅ Test ${index + 1}: Label contains all expected text`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: Label missing expected text`, { label, expected: testCase.shouldContain });
    }
  });
  
  console.log(`📊 QuestionCode Labels: ${passed}/${total} tests passed\n`);
  return passed === total;
}

/**
 * Verify filter options generation
 */
export function verifyFilterOptions() {
  console.log('⚙️ Verifying Filter Options...');
  
  const options = getFilterOptions();
  let passed = 0;
  const total = 7; // Number of option categories
  
  // Check grades
  if (options.grades.length > 0 && options.grades.some(g => g.label.includes('Lớp'))) {
    console.log('✅ Grade options generated correctly');
    passed++;
  } else {
    console.log('❌ Grade options missing or incorrect');
  }
  
  // Check subjects
  if (options.subjects.length > 0 && options.subjects.some(s => s.label.includes('Toán'))) {
    console.log('✅ Subject options generated correctly');
    passed++;
  } else {
    console.log('❌ Subject options missing or incorrect');
  }
  
  // Check chapters
  if (options.chapters.length === 9 && options.chapters[0].label === 'Chương 1') {
    console.log('✅ Chapter options generated correctly');
    passed++;
  } else {
    console.log('❌ Chapter options missing or incorrect');
  }
  
  // Check levels
  if (options.levels.length === 6 && options.levels.some(l => l.label === 'Nhận biết')) {
    console.log('✅ Level options generated correctly');
    passed++;
  } else {
    console.log('❌ Level options missing or incorrect');
  }
  
  // Check lessons
  if (options.lessons.length > 30 && options.lessons[0].label === 'Bài 1') {
    console.log('✅ Lesson options generated correctly');
    passed++;
  } else {
    console.log('❌ Lesson options missing or incorrect');
  }
  
  // Check forms
  if (options.forms.length === 9 && options.forms[0].label === 'Dạng 1') {
    console.log('✅ Form options generated correctly');
    passed++;
  } else {
    console.log('❌ Form options missing or incorrect');
  }
  
  // Check formats
  if (options.formats.length === 2 && 
      options.formats.some(f => f.value === 'ID5') && 
      options.formats.some(f => f.value === 'ID6')) {
    console.log('✅ Format options generated correctly');
    passed++;
  } else {
    console.log('❌ Format options missing or incorrect');
  }
  
  console.log(`📊 Filter Options: ${passed}/${total} tests passed\n`);
  return passed === total;
}

/**
 * Verify comprehensive filtering logic
 */
export function verifyFilteringLogic() {
  console.log('🔍 Verifying Filtering Logic...');
  
  // Mock questions for testing
  const mockQuestions = [
    {
      id: 'q1',
      questionCodeId: '0P1N1',
      content: 'Câu hỏi toán học cơ bản',
      type: QuestionType.MC,
      status: QuestionStatus.ACTIVE,
      difficulty: QuestionDifficulty.EASY,
      tag: ['co-ban', 'toan-hoc'],
      usageCount: 5,
      feedback: 8.5,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'q2',
      questionCodeId: '1L2V2-1',
      content: 'Câu hỏi vật lý nâng cao',
      type: QuestionType.ES,
      status: QuestionStatus.PENDING,
      difficulty: QuestionDifficulty.HARD,
      tag: ['nang-cao', 'vat-ly'],
      usageCount: 12,
      feedback: 7.2,
      createdAt: '2024-02-01T00:00:00Z'
    }
  ];
  
  let passed = 0;
  const total = 6; // Number of filter tests
  
  // Test grade filtering
  const gradeFilter = ['0'];
  const gradeFiltered = mockQuestions.filter(q => {
    const qCode = parseQuestionCode(q.questionCodeId);
    return gradeFilter.includes(qCode.grade);
  });
  
  if (gradeFiltered.length === 1 && gradeFiltered[0].id === 'q1') {
    console.log('✅ Grade filtering works correctly');
    passed++;
  } else {
    console.log('❌ Grade filtering failed');
  }
  
  // Test subject filtering
  const subjectFilter = ['L'];
  const subjectFiltered = mockQuestions.filter(q => {
    const qCode = parseQuestionCode(q.questionCodeId);
    return subjectFilter.includes(qCode.subject);
  });
  
  if (subjectFiltered.length === 1 && subjectFiltered[0].id === 'q2') {
    console.log('✅ Subject filtering works correctly');
    passed++;
  } else {
    console.log('❌ Subject filtering failed');
  }
  
  // Test type filtering
  const typeFilter = [QuestionType.MC];
  const typeFiltered = mockQuestions.filter(q => typeFilter.includes(q.type));
  
  if (typeFiltered.length === 1 && typeFiltered[0].id === 'q1') {
    console.log('✅ Type filtering works correctly');
    passed++;
  } else {
    console.log('❌ Type filtering failed');
  }
  
  // Test status filtering
  const statusFilter = [QuestionStatus.ACTIVE];
  const statusFiltered = mockQuestions.filter(q => statusFilter.includes(q.status));
  
  if (statusFiltered.length === 1 && statusFiltered[0].id === 'q1') {
    console.log('✅ Status filtering works correctly');
    passed++;
  } else {
    console.log('❌ Status filtering failed');
  }
  
  // Test usage count filtering
  const usageCountFilter = { min: 10, max: 20 };
  const usageFiltered = mockQuestions.filter(q => {
    const usageCount = q.usageCount || 0;
    return usageCount >= usageCountFilter.min && usageCount <= usageCountFilter.max;
  });
  
  if (usageFiltered.length === 1 && usageFiltered[0].id === 'q2') {
    console.log('✅ Usage count filtering works correctly');
    passed++;
  } else {
    console.log('❌ Usage count filtering failed');
  }
  
  // Test content search
  const keyword = 'toán học';
  const searchFiltered = mockQuestions.filter(q => 
    q.content.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (searchFiltered.length === 1 && searchFiltered[0].id === 'q1') {
    console.log('✅ Content search works correctly');
    passed++;
  } else {
    console.log('❌ Content search failed');
  }
  
  console.log(`📊 Filtering Logic: ${passed}/${total} tests passed\n`);
  return passed === total;
}

/**
 * Run all verification tests
 */
export function runAllVerifications() {
  console.log('🚀 Starting Comprehensive Question Filters Verification...\n');
  
  const results = [
    verifyQuestionCodeParsing(),
    verifyQuestionCodeLabels(),
    verifyFilterOptions(),
    verifyFilteringLogic()
  ];
  
  const totalPassed = results.filter(Boolean).length;
  const totalTests = results.length;
  
  console.log('📋 VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${totalPassed}/${totalTests} test suites`);
  console.log(`📊 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALL VERIFICATIONS PASSED! Comprehensive Question Filters are working correctly.');
  } else {
    console.log('⚠️ Some verifications failed. Please check the implementation.');
  }
  
  return totalPassed === totalTests;
}

// Type definition for window object extension
declare global {
  interface Window {
    verifyQuestionFilters: () => void;
  }
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  window.verifyQuestionFilters = runAllVerifications;
  console.log('💡 Run verifyQuestionFilters() in console to test the filters');
} else {
  // Node.js environment
  runAllVerifications();
}

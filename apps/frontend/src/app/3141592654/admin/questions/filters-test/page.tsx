/**
 * Question Filters Test Page
 * Simple test page để verify comprehensive question filtering functionality
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Button } from '@/components/ui/form/button';
import { Badge } from '@/components/ui/display/badge';

// Import utilities để test
import { 
  parseQuestionCode, 
  getQuestionCodeLabel, 
  getFilterOptions,
  MAPCODE_CONFIG 
} from '@/lib/utils/question-code';

// ===== COMPONENT =====

export default function QuestionFiltersTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  /**
   * Add test result
   */
  const addResult = (message: string, isSuccess: boolean = true) => {
    const prefix = isSuccess ? '✅' : '❌';
    setTestResults(prev => [...prev, `${prefix} ${message}`]);
  };

  /**
   * Run comprehensive tests
   */
  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('🚀 Starting Comprehensive Question Filters Tests...');
    
    // Test 1: QuestionCode Parsing
    addResult('📝 Testing QuestionCode Parsing...');
    
    const parseTest1 = parseQuestionCode('0P1N1');
    if (parseTest1.isValid && parseTest1.format === 'ID5' && parseTest1.grade === '0') {
      addResult('ID5 format parsing works correctly');
    } else {
      addResult('ID5 format parsing failed', false);
    }
    
    const parseTest2 = parseQuestionCode('1L2V2-1');
    if (parseTest2.isValid && parseTest2.format === 'ID6' && parseTest2.form === '1') {
      addResult('ID6 format parsing works correctly');
    } else {
      addResult('ID6 format parsing failed', false);
    }
    
    const parseTest3 = parseQuestionCode('invalid');
    if (!parseTest3.isValid) {
      addResult('Invalid code rejection works correctly');
    } else {
      addResult('Invalid code rejection failed', false);
    }
    
    // Test 2: Label Generation
    addResult('🏷️ Testing Label Generation...');
    
    const label1 = getQuestionCodeLabel('0P1N1');
    if (label1.includes('Lớp 10') && label1.includes('Toán học')) {
      addResult('Vietnamese label generation works correctly');
    } else {
      addResult('Vietnamese label generation failed', false);
    }
    
    // Test 3: Filter Options
    addResult('⚙️ Testing Filter Options...');
    
    const options = getFilterOptions();
    if (options.grades.length > 0 && options.subjects.length > 0) {
      addResult('Filter options generation works correctly');
    } else {
      addResult('Filter options generation failed', false);
    }
    
    // Test 4: MapCode Configuration
    addResult('🗺️ Testing MapCode Configuration...');
    
    if (MAPCODE_CONFIG.grades['0'] === 'Lớp 10' && 
        MAPCODE_CONFIG.subjects['P'] === 'Toán học') {
      addResult('MapCode configuration is correct');
    } else {
      addResult('MapCode configuration failed', false);
    }
    
    // Test 5: Performance Test
    addResult('⚡ Testing Performance...');
    
    const startTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      parseQuestionCode('0P1N1');
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration < 100) { // Should be much faster than 100ms for 1000 operations
      addResult(`Performance test passed (${duration.toFixed(2)}ms for 1000 operations)`);
    } else {
      addResult(`Performance test failed (${duration.toFixed(2)}ms for 1000 operations)`, false);
    }
    
    addResult('🎉 All tests completed!');
    setIsRunning(false);
  };

  /**
   * Clear results
   */
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Filters Test</h1>
          <p className="text-muted-foreground">
            Comprehensive testing cho Question Filtering System
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? '🔄 Running...' : '🚀 Run Tests'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearResults}
            disabled={isRunning}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Test Results
              {testResults.length > 0 && (
                <Badge variant="secondary">
                  {testResults.filter(r => r.startsWith('✅')).length} passed
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Click &quot;Run Tests&quot; để bắt đầu testing
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`text-sm p-2 rounded ${
                      result.startsWith('✅') ? 'bg-green-50 text-green-800' :
                      result.startsWith('❌') ? 'bg-red-50 text-red-800' :
                      'bg-blue-50 text-blue-800'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Info */}
        <Card>
          <CardHeader>
            <CardTitle>🗺️ MapCode Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Grades (Lớp)</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(MAPCODE_CONFIG.grades).slice(0, 6).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Subjects (Môn học)</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(MAPCODE_CONFIG.subjects).slice(0, 6).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Levels (Mức độ)</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(MAPCODE_CONFIG.levels).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample QuestionCode Tests */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Sample QuestionCode Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { code: '0P1N1', description: 'Lớp 10 - Toán - Chương 1 - Nhận biết - Bài 1' },
              { code: '1L2V2-1', description: 'Lớp 11 - Vật lý - Chương 2 - Vận dụng - Bài 2 - Dạng 1' },
              { code: '2H3C3', description: 'Lớp 12 - Hóa học - Chương 3 - Vận dụng cao - Bài 3' },
              { code: 'AS4T4-2', description: 'Đại học - Sinh học - Chương 4 - VIP - Bài 4 - Dạng 2' }
            ].map((sample, index) => {
              const parsed = parseQuestionCode(sample.code);
              const label = getQuestionCodeLabel(sample.code);
              
              return (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="font-mono text-sm font-medium">{sample.code}</div>
                  <div className="text-xs text-muted-foreground">{sample.description}</div>
                  <div className="text-xs">
                    <span className={`px-2 py-1 rounded ${parsed.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {parsed.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  {parsed.isValid && (
                    <div className="text-xs text-muted-foreground">
                      {label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

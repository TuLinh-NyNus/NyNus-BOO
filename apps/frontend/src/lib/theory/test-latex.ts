/**
 * Test file for LaTeX parsing functionality
 * Tests the latex-commands.ts implementation
 */

import { parseLatexToHtml, testKatexRendering, extractMetadata, extractTitle } from './latex-commands';

// Sample LaTeX content from Chapter1-1.tex
const sampleLatexContent = `\\section{MỆNH ĐỀ}

\\subsection{TÓM TẮT LÝ THUYẾT}
\\subsubsection{Mệnh đề, mệnh đề chứa biến}
\\begin{itemize}
	\\item [\\iconMT] \\indam{Mệnh đề:} Mệnh đề là một \\indamm{ câu khẳng định} đúng hoặc sai. 
	\\begin{boxkn}
		\\begin{itemize}
			\\item Câu khẳng định đúng gọi là mệnh đề đúng.
			\\item Câu khẳng định sai gọi là mệnh đề \\textbf{sai}.
			\\item Một mệnh đề không thể vừa đúng hoặc vừa \\textbf{sai}.
			\\item Những mệnh đề liên quan đến toán học được gọi là mệnh đề toán học.
		\\end{itemize} 
	\\end{boxkn}
	\\item [\\iconMT] \\indam{Mệnh đề chứa biến:} Mệnh đề chứa biến là một câu khẳng định chứa biến nhận giá trị trong một tập $X$ nào đó và với mỗi giá trị của biến thuộc $X$ ta được một mệnh đề.
\\end{itemize}

\\subsubsection{Mệnh đề phủ định}
\\begin{itemize}
	\\item [\\iconMT] Cho mệnh đề $P$. Mệnh đề \\lq\\lq không phải $P$ \\rq\\rq gọi là mệnh đề phủ định của $P$.
\\end{itemize}`;

/**
 * Test basic KaTeX functionality
 */
export function testBasicKatex(): void {
  console.log('🧪 Testing KaTeX rendering...');
  
  const result = testKatexRendering();
  console.log('KaTeX test result:', result);
  
  if (result.includes('katex')) {
    console.log('✅ KaTeX is working correctly');
  } else {
    console.log('❌ KaTeX test failed');
  }
}

/**
 * Test LaTeX command parsing
 */
export function testLatexParsing(): void {
  console.log('🧪 Testing LaTeX parsing...');
  
  const parsed = parseLatexToHtml(sampleLatexContent);
  console.log('Parsed content:', parsed);
  
  // Check if key transformations worked
  const checks = [
    { test: parsed.includes('<h2 class="theory-section">'), name: 'Section parsing' },
    { test: parsed.includes('<h3 class="theory-subsection">'), name: 'Subsection parsing' },
    { test: parsed.includes('<strong class="theory-emphasis">'), name: 'indam command' },
    { test: parsed.includes('<div class="theory-box-knowledge">'), name: 'boxkn environment' },
    { test: parsed.includes('katex'), name: 'Math rendering' },
  ];
  
  checks.forEach(check => {
    if (check.test) {
      console.log(`✅ ${check.name} working`);
    } else {
      console.log(`❌ ${check.name} failed`);
    }
  });
}

/**
 * Test metadata extraction
 */
export function testMetadataExtraction(): void {
  console.log('🧪 Testing metadata extraction...');
  
  const title = extractTitle(sampleLatexContent);
  console.log('Extracted title:', title);
  
  const metadata = extractMetadata(sampleLatexContent);
  console.log('Extracted metadata:', metadata);
  
  if (title === 'MỆNH ĐỀ') {
    console.log('✅ Title extraction working');
  } else {
    console.log('❌ Title extraction failed');
  }
  
  if (metadata.hasmath) {
    console.log('✅ Math detection working');
  } else {
    console.log('❌ Math detection failed');
  }
}

/**
 * Run all tests
 */
export function runAllTests(): void {
  console.log('🚀 Running LaTeX processing tests...');
  console.log('=====================================');
  
  testBasicKatex();
  console.log('');
  
  testLatexParsing();
  console.log('');
  
  testMetadataExtraction();
  console.log('');
  
  console.log('✅ All tests completed!');
}

/**
 * Test with actual Chapter1-1.tex file content
 */
export async function testWithRealFile(): Promise<void> {
  try {
    // In a real implementation, this would read from the file system
    // For now, we'll use the sample content
    console.log('🧪 Testing with real LaTeX file...');
    
    const parsed = parseLatexToHtml(sampleLatexContent);
    const metadata = extractMetadata(sampleLatexContent);
    
    console.log('File metadata:', metadata);
    console.log('Parsed HTML length:', parsed.length);
    
    if (parsed.length > 0 && metadata.title) {
      console.log('✅ Real file processing working');
    } else {
      console.log('❌ Real file processing failed');
    }
  } catch (error) {
    console.error('❌ Error testing real file:', error);
  }
}

// Export for use in components or pages
export { sampleLatexContent };

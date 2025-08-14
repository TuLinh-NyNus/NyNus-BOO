'use client';

import React, { useEffect, useState } from 'react';
import { parseLatexToHtml, testKatexRendering, extractMetadata, LatexMetadata } from '@/lib/theory/latex-commands';
import { runAllTests } from '@/lib/theory/test-latex';
import { parseLatexContent, generateTableOfContents } from '@/lib/theory/latex-parser';
import type { ParsedLatexFile } from '@/lib/theory/latex-parser';
import { getAllLatexFiles, getDirectoryStructure } from '@/lib/theory/file-operations';
import type { DirectoryStructure, FileInfo } from '@/lib/theory/file-operations';
import { parseLatexToReact, LatexToReact } from '@/lib/theory/latex-to-react';
import type { ReactParseResult } from '@/lib/theory/latex-to-react';

// Sample LaTeX content for testing
const sampleContent = `\\section{MỆNH ĐỀ}

\\subsection{TÓM TẮT LÝ THUYẾT}
\\subsubsection{Mệnh đề, mệnh đề chứa biến}
\\begin{itemize}
	\\item [\\iconMT] \\indam{Mệnh đề:} Mệnh đề là một \\indamm{ câu khẳng định} đúng hoặc sai. 
	\\begin{boxkn}
		\\begin{itemize}
			\\item Câu khẳng định đúng gọi là mệnh đề đúng.
			\\item Câu khẳng định sai gọi là mệnh đề \\textbf{sai}.
		\\end{itemize} 
	\\end{boxkn}
	\\item [\\iconMT] \\indam{Mệnh đề chứa biến:} Mệnh đề chứa biến là một câu khẳng định chứa biến nhận giá trị trong một tập $X$ nào đó và với mỗi giá trị của biến thuộc $X$ ta được một mệnh đề.
\\end{itemize}`;

export default function TestTheoryPage() {
  const [parsedContent, setParsedContent] = useState<string>('');
  const [katexTest, setKatexTest] = useState<string>('');
  const [metadata, setMetadata] = useState<LatexMetadata | null>(null);
  const [parsedFile, setParsedFile] = useState<ParsedLatexFile | null>(null);
  const [directoryStructure, setDirectoryStructure] = useState<DirectoryStructure | null>(null);
  const [allFiles, setAllFiles] = useState<FileInfo[]>([]);
  const [reactParseResult, setReactParseResult] = useState<ReactParseResult | null>(null);

  useEffect(() => {
    async function runTests() {
      // Test KaTeX
      const katexResult = testKatexRendering();
      setKatexTest(katexResult);

      // Parse LaTeX content
      const parsed = parseLatexToHtml(sampleContent);
      setParsedContent(parsed);

      // Extract metadata
      const meta = extractMetadata(sampleContent);
      setMetadata(meta);

      // Test Phase 1.2 - LaTeX Parser
      const parsedFileResult = parseLatexContent(sampleContent, 'Chapter1-1.tex');
      setParsedFile(parsedFileResult);

      // Test Phase 1.3 - LaTeX to React Converter
      const reactResult = parseLatexToReact(sampleContent);
      setReactParseResult(reactResult);

      // Test file operations
      try {
        const structure = await getDirectoryStructure();
        setDirectoryStructure(structure);

        const files = await getAllLatexFiles();
        setAllFiles(files);
      } catch (error) {
        console.error('Error testing file operations:', error);
      }

      // Run console tests
      runAllTests();
    }

    runTests();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Theory LaTeX Processing Test</h1>
      
      {/* KaTeX Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">KaTeX Test</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>Test formula: x² + y² = z²</p>
          <div dangerouslySetInnerHTML={{ __html: katexTest }} />
        </div>
      </section>

      {/* Metadata Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Metadata Extraction</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      </section>

      {/* Original LaTeX */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Original LaTeX</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="whitespace-pre-wrap text-sm">{sampleContent}</pre>
        </div>
      </section>

      {/* Parsed Content */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Parsed HTML</h2>
        <div className="bg-white border p-4 rounded">
          <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
        </div>
      </section>

      {/* Raw HTML */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Raw HTML Output</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="whitespace-pre-wrap text-sm">{parsedContent}</pre>
        </div>
      </section>

      {/* Phase 1.2 Tests */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Phase 1.2: LaTeX Parser Results</h2>
        {parsedFile && (
          <div className="space-y-4">
            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-2">File Information</h3>
              <p><strong>Title:</strong> {parsedFile.title}</p>
              <p><strong>Word Count:</strong> {parsedFile.wordCount}</p>
              <p><strong>Reading Time:</strong> {parsedFile.estimatedReadingTime} minutes</p>
              <p><strong>Sections:</strong> {parsedFile.sections.length}</p>
            </div>

            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-2">Table of Contents</h3>
              <pre className="whitespace-pre-wrap text-sm">{generateTableOfContents(parsedFile)}</pre>
            </div>

            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-2">Sections Detail</h3>
              {parsedFile.sections.map((section, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  <p><strong>Level {section.level}:</strong> {section.title}</p>
                  <p className="text-sm text-gray-600">Lines {section.startLine}-{section.endLine}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* File Operations Tests */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">File Operations Results</h2>
        <div className="space-y-4">
          <div className="bg-white border p-4 rounded">
            <h3 className="font-semibold mb-2">Directory Structure</h3>
            {directoryStructure && (
              <div>
                <p><strong>Total Files:</strong> {directoryStructure.totalFiles}</p>
                {directoryStructure.subjects.map((subject, index) => (
                  <div key={index} className="mt-2">
                    <p><strong>{subject.name}:</strong></p>
                    {subject.grades.map((grade, gradeIndex) => (
                      <div key={gradeIndex} className="ml-4">
                        <p>- {grade.name}: {grade.fileCount} files</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border p-4 rounded">
            <h3 className="font-semibold mb-2">All Files ({allFiles.length})</h3>
            <div className="max-h-40 overflow-y-auto">
              {allFiles.slice(0, 10).map((file, index) => (
                <div key={index} className="text-sm py-1">
                  <span className="font-mono">{file.fileName}</span> - {file.grade} - {file.chapter}
                </div>
              ))}
              {allFiles.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">... and {allFiles.length - 10} more files</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Phase 1.3 Tests */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Phase 1.3: LaTeX to React Converter Results</h2>
        {reactParseResult && (
          <div className="space-y-4">
            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-2">Parse Statistics</h3>
              <p><strong>Components Generated:</strong> {reactParseResult.components.length}</p>
              <p><strong>Errors:</strong> {reactParseResult.errors.length}</p>
              <p><strong>Warnings:</strong> {reactParseResult.warnings.length}</p>
            </div>

            {reactParseResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <h3 className="font-semibold mb-2 text-red-800">Parsing Errors</h3>
                <ul className="list-disc list-inside text-red-700">
                  {reactParseResult.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-2">React Components Output</h3>
              <div className="border rounded p-4 bg-gray-50">
                <LatexToReact content={sampleContent} />
              </div>
            </div>

            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-2">Component Details</h3>
              <div className="max-h-60 overflow-y-auto">
                {reactParseResult.components.map((component, index) => (
                  <div key={index} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                    <p><strong>Component {index + 1}:</strong> {typeof component}</p>
                    <p className="text-gray-600 truncate">
                      {React.isValidElement(component) ? `<${component.type}>` : String(component).substring(0, 100)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

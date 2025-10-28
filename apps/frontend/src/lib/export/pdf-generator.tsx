/**
 * PDF Generator for Question Export
 * 
 * Uses @react-pdf/renderer to generate professional PDFs
 * Design matches the NyNus theme system (pastel colors, clean layout)
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { Question, QuestionType } from '@/types/question';

// PDF Styles - Matching NyNus Design System
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2 solid #E8A0A4', // Pastel rose accent
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E', // Dark navy
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#4A5568', // Medium gray
  },
  questionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FDF2F8', // Very light pink background
    borderRadius: 8,
    border: '1 solid #F9DDD2', // Light muted border
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'medium',
  },
  badgeType: {
    backgroundColor: '#E6C6D1', // Pastel lilac
    color: '#1A1A2E',
  },
  badgeDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'medium',
  },
  difficultyEasy: {
    backgroundColor: '#D1FAE5', // Green 100
    color: '#065F46', // Green 800
  },
  difficultyMedium: {
    backgroundColor: '#FEF3C7', // Yellow 100
    color: '#92400E', // Yellow 800
  },
  difficultyHard: {
    backgroundColor: '#FEE2E2', // Red 100
    color: '#991B1B', // Red 800
  },
  questionContent: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#1A1A2E',
    marginBottom: 12,
  },
  answersContainer: {
    marginTop: 8,
  },
  answersTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  answerItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  answerItemDefault: {
    backgroundColor: '#F6EADE', // Beige pastel
  },
  answerItemCorrect: {
    backgroundColor: '#D1FAE5', // Green 100
    border: '1 solid #6EE7B7', // Green 300
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 24,
  },
  answerText: {
    fontSize: 11,
    lineHeight: 1.5,
    flex: 1,
  },
  solutionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#DBEAFE', // Blue 100
    borderLeft: '3 solid #3B82F6', // Blue 500
    borderRadius: 4,
  },
  solutionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E3A8A', // Blue 800
    marginBottom: 6,
  },
  solutionText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#1E3A8A',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FBCFD0', // Pink pastel
    borderRadius: 12,
    fontSize: 9,
    color: '#1A1A2E',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTop: '1 solid #F9DDD2',
  },
  footerText: {
    fontSize: 9,
    color: '#4A5568',
  },
  pageNumber: {
    fontSize: 9,
    color: '#4A5568',
  },
});

export interface ExportOptions {
  title?: string;
  showSolutions?: boolean;
  showMetadata?: boolean;
  includePageNumbers?: boolean;
}

/**
 * Strip HTML tags from content (basic sanitization)
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Get answer option label (A, B, C, D for MC; 1, 2, 3 for others)
 */
function getAnswerLabel(index: number, type: QuestionType): string {
  if (type === 'MULTIPLE_CHOICE') {
    return String.fromCharCode(65 + index); // A, B, C, D
  }
  return `${index + 1}`;
}

/**
 * Get difficulty badge style
 */
function getDifficultyStyle(difficulty: string) {
  switch (difficulty) {
    case 'EASY':
      return styles.difficultyEasy;
    case 'MEDIUM':
      return styles.difficultyMedium;
    case 'HARD':
      return styles.difficultyHard;
    default:
      return styles.badgeType;
  }
}

/**
 * Render a single question
 */
function QuestionItem({
  question,
  index,
  showSolutions,
  showMetadata,
}: {
  question: Question;
  index: number;
  showSolutions: boolean;
  showMetadata: boolean;
}) {
  return (
    <View style={styles.questionContainer} wrap={false}>
      {/* Question Header */}
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>Câu {index + 1}</Text>
        <View style={styles.questionMeta}>
          <View style={[styles.badge, styles.badgeType]}>
            <Text>{question.type}</Text>
          </View>
          <View style={[styles.badgeDifficulty, getDifficultyStyle(question.difficulty || 'EASY')]}>
            <Text>{question.difficulty || 'EASY'}</Text>
          </View>
        </View>
      </View>

      {/* Question Content */}
      <Text style={styles.questionContent}>{stripHtml(question.content)}</Text>

      {/* Answers */}
      {question.answers && question.answers.length > 0 && (
        <View style={styles.answersContainer}>
          <Text style={styles.answersTitle}>Các đáp án:</Text>
          {question.answers.map((answer, idx) => (
            <View
              key={'id' in answer ? answer.id : `${idx}`}
              style={[
                styles.answerItem,
                ('isCorrect' in answer ? answer.isCorrect : false) ? styles.answerItemCorrect : styles.answerItemDefault,
              ]}
            >
              <Text style={styles.answerLabel}>
                {getAnswerLabel(idx, question.type)}.
              </Text>
              <Text style={styles.answerText}>{stripHtml('content' in answer ? answer.content : `${answer.left} - ${answer.right}`)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Solution */}
      {showSolutions && question.solution && (
        <View style={styles.solutionContainer}>
          <Text style={styles.solutionTitle}>Lời giải:</Text>
          <Text style={styles.solutionText}>{stripHtml(question.solution)}</Text>
        </View>
      )}

      {/* Tags */}
      {showMetadata && question.tag && question.tag.length > 0 && (
        <View style={styles.tagsContainer}>
          {question.tag.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Generate PDF Document
 */
export function QuestionsPDFDocument({
  questions,
  options = {},
}: {
  questions: Question[];
  options?: ExportOptions;
}) {
  const {
    title = 'Bộ câu hỏi',
    showSolutions = true,
    showMetadata = true,
    includePageNumbers = true,
  } = options;

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header (only on first page) */}
        <View style={styles.header} fixed>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Tổng số câu hỏi: {questions.length} | Ngày xuất: {currentDate}
          </Text>
        </View>

        {/* Questions */}
        {questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index}
            showSolutions={showSolutions}
            showMetadata={showMetadata}
          />
        ))}

        {/* Footer with page numbers */}
        {includePageNumbers && (
          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>NyNus - Hệ thống câu hỏi trắc nghiệm</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `Trang ${pageNumber} / ${totalPages}`}
            />
          </View>
        )}
      </Page>
    </Document>
  );
}

/**
 * Generate PDF and trigger download
 */
export async function generatePDF(
  questions: Question[],
  options: ExportOptions = {},
  filename: string = 'questions.pdf'
): Promise<void> {
  try {
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(<QuestionsPDFDocument questions={questions} options={options} />).toBlob();
    
    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Không thể tạo file PDF. Vui lòng thử lại.');
  }
}


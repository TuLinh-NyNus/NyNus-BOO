/**
 * Question Detail Page
 * Dynamic page cho individual question detail theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eye, Star, Clock, Share2, Bookmark, ChevronUp } from 'lucide-react';

import { QUESTION_ROUTES, QUESTION_DYNAMIC_ROUTES } from '@/lib/question-paths';
// import { QuestionsBreadcrumb } from '@/components/questions/shared/breadcrumb/questions-breadcrumb';
import { QuestionsHeader } from '@/components/questions/layout/questions-header';
import { NavigationButtons } from '@/components/questions/shared/navigation-buttons';
import { Button } from '@/components/ui/button';
import { PublicQuestionService } from '@/services/public/question.service';
import { QuestionAnalyticsTracker } from '@/components/analytics/question-analytics-tracker';

// ===== TYPES =====

/**
 * Page Props Interface
 * Props cho dynamic question detail page
 */
interface QuestionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Question Answer Interface
 */
interface QuestionAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

/**
 * Question Data Interface (for internal use)
 */
interface QuestionData {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  type: string;
  views: number;
  rating: number;
  createdAt: string;
  answers?: QuestionAnswer[];
  solution?: string;
  tags: string[];
  author: string;
  lastUpdated?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Fetch question data từ backend
 * @param id - Question ID
 * @returns Question data hoặc null nếu không tìm thấy
 */
async function fetchQuestionData(id: string): Promise<QuestionData | null> {
  try {
    const publicQuestion = await PublicQuestionService.getPublicQuestionById(id);
    
    // Map to QuestionData format
    return {
      id: publicQuestion.id,
      title: publicQuestion.content.substring(0, 100), // First 100 chars as title
      content: publicQuestion.content,
      category: publicQuestion.category || 'Chưa phân loại',
      difficulty: publicQuestion.difficulty || 'Trung bình',
      type: publicQuestion.type,
      views: publicQuestion.views || 0,
      rating: publicQuestion.rating || 0,
      createdAt: new Date(publicQuestion.createdAt).toLocaleDateString('vi-VN'),
      answers: publicQuestion.answers,
      solution: publicQuestion.solution,
      tags: publicQuestion.tags,
      author: publicQuestion.author || 'Ẩn danh',
      lastUpdated: publicQuestion.updatedAt 
        ? new Date(publicQuestion.updatedAt).toLocaleDateString('vi-VN')
        : undefined,
    };
  } catch (error) {
    console.error('Error fetching question:', error);
    return null;
  }
}

/**
 * Fetch related questions
 * @param questionId - Source question ID
 * @returns Array of related questions
 */
async function fetchRelatedQuestions(questionId: string) {
  try {
    return await PublicQuestionService.getRelatedQuestions(questionId, 3);
  } catch (error) {
    console.error('Error fetching related questions:', error);
    return [];
  }
}

// ===== METADATA GENERATION =====

/**
 * Generate metadata cho question detail page
 * @param params - Page parameters
 * @returns Metadata object
 */
export async function generateMetadata({ params }: QuestionDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const question = await fetchQuestionData(resolvedParams.id);
  
  if (!question) {
    return {
      title: 'Câu hỏi không tồn tại | NyNus',
      description: 'Câu hỏi bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
      robots: {
        index: false,
        follow: false,
      }
    };
  }

  const metaTitle = question.title.length > 60 
    ? `${question.title.substring(0, 57)}...` 
    : question.title;
  const metaDescription = question.content.substring(0, 160);

  return {
    title: `${metaTitle} | NyNus`,
    description: metaDescription,
    keywords: [
      'ngân hàng câu hỏi',
      question.category?.toLowerCase() || '',
      question.difficulty?.toLowerCase() || '',
      ...question.tags
    ].filter(Boolean),
    openGraph: {
      title: `${question.title} | NyNus`,
      description: metaDescription,
      type: 'article',
      publishedTime: question.createdAt,
      modifiedTime: question.lastUpdated,
      tags: question.tags,
    },
    alternates: {
      canonical: `/questions/${resolvedParams.id}`,
    },
  };
}

// ===== MAIN COMPONENT =====

/**
 * Question Detail Page Component
 * Dynamic page hiển thị chi tiết câu hỏi với real data từ backend
 */
export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const resolvedParams = await params;
  
  // Fetch question data from backend
  const question = await fetchQuestionData(resolvedParams.id);

  // Return 404 if question not found
  if (!question) {
    notFound();
  }

  // Fetch related questions
  const relatedQuestions = await fetchRelatedQuestions(resolvedParams.id);

  // Increment view count (async, don't wait)
  PublicQuestionService.incrementViewCount(resolvedParams.id).catch(err => 
    console.error('Failed to increment view count:', err)
  );

  return (
    <div className="question-detail-page">
      {/* Analytics Tracker - tracks question view */}
      <QuestionAnalyticsTracker
        questionId={resolvedParams.id}
        questionType={question.type}
        category={question.category}
        difficulty={question.difficulty}
      />

      {/* Enhanced Page Header với QuestionsBreadcrumb */}
      <QuestionsHeader
        title={`Câu hỏi ${resolvedParams.id}`}
        description={question.title}
        showBreadcrumbs={false}  // Breadcrumb already shown in layout
        showBackButton={true}
        backButtonHref={QUESTION_ROUTES.BROWSE}
        backButtonLabel="Quay lại danh sách"
        variant="default"
        size="md"
        className="border-b"
      />

      {/* Question Meta Section */}
      <section className="question-meta py-6 border-b">
        <div className="container mx-auto px-4">
          {/* Question Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {question.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              question.difficulty === 'Dễ' ? 'bg-green-100 text-green-700' :
              question.difficulty === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {question.difficulty}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {question.type}
            </span>
          </div>

          {/* Question Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {question.title}
          </h1>

          {/* Question Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {question.views.toLocaleString()} lượt xem
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              {question.rating} đánh giá
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {question.createdAt}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content py-8">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Question Content */}
            <div className="lg:col-span-2">
              {/* Question Body */}
              <div className="question-content bg-card rounded-lg border p-6 mb-6">
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: question.content.replace(/\$([^$]+)\$/g, '<span class="math-inline">$1</span>') }} />
                </div>
              </div>
              
              {/* Answers (for multiple choice) */}
              {question.answers && (
                <div className="answers-section bg-card rounded-lg border p-6 mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Các đáp án:</h3>
                  <div className="space-y-3">
                    {question.answers.map((answer: QuestionAnswer) => (
                      <div
                        key={answer.id}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          answer.isCorrect 
                            ? 'border-green-200 bg-green-50 text-green-800' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-3">
                            {answer.id.toUpperCase()}.
                          </span>
                          <span dangerouslySetInnerHTML={{ __html: answer.content.replace(/\$([^$]+)\$/g, '<span class="math-inline">$1</span>') }} />
                          {answer.isCorrect && (
                            <span className="ml-auto text-green-600 font-medium">✓ Đúng</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Solution */}
              <div className="solution-section bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">Lời giải chi tiết</h3>
                  <button className="flex items-center text-primary hover:text-primary/80 transition-colors">
                    <span className="mr-2">Thu gọn</span>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: question.solution?.replace(/\$([^$]+)\$/g, '<span class="math-inline">$1</span>') || 'Không có lời giải' }} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Actions */}
              <div className="actions-card bg-card rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Thao tác</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Lưu câu hỏi
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                    <Share2 className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </button>
                </div>
              </div>
              
              {/* Question Info */}
              <div className="info-card bg-card rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Thông tin</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tác giả:</span>
                    <span className="font-medium">{question.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cập nhật:</span>
                    <span className="font-medium">{question.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono text-xs">{resolvedParams.id}</span>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div className="tags-card bg-card rounded-lg border p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Từ khóa</h3>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Related Questions */}
              <div className="related-card bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Câu hỏi liên quan</h3>
                <div className="space-y-3">
                  {relatedQuestions.map((related) => (
                    <Link
                      key={related.id}
                      href={QUESTION_DYNAMIC_ROUTES.DETAIL(related.id)}
                      className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <h4 className="font-medium text-foreground text-sm mb-1 line-clamp-2">
                        {related.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{related.category}</span>
                        <span>•</span>
                        <span>{related.difficulty}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Navigation Footer */}
      <section className="navigation-footer py-6 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Back Navigation */}
            <NavigationButtons
              showBack={true}
              showHome={true}
              backUrl={QUESTION_ROUTES.BROWSE}
              homeUrl={QUESTION_ROUTES.LANDING}
              backLabel="Quay lại danh sách"
              homeLabel="Ngân hàng câu hỏi"
              variant="outline"
              size="default"
            />

            {/* Question Navigation */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Câu hỏi {resolvedParams.id}</span>
              <span>•</span>
              <span>{question.category}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Lưu
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

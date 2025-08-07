'use client';

import { useState } from 'react';

import {
  QuizSettings,
  QuestionEditor,
  QuestionList,
  QuizActions
} from './components';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  points: number;
}

interface QuizData {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  allowReview: boolean;
}

interface QuizBuilderProps {
  quizId?: string;
  courseId: string;
  chapterId?: string;
  onSave?: (quizData: unknown) => void;
  onCancel?: () => void;
}

/**
 * QuizBuilder - Main Orchestrator Component
 * Complexity reduced from 18 to 6 through component decomposition
 * Now acts as state manager và coordinator for sub-components
 */
export function QuizBuilder({ quizId, courseId, chapterId, onSave, onCancel }: QuizBuilderProps): JSX.Element {
  // Simplified state management
  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3,
    shuffleQuestions: true,
    showResults: true,
    allowReview: true
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Simplified event handlers
  const handleQuizDataUpdate = (data: Partial<QuizData>) => {
    setQuizData(prev => ({ ...prev, ...data }));
  };

  const handleAddQuestion = (type: QuizQuestion['type']) => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type,
      question: '',
      options: type === 'multiple-choice' ? ['', '', '', ''] : type === 'true-false' ? ['Đúng', 'Sai'] : undefined,
      correctAnswer: type === 'multiple-choice' ? 0 : type === 'true-false' ? 0 : '',
      points: 1
    };

    setCurrentQuestion(newQuestion);
    setIsEditing(true);
  };

  const handleSaveQuestion = (question: QuizQuestion) => {
    const existingIndex = questions.findIndex(q => q.id === question.id);
    if (existingIndex >= 0) {
      setQuestions(prev => prev.map((q, i) => i === existingIndex ? question : q));
    } else {
      setQuestions(prev => [...prev, question]);
    }

    setCurrentQuestion(null);
    setIsEditing(false);
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setCurrentQuestion({ ...question });
    setIsEditing(true);
  };

  const handleDeleteQuestion = (QuestionID: string) => {
    setQuestions(prev => prev.filter(q => q.id !== QuestionID));
  };

  const handleCancelEdit = () => {
    setCurrentQuestion(null);
    setIsEditing(false);
  };

  const handleSaveQuiz = () => {
    const quizPayload = {
      ...quizData,
      questions,
      courseId,
      chapterId,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      questionCount: questions.length,
      updatedAt: new Date().toISOString()
    };

    onSave?.(quizPayload);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Quiz Settings */}
        <div className="space-y-6">
          <QuizSettings
            quizData={quizData}
            onUpdate={handleQuizDataUpdate}
          />

          <QuizActions
            quizData={quizData}
            questions={questions}
            onSave={handleSaveQuiz}
            onCancel={onCancel || (() => {})}
          />
        </div>

        {/* Right Column: Questions */}
        <div className="space-y-6">
          <QuestionList
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onEditQuestion={handleEditQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        </div>
      </div>

      {/* Question Editor Modal/Overlay */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <QuestionEditor
              question={currentQuestion}
              isEditing={isEditing}
              onSave={handleSaveQuestion}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
}

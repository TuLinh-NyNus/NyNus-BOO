'use client';

import { PlusCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';


import { Button } from '@/components/ui/form/button';
import { Badge } from "@/components/ui/display/badge";
import { Checkbox } from "@/components/ui/form/checkbox";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { RadioGroup, RadioGroupItem } from '@/components/ui/form/radio-group';
import logger from '@/lib/utils/logger';

import { QuestionFormData } from '@/lib/types/unified-question-form';

interface QuestionAnswerSectionProps {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
}

function getAnswerLabel(index: number): string {
  return String.fromCharCode(64 + (index + 1));
}

export function QuestionAnswerSection({ formData, setFormData }: QuestionAnswerSectionProps): JSX.Element {
  // Xác định loại câu hỏi
  const [questionType, setQuestionType] = useState<string>(formData.type || 'MC');

  // Cập nhật questionType khi formData.type thay đổi
  useEffect(() => {
    setQuestionType(formData.type || 'MC');

    // Log để debug
    logger.debug('QuestionAnswerSection - formData đã thay đổi:', {
      type: formData.type,
      Answers: formData.Answers?.length || 0,
      correctAnswer: formData.correctAnswer
    });
  }, [formData.type, formData.Answers, formData.correctAnswer]);

  // Thêm đáp án mới
  const addAnswer = () => {
    let newId = "1";

    // Đảm bảo formData.Answers tồn tại
    const Answers = formData.Answers || [];

    if (Answers.length > 0) {
      const maxId = Math.max(...Answers.map(a => parseInt(a.id) || 0)) || 0;
      newId = (maxId + 1).toString();
    }

    const newAnswer = {
      id: newId,
      content: '',
      isCorrect: false
    };

    setFormData(prev => ({
      ...prev,
      Answers: [...(prev.Answers || []), newAnswer]
    }));
  };

  // Xóa đáp án
  const removeAnswer = (id: string) => {
    // Đảm bảo formData.Answers tồn tại
    const Answers = formData.Answers || [];
    const answer = Answers.find(a => a.id === id);
    if (!answer) return;

    setFormData(prev => {
      // Đảm bảo prev.Answers tồn tại
      const prevAnswers = prev.Answers || [];

      // Xóa đáp án khỏi danh sách
      const newAnswers = prevAnswers.filter(a => a.id !== id);

      // Cập nhật correctAnswer
      let newcorrectAnswer = prev.correctAnswer;
      if (answer.isCorrect) {
        if (questionType === 'TF') {
          // Nếu là câu hỏi TF, correctAnswer là mảng
          if (Array.isArray(prev.correctAnswer)) {
            newcorrectAnswer = prev.correctAnswer.filter(a => a !== answer.content);
          }
        } else if (questionType === 'MC') {
          // Nếu là câu hỏi MC, correctAnswer là string
          if (prev.correctAnswer === answer.content) {
            newcorrectAnswer = '';
          }
        }
      }

      return {
        ...prev,
        Answers: newAnswers,
        correctAnswer: newcorrectAnswer
      };
    });
  };

  // Cập nhật nội dung đáp án
  const updateAnswerContent = (id: string, content: string) => {
    setFormData(prev => {
      // Đảm bảo prev.Answers tồn tại
      const prevAnswers = prev.Answers || [];

      // Cập nhật nội dung đáp án
      const newAnswers = prevAnswers.map(a =>
        a.id === id ? { ...a, content } : a
      );

      // Cập nhật correctAnswer nếu đáp án này là đáp án đúng
      let newcorrectAnswer = prev.correctAnswer;
      const answer = prevAnswers.find(a => a.id === id);

      if (answer?.isCorrect) {
        if (questionType === 'TF') {
          // Nếu là câu hỏi TF, correctAnswer là mảng
          if (Array.isArray(prev.correctAnswer)) {
            newcorrectAnswer = prev.correctAnswer.map(a =>
              a === answer.content ? content : a
            );
          }
        } else if (questionType === 'MC') {
          // Nếu là câu hỏi MC, correctAnswer là string
          if (prev.correctAnswer === answer.content) {
            newcorrectAnswer = content;
          }
        }
      }

      return {
        ...prev,
        Answers: newAnswers,
        correctAnswer: newcorrectAnswer
      };
    });
  };

  // Đánh dấu đáp án đúng (đơn lẻ cho trắc nghiệm)
  const markcorrectAnswer = (id: string) => {
    // Đảm bảo formData.Answers tồn tại
    const Answers = formData.Answers || [];
    const answer = Answers.find(a => a.id === id);
    if (!answer) return;

    setFormData(prev => {
      // Đảm bảo prev.Answers tồn tại
      const prevAnswers = prev.Answers || [];

      const updatedAnswers = prevAnswers.map(a =>
        ({ ...a, isCorrect: a.id === id })
      );

      return {
        ...prev,
        correctAnswer: [answer.content], // Lưu dưới dạng mảng để phù hợp với API
        Answers: updatedAnswers
      };
    });
  };

  // Đánh dấu đáp án đúng (nhiều) - chỉ cho câu hỏi đúng/sai
  const togglecorrectAnswer = (id: string, checked: boolean) => {
    // Đảm bảo formData.Answers tồn tại
    const Answers = formData.Answers || [];
    const answer = Answers.find(a => a.id === id);
    if (!answer) return;

    setFormData(prev => {
      // Đảm bảo prev.Answers tồn tại
      const prevAnswers = prev.Answers || [];

      const updatedAnswers = prevAnswers.map(a =>
        a.id === id ? { ...a, isCorrect: checked } : a
      );

      const correctContents = updatedAnswers
        .filter(a => a.isCorrect)
        .map(a => a.content);

      return {
        ...prev,
        correctAnswer: correctContents,
        Answers: updatedAnswers
      };
    });
  };

  // Cập nhật đáp án tự luận, trả lời ngắn
  const handleTextAnswerChange = (answer: string) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: [answer] // Lưu dưới dạng mảng để phù hợp với API
    }));
  };

  // Kiểm tra đáp án đúng
  const iscorrectAnswer = (answerId: string): boolean => {
    // Đảm bảo formData.Answers tồn tại
    const Answers = formData.Answers || [];
    const answer = Answers.find(a => a.id === answerId);
    return !!answer?.isCorrect;
  };

  // Hiển thị phần đáp án dựa trên loại câu hỏi
  const renderAnswerSection = () => {
    switch (questionType) {
      case 'MC': // Multiple Choice
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white transition-colors duration-300">Đáp án trắc nghiệm</h3>

            {/* Hiển thị đáp án đúng */}
            {formData.correctAnswer && (
              <div className="mb-4 p-3 bg-primary-gold/10 dark:bg-green-500/10 border border-primary-gold/30 dark:border-green-500/30 rounded-md transition-colors duration-300">
                <div className="font-medium text-primary-terracotta dark:text-green-500 transition-colors duration-300">
                  Đáp án đúng: {Array.isArray(formData.correctAnswer)
                    ? formData.correctAnswer.join(', ')
                    : formData.correctAnswer}
                </div>
              </div>
            )}

            {/* Danh sách đáp án */}
            {(formData.Answers || []).map((answer, index) => {
              const isCorrect = iscorrectAnswer(answer.id);

              return (
                <div
                  key={answer.id}
                  className={`p-4 border rounded-md relative ${isCorrect ? 'border-primary-gold/30 dark:border-green-500/50 bg-primary-gold/5 dark:bg-green-500/5' : 'border-primary-terracotta/20 dark:border-slate-700'} transition-colors duration-300`}
                >
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnswer(answer.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="pt-2">
                      <RadioGroup
                        value={isCorrect ? answer.id : ''}
                        onValueChange={markcorrectAnswer}
                      >
                        <RadioGroupItem
                          value={answer.id}
                          id={`answer-correct-${answer.id}`}
                        />
                      </RadioGroup>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`answer-${answer.id}`} className="mb-1 flex items-center gap-2 text-slate-800 dark:text-white transition-colors duration-300">
                        <Badge className={`h-6 w-6 flex items-center justify-center rounded-full ${isCorrect ? 'bg-primary-gold/20 dark:bg-green-500/20 text-primary-terracotta dark:text-green-500 border-primary-gold/30 dark:border-green-500/30' : 'bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white'} transition-colors duration-300`}>
                          {getAnswerLabel(index)}
                        </Badge>
                        {isCorrect && (
                          <Badge variant="outline" className="bg-primary-gold/20 dark:bg-green-500/20 text-primary-terracotta dark:text-green-500 border-primary-gold/30 dark:border-green-500/30 transition-colors duration-300">
                            Đáp án đúng
                          </Badge>
                        )}
                      </Label>
                      <Textarea
                        id={`answer-${answer.id}`}
                        value={answer.content}
                        onChange={(e) => updateAnswerContent(answer.id, e.target.value)}
                        placeholder="Nhập nội dung đáp án"
                        className={`min-h-[80px] bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300 ${isCorrect ? 'border-primary-gold/30 dark:border-green-500/50' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              onClick={addAnswer}
              type="button"
              className="w-full mt-2 bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 hover:bg-nynus-silver dark:hover:bg-slate-700 transition-colors duration-300 hover:scale-105"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Thêm đáp án
            </Button>
          </div>
        );

      case 'TF': // True/False
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800 dark:text-white transition-colors duration-300">Đáp án đúng/sai</h3>

            {/* Hiển thị đáp án đúng */}
            {formData.correctAnswer && (
              <div className="mb-4 p-3 bg-primary-gold/10 dark:bg-green-500/10 border border-primary-gold/30 dark:border-green-500/30 rounded-md transition-colors duration-300">
                <div className="font-medium text-primary-terracotta dark:text-green-500 transition-colors duration-300">
                  Đáp án đúng: {Array.isArray(formData.correctAnswer)
                    ? formData.correctAnswer.join(', ')
                    : formData.correctAnswer}
                </div>
              </div>
            )}

            {/* Danh sách đáp án */}
            {(formData.Answers || []).map((answer, index) => {
              const isCorrect = iscorrectAnswer(answer.id);

              return (
                <div
                  key={answer.id}
                  className={`p-4 border rounded-md relative ${isCorrect ? 'border-primary-gold/30 dark:border-green-500/50 bg-primary-gold/5 dark:bg-green-500/5' : 'border-primary-terracotta/20 dark:border-slate-700'} transition-colors duration-300`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="pt-2">
                      <Checkbox
                        checked={isCorrect}
                        id={`answer-correct-${answer.id}`}
                        onCheckedChange={(checked) => togglecorrectAnswer(answer.id, checked as boolean)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`answer-${answer.id}`} className="mb-1 flex items-center gap-2 text-slate-800 dark:text-white transition-colors duration-300">
                        <Badge className={`h-6 w-6 flex items-center justify-center rounded-full ${isCorrect ? 'bg-primary-gold/20 dark:bg-green-500/20 text-primary-terracotta dark:text-green-500 border-primary-gold/30 dark:border-green-500/30' : 'bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white'} transition-colors duration-300`}>
                          {getAnswerLabel(index)}
                        </Badge>
                        {isCorrect && (
                          <Badge variant="outline" className="bg-primary-gold/20 dark:bg-green-500/20 text-primary-terracotta dark:text-green-500 border-primary-gold/30 dark:border-green-500/30 transition-colors duration-300">
                            Đáp án đúng
                          </Badge>
                        )}
                      </Label>
                      <Textarea
                        id={`answer-${answer.id}`}
                        value={answer.content}
                        onChange={(e) => updateAnswerContent(answer.id, e.target.value)}
                        placeholder="Nhập nội dung đáp án"
                        className={`min-h-[80px] bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300 ${isCorrect ? 'border-primary-gold/30 dark:border-green-500/50' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              onClick={addAnswer}
              type="button"
              className="w-full mt-2 bg-nynus-cream dark:bg-slate-800 text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 hover:bg-nynus-silver dark:hover:bg-slate-700 transition-colors duration-300 hover:scale-105"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Thêm đáp án
            </Button>
          </div>
        );

      case 'SA': // Short Answer
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-nynus-dark dark:text-white transition-colors duration-300">Đáp án trả lời ngắn</h3>
            <div className="mb-2 text-sm text-nynus-medium dark:text-slate-400 transition-colors duration-300">
              Nhập câu trả lời ngắn mà học sinh/sinh viên phải nhập chính xác để được tính là đúng
            </div>
            <Textarea
              id="short-answer"
              value={Array.isArray(formData.correctAnswer) && formData.correctAnswer.length > 0
                ? formData.correctAnswer[0]
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Nhập đáp án trả lời ngắn (ví dụ: 42, Paris, H2O, etc.)"
              className="min-h-[80px] bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300"
            />
          </div>
        );

      case 'ES': // Essay
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-nynus-dark dark:text-white transition-colors duration-300">Đáp án tự luận</h3>
            <div className="mb-2 text-sm text-nynus-medium dark:text-slate-400 transition-colors duration-300">
              Nhập gợi ý đáp án tự luận cho giáo viên chấm điểm
            </div>
            <Textarea
              id="essay-answer"
              value={Array.isArray(formData.correctAnswer) && formData.correctAnswer.length > 0
                ? formData.correctAnswer[0]
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Nhập gợi ý đáp án tự luận"
              className="min-h-[150px] bg-nynus-cream dark:bg-black text-nynus-dark dark:text-white border-primary-terracotta/20 dark:border-slate-700 transition-colors duration-300"
            />
          </div>
        );

      default:
        return (
          <div className="text-nynus-medium dark:text-slate-400 transition-colors duration-300">
            Không có thông tin đáp án cho loại câu hỏi này
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 bg-nynus-jade dark:bg-slate-950 border border-primary-terracotta/20 dark:border-slate-800 p-4 rounded-md transition-colors duration-300">
      {renderAnswerSection()}
    </div>
  );
}

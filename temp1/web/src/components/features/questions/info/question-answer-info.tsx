'use client';

import { Trash2, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';


import { Button } from '@/components/ui/form/button';
import { Badge } from "@/components/ui/display/badge";
import { Checkbox } from "@/components/ui/form/checkbox";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { RadioGroup, RadioGroupItem } from '@/components/ui/form/radio-group';
import logger from '@/lib/utils/logger';

import { correctAnswerDisplay } from '../components/question-display';
import { QuestionFormData, QuestionAnswer } from '@/lib/types/unified-question-form';



interface QuestionAnswerInfoProps {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
}

function getAnswerLabel(index: number): string {
  return String.fromCharCode(64 + (index + 1));
}

export function QuestionAnswerInfo({ formData, setFormData }: QuestionAnswerInfoProps): JSX.Element {
  // Xác định loại đáp án dựa vào loại câu hỏi
  type QuestionFormType = 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'essay';

  const [answerType, setAnswerType] = useState<QuestionFormType>(
    (formData.questionID?.form as QuestionFormType) || 'multiple-choice'
  );

  // Cập nhật answerType khi formData.questionID?.form thay đổi
  useEffect(() => {
    setAnswerType((formData.questionID?.form as QuestionFormType) || 'multiple-choice');

    // Log để debug
    logger.info('QuestionAnswerInfo - formData đã thay đổi:', {
      form: formData.questionID?.form,
      Type: formData.type,
      Answers: formData.Answers?.length || 0,
      correctAnswer: formData.correctAnswer
    });
  }, [formData.questionID?.form, formData.Answers, formData.correctAnswer]);

  // Cập nhật correctAnswer dựa trên content của Answers có isCorrect là true
  const updatecorrectAnswerFromContent = (Answers: QuestionAnswer[]) => {
    // Đảm bảo Answers tồn tại
    const safeAnswers = Answers || [];
    const correctAnswers = safeAnswers.filter((a: QuestionAnswer) => a.isCorrect);

    if (answerType === 'true-false') {
      return correctAnswers.map((a: QuestionAnswer) => a.content); // Đã là mảng
    } else if (correctAnswers.length > 0) {
      return [correctAnswers[0].content]; // Chuyển thành mảng
    }

    return []; // Trả về mảng rỗng thay vì chuỗi rỗng
  };

  // Thêm đáp án mới
  const addAnswer = () => {
    let newId = "1";

    // Đảm bảo formData.Answers tồn tại
    const Answers = formData.Answers || [];

    if (Answers.length > 0) {
      const maxId = Math.max(...Answers.map((a: QuestionAnswer) => parseInt(a.id) || 0)) || 0;
      newId = (maxId + 1).toString();
    }

    const newAnswer: QuestionAnswer = {
      id: newId,
      content: '',
      isCorrect: false
    };

    setFormData((prev: QuestionFormData) => ({
      ...prev,
      Answers: [...(prev.Answers || []), newAnswer]
    }));
  };

  // Xóa đáp án
  const removeAnswer = (id: string) => {
    // Đảm bảo formData.Answers tồn tại
    const Answers = formData.Answers || [];
    const answer = Answers.find((a: QuestionAnswer) => a.id === id);
    if (!answer) return;

    setFormData((prev: QuestionFormData) => {
      // Đảm bảo prev.Answers tồn tại
      const prevAnswers = prev.Answers || [];

      // Xóa đáp án khỏi danh sách
      const newAnswers = prevAnswers.filter((a: QuestionAnswer) => a.id !== id);

      // Cập nhật correctAnswer dựa trên content
      let newcorrectAnswer = updatecorrectAnswerFromContent(newAnswers);

      // Đảm bảo correctAnswer luôn là mảng
      if (!Array.isArray(newcorrectAnswer)) {
        newcorrectAnswer = newcorrectAnswer ? [newcorrectAnswer] : [];
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
    setFormData((prev: QuestionFormData) => {
      // Đảm bảo prev.Answers tồn tại
      const prevAnswers = prev.Answers || [];

      // Cập nhật nội dung đáp án
      const newAnswers = prevAnswers.map((a: QuestionAnswer) =>
        a.id === id ? { ...a, content } : a
      );

      // Cập nhật correctAnswer nếu đáp án này là đáp án đúng
      const AnswersWithUpdatedContent = newAnswers.map((a: QuestionAnswer) =>
        a.id === id ? { ...a, content } : a
      );

      let newcorrectAnswer = updatecorrectAnswerFromContent(AnswersWithUpdatedContent);

      // Đảm bảo correctAnswer luôn là mảng
      if (!Array.isArray(newcorrectAnswer)) {
        newcorrectAnswer = newcorrectAnswer ? [newcorrectAnswer] : [];
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
    const answer = Answers.find((a: QuestionAnswer) => a.id === id);
    if (!answer) return;

    setFormData((prev: QuestionFormData) => {
      // Đảm bảo prev.Answers tồn tại
      const prevAnswers = prev.Answers || [];

      const updatedAnswers = prevAnswers.map((a: QuestionAnswer) =>
        ({ ...a, isCorrect: a.id === id })
      );

      return {
        ...prev,
        correctAnswer: [answer.content], // Đảm bảo correctAnswer luôn là mảng
        Answers: updatedAnswers
      };
    });
  };

  // Đánh dấu đáp án đúng (nhiều) - chỉ cho câu hỏi đúng/sai
  const togglecorrectAnswer = (id: string, checked: boolean) => {
    // Đảm bảo formData.Answers tồn tại
    const Answers = formData.Answers || [];
    const answer = Answers.find((a: QuestionAnswer) => a.id === id);
    if (!answer) return;

    setFormData((prev: QuestionFormData) => {
      // Đảm bảo prev.Answers tồn tại
      const prevAnswers = prev.Answers || [];

      const updatedAnswers = prevAnswers.map((a: QuestionAnswer) =>
        a.id === id ? { ...a, isCorrect: checked } : a
      );

      const correctContents = updatedAnswers
        .filter((a: QuestionAnswer) => a.isCorrect)
        .map((a: QuestionAnswer) => a.content);

      return {
        ...prev,
        correctAnswer: correctContents,
        Answers: updatedAnswers
      };
    });
  };

  // Cập nhật đáp án tự luận, trả lời ngắn và ghép đôi
  const handleTextAnswerChange = (answer: string) => {
    setFormData((prev: QuestionFormData) => ({
      ...prev,
      correctAnswer: [answer] // Đảm bảo correctAnswer luôn là mảng
    }));
  };

  // Kiểm tra đáp án đúng
  const iscorrectAnswer = (answerId: string): boolean => {
    // Đảm bảo formData.Answers tồn tại
    const Answers = formData.Answers || [];
    const answer = Answers.find((a: QuestionAnswer) => a.id === answerId);
    return !!answer?.isCorrect;
  };

  return (
    <div className="space-y-6 bg-slate-950 border border-slate-800 p-4 rounded-md">
      <div>
        <h3 className="text-lg font-medium mb-4">Đáp án</h3>

        <div className="mb-4">
          <Label className="mb-2 block">Loại câu hỏi: <span className="font-semibold">{
            {
              'multiple-choice': 'Trắc nghiệm',
              'true-false': 'Đúng/Sai',
              'short-answer': 'Trả lời ngắn',
              'matching': 'Ghép đôi',
              'essay': 'Tự luận'
            }[answerType]
          }</span></Label>
        </div>

        {answerType === 'multiple-choice' ? (
          <>
            {/* Hiển thị đáp án đúng */}
            <div className="mb-4">
              <correctAnswerDisplay formData={formData as QuestionFormData} />
            </div>

            <div className="space-y-4">
              {(formData.Answers || []).map((answer: QuestionAnswer, index: number) => {
                const isCorrect = iscorrectAnswer(answer.id);

                return (
                  <div
                    key={answer.id}
                    className={`p-4 border rounded-md relative ${isCorrect ? 'border-green-500/50 bg-green-500/5' : ''}`}
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
                        <Label htmlFor={`answer-${answer.id}`} className="mb-1 flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`h-6 w-6 flex items-center justify-center rounded-full ${isCorrect ? 'bg-green-500/20 text-green-600 border-green-500/30' : 'bg-slate-800'}`}>
                              {getAnswerLabel(index)}
                            </Badge>
                            {isCorrect && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                                Đáp án đúng
                              </Badge>
                            )}
                          </div>
                        </Label>
                        <Textarea
                          id={`answer-${answer.id}`}
                          value={answer.content}
                          onChange={(e) => updateAnswerContent(answer.id, e.target.value)}
                          placeholder="Nhập nội dung đáp án"
                          className={`min-h-[80px] bg-black text-white border-slate-700 ${isCorrect ? 'border-green-500/50' : ''}`}
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
                className="w-full mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Thêm đáp án
              </Button>
            </div>
          </>
        ) : answerType === 'true-false' ? (
          <>
            {/* Hiển thị đáp án đúng cho câu hỏi Đúng/Sai */}
            <div className="mb-4">
              <correctAnswerDisplay formData={formData as QuestionFormData} />
            </div>

            <div className="space-y-4">
              {(formData.Answers || []).map((answer: QuestionAnswer, index: number) => {
                const isCorrect = iscorrectAnswer(answer.id);

                return (
                  <div
                    key={answer.id}
                    className={`p-4 border rounded-md relative ${isCorrect ? 'border-green-500/50 bg-green-500/5' : ''}`}
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
                        <Label htmlFor={`answer-${answer.id}`} className="mb-1 flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`h-6 w-6 flex items-center justify-center rounded-full ${isCorrect ? 'bg-green-500/20 text-green-600 border-green-500/30' : 'bg-slate-800'}`}>
                              {getAnswerLabel(index)}
                            </Badge>
                            {isCorrect && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                                Đáp án đúng
                              </Badge>
                            )}
                          </div>
                        </Label>
                        <div className="p-4 bg-black text-white border border-slate-700 rounded-md">
                          {answer.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : answerType === 'short-answer' ? (
          <div className="space-y-4">
            <Label htmlFor="short-answer">Đáp án trả lời ngắn</Label>
            <div className="mb-2 text-sm text-muted-foreground">
              Nhập câu trả lời ngắn mà học sinh/sinh viên phải nhập chính xác để được tính là đúng
            </div>
            <Textarea
              id="short-answer"
              value={Array.isArray(formData.correctAnswer) && formData.correctAnswer.length > 0
                ? formData.correctAnswer[0]
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Nhập đáp án trả lời ngắn (ví dụ: 42, Paris, H2O, etc.)"
              className="min-h-[80px] bg-black text-white border-slate-700"
            />
          </div>
        ) : answerType === 'matching' ? (
          <div className="space-y-4">
            <Label>Đáp án ghép đôi</Label>
            <div className="mb-2 text-sm text-muted-foreground">
              Nhập các cặp ghép đôi, mỗi cặp trên một dòng theo định dạng &ldquo;Mục bên trái ⟷ Mục bên phải&rdquo;
            </div>
            <Textarea
              value={Array.isArray(formData.correctAnswer)
                ? formData.correctAnswer.join('\n')
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => {
                const pairsArray = e.target.value.split('\n').filter(line => line.trim());
                setFormData((prev: QuestionFormData) => ({
                  ...prev,
                  correctAnswer: pairsArray
                }));
              }}
              placeholder="Ví dụ:\nParis ⟷ Pháp\nLondon ⟷ Anh\nBerlin ⟷ Đức"
              className="min-h-[150px] bg-black text-white border-slate-700"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Label htmlFor="essay-answer">Đáp án tự luận</Label>
            <div className="mb-2 text-sm text-muted-foreground">
              Nhập gợi ý đáp án tự luận cho giáo viên chấm điểm
            </div>
            <Textarea
              id="essay-answer"
              value={Array.isArray(formData.correctAnswer) && formData.correctAnswer.length > 0
                ? formData.correctAnswer[0]
                : (typeof formData.correctAnswer === 'string' ? formData.correctAnswer : '')}
              onChange={(e) => handleTextAnswerChange(e.target.value)}
              placeholder="Nhập gợi ý đáp án tự luận"
              className="min-h-[150px] bg-black text-white border-slate-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}

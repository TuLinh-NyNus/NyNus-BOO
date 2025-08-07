'use client';

import { Save } from "lucide-react";
import { useState, useEffect, useCallback } from 'react';


import { Button, Badge, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { fetchWithAuth } from '@/lib/api';
import { cn } from '@/lib/utils';
import logger from '@/lib/utils/logger';

import { QuestionAnswerInfo, QuestionAnswerSection, QuestionBasicInfo, QuestionMetadataInfo } from '../../info';
import { QuestionIDInfo } from '../../mapid';

// Import các components con



export interface QuestionAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
}

export type QuestionFormData = {
  id?: string; // ID của câu hỏi trong cơ sở dữ liệu
  _id?: string; // ID cũ (giữ lại để tương thích)

  // 1. rawContent: Nội dung gốc LaTex của câu hỏi
  rawContent: string;
  raw_content?: string; // Tương thích với tên field cũ

  // 2. QuestionID: Mục đích dùng để phân loại câu hỏi
  QuestionID?: string; // Định dạng XXXXX-X

  // Định danh - QuestionID (chi tiết)
  questionID: {
    format: string;
    fullId: string;
    grade: {
      value?: string;
      description?: string;
      id?: string;
      name?: string;
      level?: number;
    };
    subject: {
      value?: string;
      description?: string;
      id?: string;
      name?: string;
    };
    chapter: {
      value?: string;
      description?: string;
      id?: string;
      name?: string;
      level?: number;
    } | null;
    level?: {
      value?: string;
      description?: string;
      id?: string;
      name?: string;
      level?: number;
    };
    lesson: {
      value?: string;
      description?: string;
      id?: string;
      name?: string;
    } | null;
    form: {
      value?: string;
      description?: string;
      id?: string;
      name?: string;
    };
    [key: string]: unknown; // Cho phép các trường động
  };

  // 3. subcount: Mục đích dành cho học sinh dễ truy vấn câu hỏi - aligned with Prisma schema
  subcount: {
    prefix: string;
    number: string;
    fullId: string;
  };

  // 4. Type: Loại câu hỏi (multiple-choice, true-false, short-answer, essay)
  type: string;

  // 5. Source: Nguồn câu hỏi
  source: string;

  // 6. Content: Nội dung câu hỏi đã xử lý
  content: string;

  // 7. answers: Danh sách đáp án
  answers?: QuestionAnswer[];

  // 8. correctAnswer: Đáp án đúng
  correctAnswer?: string | string[];

  // 9. Solution: Lời giải câu hỏi
  solution: string;

  // 10. Images: Danh sách hình ảnh
  images: {
    questionImage: string | null;
    solutionImage: string | null;
  };

  // 11. Tags: Nhãn phân loại
  tags: string[];

  // 12. usageCount: Số lần sử dụng - aligned with Prisma schema
  usageCount: number;

  // 13. Creator: Thông tin người tạo
  creatorId?: string;
  creator: {
    id: string | null;
    name: string | null;
  };

  // 14. Status: Trạng thái câu hỏi
  status: {
    code: string;
    lastUpdated: Date | string;
  };

  // 15. ExamRefs: Tham chiếu đến các bài kiểm tra
  examRefs: Array<{ id: string; name: string; date: string | Date }> | null;

  // 16. Feedback: Số lần câu hỏi này được feedback
  feedback: {
    count: number; // Số lần feedback
    averageDifficulty: number;
    clarity: number;
    correctnessRate: number;
    feedbackCount: number;
    comments: Array<{
      id: string;
      userId: string;
      content: string;
      date: Date | string;
     }>;
  };

  // Trường bổ sung
  difficulty?: string; // Độ khó của câu hỏi

  // Lịch sử sử dụng
  usageHistory: Array<{
    examId: string;
    examName: string;
    date: Date | string;
    questionPosition: number;
  }>;

  // Thời gian
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type QuestionFormTabsProps = {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  isLoading?: boolean;
  hideIdentityTab?: boolean;
};

export function QuestionFormTabs({
  formData,
  setFormData,
  isLoading = false,
  hideIdentityTab = false
}: QuestionFormTabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState("content");
  // const [isAnalyzing, setIsAnalyzing] = useState(false); // Commented out as it's not used
  // const [isSaving, setIsSaving] = useState(false); // Commented out as it's not used
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  /*
  // Tối ưu hóa hàm validateFormData bằng cách sử dụng useCallback
  // Được sử dụng trong hàm saveQuestionToDatabase đã bị comment out
  const validateFormData = useCallback((data: QuestionFormData): string[] => {
    const errors = [];

    // Kiểm tra các trường bắt buộc
    if (!data.content.trim()) {
      errors.push('Nội dung câu hỏi không được để trống');
    }

    // Kiểm tra cả form và type để đảm bảo tương thích
    if (!data.form && !data.type) {
      errors.push('Loại câu hỏi không được để trống');
    }

    // Kiểm tra ID câu hỏi
    if (!data.QuestionID?.fullId) {
      errors.push('ID câu hỏi không được để trống');
    }

    // Sử dụng form hoặc type tùy theo cái nào có giá trị
    const questionType = data.form || data.type;

    // Kiểm tra đáp án cho câu hỏi trắc nghiệm
    if (questionType === 'multiple-choice') {
      if (!data.answers || data.answers.length < 2) {
        errors.push('Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án');
      }

      const hascorrectAnswer = data.answers?.some(answer => answer.isCorrect);
      if (!hascorrectAnswer) {
        errors.push('Cần chọn ít nhất một đáp án đúng');
      }
    }

    // Kiểm tra đáp án cho câu hỏi trả lời ngắn
    if (questionType === 'short-answer' && (!data.correctAnswer ||
        (Array.isArray(data.correctAnswer) && data.correctAnswer.length === 0))) {
      errors.push('Cần nhập đáp án cho câu hỏi trả lời ngắn');
    }

    return errors;
  }, []);
  */

  // Sử dụng useCallback để tránh tạo lại hàm khi render
  const handleFormDataChange = useCallback((newData: Partial<QuestionFormData>) => {
    setFormData(prevData => {
      const updatedData = { ...newData };

      // Không cần đồng bộ hóa type và form nữa vì chỉ sử dụng type

      // Đồng bộ hóa QuestionID và questionID.fullId
      if (updatedData.QuestionID && !updatedData.questionID?.fullId) {
        updatedData.questionID = {
          ...prevData.questionID,
          fullId: updatedData.QuestionID
        };
      } else if (updatedData.questionID?.fullId && !updatedData.QuestionID) {
        updatedData.QuestionID = updatedData.questionID.fullId;
      }

      // Đảm bảo Subcount tồn tại
      if (!prevData.subcount) {
        updatedData.subcount = updatedData.subcount || {
          prefix: "",
          number: "",
          fullId: ""
        };
      }

      return {
        ...prevData,
        ...updatedData
      };
    });
  }, [setFormData]);

  // Tạo hàm adaptedSetFormData để có thể sử dụng với các component con
  const adaptedSetFormData: React.Dispatch<React.SetStateAction<QuestionFormData>> = useCallback((valueOrFunction) => {
    if (typeof valueOrFunction === 'function') {
      // Nếu valueOrFunction là một function, gọi nó với state hiện tại
      setFormData(prev => {
        const updatedValue = (valueOrFunction as ((prev: QuestionFormData) => QuestionFormData))(prev);

        // Không cần đồng bộ hóa type và form nữa vì chỉ sử dụng type

        // Đồng bộ hóa QuestionID và questionID.fullId
        if (updatedValue.QuestionID && updatedValue.QuestionID !== prev.questionID?.fullId) {
          updatedValue.questionID = {
            ...prev.questionID,
            fullId: updatedValue.QuestionID
          };
        } else if (updatedValue.questionID?.fullId && updatedValue.questionID.fullId !== prev.QuestionID) {
          updatedValue.QuestionID = updatedValue.questionID.fullId;
        }

        // Đảm bảo Subcount tồn tại
        if (!updatedValue.subcount) {
          updatedValue.subcount = {
            prefix: "",
            number: "",
            fullId: ""
          };
        }

        return updatedValue;
      });
    } else {
      // Nếu valueOrFunction là một object, sử dụng handleFormDataChange để merge với state hiện tại
      handleFormDataChange(valueOrFunction);
    }
  }, [setFormData, handleFormDataChange]);

  // Hàm lấy danh sách câu hỏi từ CSDL sử dụng useCallback
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoadingQuestions(true);

      // Cookie-based authentication - không cần lấy token từ localStorage
      // fetchWithAuth sẽ tự động sử dụng secure httpOnly cookies

      // Sử dụng URL không có tham số debug để tránh lỗi validation từ backend
      const url = '/api/admin/questions';

      const response = await fetchWithAuth(url, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Không thể lấy danh sách câu hỏi';
        logger.error('Error fetching questions:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      logger.debug('Fetched questions:', data);
      setQuestions(data.data?.questions || []);
    } catch (error) {
      logger.error('Error fetching questions:', error);
      setSaveStatus('error');
      setSaveMessage(error instanceof Error ? error.message : "Không thể lấy danh sách câu hỏi");
    } finally {
      setIsLoadingQuestions(false);
    }
  }, []);

  // Gọi API lấy danh sách câu hỏi khi component mount
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSaveQuestion = useCallback(async () => {
    // Xử lý lưu câu hỏi
    logger.debug("Lưu câu hỏi:", formData);
    // Không thực hiện lưu trực tiếp ở đây, vì chức năng lưu đã được xử lý ở component cha
  }, [formData]);



  // Hàm xử lý khi chọn một câu hỏi từ danh sách
  const handleSelectQuestion = useCallback((question: QuestionFormData) => {
    // Tạo bản sao mới của question để tránh tham chiếu
    const newQuestion = JSON.parse(JSON.stringify(question));

    // Đảm bảo trường rawContent được thiết lập
    if (newQuestion.rawContent && !newQuestion.rawContent) {
      newQuestion.rawContent = newQuestion.rawContent;
      delete newQuestion.rawContent; // Xóa trường raw_content
    }

    // Đồng bộ hóa QuestionID và questionID.fullId
    if (newQuestion.QuestionID && !newQuestion.QuestionID?.fullId) {
      newQuestion.QuestionID = {
        ...newQuestion.QuestionID,
        fullId: newQuestion.QuestionID
      };
    } else if (newQuestion.QuestionID?.fullId && !newQuestion.QuestionID) {
      newQuestion.QuestionID = newQuestion.QuestionID.fullId;
    }

    // Đảm bảo feedback có cấu trúc đúng
    if (typeof newQuestion.Feedback === 'number') {
      newQuestion.Feedback = {
        count: newQuestion.Feedback,
        averageDifficulty: 0,
        clarity: 0,
        correctnessRate: 0,
        feedbackCount: newQuestion.Feedback,
        comments: []
      };
    } else if (!newQuestion.Feedback) {
      newQuestion.Feedback = {
        count: 0,
        averageDifficulty: 0,
        clarity: 0,
        correctnessRate: 0,
        feedbackCount: 0,
        comments: []
      };
    }

    // Đảm bảo Subcount có cấu trúc đúng
    if (!newQuestion.subcount) {
      newQuestion.subcount = {
        prefix: "",
        number: "",
        fullId: ""
      };
    }

    // Log để debug
    logger.info('Chọn câu hỏi:', {
      content: newQuestion.content?.substring(0, 50) + '...',
      type: newQuestion.type,
      questionID: newQuestion.QuestionID?.fullId,
      formData: JSON.stringify(newQuestion).substring(0, 200) + '...'
    });

    setFormData(newQuestion);
    setActiveTab("content");
  }, [setFormData]);

  return (
    <Tabs
      defaultValue="content"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-3 mb-4 bg-nynus-cream dark:bg-slate-800/50 text-nynus-dark dark:text-white transition-colors duration-300">
        <TabsTrigger value="content" disabled={isLoading} className="data-[state=active]:bg-primary-gold/20 data-[state=active]:text-primary-terracotta dark:data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:text-indigo-400 transition-colors duration-300 hover:scale-105">
          Nội dung
        </TabsTrigger>
        <TabsTrigger value="metadata" disabled={isLoading} className="data-[state=active]:bg-primary-gold/20 data-[state=active]:text-primary-terracotta dark:data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:text-indigo-400 transition-colors duration-300 hover:scale-105">
          Metadata & Lịch sử
        </TabsTrigger>
        <TabsTrigger value="list" disabled={isLoading || isLoadingQuestions} className="data-[state=active]:bg-primary-gold/20 data-[state=active]:text-primary-terracotta dark:data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:text-indigo-400 transition-colors duration-300 hover:scale-105">
          Danh sách câu hỏi {isLoadingQuestions && "..."}
        </TabsTrigger>
      </TabsList>

      <div className={cn("rounded-md border p-4 bg-nynus-jade dark:bg-slate-950 border-primary-terracotta/20 dark:border-slate-800 transition-colors duration-300", isLoading && "opacity-60")}>
        <TabsContent value="content" className="mt-0 space-y-8">
          {/* Thông tin cơ bản của câu hỏi */}
          <QuestionBasicInfo formData={formData as QuestionFormData} setFormData={adaptedSetFormData} />

          {/* Phần Định danh */}
          {!hideIdentityTab && (
            <>
              <Separator className="my-6 bg-slate-200 dark:bg-slate-700 transition-colors duration-300" />
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">Định danh</h3>
                <QuestionIDInfo formData={formData as QuestionFormData} setFormData={adaptedSetFormData} />
              </div>
            </>
          )}

          {/* Phần đáp án */}
          <Separator className="my-6 bg-slate-200 dark:bg-slate-700 transition-colors duration-300" />
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">Đáp án</h3>
            <QuestionAnswerSection formData={formData as QuestionFormData} setFormData={adaptedSetFormData} />
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSaveQuestion}
              className="flex items-center gap-2 bg-primary-gold hover:bg-primary-sienna text-nynus-dark hover:text-nynus-light transition-colors duration-300 hover:scale-105"
            >
              <Save className="h-4 w-4" />
              Lưu câu hỏi
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="mt-0">
          <QuestionMetadataInfo formData={formData as QuestionFormData} setFormData={adaptedSetFormData} />
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSaveQuestion}
              className="flex items-center gap-2 bg-primary-gold hover:bg-primary-sienna text-nynus-dark hover:text-nynus-light transition-colors duration-300 hover:scale-105"
            >
              <Save className="h-4 w-4" />
              Lưu câu hỏi
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">Danh sách câu hỏi</h3>
            {isLoadingQuestions ? (
              <div className="text-center py-4 text-slate-600 dark:text-slate-400 transition-colors duration-300">Đang tải danh sách câu hỏi...</div>
            ) : questions.length > 0 ? (
              <div className="space-y-2">
                {questions.map((question) => (
                  <div
                    key={question._id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors duration-300 hover:scale-105"
                    onClick={() => handleSelectQuestion(question)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-slate-800 dark:text-white transition-colors duration-300">{question.QuestionID?.fullId}</div>
                        <div className="text-sm text-slate-600 dark:text-gray-400 mt-1 transition-colors duration-300">{question.content}</div>
                      </div>
                      <Badge className="bg-primary-pink/20 dark:bg-indigo-500/20 text-primary-sienna dark:text-indigo-400 transition-colors duration-300">{question.type || 'multiple-choice'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 dark:text-gray-500 transition-colors duration-300">
                Chưa có câu hỏi nào trong cơ sở dữ liệu
              </div>
            )}
          </div>
        </TabsContent>

        {/* Hiển thị thông báo lỗi hoặc thành công nếu có */}
        {saveStatus !== 'idle' && (
          <div className={cn(
            "mt-4 p-3 rounded-md transition-colors duration-300",
            saveStatus === 'success' ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border border-green-300 dark:border-green-500/30" :
            saveStatus === 'error' ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-300 dark:border-red-500/30" : ""
          )}>
            {saveMessage}
          </div>
        )}
      </div>
    </Tabs>
  );
}

export default QuestionFormTabs;

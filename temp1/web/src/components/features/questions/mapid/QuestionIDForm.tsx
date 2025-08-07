'use client';

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import logger from "@/lib/utils/logger";
import { QuestionFormData } from "../components/question-form/question-form-tabs";

// Interface cho các tùy chọn dropdown
interface OptionItem {
  value: string;
  label: string;
}

// Interface cho kết quả MapID
interface MapIDOption {
  mapID: string;
  description: string;
}

type QuestionIDFormProps = {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  onGenerateFullId: () => void;
  showInputForm: boolean;
  setShowInputForm: (show: boolean) => void;
};

export function QuestionIDForm({ 
  formData, 
  setFormData, 
  onGenerateFullId,
  showInputForm,
  setShowInputForm 
}: QuestionIDFormProps): JSX.Element {
  // State cho danh sách các tùy chọn
  const [grades, setGrades] = useState<OptionItem[]>([]);
  const [subjects, setSubjects] = useState<OptionItem[]>([]);
  const [chapters, setChapters] = useState<OptionItem[]>([]);
  const [lessons, setLessons] = useState<OptionItem[]>([]);

  // State loading cho từng loại dữ liệu
  const [loadingStates, setLoadingStates] = useState({
    grades: false,
    subjects: false,
    chapters: false,
    lessons: false,
  });

  // State lỗi
  const [error, setError] = useState<string | null>(null);

  // Tải dữ liệu lớp (class)
  const fetchGrades = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, grades: true }));
    setError(null);

    try {
      const response = await fetch('/api/map-id/search?field=grade');
      const data = await response.json();

      if (!data.success) {
        throw new Error('Không thể tải danh sách lớp');
      }

      // Lọc ra các item có giá trị không rỗng
      const grades: OptionItem[] = [];
      logger.debug('API response for grades:', data.results);
      data.results.forEach((item: MapIDOption) => {
        const value = item.mapID.match(/\[(\d)/)?.[1] || '';
        if (value) {
          const label = item.description;
          logger.debug(`Grade: value=${value}, label=${label}`);
          grades.push({
            value,
            label
          });
        }
      });

      setGrades(grades);
    } catch (error) {
      logger.error('Error fetching grades:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setLoadingStates(prev => ({ ...prev, grades: false }));
    }
  }, []);

  // Tải danh sách môn học khi lớp được chọn
  const fetchSubjects = useCallback(async (gradeValue: string) => {
    if (!gradeValue) return;

    setLoadingStates(prev => ({ ...prev, subjects: true }));
    setError(null);

    try {
      const response = await fetch(`/api/map-id/search?grade=${gradeValue}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(`Không thể tải danh sách môn học cho lớp ${gradeValue}`);
      }

      // Lọc ra các item có giá trị không rỗng
      const subjects: OptionItem[] = [];
      data.results.forEach((item: MapIDOption) => {
        const code = item.mapID.match(/\[\d([A-Z])/)?.[1] || '';
        if (code) {
          subjects.push({
            value: code,
            label: item.description
          });
        }
      });

      setSubjects(subjects);
    } catch (error) {
      logger.error('Error fetching subjects:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setLoadingStates(prev => ({ ...prev, subjects: false }));
    }
  }, []);

  // Tải danh sách chương khi môn học được chọn
  const fetchChapters = useCallback(async (gradeValue: string, subjectValue: string) => {
    if (!gradeValue || !subjectValue) return;

    setLoadingStates(prev => ({ ...prev, chapters: true }));
    setError(null);

    try {
      const response = await fetch(`/api/map-id/search?grade=${gradeValue}&subject=${subjectValue}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(`Không thể tải danh sách chương cho lớp ${gradeValue}, môn học ${subjectValue}`);
      }

      // Lọc ra các item có giá trị không rỗng
      const chapters: OptionItem[] = [];
      data.results.forEach((item: MapIDOption) => {
        const code = item.mapID.match(/\[\d[A-Z](\d+)/)?.[1] || '';
        if (code) {
          chapters.push({
            value: code,
            label: item.description
          });
        }
      });

      setChapters(chapters);
    } catch (error) {
      logger.error('Error fetching chapters:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setLoadingStates(prev => ({ ...prev, chapters: false }));
    }
  }, []);

  // Tải danh sách bài học khi chương được chọn
  const fetchLessons = useCallback(async (gradeValue: string, subjectValue: string, chapterValue: string) => {
    if (!gradeValue || !subjectValue || !chapterValue) return;

    setLoadingStates(prev => ({ ...prev, lessons: true }));
    setError(null);

    try {
      const response = await fetch(`/api/map-id/search?grade=${gradeValue}&subject=${subjectValue}&chapter=${chapterValue}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(`Không thể tải danh sách bài học`);
      }

      // Lọc ra các item có giá trị không rỗng
      const lessons: OptionItem[] = [];
      data.results.forEach((item: MapIDOption) => {
        const code = item.mapID.match(/\[\d[A-Z]\d+[NHVCTM](\d+)/)?.[1] || '';
        if (code) {
          lessons.push({
            value: code,
            label: item.description
          });
        }
      });

      setLessons(lessons);
    } catch (error) {
      logger.error('Error fetching lessons:', error);
      setError(error instanceof Error ? error.message : 'Lỗi không xác định');
    } finally {
      setLoadingStates(prev => ({ ...prev, lessons: false }));
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  // Load subjects when grade changes
  useEffect(() => {
    const gradeValue = formData.questionID?.grade?.value;
    if (gradeValue) {
      fetchSubjects(gradeValue);
    }
  }, [formData.questionID?.grade?.value, fetchSubjects]);

  // Load chapters when subject changes
  useEffect(() => {
    const gradeValue = formData.questionID?.grade?.value;
    const subjectValue = formData.questionID?.subject?.value;
    if (gradeValue && subjectValue) {
      fetchChapters(gradeValue, subjectValue);
    }
  }, [formData.questionID?.grade?.value, formData.questionID?.subject?.value, fetchChapters]);

  // Load lessons when chapter changes
  useEffect(() => {
    const gradeValue = formData.questionID?.grade?.value;
    const subjectValue = formData.questionID?.subject?.value;
    const chapterValue = formData.questionID?.chapter?.value;
    if (gradeValue && subjectValue && chapterValue) {
      fetchLessons(gradeValue, subjectValue, chapterValue);
    }
  }, [formData.questionID?.grade?.value, formData.questionID?.subject?.value, formData.questionID?.chapter?.value, fetchLessons]);

  // Xử lý thay đổi các trường lồng nhau
  const handleNestedChange = (field: string, value: string) => {
    setFormData(prev => {
      // Đảm bảo có cấu trúc chuẩn hóa khi cập nhật giá trị
      const updatedQuestionID = { ...prev.questionID };

      // Tạo đối tượng field nếu chưa tồn tại
      if (!updatedQuestionID[field]) {
        updatedQuestionID[field] = { value: "", description: "" };
      }

      // Nếu field là một object với cấu trúc value/description
      if (typeof updatedQuestionID[field] === 'object' && updatedQuestionID[field] !== null) {
        // Tìm mô tả tương ứng với giá trị được chọn
        let description = "";

        // Tìm mô tả từ danh sách tương ứng
        if (field === 'grade' && grades.length > 0) {
          const option = grades.find(opt => opt.value === value);
          description = option?.label || "";
        } else if (field === 'subject' && subjects.length > 0) {
          const option = subjects.find(opt => opt.value === value);
          description = option?.label || "";
        } else if (field === 'chapter' && chapters.length > 0) {
          const option = chapters.find(opt => opt.value === value);
          description = option?.label || "";
        } else if (field === 'lesson' && lessons.length > 0) {
          const option = lessons.find(opt => opt.value === value);
          description = option?.label || "";
        } else if (field === 'level') {
          // Mức độ có các giá trị cố định
          const levelMap: Record<string, string> = {
            'N': 'Nhận biết',
            'H': 'Thông Hiểu',
            'V': 'Vận dụng',
            'C': 'Vận dụng cao',
            'T': 'Tổng hợp',
            'M': 'Đánh giá'
          };
          description = levelMap[value] || "";
        } else if (field === 'form') {
          // Form có các giá trị cố định
          const formMap: Record<string, string> = {
            '0': 'Câu hỏi tổng hợp',
            '1': 'Dạng 1',
            '2': 'Dạng 2',
            '3': 'Dạng 3',
            '4': 'Dạng 4',
            '5': 'Dạng 5',
            '6': 'Dạng 6',
            '7': 'Dạng 7',
            '8': 'Dạng 8',
            '9': 'Dạng 9'
          };
          description = formMap[value] || "";
        }

        // Cập nhật giá trị và mô tả
        (updatedQuestionID[field] as any) = {
          ...(updatedQuestionID[field] as any),
          value,
          description
        };
      } else {
        // Nếu field không phải object, tạo mới
        updatedQuestionID[field] = { value, description: "" };
      }

      return {
        ...prev,
        questionID: updatedQuestionID
      };
    });
  };

  // Xử lý thay đổi các trường đơn giản trong QuestionID
  const handleQuestionIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name.split('_')[1]; // Lấy phần sau dấu gạch dưới

    setFormData((prev) => ({
      ...prev,
      questionID: {
        ...prev.questionID,
        [field]: value,
      },
    }));
  };

  if (!showInputForm) {
    return (
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={() => setShowInputForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
        >
          Nhập thông tin Question ID
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">
          Thông tin Question ID
        </h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowInputForm(false)}
          className="text-sm"
        >
          Thu gọn
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full ID Field */}
        <div className="space-y-2">
          <Label htmlFor="questionID_fullId" className="text-slate-800 dark:text-white transition-colors duration-300">
            ID đầy đủ
          </Label>
          <div className="flex gap-2">
            <Input
              id="questionID_fullId"
              name="questionID_fullId"
              value={formData.questionID?.fullId || ""}
              onChange={handleQuestionIDChange}
              placeholder="ID đầy đủ sẽ được tạo tự động"
              readOnly
              className="flex-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300"
            />
            <button
              type="button"
              onClick={onGenerateFullId}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors duration-300 hover:scale-105"
            >
              Tạo ID
            </button>
          </div>
        </div>

        {/* Grade Field */}
        <div className="space-y-2">
          <Label htmlFor="questionID_grade" className="text-slate-800 dark:text-white transition-colors duration-300">
            Lớp
          </Label>
          <div className="relative">
            <Select
              value={formData.questionID?.grade?.value || ""}
              onValueChange={(value) => handleNestedChange('grade', value)}
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300">
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.value} - {grade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingStates.grades && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <Label htmlFor="questionID_subject" className="text-slate-800 dark:text-white transition-colors duration-300">
            Môn học
          </Label>
          <div className="relative">
            <Select
              value={formData.questionID?.subject?.value || ""}
              onValueChange={(value) => handleNestedChange('subject', value)}
              disabled={!formData.questionID?.grade?.value}
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300">
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.value} - {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingStates.subjects && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Chapter Field */}
        <div className="space-y-2">
          <Label htmlFor="questionID_chapter" className="text-slate-800 dark:text-white transition-colors duration-300">
            Chương
          </Label>
          <div className="relative">
            <Select
              value={formData.questionID?.chapter?.value || ""}
              onValueChange={(value) => handleNestedChange('chapter', value)}
              disabled={!formData.questionID?.subject?.value}
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300">
                <SelectValue placeholder="Chọn chương" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter.value} value={chapter.value}>
                    {chapter.value} - {chapter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingStates.chapters && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Level Field */}
        <div className="space-y-2">
          <Label htmlFor="questionID_level" className="text-slate-800 dark:text-white transition-colors duration-300">
            Mức độ
          </Label>
          <Select
            value={formData.questionID?.level?.value || ""}
            onValueChange={(value) => handleNestedChange('level', value)}
          >
            <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300">
              <SelectValue placeholder="Chọn mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="N">N - Nhận biết</SelectItem>
              <SelectItem value="H">H - Thông Hiểu</SelectItem>
              <SelectItem value="V">V - Vận dụng</SelectItem>
              <SelectItem value="C">C - Vận dụng cao</SelectItem>
              <SelectItem value="T">T - Tổng hợp</SelectItem>
              <SelectItem value="M">M - Đánh giá</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lesson Field */}
        <div className="space-y-2">
          <Label htmlFor="questionID_lesson" className="text-slate-800 dark:text-white transition-colors duration-300">
            Bài học (tùy chọn)
          </Label>
          <div className="relative">
            <Select
              value={formData.questionID?.lesson?.value || ""}
              onValueChange={(value) => handleNestedChange('lesson', value)}
              disabled={!formData.questionID?.chapter?.value}
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300">
                <SelectValue placeholder="Chọn bài học" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.value} value={lesson.value}>
                    {lesson.value} - {lesson.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingStates.lessons && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Form Field */}
        <div className="space-y-2">
          <Label htmlFor="questionID_form" className="text-slate-800 dark:text-white transition-colors duration-300">
            Dạng câu hỏi
          </Label>
          <Select
            value={formData.questionID?.form?.value || ""}
            onValueChange={(value) => handleNestedChange('form', value)}
          >
            <SelectTrigger className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 transition-colors duration-300">
              <SelectValue placeholder="Chọn dạng câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Câu hỏi tổng hợp</SelectItem>
              <SelectItem value="1">1 - Dạng 1</SelectItem>
              <SelectItem value="2">2 - Dạng 2</SelectItem>
              <SelectItem value="3">3 - Dạng 3</SelectItem>
              <SelectItem value="4">4 - Dạng 4</SelectItem>
              <SelectItem value="5">5 - Dạng 5</SelectItem>
              <SelectItem value="6">6 - Dạng 6</SelectItem>
              <SelectItem value="7">7 - Dạng 7</SelectItem>
              <SelectItem value="8">8 - Dạng 8</SelectItem>
              <SelectItem value="9">9 - Dạng 9</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/button";
import { QuestionFormData } from "../components/question-form/question-form-tabs";

type QuestionIDDisplayProps = {
  formData: QuestionFormData;
  onEdit?: () => void;
  showEditButton?: boolean;
  className?: string;
  mode?: 'basic' | 'detailed' | 'meaning';
};

export function QuestionIDDisplay({ 
  formData, 
  onEdit, 
  showEditButton = false,
  className = "",
  mode = 'basic'
}: QuestionIDDisplayProps): JSX.Element {
  // Kiểm tra xem có đủ thông tin cơ bản không
  const hasBasicInfo = formData.questionID?.grade?.value &&
                      formData.questionID?.subject?.value &&
                      formData.questionID?.level?.value;

  // Tạo formatted ID
  const createFormattedID = () => {
    if (!hasBasicInfo) return 'ID chưa đủ thông tin';

    const parts = [
      formData.questionID?.grade?.value,
      formData.questionID?.subject?.value,
      formData.questionID?.chapter?.value,
      formData.questionID?.level?.value,
      formData.questionID?.lesson?.value || '',
    ];

    let id = parts.join('-');

    if (formData.questionID?.form?.value) {
      id += `-${formData.questionID.form.value}`;
    }

    return id;
  };

  const formattedID = createFormattedID();

  if (mode === 'basic') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Question ID
          </h3>
          {showEditButton && onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="text-sm"
            >
              Chỉnh sửa
            </Button>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
          <div className="text-lg font-mono font-semibold text-slate-800 dark:text-white">
            {formattedID}
          </div>
          {formData.questionID?.fullId && (
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Full ID: {formData.questionID.fullId}
            </div>
          )}
        </div>

        {hasBasicInfo && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {formData.questionID?.grade?.value && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="min-w-[30px] text-center">
                  {formData.questionID.grade.value}
                </Badge>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {formData.questionID.grade.description || 'Lớp'}
                </span>
              </div>
            )}

            {formData.questionID?.subject?.value && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="min-w-[30px] text-center">
                  {formData.questionID.subject.value}
                </Badge>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {formData.questionID.subject.description || 'Môn học'}
                </span>
              </div>
            )}

            {formData.questionID?.level?.value && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="min-w-[30px] text-center">
                  {formData.questionID.level.value}
                </Badge>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {formData.questionID.level.description || 'Mức độ'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (mode === 'detailed') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Chi tiết Question ID
          </h3>
          {showEditButton && onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="text-sm"
            >
              Chỉnh sửa
            </Button>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
          <div className="text-xl font-mono font-bold text-slate-800 dark:text-white mb-2">
            {formattedID}
          </div>
          {formData.questionID?.fullId && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Full ID: {formData.questionID.fullId}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Grade */}
          {formData.questionID?.grade?.value && (
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {formData.questionID.grade.value}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Lớp:</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    {formData.questionID.grade.description || 'Chưa xác định'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Subject */}
          {formData.questionID?.subject?.value && (
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {formData.questionID.subject.value}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Môn học:</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    {formData.questionID.subject.description || 'Chưa xác định'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Chapter */}
          {formData.questionID?.chapter?.value && (
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {formData.questionID.chapter.value}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Chương:</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    {formData.questionID.chapter.description || 'Chưa xác định'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Level */}
          {formData.questionID?.level?.value && (
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {formData.questionID.level.value}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Mức độ:</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    {formData.questionID.level.description || 'Chưa xác định'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lesson */}
          {formData.questionID?.lesson?.value && (
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {formData.questionID.lesson.value}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Bài học:</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    {formData.questionID.lesson.description || 'Chưa xác định'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {formData.questionID?.form?.value && (
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {formData.questionID.form.value}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Dạng câu hỏi:</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    {formData.questionID.form.description || 'Chưa xác định'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subcount Display */}
        {formData.subcount && (formData.subcount.prefix || formData.subcount.number) && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Thông tin Subcount
            </h4>
            <div className="space-y-2">
              {formData.subcount.fullId && (
                <div className="text-lg font-mono font-semibold text-blue-800 dark:text-blue-200">
                  {formData.subcount.fullId}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {formData.subcount.prefix && (
                  <div>
                    <span className="font-medium">Tiền tố:</span>
                    <span className="ml-2 text-blue-600 dark:text-blue-300">
                      {formData.subcount.prefix}
                    </span>
                  </div>
                )}
                {formData.subcount.number && (
                  <div>
                    <span className="font-medium">Số thứ tự:</span>
                    <span className="ml-2 text-blue-600 dark:text-blue-300">
                      {formData.subcount.number}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mode 'meaning' - hiển thị ý nghĩa chi tiết
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Ý nghĩa Question ID
        </h3>
        {showEditButton && onEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-sm"
          >
            Chỉnh sửa
          </Button>
        )}
      </div>

      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-2xl font-mono font-bold text-blue-800 dark:text-blue-200 mb-4 text-center">
          {formattedID}
        </div>
        
        <div className="text-center text-sm text-blue-600 dark:text-blue-300 mb-6">
          Mã định danh câu hỏi theo chuẩn MapID
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasBasicInfo && (
            <>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-md border">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  LỚP HỌC
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {formData.questionID?.grade?.value}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formData.questionID?.grade?.description}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-md border">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  MÔN HỌC
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {formData.questionID?.subject?.value}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formData.questionID?.subject?.description}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-md border">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  MỨC ĐỘ
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {formData.questionID?.level?.value}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formData.questionID?.level?.description}
                  </span>
                </div>
              </div>

              {formData.questionID?.chapter?.value && (
                <div className="p-3 bg-white dark:bg-slate-800 rounded-md border">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    CHƯƠNG
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {formData.questionID.chapter.value}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formData.questionID.chapter.description}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

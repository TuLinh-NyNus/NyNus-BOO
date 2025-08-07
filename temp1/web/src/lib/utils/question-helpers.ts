import type { BadgeProps } from "@/components/ui/display/badge";

/**
 * Question utility functions
 * Extracted từ QuestionItem component để improve reusability across question-related components
 */

export type QuestionLevel = 'EASY' | 'E' | 'MEDIUM' | 'M' | 'HARD' | 'H';
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * Lấy variant cho Badge component dựa trên độ khó của câu hỏi
 * @param level - Độ khó của câu hỏi (EASY, MEDIUM, HARD hoặc E, M, H)
 * @returns Badge variant tương ứng
 */
export const getBadgeVariantByLevel = (level: string): BadgeVariant => {
  switch (level?.toUpperCase()) {
    case 'EASY':
    case 'E':
      return "default";
    case 'MEDIUM':
    case 'M':
      return "secondary";
    case 'HARD':
    case 'H':
      return "destructive";
    default:
      return "outline";
  }
};

/**
 * Lấy label tiếng Việt cho độ khó của câu hỏi
 * @param level - Độ khó của câu hỏi (EASY, MEDIUM, HARD hoặc E, M, H)
 * @returns Label tiếng Việt tương ứng
 */
export const getLevelLabel = (level: string): string => {
  switch (level?.toUpperCase()) {
    case 'EASY':
    case 'E':
      return "Dễ";
    case 'MEDIUM':
    case 'M':
      return "Trung bình";
    case 'HARD':
    case 'H':
      return "Khó";
    default:
      return level || "Không xác định";
  }
};

/**
 * Lấy màu sắc cho badge dựa trên loại câu hỏi
 * @param type - Loại câu hỏi (MC, TF, SA, ES, MA)
 * @returns CSS class cho màu sắc
 */
export const getQuestionTypeColor = (type: string): string => {
  switch (type?.toUpperCase()) {
    case 'MC':
      return "bg-blue-500 hover:bg-blue-600";
    case 'TF':
      return "bg-green-500 hover:bg-green-600";
    case 'SA':
      return "bg-yellow-500 hover:bg-yellow-600";
    case 'ES':
      return "bg-purple-500 hover:bg-purple-600";
    case 'MA':
      return "bg-red-500 hover:bg-red-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

/**
 * Lấy label tiếng Việt cho loại câu hỏi
 * @param type - Loại câu hỏi (MC, TF, SA, ES, MA)
 * @returns Label tiếng Việt tương ứng
 */
export const getQuestionTypeLabel = (type: string): string => {
  switch (type?.toUpperCase()) {
    case 'MC':
      return "Trắc nghiệm";
    case 'TF':
      return "Đúng/Sai";
    case 'SA':
      return "Trả lời ngắn";
    case 'ES':
      return "Tự luận";
    case 'MA':
      return "Nhiều đáp án";
    default:
      return type || "Không xác định";
  }
};

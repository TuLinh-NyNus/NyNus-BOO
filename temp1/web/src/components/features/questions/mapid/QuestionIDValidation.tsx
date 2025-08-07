'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { QuestionFormData } from "../components/question-form/question-form-tabs";
import logger from "@/lib/utils/logger";

// Kết quả chuẩn hóa
interface NormalizedField {
  value: string;
  description: string;
}

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validation rules interface
interface ValidationRules {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
}

type QuestionIDValidationProps = {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  onValidationChange?: (result: ValidationResult) => void;
};

export function QuestionIDValidation({ 
  formData, 
  setFormData, 
  onValidationChange 
}: QuestionIDValidationProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  // Helper function để chuẩn hóa dữ liệu từ API
  const normalizeFieldData = useCallback((field: unknown): NormalizedField => {
    // Nếu field là null hoặc undefined
    if (!field) return { value: "", description: "" };

    // Nếu field là string
    if (typeof field === 'string') {
      return { value: field, description: field };
    }

    // Nếu field là object
    if (typeof field === 'object') {
      const fieldObj = field as Record<string, unknown>;

      // Nếu đã có cấu trúc value/description
      if ('value' in fieldObj && 'description' in fieldObj) {
        return {
          value: String(fieldObj.value || ""),
          description: String(fieldObj.description || "")
        };
      }

      // Chuyển đổi từ cấu trúc id/name/level sang value/description
      if ('id' in fieldObj || 'name' in fieldObj) {
        return {
          value: fieldObj.id ? String(fieldObj.id) : "",
          description: fieldObj.name ? String(fieldObj.name) : "",
        };
      }
    }

    // Trường hợp mặc định
    return { value: "", description: "" };
  }, []);

  // Validation rules cho từng field
  const validationRules = useMemo((): Record<string, ValidationRules> => ({
    grade: {
      required: true,
      pattern: /^[0-9]$/,
      customValidator: (value: string) => ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(value)
    },
    subject: {
      required: true,
      pattern: /^[A-Z]$/,
      customValidator: (value: string) => /^[A-Z]$/.test(value)
    },
    chapter: {
      required: false,
      pattern: /^\d+$/,
      customValidator: (value: string) => !value || /^\d+$/.test(value)
    },
    level: {
      required: true,
      pattern: /^[NHVCTM]$/,
      customValidator: (value: string) => ['N', 'H', 'V', 'C', 'T', 'M'].includes(value)
    },
    lesson: {
      required: false,
      pattern: /^\d+$/,
      customValidator: (value: string) => !value || /^\d+$/.test(value)
    },
    form: {
      required: false,
      pattern: /^[0-9]$/,
      customValidator: (value: string) => !value || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(value)
    },
    fullId: {
      required: false,
      minLength: 5,
      maxLength: 100
    }
  }), []);

  // Validate một field cụ thể
  const validateField = useCallback((fieldName: string, value: string): string[] => {
    const rules = validationRules[fieldName];
    if (!rules) return [];

    const errors: string[] = [];

    // Check required
    if (rules.required && (!value || value.trim().length === 0)) {
      errors.push(`${getFieldDisplayName(fieldName)} là bắt buộc`);
      return errors;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim().length === 0) {
      return errors;
    }

    // Check min length
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${getFieldDisplayName(fieldName)} phải có ít nhất ${rules.minLength} ký tự`);
    }

    // Check max length
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${getFieldDisplayName(fieldName)} không được vượt quá ${rules.maxLength} ký tự`);
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${getFieldDisplayName(fieldName)} có định dạng không hợp lệ`);
    }

    // Check custom validator
    if (rules.customValidator && !rules.customValidator(value)) {
      errors.push(`${getFieldDisplayName(fieldName)} có giá trị không hợp lệ`);
    }

    return errors;
  }, [validationRules]);

  // Get display name for field
  const getFieldDisplayName = (fieldName: string): string => {
    const displayNames: Record<string, string> = {
      grade: 'Lớp',
      subject: 'Môn học',
      chapter: 'Chương',
      level: 'Mức độ',
      lesson: 'Bài học',
      form: 'Dạng câu hỏi',
      fullId: 'ID đầy đủ'
    };
    return displayNames[fieldName] || fieldName;
  };

  // Validate toàn bộ QuestionID
  const validateQuestionID = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!formData.questionID) {
      errors.push('Thông tin Question ID không tồn tại');
      return { isValid: false, errors, warnings };
    }

    // Validate từng field
    Object.entries(validationRules).forEach(([fieldName, rules]) => {
      const fieldValue = formData.questionID?.[fieldName as keyof typeof formData.questionID];
      const value = typeof fieldValue === 'object' && fieldValue !== null 
        ? (fieldValue as any).value || ''
        : String(fieldValue || '');

      const fieldErrors = validateField(fieldName, value);
      errors.push(...fieldErrors);
    });

    // Business logic validations
    const grade = formData.questionID.grade?.value;
    const subject = formData.questionID.subject?.value;
    const chapter = formData.questionID.chapter?.value;
    const level = formData.questionID.level?.value;

    // Check logical dependencies
    if (subject && !grade) {
      errors.push('Phải chọn lớp trước khi chọn môn học');
    }

    if (chapter && (!grade || !subject)) {
      errors.push('Phải chọn lớp và môn học trước khi chọn chương');
    }

    // Check for warnings
    if (grade && subject && level && !chapter) {
      warnings.push('Nên chọn chương để có thông tin đầy đủ hơn');
    }

    if (formData.questionID.lesson?.value && !chapter) {
      warnings.push('Bài học chỉ có ý nghĩa khi đã chọn chương');
    }

    // Validate fullId format if exists
    if (formData.questionID.fullId) {
      const fullIdPattern = /^[A-Z0-9_-]+$/;
      if (!fullIdPattern.test(formData.questionID.fullId)) {
        errors.push('ID đầy đủ chứa ký tự không hợp lệ');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [formData.questionID, validationRules, validateField]);

  // Validate Subcount
  const validateSubcount = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!formData.subcount) {
      return { isValid: true, errors, warnings };
    }

    const { prefix, number, fullId } = formData.subcount;

    // Validate prefix
    if (prefix) {
      if (prefix.length < 2 || prefix.length > 10) {
        errors.push('Tiền tố Subcount phải có từ 2-10 ký tự');
      }
      if (!/^[A-Z0-9]+$/.test(prefix)) {
        errors.push('Tiền tố Subcount chỉ được chứa chữ cái in hoa và số');
      }
    }

    // Validate number
    if (number) {
      if (!/^\d{3}$/.test(number)) {
        errors.push('Số thứ tự Subcount phải là 3 chữ số (ví dụ: 001)');
      }
    }

    // Validate fullId format
    if (fullId) {
      const expectedFullId = prefix && number ? `${prefix}.${number}` : '';
      if (fullId !== expectedFullId) {
        warnings.push('ID đầy đủ Subcount không khớp với tiền tố và số thứ tự');
      }
    }

    // Check completeness
    if ((prefix && !number) || (!prefix && number)) {
      warnings.push('Nên điền đầy đủ cả tiền tố và số thứ tự cho Subcount');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [formData.subcount]);

  // Tổng hợp validation
  const performFullValidation = useCallback((): ValidationResult => {
    const questionIDResult = validateQuestionID();
    const subcountResult = validateSubcount();

    return {
      isValid: questionIDResult.isValid && subcountResult.isValid,
      errors: [...questionIDResult.errors, ...subcountResult.errors],
      warnings: [...questionIDResult.warnings, ...subcountResult.warnings]
    };
  }, [validateQuestionID, validateSubcount]);

  // Auto-normalize data khi formData thay đổi
  const normalizeFormData = useCallback(() => {
    let needsUpdate = false;
    const updatedData: Partial<QuestionFormData> = {};

    // Chuẩn hóa questionID
    if (formData.questionID) {
      // Tạo một đối tượng questionID mặc định nếu chưa có
      const defaultQuestionID = {
        fullId: "",
        format: "",
        grade: { value: "", description: "" },
        subject: { value: "", description: "" },
        chapter: { value: "", description: "" },
        level: { value: "", description: "" },
        lesson: { value: "", description: "" },
        form: { value: "", description: "" },
      };

      // Kết hợp với dữ liệu hiện có
      const normalizedQuestionID = {
        ...defaultQuestionID,
        ...formData.questionID,
        grade: normalizeFieldData(formData.questionID.grade),
        subject: normalizeFieldData(formData.questionID.subject),
        chapter: normalizeFieldData(formData.questionID.chapter),
        level: normalizeFieldData(formData.questionID.level || formData.questionID.difficulty),
        lesson: normalizeFieldData(formData.questionID.lesson),
        form: formData.questionID.form ? normalizeFieldData(formData.questionID.form) : { value: "", description: "" },
      } as typeof formData.questionID;

      // Kiểm tra xem có sự thay đổi không
      if (JSON.stringify(normalizedQuestionID) !== JSON.stringify(formData.questionID)) {
        updatedData.questionID = normalizedQuestionID;
        needsUpdate = true;
      }
    }

    // Chuẩn hóa Subcount
    if (formData.subcount) {
      // Đảm bảo tất cả các trường của Subcount đều tồn tại
      const normalizedSubcount = {
        prefix: formData.subcount.prefix || "",
        number: formData.subcount.number || "",
        fullId: formData.subcount.fullId || ""
      };

      // Kiểm tra xem có sự thay đổi không
      if (JSON.stringify(normalizedSubcount) !== JSON.stringify(formData.subcount)) {
        updatedData.subcount = normalizedSubcount;
        needsUpdate = true;
      }
    }

    // Cập nhật nếu cần
    if (needsUpdate) {
      logger.debug('Normalizing form data:', updatedData);
      setFormData(prev => ({ ...prev, ...updatedData }));
    }
  }, [formData.questionID, formData.subcount, normalizeFieldData, setFormData]);

  // Run validation when formData changes
  useEffect(() => {
    const result = performFullValidation();
    setValidationResult(result);
    onValidationChange?.(result);
  }, [formData, performFullValidation, onValidationChange]);

  // Run normalization when formData changes
  useEffect(() => {
    normalizeFormData();
  }, [normalizeFormData]);

  // Return validation utilities for external use
  return {
    validationResult,
    validateField,
    validateQuestionID,
    validateSubcount,
    performFullValidation,
    normalizeFieldData
  };
}

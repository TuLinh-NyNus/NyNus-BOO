'use client';

import { useCallback, useEffect, useState } from "react";
import { QuestionFormData } from "../components/question-form/question-form-tabs";
import logger from "@/lib/utils/logger";

// Interface cho MapID details
interface MapIDDetails {
  grade?: {
    value: string;
    description: string;
    level?: number;
  };
  subject?: {
    value: string;
    description: string;
    name?: string;
  };
  chapter?: {
    value: string;
    description: string;
    name?: string;
  };
  level?: {
    value: string;
    description: string;
    name?: string;
  };
  lesson?: {
    value: string;
    description: string;
    name?: string;
  };
  form?: {
    value: string;
    description: string;
    label?: string;
  };
}

// Interface cho decode result
interface DecodeResult {
  success: boolean;
  mapID: string;
  details?: MapIDDetails;
  error?: string;
}

type MapIDDecoderProps = {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  onDecodeComplete?: (result: DecodeResult) => void;
};

export function MapIDDecoder({ 
  formData, 
  setFormData, 
  onDecodeComplete 
}: MapIDDecoderProps) {
  const [mapIDDetails, setMapIDDetails] = useState<MapIDDetails | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // Tạo MapID từ QuestionID data
  const generateMapID = useCallback((questionID: typeof formData.questionID): string => {
    if (!questionID) return '';

    const grade = questionID.grade?.value || '0';
    const subject = questionID.subject?.value || 'A';
    const chapter = questionID.chapter?.value || '0';
    const level = questionID.level?.value || 'N';
    const lesson = questionID.lesson?.value || '0';
    const form = questionID.form?.value || '0';

    // Format: [GSCLF] hoặc [GSCL-F] nếu form khác 0
    let mapID = `[${grade}${subject}${chapter}${level}${lesson}`;
    
    if (form && form !== '0') {
      mapID += `-${form}`;
    }
    
    mapID += ']';
    
    return mapID;
  }, []);

  // Parse MapID string thành components
  const parseMapID = useCallback((mapID: string): Partial<typeof formData.questionID> | null => {
    try {
      // Remove brackets
      const cleanMapID = mapID.replace(/[\[\]]/g, '');
      
      // Check for form separator
      const parts = cleanMapID.split('-');
      const mainPart = parts[0];
      const formPart = parts[1] || '0';

      // Parse main part: GSCL or GSCLF
      if (mainPart.length < 4) {
        throw new Error('MapID format không hợp lệ');
      }

      const grade = mainPart[0];
      const subject = mainPart[1];
      const chapter = mainPart[2];
      const level = mainPart[3];
      const lesson = mainPart[4] || '0';

      return {
        grade: { value: grade, description: '' },
        subject: { value: subject, description: '' },
        chapter: { value: chapter, description: '' },
        level: { value: level, description: '' },
        lesson: { value: lesson, description: '' },
        form: { value: formPart, description: '' }
      };
    } catch (error) {
      logger.error('Error parsing MapID:', error);
      return null;
    }
  }, []);

  // Decode MapID từ API
  const decodeMapID = useCallback(async (mapID: string): Promise<DecodeResult> => {
    if (!mapID || mapID.trim().length === 0) {
      return {
        success: false,
        mapID: '',
        error: 'MapID không được để trống'
      };
    }

    setIsDecoding(true);
    setDecodeError(null);

    try {
      const response = await fetch(`/api/map-id/decode?mapID=${encodeURIComponent(mapID)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi decode MapID');
      }

      if (!data.success) {
        throw new Error(data.message || 'Không thể decode MapID');
      }

      const details: MapIDDetails = {
        grade: data.result?.grade ? {
          value: data.result.grade.value || data.result.grade.id || '',
          description: data.result.grade.description || data.result.grade.name || '',
          level: data.result.grade.level
        } : undefined,
        subject: data.result?.subject ? {
          value: data.result.subject.value || data.result.subject.id || '',
          description: data.result.subject.description || data.result.subject.name || '',
          name: data.result.subject.name
        } : undefined,
        chapter: data.result?.chapter ? {
          value: data.result.chapter.value || data.result.chapter.id || '',
          description: data.result.chapter.description || data.result.chapter.name || '',
          name: data.result.chapter.name
        } : undefined,
        level: data.result?.difficulty ? {
          value: data.result.difficulty.value || data.result.difficulty.id || '',
          description: data.result.difficulty.description || data.result.difficulty.name || '',
          name: data.result.difficulty.name
        } : undefined,
        lesson: data.result?.lesson ? {
          value: data.result.lesson.value || data.result.lesson.id || '',
          description: data.result.lesson.description || data.result.lesson.name || '',
          name: data.result.lesson.name
        } : undefined,
        form: data.result?.form ? {
          value: data.result.form.value || data.result.form.id || '',
          description: data.result.form.description || data.result.form.label || '',
          label: data.result.form.label
        } : undefined
      };

      setMapIDDetails(details);

      return {
        success: true,
        mapID,
        details
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setDecodeError(errorMessage);
      
      return {
        success: false,
        mapID,
        error: errorMessage
      };
    } finally {
      setIsDecoding(false);
    }
  }, []);

  // Auto-decode khi có đủ thông tin
  const autoDecodeFromQuestionID = useCallback(async () => {
    if (!formData.questionID) return;

    const hasBasicInfo = formData.questionID.grade?.value &&
                        formData.questionID.subject?.value &&
                        formData.questionID.level?.value;

    if (!hasBasicInfo) return;

    const mapID = generateMapID(formData.questionID);
    if (!mapID) return;

    logger.debug('Auto-decoding MapID:', mapID);
    
    const result = await decodeMapID(mapID);
    onDecodeComplete?.(result);

    // Update formData với thông tin đã decode
    if (result.success && result.details) {
      setFormData(prev => ({
        ...prev,
        questionID: {
          ...prev.questionID,
          grade: result.details?.grade ? {
            value: result.details.grade.value,
            description: result.details.grade.description
          } : prev.questionID?.grade,
          subject: result.details?.subject ? {
            value: result.details.subject.value,
            description: result.details.subject.description
          } : prev.questionID?.subject,
          chapter: result.details?.chapter ? {
            value: result.details.chapter.value,
            description: result.details.chapter.description
          } : prev.questionID?.chapter,
          level: result.details?.level ? {
            value: result.details.level.value,
            description: result.details.level.description
          } : prev.questionID?.level,
          lesson: result.details?.lesson ? {
            value: result.details.lesson.value,
            description: result.details.lesson.description
          } : prev.questionID?.lesson,
          form: result.details?.form ? {
            value: result.details.form.value,
            description: result.details.form.description
          } : prev.questionID?.form,
        }
      }));
    }
  }, [formData.questionID, generateMapID, decodeMapID, onDecodeComplete, setFormData]);

  // Decode từ fullId
  const decodeFromFullId = useCallback(async (fullId: string) => {
    if (!fullId) return;

    try {
      // Phân tích fullId theo định dạng: subject_grade_level_form_chapter_lesson_uniqueId
      const parts = fullId.split('_');
      if (parts.length >= 4) { // Ít nhất phải có subject, grade, level, form
        const [subject, grade, level, form] = parts;

        // Tạo MapID từ các thông tin đã có
        const mapID = `[${grade}${subject}${parts.length >= 5 ? parts[4] : '0'}${level}${parts.length >= 6 ? parts[5] : '0'}${form ? `-${form}` : ''}]`;

        logger.debug('Decoding from fullId:', { fullId, mapID });

        const result = await decodeMapID(mapID);
        
        if (result.success && result.details) {
          // Cập nhật formData với thông tin đã decode
          setFormData(prev => ({
            ...prev,
            questionID: {
              ...prev.questionID,
              grade: { value: grade, description: result.details?.grade?.description || '' },
              subject: { value: subject, description: result.details?.subject?.description || '' },
              level: { value: level, description: result.details?.level?.description || '' },
              form: { value: form, description: result.details?.form?.description || '' },
              ...(parts.length >= 5 ? { chapter: { value: parts[4], description: result.details?.chapter?.description || '' } } : {}),
              ...(parts.length >= 6 ? { lesson: { value: parts[5], description: result.details?.lesson?.description || '' } } : {}),
            }
          }));
        }
      }
    } catch (error) {
      logger.error('Error decoding from fullId:', error);
      setDecodeError(error instanceof Error ? error.message : 'Lỗi khi decode từ fullId');
    }
  }, [decodeMapID, setFormData]);

  // Tạo fullId từ QuestionID components
  const generateFullId = useCallback(() => {
    // Đảm bảo formData.questionID tồn tại
    if (!formData.questionID) return;

    const { grade, subject, level, form, chapter, lesson } = formData.questionID;

    // Kiểm tra xem các trường bắt buộc đã có hay chưa
    if (!grade?.value || !subject?.value || !level?.value) {
      return; // Không tạo fullId nếu thiếu thông tin
    }

    // Tạo fullId với các trường bắt buộc
    let fullId = `${subject.value}_${grade.value}_${level?.value || '0'}`;

    // Thêm form nếu có
    if (form?.value) {
      fullId += `_${form.value}`;
    } else {
      fullId += '_0'; // Giá trị mặc định cho form
    }

    // Thêm chapter và lesson nếu có
    if (chapter?.value) {
      fullId += `_${chapter.value}`;
      if (lesson?.value) {
        fullId += `_${lesson.value}`;
      }
    }

    // Thêm một mã định danh cố định thay vì timestamp
    // Sử dụng các giá trị đã có để tạo mã định danh
    const uniqueId = `${grade.value}${subject.value}${chapter?.value || ''}${level?.value || ''}${lesson?.value || ''}${form?.value || ''}`;
    fullId += `_${uniqueId}`;

    setFormData(prev => ({
      ...prev,
      questionID: {
        ...prev.questionID,
        fullId
      }
    }));
  }, [formData.questionID, setFormData]);

  // Auto-generate fullId cho Subcount
  const generateSubcountFullId = useCallback(() => {
    // Kiểm tra xem formData.subcount có tồn tại không
    if (!formData.subcount) return;

    const { prefix, number } = formData.subcount;
    if (prefix && number) {
      const fullId = `${prefix}.${number}`;
      setFormData(prev => ({
        ...prev,
        Subcount: {
          ...prev.subcount,
          fullId
        }
      }));
    }
  }, [formData.subcount, setFormData]);

  // Auto-decode when QuestionID changes
  useEffect(() => {
    autoDecodeFromQuestionID();
  }, [autoDecodeFromQuestionID]);

  // Auto-decode when fullId changes
  useEffect(() => {
    if (formData.questionID?.fullId) {
      decodeFromFullId(formData.questionID.fullId);
    }
  }, [formData.questionID?.fullId, decodeFromFullId]);

  // Auto-generate Subcount fullId when prefix or number changes
  useEffect(() => {
    generateSubcountFullId();
  }, [formData.subcount?.prefix, formData.subcount?.number, generateSubcountFullId]);

  // Return decoder utilities for external use
  return {
    mapIDDetails,
    isDecoding,
    decodeError,
    generateMapID,
    parseMapID,
    decodeMapID,
    generateFullId,
    generateSubcountFullId,
    decodeFromFullId
  };
}

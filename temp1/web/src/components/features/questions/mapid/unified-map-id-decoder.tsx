'use client';

import { Loader2, AlertCircle, Info } from 'lucide-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Skeleton } from "@/components/ui/display/skeleton";
import { Input } from "@/components/ui/form/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/overlay/tooltip";
import { MapIDService } from '@/lib/services/mapid-service';
import { QuestionID } from '@/lib/types/question';
import logger from '@/lib/utils/logger';

// TODO: Define proper MapIDResult interface after implementing MapID service methods
interface MapIDResult {
  mapID: string;
  grade: { code: string; description: string };
  subject: { code: string; description: string };
  chapter?: { code: string; description: string };
  difficulty?: { code: string; description: string };
  lesson?: { code: string; description: string };
  questionType?: { code: string; description: string };
  fullDescription: string;
}

interface UnifiedMapIDDecoderProps {
  mode?: 'standalone' | 'embedded';
  questionID?: QuestionID;
  initialMapID?: string;
  onResult?: (result: MapIDResult | null) => void;
  className?: string;
}

/**
 * Unified MapID Decoder Component
 * Supports both standalone mode (with input) and embedded mode (with QuestionID)
 */
const UnifiedMapIDDecoderComponent = React.memo(function UnifiedMapIDDecoder({
  mode = 'standalone',
  questionID,
  initialMapID = '',
  onResult,
  className = ''
}: UnifiedMapIDDecoderProps) {
  const [mapIDInput, setMapIDInput] = useState<string>(initialMapID);
  const [result, setResult] = useState<MapIDResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Generate MapID from QuestionID (for embedded mode)
  const generatedMapID = useMemo(() => {
    if (mode !== 'embedded' || !questionID) return null;
    // TODO: Implement proper MapID generation
    // return mapIDService.generateMapID(questionID);
    return `[${questionID.grade?.value || ''}${questionID.subject?.value || ''}01N01]`;
  }, [
    mode,
    questionID?.grade?.value,
    questionID?.subject?.value,
    questionID?.chapter?.value,
    questionID?.level?.value,
    questionID?.lesson?.value,
    questionID?.form?.value
  ]);

  // Get current MapID based on mode
  const currentMapID = mode === 'embedded' ? generatedMapID : mapIDInput;

  // Initialize decoder (for standalone mode)
  useEffect(() => {
    if (mode === 'embedded') {
      setInitialized(true);
      return;
    }

    const initializeDecoder = async () => {
      try {
        setLoading(true);
        // Mock initialization for frontend-only app
        await new Promise(resolve => setTimeout(resolve, 500));
        setInitialized(true);
        setError(null);
      } catch (err) {
        setError('Không thể khởi tạo MapID Decoder. Hãy thử tải lại trang.');
        logger.error('Error initializing decoder:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeDecoder();
  }, [mode]);

  // Decode MapID - memoized for performance
  const decodeMapID = useCallback(async (mapID: string) => {
    if (!mapID) {
      setError('MapID không hợp lệ');
      return;
    }

    // TODO: Implement proper MapID validation
    // const validation = mapIDService.validateMapID(mapID);
    // if (!validation.isValid) {
    //   setError(validation.error || 'MapID không hợp lệ');
    //   return;
    // }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement proper MapID decoding
      // const result = await mapIDService.decodeMapID(mapID);
      const mockResult: MapIDResult = {
        mapID,
        grade: { code: '12', description: 'Lớp 12' },
        subject: { code: 'T', description: 'Toán' },
        fullDescription: 'Mock MapID result - cần implement thực tế'
      };

      setResult(mockResult);
      onResult?.(mockResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      setResult(null);
      onResult?.(null);
      logger.error('Error decoding MapID:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  // Auto-decode when MapID changes (embedded mode)
  useEffect(() => {
    if (mode === 'embedded' && currentMapID) {
      decodeMapID(currentMapID);
    }
  }, [mode, currentMapID]);

  // Handle manual decode (standalone mode) - memoized
  const handleDecode = useCallback(() => {
    if (currentMapID) {
      decodeMapID(currentMapID);
    }
  }, [currentMapID, decodeMapID]);

  // Embedded mode rendering
  if (mode === 'embedded') {
    if (!currentMapID) {
      return (
        <div className={`w-full ${className}`}>
          <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-slate-600">
                Điền đầy đủ các trường để xem chi tiết MapID
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className={`w-full ${className}`}>
          <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </div>
      );
    }

    if (error || !result) {
      return (
        <div className={`w-full ${className}`}>
          <div className="p-3 border border-red-100 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">
                Không thể giải mã MapID
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`w-full ${className}`}>
        <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-100 text-slate-800 font-semibold">
              {currentMapID}
            </Badge>
            <span className="text-sm text-muted-foreground">→</span>
            <Badge className="bg-primary text-primary-foreground">
              {result.fullDescription}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Standalone mode rendering
  return (
    <div className={`w-full max-w-3xl mx-auto p-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Giải mã MapID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Nhập MapID (ví dụ: [0H5V4-1])"
                value={mapIDInput}
                onChange={(e) => setMapIDInput(e.target.value)}
                disabled={loading || !initialized}
              />
              <Button
                onClick={handleDecode}
                disabled={loading || !initialized || !mapIDInput}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Giải mã
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!initialized && !error && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang khởi tạo decoder...
              </div>
            )}

            {result && (
              <div className="bg-white border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b font-medium">
                  Kết quả giải mã MapID: {result.mapID}
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-medium">Lớp:</span></div>
                    <div>{result.grade.code} - {result.grade.description}</div>

                    <div><span className="font-medium">Môn học:</span></div>
                    <div>{result.subject.code} - {result.subject.description}</div>

                    {result.chapter && (
                      <>
                        <div><span className="font-medium">Chương:</span></div>
                        <div>{result.chapter.code} - {result.chapter.description}</div>
                      </>
                    )}

                    {result.difficulty && (
                      <>
                        <div><span className="font-medium">Mức độ:</span></div>
                        <div>{result.difficulty.code} - {result.difficulty.description}</div>
                      </>
                    )}

                    {result.lesson && (
                      <>
                        <div><span className="font-medium">Bài:</span></div>
                        <div>{result.lesson.code} - {result.lesson.description}</div>
                      </>
                    )}

                    {result.questionType && result.questionType.code !== '0' && (
                      <>
                        <div><span className="font-medium">Loại câu hỏi:</span></div>
                        <div>{result.questionType.code} - {result.questionType.description}</div>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t mt-2">
                    <span className="font-medium">Mô tả đầy đủ:</span>
                    <div className="mt-1 text-gray-700">
                      {result.fullDescription}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export { UnifiedMapIDDecoderComponent as UnifiedMapIDDecoder };
export default UnifiedMapIDDecoderComponent;

'use client';

/**
 * MapCode Translation Display Component
 * Shows translation results and hierarchy navigation for question codes
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  ChevronRight,
  Info
} from 'lucide-react';
import { MapCodeClient, MapCodeTranslationData, HierarchyNavigationData } from '@/lib/grpc/mapcode-client';
import { toast } from 'sonner';

interface TranslationDisplayProps {
  className?: string;
}

export function TranslationDisplay({ className }: TranslationDisplayProps) {
  const [questionCode, setQuestionCode] = useState('');
  const [translation, setTranslation] = useState<MapCodeTranslationData | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyNavigationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!questionCode.trim()) {
      toast.error('Vui lòng nhập mã câu hỏi');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get translation and hierarchy in parallel
      const [translationResult, hierarchyResult] = await Promise.allSettled([
        MapCodeClient.translateCode(questionCode.trim()),
        MapCodeClient.getHierarchyNavigation(questionCode.trim()),
      ]);

      // Handle translation
      if (translationResult.status === 'fulfilled') {
        setTranslation(translationResult.value);
      } else {
        throw new Error(translationResult.reason?.message || 'Translation failed');
      }

      // Handle hierarchy (optional)
      if (hierarchyResult.status === 'fulfilled') {
        setHierarchy(hierarchyResult.value);
      } else {
        console.warn('Hierarchy navigation failed:', hierarchyResult.reason);
        setHierarchy(null);
      }

      toast.success('Dịch mã thành công');
    } catch (error) {
      console.error('Translation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      setError(errorMessage);
      toast.error(`Không thể dịch mã: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTranslation = () => {
    if (translation?.translation) {
      navigator.clipboard.writeText(translation.translation);
      toast.success('Đã copy bản dịch');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTranslate();
    }
  };

  const renderHierarchyLevel = (
    label: string,
    level: { code: string; name: string; description: string } | undefined
  ) => {
    if (!level) return null;

    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          {level.code}
        </Badge>
        <span className="text-sm">{level.description}</span>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>MapCode Translation</CardTitle>
        <CardDescription>
          Dịch mã câu hỏi thành ý nghĩa dễ hiểu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="flex gap-2">
          <Input
            placeholder="Nhập mã câu hỏi (VD: 0P1N1 hoặc 2H5V3-2)"
            value={questionCode}
            onChange={(e) => setQuestionCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="font-mono"
            disabled={loading}
          />
          <Button 
            onClick={handleTranslate}
            disabled={loading || !questionCode.trim()}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang dịch...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Dịch
              </>
            )}
          </Button>
        </div>

        {/* Format Info */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Định dạng hỗ trợ:</strong> ID5 (XXXXX) hoặc ID6 (XXXXX-X)
            <br />
            <strong>Ví dụ:</strong> 0P1N1 → &quot;Lớp 10 - Toán học - Chương 1 - Nhận biết - Bài 1&quot;
          </AlertDescription>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Lỗi:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Translation Result */}
        {translation && (
          <div className="space-y-4">
            <Separator />
            
            {/* Main Translation */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Bản dịch</span>
                    <Badge variant="secondary" className="font-mono">
                      {translation.questionCode}
                    </Badge>
                  </div>
                  <p className="text-lg font-medium text-green-900">
                    {translation.translation}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTranslation}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Hierarchy Navigation */}
            {hierarchy && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Chi tiết phân cấp:
                </h4>
                
                <div className="space-y-2">
                  {renderHierarchyLevel('Lớp', hierarchy.grade)}
                  {renderHierarchyLevel('Môn học', hierarchy.subject)}
                  {renderHierarchyLevel('Chương', hierarchy.chapter)}
                  {renderHierarchyLevel('Mức độ', hierarchy.level)}
                  {renderHierarchyLevel('Bài học', hierarchy.lesson)}
                  {hierarchy.form && renderHierarchyLevel('Dạng', hierarchy.form)}
                </div>

                {/* Breadcrumbs */}
                {hierarchy.breadcrumbs.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Đường dẫn:</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {hierarchy.breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          <span>{crumb}</span>
                          {index < hierarchy.breadcrumbs.length - 1 && (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Individual Components */}
            {(translation.grade || translation.subject || translation.chapter || 
              translation.level || translation.lesson || translation.form) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Thành phần riêng lẻ:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {translation.grade && (
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-muted-foreground">Lớp:</span>
                      <span className="ml-1 font-medium">{translation.grade}</span>
                    </div>
                  )}
                  {translation.subject && (
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-muted-foreground">Môn:</span>
                      <span className="ml-1 font-medium">{translation.subject}</span>
                    </div>
                  )}
                  {translation.chapter && (
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-muted-foreground">Chương:</span>
                      <span className="ml-1 font-medium">{translation.chapter}</span>
                    </div>
                  )}
                  {translation.level && (
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-muted-foreground">Mức độ:</span>
                      <span className="ml-1 font-medium">{translation.level}</span>
                    </div>
                  )}
                  {translation.lesson && (
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-muted-foreground">Bài:</span>
                      <span className="ml-1 font-medium">{translation.lesson}</span>
                    </div>
                  )}
                  {translation.form && (
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-muted-foreground">Dạng:</span>
                      <span className="ml-1 font-medium">{translation.form}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

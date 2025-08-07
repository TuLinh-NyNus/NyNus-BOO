'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/form/button';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { MockResource } from '@/lib/mockdata/courses-types';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  file: MockResource | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (file: MockResource) => void;
  className?: string;
}

/**
 * FilePreview Component
 * Component xem trước file với các loại: PDF, DOC, Slide, Link, Image
 * Hỗ trợ zoom, rotate cho hình ảnh
 */
export function FilePreview({ 
  file, 
  isOpen, 
  onClose, 
  onDownload,
  className 
}: FilePreviewProps): JSX.Element | null {
  const [zoom, setZoom] = useState(100);
  // TODO: Implement rotation feature for image preview
  // const [rotation, setRotation] = useState(0);

  if (!file) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  // TODO: Implement rotation feature
  // const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    // setRotation(0);
  };

  const renderPreviewContent = () => {
    switch (file.type) {
      case 'pdf':
        return (
          <div className="flex items-center justify-center h-96 bg-slate-700/50 rounded-lg">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">PDF Preview</h3>
                <p className="text-slate-400">Nhấn &quot;Tải về&quot; để xem file PDF</p>
              </div>
              <Button
                onClick={() => onDownload?.(file)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải về PDF
              </Button>
            </div>
          </div>
        );

      case 'doc':
        return (
          <div className="flex items-center justify-center h-96 bg-slate-700/50 rounded-lg">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Document Preview</h3>
                <p className="text-slate-400">Nhấn &quot;Tải về&quot; để xem tài liệu</p>
              </div>
              <Button
                onClick={() => onDownload?.(file)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải về Document
              </Button>
            </div>
          </div>
        );

      case 'slide':
        return (
          <div className="flex items-center justify-center h-96 bg-slate-700/50 rounded-lg">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Slide Presentation</h3>
                <p className="text-slate-400">Nhấn &quot;Tải về&quot; để xem slide</p>
              </div>
              <Button
                onClick={() => onDownload?.(file)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải về Slide
              </Button>
            </div>
          </div>
        );

      case 'exercise':
        return (
          <div className="flex items-center justify-center h-96 bg-slate-700/50 rounded-lg">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-orange-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Bài tập</h3>
                <p className="text-slate-400">Nhấn &quot;Tải về&quot; để làm bài tập</p>
              </div>
              <Button
                onClick={() => onDownload?.(file)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải về bài tập
              </Button>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="flex items-center justify-center h-96 bg-slate-700/50 rounded-lg">
            <div className="text-center space-y-4">
              <ExternalLink className="h-16 w-16 mx-auto text-cyan-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">External Link</h3>
                <p className="text-slate-400">Nhấn &quot;Mở liên kết&quot; để truy cập</p>
                <p className="text-xs text-slate-500 break-all max-w-md mx-auto">{file.url}</p>
              </div>
              <Button
                onClick={() => window.open(file.url, '_blank')}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Mở liên kết
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96 bg-slate-700/50 rounded-lg">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Không thể xem trước</h3>
                <p className="text-slate-400">Loại file này không hỗ trợ xem trước</p>
              </div>
              <Button
                onClick={() => onDownload?.(file)}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải về file
              </Button>
            </div>
          </div>
        );
    }
  };

  const showImageControls = false; // Có thể mở rộng cho image preview sau

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("w-full max-w-4xl max-h-[90vh] overflow-hidden", className)}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-slate-800 border-slate-700 h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl text-white">{file.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {file.type.toUpperCase()}
                    </Badge>
                    {file.size && (
                      <span className="text-sm text-slate-400">{file.size}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Image Controls - có thể mở rộng sau */}
                  {showImageControls && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-slate-400 min-w-[3rem] text-center">
                        {zoom}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      {/* TODO: Implement rotation feature
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRotate}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        Reset
                      </Button>
                    </>
                  )}

                  {/* Download Button */}
                  {file.type !== 'link' && (
                    <Button
                      onClick={() => onDownload?.(file)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Tải về
                    </Button>
                  )}

                  {/* Close Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
                {renderPreviewContent()}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

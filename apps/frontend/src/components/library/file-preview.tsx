'use client';

/**
 * Library File Preview Component
 * PDF viewer, YouTube embed, và Image gallery
 */

import { useState, useEffect } from 'react';
import { FileText, Play, Image as ImageIcon, ExternalLink, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
export interface FilePreviewProps {
  fileUrl?: string;
  thumbnailUrl?: string;
  youtubeUrl?: string;
  fileType?: string;
  kind: 'book' | 'exam' | 'video' | 'other';
  title: string;
  className?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Support multiple YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  
  return null;
}

/**
 * Get file extension from URL or file type
 */
function getFileExtension(fileUrl?: string, fileType?: string): string {
  if (fileType) {
    const ext = fileType.toLowerCase().replace('application/', '').replace('image/', '');
    return ext;
  }
  
  if (fileUrl) {
    const match = fileUrl.match(/\.([^.?#]+)(?:[?#]|$)/);
    return match?.[1]?.toLowerCase() || '';
  }
  
  return '';
}

/**
 * Check if file is an image
 */
function isImageFile(fileUrl?: string, fileType?: string): boolean {
  const ext = getFileExtension(fileUrl, fileType);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
}

/**
 * Check if file is a PDF
 */
function isPdfFile(fileUrl?: string, fileType?: string): boolean {
  const ext = getFileExtension(fileUrl, fileType);
  return ext === 'pdf' || fileType?.includes('pdf');
}

export function LibraryFilePreview({
  fileUrl,
  thumbnailUrl,
  youtubeUrl,
  fileType,
  kind,
  title,
  className,
}: FilePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewMode, setPreviewMode] = useState<'thumbnail' | 'embed' | 'iframe'>('thumbnail');

  const youtubeId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;
  const isImage = isImageFile(fileUrl, fileType);
  const isPdf = isPdfFile(fileUrl, fileType);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setPreviewMode('thumbnail');
  }, [fileUrl, youtubeUrl]);

  // Auto-select preview mode for videos
  useEffect(() => {
    if (kind === 'video' && youtubeId) {
      setPreviewMode('embed');
    }
  }, [kind, youtubeId]);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  // Render YouTube embed
  if (kind === 'video' && youtubeId && previewMode === 'embed') {
    return (
      <div className={cn('relative overflow-hidden rounded-2xl bg-black', className)}>
        <div className="relative pb-[56.25%]">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            onLoad={() => setLoading(false)}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render PDF embed
  if ((kind === 'book' || kind === 'exam') && isPdf && fileUrl && previewMode === 'iframe') {
    return (
      <div className={cn('relative overflow-hidden rounded-2xl bg-muted', className)}>
        <div className="relative min-h-[600px]">
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title={title}
            className="absolute inset-0 h-full w-full"
            onLoad={() => setLoading(false)}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="absolute bottom-4 right-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPreviewMode('thumbnail')}
            className="shadow-lg"
          >
            Đóng xem trước
          </Button>
        </div>
      </div>
    );
  }

  // Render image preview
  if (isImage && fileUrl && previewMode === 'embed') {
    return (
      <div className={cn('relative overflow-hidden rounded-2xl bg-muted', className)}>
        <img
          src={fileUrl}
          alt={title}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="h-auto w-full object-contain"
        />
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    );
  }

  // Render thumbnail with preview options
  return (
    <div className={cn('space-y-3', className)}>
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
        {thumbnailUrl && !error ? (
          <img
            src={thumbnailUrl}
            alt={title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {kind === 'video' && (
              <div className="flex flex-col items-center gap-2 text-primary">
                <Play className="h-12 w-12" />
                <p className="text-sm font-medium">Video bài giảng</p>
              </div>
            )}
            {(kind === 'book' || kind === 'exam') && (
              <div className="flex flex-col items-center gap-2 text-primary">
                <FileText className="h-12 w-12" />
                <p className="text-sm font-medium">
                  {kind === 'book' ? 'Tài liệu PDF' : 'Đề thi PDF'}
                </p>
              </div>
            )}
            {kind === 'other' && (
              <div className="flex flex-col items-center gap-2 text-primary">
                <ImageIcon className="h-12 w-12" />
                <p className="text-sm font-medium">Tài liệu</p>
              </div>
            )}
          </div>
        )}
        
        {loading && !error && thumbnailUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* YouTube preview */}
        {kind === 'video' && youtubeId && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewMode('embed')}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Xem video
          </Button>
        )}

        {/* PDF preview */}
        {(kind === 'book' || kind === 'exam') && isPdf && fileUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewMode('iframe')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Xem trước PDF
          </Button>
        )}

        {/* Image preview */}
        {isImage && fileUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewMode('embed')}
            className="gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Xem ảnh
          </Button>
        )}

        {/* External link */}
        {fileUrl && (
          <Button
            size="sm"
            variant="outline"
            asChild
            className="gap-2"
          >
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Mở trong tab mới
            </a>
          </Button>
        )}

        {/* YouTube external link */}
        {kind === 'video' && youtubeUrl && (
          <Button
            size="sm"
            variant="outline"
            asChild
            className="gap-2"
          >
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Mở YouTube
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default LibraryFilePreview;


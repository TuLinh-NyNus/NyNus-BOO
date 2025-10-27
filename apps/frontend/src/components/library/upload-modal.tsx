'use client';

import { FormEvent, useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Int32Value, Int64Value } from 'google-protobuf/google/protobuf/wrappers_pb';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/feedback/use-toast';
import { cn } from '@/lib/utils';
import { LibraryService } from '@/services/grpc/library.service';
import {
  LibraryItemPayload,
  LibraryItemType,
  CreateBookMetadata,
} from '@/generated/v1/library_pb';

import {
  BOOK_TYPE_OPTIONS,
  GRADE_OPTIONS,
  LIBRARY_TYPES,
  SUBJECT_OPTIONS,
} from './constants';
import { LibraryFileUploader, type FileUploadResult } from './file-uploader';

interface UploadModalProps {
  onCreated?: () => void;
}

export function LibraryUploadModal({ onCreated }: UploadModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<'book' | 'exam' | 'video'>('book');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [bookType, setBookType] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [isbn, setIsbn] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileId, setFileId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setGrade('');
    setBookType('');
    setAuthor('');
    setPublisher('');
    setPublicationYear('');
    setIsbn('');
    setFileUrl('');
    setFileId('');
    setThumbnailUrl('');
    setFileSize('');
    setFileType('');
  };

  const handleFileUploadComplete = (result: FileUploadResult) => {
    setFileUrl(result.fileUrl);
    setFileId(result.fileId);
    setFileType(result.fileType);
    setFileSize(result.fileSize.toString());
    if (result.thumbnailUrl) {
      setThumbnailUrl(result.thumbnailUrl);
    }
    toast({
      title: 'Tải file thành công',
      description: `File đã được tải lên (${(result.fileSize / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  const handleFileUploadError = (error: string) => {
    toast({
      title: 'Lỗi tải file',
      description: error,
      variant: 'destructive',
    });
  };

  const isBook = selectedType === 'book';

  const disabledTypes = useMemo(() => ['exam', 'video'] as const, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isBook) {
      toast({
        title: 'Sắp ra mắt',
        description: 'Hiện tại chỉ hỗ trợ tải lên tài liệu dạng sách.',
      });
      return;
    }

    if (!title.trim() || !fileUrl.trim()) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập tối thiểu tiêu đề và đường dẫn tài liệu.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = new LibraryItemPayload();
      payload.setName(title.trim());
      payload.setDescription(description.trim());
      payload.setType(LibraryItemType.LIBRARY_ITEM_TYPE_BOOK);
      payload.setFileUrl(fileUrl.trim());
      payload.setFileId(fileId.trim());
      payload.setThumbnailUrl(thumbnailUrl.trim());
      payload.setCategory(bookType || 'reference');
      payload.setRequiredRole('STUDENT');

      if (fileSize.trim()) {
        const size = Number(fileSize);
        if (!Number.isNaN(size)) {
          const sizeWrapper = new Int64Value();
          sizeWrapper.setValue(size);
          payload.setFileSize(sizeWrapper);
        }
      }

      const bookMetadata = new CreateBookMetadata();
      bookMetadata.setSubject(subject || 'Chưa xác định');
      bookMetadata.setGrade(grade || 'Chưa xác định');
      bookMetadata.setBookType(bookType || 'reference');
      bookMetadata.setAuthor(author || 'NyNus biên soạn');
      bookMetadata.setPublisher(publisher || 'Đang cập nhật');
      if (publicationYear.trim()) {
        const yearValue = Number(publicationYear);
        if (!Number.isNaN(yearValue)) {
          const yearWrapper = new Int32Value();
          yearWrapper.setValue(yearValue);
          bookMetadata.setPublicationYear(yearWrapper);
        }
      }
      bookMetadata.setIsbn(isbn);
      payload.setBook(bookMetadata);

      const result = await LibraryService.createItem(payload);
      if (!result.success) {
        throw new Error(result.errors?.[0] ?? result.message ?? 'Không thể tạo nội dung');
      }

      toast({
        title: 'Tải lên thành công',
        description: 'Tài liệu của bạn đã được gửi lên hệ thống. Vui lòng chờ duyệt trước khi công bố.',
      });
      resetForm();
      setOpen(false);
      onCreated?.();
    } catch (error) {
      toast({
        title: 'Không thể tải lên',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next);
      if (!next) {
        resetForm();
        setSubmitting(false);
      }
    }}
    >
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Tải tài liệu lên
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-3xl border border-border/50 bg-background/95 shadow-xl shadow-primary/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">Tải nội dung lên thư viện</DialogTitle>
          <DialogDescription>
            Hiện tại nền tảng hỗ trợ tải lên tài liệu dạng sách (PDF, tài liệu tham khảo). Các định dạng khác sẽ được mở trong bản cập nhật tiếp theo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {LIBRARY_TYPES.map(({ value, label }) => {
              const isActive = selectedType === value;
              const isDisabled = disabledTypes.includes(value as typeof disabledTypes[number]);
              return (
                <Button
                  key={value}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => setSelectedType(value as 'book' | 'exam' | 'video')}
                  className={cn(
                    'h-auto rounded-xl border border-border/50 px-4 py-2 text-xs',
                    isActive ? 'bg-primary text-primary-foreground shadow shadow-primary/30' : 'text-muted-foreground',
                  )}
                >
                  {label}
                  {isDisabled && (
                    <Badge variant="outline" className="ml-2 rounded-full border-dashed bg-background text-muted-foreground">
                      Sắp có
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="upload-title">Tiêu đề</Label>
              <Input
                id="upload-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Bộ đề luyện thi THPT Quốc Gia 2025"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="upload-description">Mô tả</Label>
              <Textarea
                id="upload-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Giới thiệu ngắn gọn về tài liệu..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Môn học</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Khối lớp</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khối lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isBook && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Loại sách</Label>
                  <Select value={bookType} onValueChange={setBookType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại sách" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOK_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Tác giả</Label>
                  <Input
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    placeholder="Ví dụ: Bộ môn Toán - NyNus"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Nhà xuất bản</Label>
                  <Input
                    value={publisher}
                    onChange={(event) => setPublisher(event.target.value)}
                    placeholder="Ví dụ: NyNus Learning"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Năm xuất bản</Label>
                  <Input
                    type="number"
                    min={1900}
                    max={2100}
                    value={publicationYear}
                    onChange={(event) => setPublicationYear(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>ISBN (nếu có)</Label>
                  <Input
                    value={isbn}
                    onChange={(event) => setIsbn(event.target.value)}
                    placeholder="978-..."
                  />
                </div>
              </div>
            )}

            {/* File Upload Section */}
            <div className="flex flex-col gap-2">
              <Label>Tải file lên</Label>
              <LibraryFileUploader
                uploadType={selectedType}
                onUploadComplete={handleFileUploadComplete}
                onUploadError={handleFileUploadError}
                disabled={submitting}
              />
            </div>

            {/* Hidden fields - populated by uploader */}
            {fileUrl && (
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>File URL:</strong> {fileUrl}</p>
                  <p><strong>File ID:</strong> {fileId || 'N/A'}</p>
                  <p><strong>File Type:</strong> {fileType || 'N/A'}</p>
                  <p><strong>File Size:</strong> {fileSize ? `${(parseInt(fileSize) / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                  {thumbnailUrl && <p><strong>Thumbnail:</strong> {thumbnailUrl}</p>}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Bạn có thể cập nhật thông tin chi tiết sau khi tải lên. Nội dung sẽ ở trạng thái chờ duyệt.
            </p>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang tải lên...' : 'Tải nội dung lên'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LibraryUploadModal;

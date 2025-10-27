/**
 * Export Dialog Component
 * 
 * Provides a user-friendly interface for exporting questions to PDF or Word
 * Design matches NyNus theme system (pastel colors, modern UI)
 */

"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Input,
  Switch,
  RadioGroup,
  RadioGroupItem,
  Label,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui';
import { FileText, FileDown, Loader2, Info, CheckCircle } from 'lucide-react';
import { Question } from '@/types/question';
import { generatePDF, ExportOptions as PDFExportOptions } from '@/lib/export/pdf-generator';
import { generateWord, ExportOptions as WordExportOptions } from '@/lib/export/word-generator';
import { useToast } from '@/hooks/ui/use-toast';

// Define schema for export form
const exportSchema = z.object({
  format: z.enum(['pdf', 'word']).default('pdf'),
  title: z.string().min(1, 'Tiêu đề không được để trống').max(100, 'Tiêu đề tối đa 100 ký tự'),
  filename: z.string().min(1, 'Tên file không được để trống').max(50, 'Tên file tối đa 50 ký tự'),
  showSolutions: z.boolean().default(true),
  showMetadata: z.boolean().default(true),
});

type ExportFormData = z.infer<typeof exportSchema>;

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  selectedQuestions?: string[]; // IDs of selected questions
}

export function ExportDialog({
  isOpen,
  onClose,
  questions,
  selectedQuestions,
}: ExportDialogProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const { toast } = useToast();

  // Determine which questions to export
  const questionsToExport =
    selectedQuestions && selectedQuestions.length > 0
      ? questions.filter((q) => selectedQuestions.includes(q.id))
      : questions;

  const form = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: 'pdf',
      title: 'Bộ câu hỏi trắc nghiệm',
      filename: `questions_${new Date().toISOString().split('T')[0]}`,
      showSolutions: true,
      showMetadata: true,
    },
  });

  const watchFormat = form.watch('format');

  const handleExport = async (data: ExportFormData) => {
    if (questionsToExport.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Không có câu hỏi nào để xuất.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const options: PDFExportOptions | WordExportOptions = {
        title: data.title,
        showSolutions: data.showSolutions,
        showMetadata: data.showMetadata,
      };

      const filename = `${data.filename}.${data.format === 'pdf' ? 'pdf' : 'docx'}`;

      if (data.format === 'pdf') {
        await generatePDF(questionsToExport, options, filename);
      } else {
        await generateWord(questionsToExport, options, filename);
      }

      setExportSuccess(true);
      toast({
        title: 'Xuất file thành công!',
        description: `Đã xuất ${questionsToExport.length} câu hỏi sang định dạng ${
          data.format.toUpperCase()
        }.`,
      });

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Lỗi xuất file',
        description:
          error instanceof Error ? error.message : 'Đã xảy ra lỗi khi xuất file. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      form.reset();
      setExportSuccess(false);
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            Xuất câu hỏi
          </DialogTitle>
          <DialogDescription>
            Xuất {questionsToExport.length} câu hỏi sang định dạng PDF hoặc Word.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleExport)} className="space-y-4">
            {/* Success Alert */}
            {exportSuccess && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">
                  Xuất file thành công!
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  File đang được tải xuống...
                </AlertDescription>
              </Alert>
            )}

            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Thông tin</AlertTitle>
              <AlertDescription>
                {selectedQuestions && selectedQuestions.length > 0 ? (
                  <>Đang xuất {questionsToExport.length} câu hỏi đã chọn.</>
                ) : (
                  <>Đang xuất tất cả {questionsToExport.length} câu hỏi trong danh sách.</>
                )}
              </AlertDescription>
            </Alert>

            {/* Format Selection */}
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Định dạng xuất</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="pdf"
                          id="format-pdf"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="format-pdf"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <FileText className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">PDF</span>
                          <span className="text-xs text-muted-foreground">Portable Document</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="word"
                          id="format-word"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="format-word"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <FileText className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">Word</span>
                          <span className="text-xs text-muted-foreground">Microsoft Word</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title Input */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Đề thi giữa kỳ Toán 10"
                      {...field}
                      disabled={isExporting}
                    />
                  </FormControl>
                  <FormDescription>
                    Tiêu đề sẽ hiển thị ở đầu file {watchFormat === 'pdf' ? 'PDF' : 'Word'}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Filename Input */}
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên file</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: de-thi-giua-ky"
                      {...field}
                      disabled={isExporting}
                    />
                  </FormControl>
                  <FormDescription>
                    File sẽ được lưu là: {field.value || 'filename'}.
                    {watchFormat === 'pdf' ? 'pdf' : 'docx'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show Solutions Toggle */}
            <FormField
              control={form.control}
              name="showSolutions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Hiển thị lời giải</FormLabel>
                    <FormDescription className="text-xs">
                      Bao gồm lời giải chi tiết cho từng câu hỏi
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isExporting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Show Metadata Toggle */}
            <FormField
              control={form.control}
              name="showMetadata"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Hiển thị thông tin</FormLabel>
                    <FormDescription className="text-xs">
                      Bao gồm tags, độ khó, loại câu hỏi
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isExporting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isExporting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isExporting}>
                {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Xuất file
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


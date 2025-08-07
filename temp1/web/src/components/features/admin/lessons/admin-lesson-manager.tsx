'use client';

import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  PlayCircle,
  Clock,
  GripVertical,
  MoreHorizontal,
  Eye,
  FileText,
  Video,
  Lock,
  Unlock
} from 'lucide-react';
import { useState } from 'react';

// import { useAdminLessons } from '@/hooks/admin/use-admin-lessons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Switch
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { MockLesson } from '@/lib/mock-data/types';

interface AdminLessonManagerProps {
  chapterId: string;
  courseId: string;
  onLessonsChange?: () => void; // Callback khi có thay đổi bài học
}

interface LessonFormData {
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  isFree: boolean;
}

export function AdminLessonManager({ chapterId, courseId, onLessonsChange }: AdminLessonManagerProps): JSX.Element {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<MockLesson | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormData>({
    title: '',
    description: '',
    duration: '',
    videoUrl: '',
    thumbnail: '',
    isFree: false
  });

  // Mock data for now
  const lessons: MockLesson[] = [];
  const isLoading = false;
  const error = null;
  const createLesson = async (data: unknown) => { return true; };
  const updateLesson = async (id: string, data: unknown) => { return true; };
  const deleteLesson = async (id: string) => { return true; };
  const duplicateLesson = async (id: string) => { return true; };
  const reorderLessons = async (lessons: unknown[]) => { return true; };

  const resetForm = () => {
    setLessonForm({
      title: '',
      description: '',
      duration: '',
      videoUrl: '',
      thumbnail: '',
      isFree: false
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const openEditDialog = (lesson: MockLesson) => {
    setSelectedLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl,
      thumbnail: lesson.thumbnail,
      isFree: lesson.isFree
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (lesson: MockLesson) => {
    setSelectedLesson(lesson);
    setDeleteDialogOpen(true);
  };

  const handleCreateLesson = async () => {
    if (!lessonForm.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên bài học không được để trống",
        variant: "destructive",
      });
      return;
    }

    const result = await createLesson({
      chapterId,
      courseId,
      title: lessonForm.title,
      description: lessonForm.description,
      duration: lessonForm.duration || '0:00',
      videoUrl: lessonForm.videoUrl || '',
      thumbnail: lessonForm.thumbnail || '/images/lessons/default-thumbnail.jpg',
      isFree: lessonForm.isFree
    });

    if (result) {
      toast({
        title: "Thành công",
        description: `Đã tạo bài học "${lessonForm.title}"`,
      });
      setCreateDialogOpen(false);
      resetForm();
      // Thông báo cho chapter manager về thay đổi
      onLessonsChange?.();
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài học. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleEditLesson = async () => {
    if (!selectedLesson || !lessonForm.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên bài học không được để trống",
        variant: "destructive",
      });
      return;
    }

    const result = await updateLesson(selectedLesson.id, {
      chapterId,
      courseId,
      title: lessonForm.title,
      description: lessonForm.description,
      duration: lessonForm.duration,
      videoUrl: lessonForm.videoUrl,
      thumbnail: lessonForm.thumbnail,
      isFree: lessonForm.isFree
    });

    if (result) {
      toast({
        title: "Thành công",
        description: `Đã cập nhật bài học "${lessonForm.title}"`,
      });
      setEditDialogOpen(false);
      setSelectedLesson(null);
      resetForm();
      // Thông báo cho chapter manager về thay đổi
      onLessonsChange?.();
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài học. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;

    const result = await deleteLesson(selectedLesson.id);
    if (result) {
      toast({
        title: "Thành công",
        description: `Đã xóa bài học "${selectedLesson.title}"`,
      });
      setDeleteDialogOpen(false);
      setSelectedLesson(null);
      // Thông báo cho chapter manager về thay đổi
      onLessonsChange?.();
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài học. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateLesson = async (lesson: MockLesson) => {
    const result = await duplicateLesson(lesson.id);
    if (result) {
      toast({
        title: "Thành công",
        description: `Đã sao chép bài học "${lesson.title}"`,
      });
      // Thông báo cho chapter manager về thay đổi
      onLessonsChange?.();
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép bài học. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-600">Đang tải bài học...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Có lỗi xảy ra: {error}</p>
        <Button variant="outline" size="sm" className="mt-2">
          Thử lại
        </Button>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="p-6 text-center">
        <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Chưa có bài học nào</h4>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Hãy tạo bài học đầu tiên cho chương này
        </p>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo bài học đầu tiên
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">Bài học</h4>
          <Badge variant="outline">{lessons.length} bài</Badge>
        </div>
        <Button size="sm" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm bài học
        </Button>
      </div>

      {/* Lessons List */}
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={index}
            onEdit={() => openEditDialog(lesson)}
            onDelete={() => openDeleteDialog(lesson)}
            onDuplicate={() => handleDuplicateLesson(lesson)}
          />
        ))}
      </div>

      {/* Create Lesson Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo bài học mới</DialogTitle>
            <DialogDescription>
              Thêm bài học mới vào chương này. Bạn có thể thêm video và tài liệu sau khi tạo bài học.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Tên bài học *</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tên bài học..."
              />
            </div>
            <div>
              <Label htmlFor="lesson-description">Mô tả</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả nội dung bài học..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-duration">Thời lượng</Label>
                <Input
                  id="lesson-duration"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="VD: 15:30"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="lesson-free"
                  checked={lessonForm.isFree}
                  onCheckedChange={(checked) => setLessonForm(prev => ({ ...prev, isFree: checked }))}
                />
                <Label htmlFor="lesson-free">Bài học miễn phí</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="lesson-video">URL Video (tùy chọn)</Label>
              <Input
                id="lesson-video"
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateLesson}>
              Tạo bài học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài học</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin bài học "{selectedLesson?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-lesson-title">Tên bài học *</Label>
              <Input
                id="edit-lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tên bài học..."
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-description">Mô tả</Label>
              <Textarea
                id="edit-lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả nội dung bài học..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-lesson-duration">Thời lượng</Label>
                <Input
                  id="edit-lesson-duration"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="VD: 15:30"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="edit-lesson-free"
                  checked={lessonForm.isFree}
                  onCheckedChange={(checked) => setLessonForm(prev => ({ ...prev, isFree: checked }))}
                />
                <Label htmlFor="edit-lesson-free">Bài học miễn phí</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-lesson-video">URL Video</Label>
              <Input
                id="edit-lesson-video"
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditLesson}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài học "{selectedLesson?.title}"?
              Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLesson} className="bg-red-600 hover:bg-red-700">
              Xóa bài học
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Lesson Card Component
interface LessonCardProps {
  lesson: MockLesson;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function LessonCard({ lesson, index, onEdit, onDelete, onDuplicate }: LessonCardProps): JSX.Element {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div className="cursor-move text-gray-400 hover:text-gray-600">
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Lesson Number */}
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {index + 1}
            </span>
          </div>

          {/* Video Icon */}
          <div className="flex-shrink-0">
            {lesson.videoUrl ? (
              <Video className="h-5 w-5 text-green-600" />
            ) : (
              <FileText className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Lesson Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {lesson.title}
              </h5>
              {lesson.isFree && (
                <Badge variant="secondary" className="text-xs">
                  <Unlock className="h-3 w-3 mr-1" />
                  Miễn phí
                </Badge>
              )}
              {!lesson.isFree && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Trả phí
                </Badge>
              )}
            </div>
            {lesson.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {lesson.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{lesson.duration}</span>
              </div>
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{lesson.resources.length} tài liệu</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem trước
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

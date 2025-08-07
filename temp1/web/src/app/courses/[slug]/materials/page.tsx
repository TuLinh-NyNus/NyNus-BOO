'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Download,
  Users,
  Star,
  FolderOpen,
  Archive,
  TrendingDown
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Components
import { MaterialsList } from '@/components/features/courses/display';
import { CourseBreadcrumb, CourseNavigation } from '@/components/features/courses/navigation/course-navigation';
import { FilePreview } from '@/components/features/courses/ui/file-preview';
import { MathBackground } from '@/components/features/courses/ui/math-background';
import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { useToast } from '@/hooks/use-toast';

// Mock Data
import { getChaptersByCourseId } from '@/lib/mock-data/course-details';
import { getCourseBySlug } from '@/lib/mock-data/courses';
import { MockCourse, MockChapter, MockResource } from '@/lib/mock-data/types';
import logger from '@/lib/utils/logger';

// Extended Material interface
interface Material extends MockResource {
  chapterTitle?: string;
  chapterNumber?: number;
  downloadCount?: number;
  fileSize?: string;
  lastModified?: string;
}

export default function CourseMaterialsPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [course, setCourse] = useState<MockCourse | null>(null);
  const [chapters, setChapters] = useState<MockChapter[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<MockResource | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const loadMaterialsData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Load course data
        const courseData = getCourseBySlug(slug);
        if (!courseData) {
          router.push('/courses');
          return;
        }

        // Load chapters data
        const chaptersData = getChaptersByCourseId(courseData.id);

        // Extract all materials from lessons and add chapter info
        const allMaterials: Material[] = [];
        chaptersData.forEach(chapter => {
          chapter.lessons.forEach(lesson => {
            lesson.resources.forEach(resource => {
              allMaterials.push({
                ...resource,
                chapterTitle: chapter.title,
                chapterNumber: chapter.number,
                downloadCount: Math.floor(Math.random() * 100) + 10, // Mock download count
                fileSize: resource.size,
                lastModified: resource.createdAt
              });
            });
          });
        });

        // Add some additional course-level materials
        const courseMaterials: Material[] = [
          {
            id: 'course-material-1',
            lessonId: '',
            title: 'Syllabus khóa học',
            type: 'pdf',
            url: '/materials/syllabus.pdf',
            size: '1.2 MB',
            createdAt: '2024-01-01T00:00:00Z',
            chapterTitle: 'Tài liệu chung',
            chapterNumber: 0,
            downloadCount: 156,
            fileSize: '1.2 MB'
          },
          {
            id: 'course-material-2',
            lessonId: '',
            title: 'Bảng công thức tổng hợp',
            type: 'pdf',
            url: '/materials/formulas.pdf',
            size: '2.8 MB',
            createdAt: '2024-01-01T00:00:00Z',
            chapterTitle: 'Tài liệu chung',
            chapterNumber: 0,
            downloadCount: 203,
            fileSize: '2.8 MB'
          },
          {
            id: 'course-material-3',
            lessonId: '',
            title: 'Video hướng dẫn sử dụng',
            type: 'link',
            url: '/materials/tutorial.mp4',
            size: '45.6 MB',
            createdAt: '2024-01-01T00:00:00Z',
            chapterTitle: 'Tài liệu chung',
            chapterNumber: 0,
            downloadCount: 89,
            fileSize: '45.6 MB'
          }
        ];

        setCourse(courseData);
        setChapters(chaptersData);
        setMaterials([...courseMaterials, ...allMaterials]);
      } catch (error) {
        logger.error('Error loading materials data:', error);
        toast({
          title: 'Lỗi',
          description: 'Có lỗi xảy ra khi tải dữ liệu tài liệu',
          variant: 'destructive'
        });
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadMaterialsData();
    }
  }, [slug, router]);

  const handleDownload = (material: Material) => {
    // In real app, this would trigger actual download
    toast({
      title: `Đang tải xuống: ${material.title}`,
      description: `File ${material.type.toUpperCase()} - ${material.fileSize || 'Unknown size'}`,
      variant: 'success'
    });

    // Update download count
    setMaterials(prev => prev.map(m => 
      m.id === material.id 
        ? { ...m, downloadCount: (m.downloadCount || 0) + 1 }
        : m
    ));
  };

  const handlePreview = (material: Material) => {
    setPreviewFile(material);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  // Calculate statistics
  const totalMaterials = materials.length;
  const totalDownloads = materials.reduce((sum, m) => sum + (m.downloadCount || 0), 0);
  const fileTypes = Array.from(new Set(materials.map(m => m.type))).length;
  const totalSize = materials.reduce((sum, m) => {
    if (!m.fileSize) return sum;
    const sizeMatch = m.fileSize.match(/(\d+\.?\d*)\s*(MB|KB|GB)/i);
    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2].toUpperCase();
      switch (unit) {
        case 'GB': return sum + size * 1024;
        case 'MB': return sum + size;
        case 'KB': return sum + size / 1024;
        default: return sum;
      }
    }
    return sum;
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <MathBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Đang tải tài liệu...</h2>
          <p className="text-slate-400">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <MathBackground />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Không tìm thấy khóa học</h1>
          <p className="text-slate-400 mb-6">Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => router.push('/courses')}>
            Quay lại danh sách khóa học
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <MathBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <CourseBreadcrumb />

        {/* Course Navigation */}
        <CourseNavigation />

        {/* Course Info Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Tài liệu khóa học</h1>
                  <p className="text-slate-400">{course.title}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students} học viên</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  {course.level}
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {course.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{totalMaterials}</div>
                <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
                  <FileText className="h-3 w-3" />
                  Tài liệu
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{totalDownloads}</div>
                <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
                  <Download className="h-3 w-3" />
                  Lượt tải
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{fileTypes}</div>
                <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
                  <FolderOpen className="h-3 w-3" />
                  Loại file
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{totalSize.toFixed(1)} MB</div>
                <div className="text-sm text-slate-400 flex items-center justify-center gap-1">
                  <Archive className="h-3 w-3" />
                  Tổng dung lượng
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Materials List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <MaterialsList
            materials={materials}
            onDownload={handleDownload}
            onPreview={handlePreview}
          />
        </motion.div>

        {/* File Preview Modal */}
        <FilePreview
          file={previewFile}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}

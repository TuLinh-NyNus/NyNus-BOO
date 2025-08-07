'use client';

import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  RotateCcw,
  Eye,
  Edit,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle,
  Clock,
  FileText,
  Video,
  Download,
  MessageCircle,
  ThumbsUp,
  Share,
  BookOpen,
  User
} from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress
} from '@/components/ui';
import {
  LessonData,
  LessonPreviewProps,
  LessonContent,
  ContentSection,
  ContentData,
  VideoContent,
  TextContent,
  QuizContent,
  ImageContent,
  CodeContent,
  ResourceContent,
  SectionType,
  isVideoContent,
  isTextContent,
  isQuizContent,
  isResourceContent
} from '@/lib/types/lesson-content';

interface LessonPreviewPropsLocal {
  lessonData: {
    id: string;
    title: string;
    description: string;
    duration: string;
    instructor: string;
    course: string;
    chapter: string;
    sections: ContentSection[];
  };
  onEdit?: () => void;
  onClose?: () => void;
}

export function LessonPreview({ lessonData, onEdit, onClose }: LessonPreviewPropsLocal): JSX.Element {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'desktop':
        return 'w-full max-w-6xl';
      case 'tablet':
        return 'w-full max-w-2xl';
      case 'mobile':
        return 'w-full max-w-sm';
      default:
        return 'w-full max-w-6xl';
    }
  };

  const renderVideoPlayer = (section: ContentSection) => (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      {/* Video Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center text-white">
          <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Video Preview</p>
          <p className="text-sm opacity-75">
            {isVideoContent(section.content) ? section.content.url : 'No video URL'}
          </p>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="space-y-2">
          {/* Progress Bar */}
          <Progress value={progress} className="h-1" />
          
          {/* Controls */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-16">
                  <Progress value={isMuted ? 0 : volume} className="h-1" />
                </div>
              </div>
              
              <span className="text-sm">0:00 / {lessonData.duration}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTextContent = (section: ContentSection) => (
    <div className="prose max-w-none">
      <div className="bg-white p-6 rounded-lg border">
        <div className="text-slate-900 leading-relaxed">
          {isTextContent(section.content) ? (section.content as TextContent).content || (section.content as TextContent).text : 'Nội dung văn bản sẽ hiển thị ở đây...'}
        </div>

        {isTextContent(section.content) && (section.content as TextContent).allowComments && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MessageCircle className="h-4 w-4" />
              <span>Cho phép bình luận</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuizContent = (section: ContentSection) => (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <CheckCircle className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-blue-900">Quiz: {section.title}</h3>
          <p className="text-sm text-blue-700">
            {isQuizContent(section.content) ? (section.content as QuizContent).questions?.length || 0 : 0} câu hỏi •
            Thời gian: {isQuizContent(section.content) ? (section.content as QuizContent).timeLimit || 'Không giới hạn' : 'Không giới hạn'} phút
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-white p-3 rounded border">
          <div className="font-medium text-slate-900">Điểm đậu</div>
          <div className="text-slate-600">
            {isQuizContent(section.content) ? (section.content as QuizContent).passingScore || 70 : 70}%
          </div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="font-medium text-slate-900">Làm lại</div>
          <div className="text-slate-600">
            {isQuizContent(section.content) && (section.content as QuizContent).allowRetake ? 'Cho phép' : 'Không cho phép'}
          </div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="font-medium text-slate-900">Loại</div>
          <div className="text-slate-600">Tự luận + Trắc nghiệm</div>
        </div>
      </div>
    </div>
  );

  const renderResourceContent = (section: ContentSection) => (
    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Download className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-medium text-green-900">Tài liệu: {section.title}</h3>
          <p className="text-sm text-green-700">
            {isResourceContent(section.content) ? (section.content as ResourceContent).description || 'Tài liệu bổ sung cho bài học' : 'Tài liệu bổ sung cho bài học'}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-white rounded border">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium">Slide bài giảng.pdf</span>
          </div>
          <Button size="sm" variant="outline">
            <Download className="h-3 w-3 mr-1" />
            Tải xuống
          </Button>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded border">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium">Bài tập thực hành.docx</span>
          </div>
          <Button size="sm" variant="outline">
            <Download className="h-3 w-3 mr-1" />
            Tải xuống
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = (section: ContentSection) => {
    switch (section.type) {
      case 'video':
        return renderVideoPlayer(section);
      case 'text':
        return renderTextContent(section);
      case 'quiz':
        return renderQuizContent(section);
      case 'resource':
        return renderResourceContent(section);
      default:
        return (
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <p className="text-slate-600">Loại nội dung: {section.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Preview Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onClose}>
                ← Quay lại
              </Button>
              
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-slate-600" />
                <span className="font-medium">Preview Mode</span>
                <Badge variant="secondary">Student View</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Device Preview Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex justify-center p-6">
        <div className={`${getPreviewDimensions()} transition-all duration-300`}>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Lesson Header */}
            <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-purple-100 text-sm mb-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{lessonData.course}</span>
                    <span>•</span>
                    <span>{lessonData.chapter}</span>
                  </div>
                  
                  <h1 className="text-2xl font-bold mb-2">{lessonData.title}</h1>
                  <p className="text-purple-100 mb-4">{lessonData.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{lessonData.instructor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{lessonData.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{lessonData.sections?.length || 0} phần</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Chia sẻ
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Thích
                  </Button>
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="p-6">
              {lessonData.sections && lessonData.sections.length > 0 ? (
                <div className="space-y-8">
                  {lessonData.sections.map((section, index) => (
                    <div key={section.id || index} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {section.type === 'video' && <Video className="h-3 w-3" />}
                          {section.type === 'text' && <FileText className="h-3 w-3" />}
                          {section.type === 'quiz' && <CheckCircle className="h-3 w-3" />}
                          {section.type === 'resource' && <Download className="h-3 w-3" />}
                          Phần {index + 1}
                        </Badge>
                        <h2 className="text-lg font-semibold">{section.title}</h2>
                        {section.isRequired && (
                          <Badge variant="destructive" className="text-xs">Bắt buộc</Badge>
                        )}
                      </div>
                      
                      {renderSectionContent(section)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Chưa có nội dung
                  </h3>
                  <p className="text-slate-600">
                    Bài học chưa có nội dung để hiển thị
                  </p>
                </div>
              )}
            </div>

            {/* Lesson Footer */}
            <div className="p-6 border-t bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline">
                    ← Bài trước
                  </Button>
                  <Button>
                    Bài tiếp theo →
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Hoàn thành bài học</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

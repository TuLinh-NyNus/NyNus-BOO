'use client';

import { 
  Save, 
  Eye, 
  Upload, 
  Video, 
  FileText, 
  Image, 
  Code, 
  Play,
  Pause,
  Volume2,
  Settings,
  Plus,
  X,
  Move
} from 'lucide-react';
import { useState, useRef } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch
} from '@/components/ui';
import {
  LessonContent,
  LessonData,
  LessonEditorProps,
  BlockType,
  ContentData,
  VideoContent,
  TextContent,
  QuizContent,
  ImageContent,
  CodeContent,
  getBlockTypeName
} from '@/lib/types/lesson-content';

interface LessonEditorPropsLocal {
  lessonId?: string;
  chapterId: string;
  courseId: string;
  onSave?: (lessonData: unknown) => void;
  onCancel?: () => void;
}

export function LessonEditor({
  lessonId,
  chapterId,
  courseId,
  onSave,
  onCancel
}: LessonEditorPropsLocal): JSX.Element {
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    duration: '',
    isFree: false,
    content: [] as LessonContent[],
    videoUrl: '',
    thumbnail: '',
    resources: []
  });

  const [activeTab, setActiveTab] = useState('editor');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateLessonData = (updates: unknown) => {
    setLessonData(prev => {
      // Type guard to ensure both prev and updates are objects before spreading
      if (typeof prev !== 'object' || prev === null) {
        return {
          title: '',
          description: '',
          duration: '',
          isFree: false,
          content: [],
          videoUrl: '',
          thumbnail: '',
          resources: [],
          ...(typeof updates === 'object' && updates !== null ? updates : {})
        };
      }
      return {
        ...prev,
        ...(typeof updates === 'object' && updates !== null ? updates : {})
      };
    });
  };

  const addContentBlock = (type: BlockType) => {
    const newBlock: LessonContent = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: lessonData.content.length
    };

    updateLessonData({
      content: [...lessonData.content, newBlock]
    });
  };

  const getDefaultContent = (type: BlockType): ContentData => {
    switch (type) {
      case 'text':
        return { content: '', formatting: 'paragraph' } as TextContent;
      case 'video':
        return { url: '', title: '', duration: '' } as VideoContent;
      case 'image':
        return { url: '', alt: '', caption: '' } as ImageContent;
      case 'code':
        return { code: '', language: 'javascript' } as CodeContent;
      case 'quiz':
        return {
          questions: [], // Required property for QuizContent interface
          question: '',
          passingScore: 70,
          allowRetake: true
        } as QuizContent;
      default:
        return {};
    }
  };

  const updateContentBlock = (blockId: string, content: unknown) => {
    updateLessonData({
      content: lessonData.content.map(block =>
        block.id === blockId ? { ...block, content } : block
      )
    });
  };

  const removeContentBlock = (blockId: string) => {
    updateLessonData({
      content: lessonData.content.filter(block => block.id !== blockId)
    });
  };

  const moveContentBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...lessonData.content];
    const index = blocks.findIndex(block => block.id === blockId);
    
    if (direction === 'up' && index > 0) {
      [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    }
    
    updateLessonData({ content: blocks });
  };

  const handleVideoUpload = () => {
    // Mock video upload
    const mockVideoUrl = '/videos/lessons/sample-lesson.mp4';
    updateLessonData({ videoUrl: mockVideoUrl });
  };

  const handleSave = () => {
    const lessonPayload = {
      ...lessonData,
      chapterId,
      courseId,
      updatedAt: new Date().toISOString()
    };
    
    onSave?.(lessonPayload);
  };

  const renderContentBlock = (block: LessonContent) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Nhập nội dung bài học..."
              value={(block.content as TextContent).text || ''}
              onChange={(e) => updateContentBlock(block.id, { ...(block.content as TextContent), text: e.target.value })}
              rows={4}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <Video className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Tải lên video bài giảng
              </h3>
              <p className="text-slate-600 mb-4">
                Hỗ trợ MP4, MOV, AVI (tối đa 500MB)
              </p>
              <Button onClick={handleVideoUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Chọn video
              </Button>
            </div>
            
            {lessonData.videoUrl && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Video đã tải lên</span>
                  <Badge variant="secondary">MP4</Badge>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <Image className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Tải lên hình ảnh
              </Button>
            </div>
            <Input
              placeholder="Mô tả hình ảnh (alt text)"
              value={(block.content as ImageContent).alt || ''}
              onChange={(e) => updateContentBlock(block.id, { ...(block.content as ImageContent), alt: e.target.value })}
            />
          </div>
        );
      
      case 'code':
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="// Nhập code ví dụ..."
              value={(block.content as CodeContent).code || ''}
              onChange={(e) => updateContentBlock(block.id, { ...(block.content as CodeContent), code: e.target.value })}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        );
      
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lessonId ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
          </h1>
          <p className="text-slate-600">
            Tạo nội dung bài học với editor đa phương tiện
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Chỉnh sửa' : 'Xem trước'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Lưu bài học
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Nội dung</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          <TabsTrigger value="resources">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề bài học</Label>
                  <Input
                    id="title"
                    placeholder="Ví dụ: Giới thiệu về đạo hàm"
                    value={lessonData.title}
                    onChange={(e) => updateLessonData({ title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Thời lượng</Label>
                  <Input
                    id="duration"
                    placeholder="Ví dụ: 15:30"
                    value={lessonData.duration}
                    onChange={(e) => updateLessonData({ duration: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả bài học</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn gọn về nội dung bài học..."
                  value={lessonData.description}
                  onChange={(e) => updateLessonData({ description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Blocks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nội dung bài học</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock('text')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Văn bản
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock('video')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock('image')}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Hình ảnh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addContentBlock('code')}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lessonData.content.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Chưa có nội dung nào. Thêm block đầu tiên để bắt đầu.</p>
                </div>
              ) : (
                lessonData.content.map((block: LessonContent, index: number) => (
                  <div key={block.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {block.type === 'text' && <FileText className="h-3 w-3 mr-1" />}
                          {block.type === 'video' && <Video className="h-3 w-3 mr-1" />}
                          {block.type === 'image' && <Image className="h-3 w-3 mr-1" />}
                          {block.type === 'code' && <Code className="h-3 w-3 mr-1" />}
                          {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                        </Badge>
                        <span className="text-sm text-slate-500">Block {index + 1}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveContentBlock(block.id, 'up')}
                          disabled={index === 0}
                        >
                          <Move className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContentBlock(block.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {renderContentBlock(block)}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt bài học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bài học miễn phí</Label>
                  <p className="text-sm text-slate-600">
                    Cho phép học viên xem trước mà không cần đăng ký
                  </p>
                </div>
                <Switch
                  checked={lessonData.isFree}
                  onCheckedChange={(checked) => updateLessonData({ isFree: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu đính kèm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Tải lên tài liệu
                </h3>
                <p className="text-slate-600 mb-4">
                  PDF, DOC, PPT, ZIP (tối đa 50MB mỗi file)
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm tài liệu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

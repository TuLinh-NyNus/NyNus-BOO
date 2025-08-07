'use client';

import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit, 
  Eye,
  FileText,
  Video,
  Image,
  Code,
  HelpCircle,
  Download,
  Link,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

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
  Switch
} from '@/components/ui';
import {
  ContentSection,
  InteractiveElement,
  LessonContentBuilderProps,
  SectionType,
  InteractiveType,
  ContentData,
  VideoContent,
  TextContent,
  QuizContent,
  ResourceContent,
  InteractiveContent,
  getSectionTypeName
} from '@/lib/types/lesson-content';

export function LessonContentBuilder({ 
  lessonId, 
  initialSections = [], 
  onSave 
}: LessonContentBuilderProps): JSX.Element {
  const [sections, setSections] = useState<ContentSection[]>(initialSections);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  const addSection = (type: SectionType) => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      title: `${getSectionTypeName(type)} mới`,
      type,
      content: getDefaultContent(type),
      isRequired: true,
      order: sections.length
    };

    setSections(prev => [...prev, newSection]);
  };

  const getDefaultContent = (type: SectionType): ContentData => {
    switch (type) {
      case 'video':
        return {
          url: '',
          thumbnail: '',
          subtitles: false,
          autoplay: false,
          controls: true
        } as VideoContent;
      case 'text':
        return {
          content: '',
          formatting: 'markdown',
          allowComments: true
        } as TextContent;
      case 'quiz':
        return {
          questions: [],
          timeLimit: 0,
          passingScore: 70,
          allowRetake: true
        } as QuizContent;
      case 'resource':
        return {
          files: [],
          downloadable: true,
          description: ''
        } as ResourceContent;
      case 'interactive':
        return {
          type: 'discussion',
          prompt: '',
          settings: {}
        } as InteractiveContent;
      default:
        return {};
    }
  };

  const updateSection = (sectionId: string, updates: Partial<ContentSection>) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, ...updates }
          : section
      )
    );
  };

  const removeSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const newSections = [...sections];
    if (direction === 'up' && sectionIndex > 0) {
      [newSections[sectionIndex], newSections[sectionIndex - 1]] = 
      [newSections[sectionIndex - 1], newSections[sectionIndex]];
    } else if (direction === 'down' && sectionIndex < sections.length - 1) {
      [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
      [newSections[sectionIndex + 1], newSections[sectionIndex]];
    }

    setSections(newSections);
  };

  const getSectionIcon = (type: ContentSection['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'quiz': return <HelpCircle className="h-4 w-4" />;
      case 'resource': return <Download className="h-4 w-4" />;
      case 'interactive': return <Link className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderSectionContent = (section: ContentSection) => {
    switch (section.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL Video</Label>
                <Input
                  placeholder="https://..."
                  value={(section.content as VideoContent).url || ''}
                  onChange={(e) => updateSection(section.id, {
                    content: { ...(section.content as VideoContent), url: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Thời lượng</Label>
                <Input
                  placeholder="15:30"
                  value={section.duration || ''}
                  onChange={(e) => updateSection(section.id, { duration: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={(section.content as VideoContent).subtitles || false}
                  onCheckedChange={(checked) => updateSection(section.id, {
                    content: { ...(section.content as VideoContent), subtitles: checked }
                  })}
                />
                <Label>Phụ đề</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={(section.content as VideoContent).autoplay || false}
                  onCheckedChange={(checked) => updateSection(section.id, {
                    content: { ...(section.content as VideoContent), autoplay: checked }
                  })}
                />
                <Label>Tự động phát</Label>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nội dung</Label>
              <Textarea
                placeholder="Nhập nội dung bài học..."
                value={(section.content as TextContent).content || ''}
                onChange={(e) => updateSection(section.id, {
                  content: { ...(section.content as TextContent), content: e.target.value }
                })}
                rows={6}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={(section.content as TextContent).allowComments || false}
                onCheckedChange={(checked) => updateSection(section.id, {
                  content: { ...(section.content as TextContent), allowComments: checked }
                })}
              />
              <Label>Cho phép bình luận</Label>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Thời gian (phút)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={(section.content as QuizContent).timeLimit || ''}
                  onChange={(e) => updateSection(section.id, {
                    content: { ...(section.content as QuizContent), timeLimit: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Điểm đậu (%)</Label>
                <Input
                  type="number"
                  placeholder="70"
                  value={(section.content as QuizContent).passingScore || ''}
                  onChange={(e) => updateSection(section.id, {
                    content: { ...(section.content as QuizContent), passingScore: parseInt(e.target.value) || 70 }
                  })}
                />
              </div>
              
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={(section.content as QuizContent).allowRetake || false}
                  onCheckedChange={(checked) => updateSection(section.id, {
                    content: { ...(section.content as QuizContent), allowRetake: checked }
                  })}
                />
                <Label>Cho phép làm lại</Label>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                Câu hỏi sẽ được quản lý trong phần Quiz Builder
              </p>
            </div>
          </div>
        );

      case 'resource':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mô tả tài liệu</Label>
              <Textarea
                placeholder="Mô tả về tài liệu đính kèm..."
                value={(section.content as ResourceContent).description || ''}
                onChange={(e) => updateSection(section.id, {
                  content: { ...(section.content as ResourceContent), description: e.target.value }
                })}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={(section.content as ResourceContent).downloadable || false}
                onCheckedChange={(checked) => updateSection(section.id, {
                  content: { ...(section.content as ResourceContent), downloadable: checked }
                })}
              />
              <Label>Cho phép tải xuống</Label>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <Download className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Tài liệu sẽ được quản lý trong Resource Manager</p>
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Loại tương tác</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={(section.content as InteractiveContent).type || 'discussion'}
                onChange={(e) => updateSection(section.id, {
                  content: { ...(section.content as InteractiveContent), type: e.target.value as InteractiveType }
                })}
              >
                <option value="discussion">Thảo luận</option>
                <option value="poll">Bình chọn</option>
                <option value="assignment">Bài tập</option>
                <option value="code-exercise">Luyện tập code</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Câu hỏi/Yêu cầu</Label>
              <Textarea
                placeholder="Nhập câu hỏi hoặc yêu cầu cho hoạt động tương tác..."
                value={(section.content as InteractiveContent).prompt || ''}
                onChange={(e) => updateSection(section.id, {
                  content: { ...(section.content as InteractiveContent), prompt: e.target.value }
                })}
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return <div>Loại nội dung không được hỗ trợ</div>;
    }
  };

  const handleSave = () => {
    onSave?.(sections);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Cấu trúc nội dung</h2>
          <p className="text-slate-600">Xây dựng nội dung bài học theo từng phần</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Xem trước
          </Button>
          <Button onClick={handleSave}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Lưu cấu trúc
          </Button>
        </div>
      </div>

      {/* Add Section Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thêm phần nội dung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => addSection('video')}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
            <Button
              variant="outline"
              onClick={() => addSection('text')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Văn bản
            </Button>
            <Button
              variant="outline"
              onClick={() => addSection('quiz')}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => addSection('resource')}
            >
              <Download className="h-4 w-4 mr-2" />
              Tài liệu
            </Button>
            <Button
              variant="outline"
              onClick={() => addSection('interactive')}
            >
              <Link className="h-4 w-4 mr-2" />
              Tương tác
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Chưa có nội dung nào
              </h3>
              <p className="text-slate-600">
                Thêm phần nội dung đầu tiên để bắt đầu xây dựng bài học
              </p>
            </CardContent>
          </Card>
        ) : (
          sections.map((section, index) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getSectionIcon(section.type)}
                        {getSectionTypeName(section.type)}
                      </Badge>
                    </div>
                    
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="font-medium border-none p-0 h-auto focus-visible:ring-0"
                    />
                    
                    {section.duration && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {section.duration}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={section.isRequired}
                        onCheckedChange={(checked) => updateSection(section.id, { isRequired: checked })}
                      />
                      <Label className="text-xs">Bắt buộc</Label>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === sections.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {renderSectionContent(section)}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {sections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tóm tắt cấu trúc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{sections.length}</div>
                <div className="text-sm text-slate-600">Tổng phần</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {sections.filter(s => s.type === 'video').length}
                </div>
                <div className="text-sm text-slate-600">Video</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {sections.filter(s => s.type === 'quiz').length}
                </div>
                <div className="text-sm text-slate-600">Quiz</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {sections.filter(s => s.isRequired).length}
                </div>
                <div className="text-sm text-slate-600">Bắt buộc</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

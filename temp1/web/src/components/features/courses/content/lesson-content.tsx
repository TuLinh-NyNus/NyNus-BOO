'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  BookOpen,
  MessageSquare,
  StickyNote,
  Clock,
  CheckCircle,
  Play
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Textarea } from "@/components/ui/form/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { MockLesson, MockResource } from '@/lib/mock-data/types';
import { cn } from '@/lib/utils';

interface LessonContentProps {
  lesson: MockLesson;
  onResourceDownload?: (resource: MockResource) => void;
  onNotesSave?: (notes: string) => void;
  className?: string;
}

export function LessonContent({ 
  lesson, 
  onResourceDownload,
  onNotesSave,
  className 
}: LessonContentProps): JSX.Element {
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleSaveNotes = () => {
    onNotesSave?.(notes);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
        return <FileText className="h-4 w-4" />;
      case 'slide':
        return <BookOpen className="h-4 w-4" />;
      case 'exercise':
        return <Play className="h-4 w-4" />;
      case 'link':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'doc':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'slide':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'exercise':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'link':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Lesson Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                    Bài {lesson.number}
                  </Badge>
                  {lesson.isFree && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Miễn phí
                    </Badge>
                  )}
                  {lesson.isCompleted && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Đã hoàn thành
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl text-white">{lesson.title}</CardTitle>
                <p className="text-slate-400 text-lg">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4" />
                <span>{lesson.duration}</span>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-purple-600">
              <FileText className="h-4 w-4 mr-2" />
              Tài liệu ({lesson.resources.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-purple-600">
              <StickyNote className="h-4 w-4 mr-2" />
              Ghi chú
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Mô tả bài học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  {lesson.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Thông tin bài học</h4>
                    <div className="space-y-1 text-sm text-slate-400">
                      <div className="flex justify-between">
                        <span>Thời lượng:</span>
                        <span className="text-white">{lesson.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loại:</span>
                        <span className="text-white">Video bài giảng</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trạng thái:</span>
                        <span className={lesson.isCompleted ? "text-green-400" : "text-yellow-400"}>
                          {lesson.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Tài liệu đính kèm</h4>
                    <div className="text-sm text-slate-400">
                      <div className="flex justify-between">
                        <span>Số lượng tài liệu:</span>
                        <span className="text-white">{lesson.resources.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Có thể tải về:</span>
                        <span className="text-green-400">Có</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tài liệu bài học</CardTitle>
              </CardHeader>
              <CardContent>
                {lesson.resources.length > 0 ? (
                  <div className="space-y-3">
                    {lesson.resources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg border",
                            getResourceColor(resource.type)
                          )}>
                            {getResourceIcon(resource.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{resource.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <span className="capitalize">{resource.type}</span>
                              {resource.size && (
                                <>
                                  <span>•</span>
                                  <span>{resource.size}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                          onClick={() => onResourceDownload?.(resource)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Tải về
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có tài liệu nào cho bài học này</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Ghi chú cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Viết ghi chú của bạn về bài học này..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveNotes}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!notes.trim()}
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    Lưu ghi chú
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Filter,
  BookOpen,
  Video,
  Image,
  Archive,
  ExternalLink,
  Calendar,
  FileIcon
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Input } from "@/components/ui/form/input";
import { MockResource } from '@/lib/mock-data/types';
import { cn } from '@/lib/utils';

interface Material extends MockResource {
  chapterTitle?: string;
  chapterNumber?: number;
  downloadCount?: number;
  fileSize?: string;
  lastModified?: string;
}

interface MaterialsListProps {
  materials: Material[];
  onDownload?: (material: Material) => void;
  onPreview?: (material: Material) => void;
  className?: string;
}

export function MaterialsList({ 
  materials, 
  onDownload,
  onPreview,
  className 
}: MaterialsListProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');

  // Get unique file types and chapters
  const fileTypes = Array.from(new Set(materials.map(m => m.type)));
  const chapters = Array.from(new Set(materials.map(m => m.chapterNumber).filter(Boolean)));

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || material.type === selectedType;
    const matchesChapter = selectedChapter === 'all' || material.chapterNumber?.toString() === selectedChapter;
    
    return matchesSearch && matchesType && matchesChapter;
  });

  // Group materials by chapter
  const groupedMaterials = filteredMaterials.reduce((acc, material) => {
    const chapterKey = material.chapterNumber ? `chapter-${material.chapterNumber}` : 'no-chapter';
    if (!acc[chapterKey]) {
      acc[chapterKey] = {
        title: material.chapterTitle || 'Tài liệu chung',
        number: material.chapterNumber || 0,
        materials: []
      };
    }
    acc[chapterKey].materials.push(material);
    return acc;
  }, {} as Record<string, { title: string; number: number; materials: Material[] }>);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-400" />;
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-400" />;
      case 'slide':
        return <BookOpen className="h-5 w-5 text-green-400" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-400" />;
      case 'image':
        return <Image className="h-5 w-5 text-yellow-400" />;
      case 'archive':
        return <Archive className="h-5 w-5 text-orange-400" />;
      case 'link':
        return <ExternalLink className="h-5 w-5 text-cyan-400" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'doc':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'slide':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'video':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'image':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archive':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'link':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatFileSize = (size: string | undefined) => {
    if (!size) return 'Unknown';
    return size;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
              >
                <option value="all">Tất cả loại file</option>
                {fileTypes.map(type => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Chapter Filter */}
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
              >
                <option value="all">Tất cả chương</option>
                {chapters.sort((a, b) => (a || 0) - (b || 0)).map(chapter => (
                  <option key={chapter || 0} value={(chapter || 0).toString()}>
                    Chương {chapter || 0}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-slate-400">
              Tìm thấy {filteredMaterials.length} tài liệu
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Materials by Chapter */}
      <div className="space-y-6">
        {Object.entries(groupedMaterials)
          .sort(([, a], [, b]) => a.number - b.number)
          .map(([chapterKey, chapter], chapterIndex) => (
            <motion.div
              key={chapterKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: chapterIndex * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    {chapter.number > 0 && (
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {chapter.number}
                      </div>
                    )}
                    {chapter.title}
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      {chapter.materials.length} tài liệu
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chapter.materials.map((material, materialIndex) => (
                      <motion.div
                        key={material.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: materialIndex * 0.05 }}
                        className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                      >
                        <div className="space-y-3">
                          {/* File Header */}
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-lg border flex-shrink-0",
                              getFileTypeColor(material.type)
                            )}>
                              {getFileIcon(material.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-white truncate">{material.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Badge variant="secondary" className="text-xs">
                                  {material.type.toUpperCase()}
                                </Badge>
                                {material.size && (
                                  <span>{formatFileSize(material.size)}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* File Info */}
                          <div className="space-y-1 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Tạo: {formatDate(material.createdAt)}</span>
                            </div>
                            {material.downloadCount && (
                              <div className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                <span>{material.downloadCount} lượt tải</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {material.type !== 'link' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPreview?.(material)}
                                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-600"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Xem
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDownload?.(material)}
                              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-600"
                            >
                              {material.type === 'link' ? (
                                <>
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Mở
                                </>
                              ) : (
                                <>
                                  <Download className="h-3 w-3 mr-1" />
                                  Tải
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <FileText className="h-16 w-16 mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy tài liệu</h3>
          <p className="text-slate-400">
            {searchQuery || selectedType !== 'all' || selectedChapter !== 'all'
              ? 'Thử thay đổi bộ lọc để tìm thấy tài liệu phù hợp'
              : 'Chưa có tài liệu nào được tải lên cho khóa học này'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
}

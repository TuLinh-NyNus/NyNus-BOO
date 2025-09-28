/**
 * Theory Content Manager Component
 * Advanced content management với bulk operations và versioning
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Badge } from "@/components/ui/display/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import {
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Upload,
  Download,
  Edit,
  Trash2,
  Copy,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface TheoryContent {
  id: string;
  title: string;
  subject: string;
  grade: number;
  chapter: number;
  lesson: number;
  filePath: string;
  content: string;
  metadata: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number;
    keywords: string[];
    lastModified: string;
    version: number;
    status: 'draft' | 'published' | 'archived';
    qualityScore: number;
  };
  performance: {
    views: number;
    engagement: number;
    completionRate: number;
    renderTime: number;
  };
}

export interface BulkOperation {
  type: 'upload' | 'edit' | 'delete' | 'move' | 'publish' | 'archive';
  contentIds: string[];
  data?: Record<string, unknown>;
}

export interface ContentFilter {
  search?: string;
  subjects?: string[];
  grades?: number[];
  status?: string[];
  qualityRange?: [number, number];
  dateRange?: [string, string];
}

export interface TheoryContentManagerProps {
  /** Handler khi content được update */
  onContentUpdate: (content: TheoryContent[]) => void;
  
  /** Handler cho bulk operations */
  onBulkOperation: (operation: BulkOperation) => Promise<void>;
  
  /** Enable content versioning */
  enableVersioning?: boolean;
  
  /** Enable quality scoring */
  enableQualityScoring?: boolean;
  
  /** Show analytics tab */
  showAnalytics?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const MOCK_CONTENT: TheoryContent[] = [
  {
    id: 'content-1',
    title: 'Phương trình bậc hai',
    subject: 'TOÁN',
    grade: 10,
    chapter: 1,
    lesson: 1,
    filePath: 'TOÁN/LỚP-10/CHƯƠNG-1/bài-1-phương-trình-bậc-hai.md',
    content: '# Phương trình bậc hai\n\nPhương trình bậc hai có dạng $ax^2 + bx + c = 0$...',
    metadata: {
      difficulty: 'medium',
      estimatedTime: 45,
      keywords: ['phương trình', 'bậc hai', 'delta'],
      lastModified: '2025-08-17T10:30:00Z',
      version: 3,
      status: 'published',
      qualityScore: 85
    },
    performance: {
      views: 1250,
      engagement: 78,
      completionRate: 82,
      renderTime: 120
    }
  },
  {
    id: 'content-2',
    title: 'Định lý Pythagoras',
    subject: 'TOÁN',
    grade: 8,
    chapter: 2,
    lesson: 3,
    filePath: 'TOÁN/LỚP-8/CHƯƠNG-2/bài-3-định-lý-pythagoras.md',
    content: '# Định lý Pythagoras\n\nTrong tam giác vuông: $a^2 + b^2 = c^2$...',
    metadata: {
      difficulty: 'easy',
      estimatedTime: 30,
      keywords: ['pythagoras', 'tam giác vuông', 'định lý'],
      lastModified: '2025-08-16T15:20:00Z',
      version: 2,
      status: 'published',
      qualityScore: 92
    },
    performance: {
      views: 2100,
      engagement: 85,
      completionRate: 90,
      renderTime: 95
    }
  },
  {
    id: 'content-3',
    title: 'Lực và chuyển động',
    subject: 'LÝ',
    grade: 10,
    chapter: 1,
    lesson: 2,
    filePath: 'LÝ/LỚP-10/CHƯƠNG-1/bài-2-lực-và-chuyển-động.md',
    content: '# Lực và chuyển động\n\nĐịnh luật Newton thứ hai: $F = ma$...',
    metadata: {
      difficulty: 'hard',
      estimatedTime: 60,
      keywords: ['lực', 'chuyển động', 'newton'],
      lastModified: '2025-08-15T09:45:00Z',
      version: 1,
      status: 'draft',
      qualityScore: 72
    },
    performance: {
      views: 450,
      engagement: 65,
      completionRate: 68,
      renderTime: 180
    }
  }
];

// ===== MAIN COMPONENT =====

export function TheoryContentManager({
  onContentUpdate,
  onBulkOperation,
  enableVersioning = true,
  enableQualityScoring = true,
  showAnalytics = true,
  className
}: TheoryContentManagerProps) {
  
  // ===== STATE =====
  
  const [content, setContent] = useState<TheoryContent[]>(MOCK_CONTENT);
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [filters, setFilters] = useState<ContentFilter>({});
  const [isLoading, setIsLoading] = useState(false);

  // ===== COMPUTED VALUES =====
  
  const filteredContent = useMemo(() => {
    return content.filter(item => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!item.title.toLowerCase().includes(searchLower) &&
            !item.content.toLowerCase().includes(searchLower) &&
            !item.metadata.keywords.some(k => k.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Subject filter
      if (filters.subjects?.length && !filters.subjects.includes(item.subject)) {
        return false;
      }

      // Grade filter
      if (filters.grades?.length && !filters.grades.includes(item.grade)) {
        return false;
      }

      // Status filter
      if (filters.status?.length && !filters.status.includes(item.metadata.status)) {
        return false;
      }

      // Quality range filter
      if (filters.qualityRange) {
        const [min, max] = filters.qualityRange;
        if (item.metadata.qualityScore < min || item.metadata.qualityScore > max) {
          return false;
        }
      }

      return true;
    });
  }, [content, filters]);

  const contentStats = useMemo(() => {
    return {
      total: content.length,
      published: content.filter(c => c.metadata.status === 'published').length,
      draft: content.filter(c => c.metadata.status === 'draft').length,
      archived: content.filter(c => c.metadata.status === 'archived').length,
      avgQuality: content.reduce((sum, c) => sum + c.metadata.qualityScore, 0) / content.length
    };
  }, [content]);

  // ===== HANDLERS =====

  const handleSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const handleSelectContent = useCallback((contentId: string, selected: boolean) => {
    setSelectedContent(prev => 
      selected 
        ? [...prev, contentId]
        : prev.filter(id => id !== contentId)
    );
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedContent(selected ? filteredContent.map(c => c.id) : []);
  }, [filteredContent]);

  const handleBulkOperation = useCallback(async (type: BulkOperation['type'], data?: Record<string, unknown>) => {
    if (selectedContent.length === 0) return;

    setIsLoading(true);
    try {
      await onBulkOperation({
        type,
        contentIds: selectedContent,
        data
      });

      // Update local state based on operation
      if (type === 'delete') {
        setContent(prev => prev.filter(c => !selectedContent.includes(c.id)));
      } else if (type === 'publish') {
        setContent(prev => prev.map(c => 
          selectedContent.includes(c.id) 
            ? { ...c, metadata: { ...c.metadata, status: 'published' as const } }
            : c
        ));
      }

      setSelectedContent([]);
      onContentUpdate(content);
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedContent, onBulkOperation, content, onContentUpdate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50';
      case 'draft': return 'text-yellow-600 bg-yellow-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-3 w-3" />;
      case 'draft': return <Clock className="h-3 w-3" />;
      case 'archived': return <AlertCircle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // ===== RENDER HELPERS =====

  const renderContentStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{contentStats.total}</div>
          <div className="text-sm text-muted-foreground">Tổng nội dung</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{contentStats.published}</div>
          <div className="text-sm text-muted-foreground">Đã xuất bản</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{contentStats.draft}</div>
          <div className="text-sm text-muted-foreground">Bản nháp</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-gray-600">{contentStats.archived}</div>
          <div className="text-sm text-muted-foreground">Đã lưu trữ</div>
        </CardContent>
      </Card>
      
      {enableQualityScoring && (
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{contentStats.avgQuality.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">Điểm chất lượng TB</div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSearchAndFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Tìm kiếm và lọc nội dung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo tiêu đề, nội dung, từ khóa..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Bộ lọc nâng cao
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Tải lên
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Xuất dữ liệu
          </Button>

          {showAnalytics && (
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Thống kê
            </Button>
          )}
        </div>

        {/* Active filters */}
        {(filters.search || filters.subjects?.length || filters.grades?.length) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tìm kiếm: {filters.search}
                <button onClick={() => handleSearch('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderBulkActions = () => {
    if (selectedContent.length === 0) return null;

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Đã chọn {selectedContent.length} nội dung
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('publish')}
                disabled={isLoading}
              >
                Xuất bản
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkOperation('archive')}
                disabled={isLoading}
              >
                Lưu trữ
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkOperation('delete')}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Xóa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div className={cn("theory-content-manager", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Quản lý nội dung lý thuyết
          </CardTitle>
          <CardDescription>
            Quản lý, chỉnh sửa và phân tích nội dung lý thuyết một cách toàn diện
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Nội dung</TabsTrigger>
              <TabsTrigger value="bulk">Thao tác hàng loạt</TabsTrigger>
              {showAnalytics && <TabsTrigger value="analytics">Phân tích</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="content" className="space-y-6">
              {renderContentStats()}
              {renderSearchAndFilters()}
              {renderBulkActions()}
              
              {/* Content table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedContent.length === filteredContent.length && filteredContent.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Môn học</TableHead>
                        <TableHead>Lớp</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        {enableQualityScoring && <TableHead>Chất lượng</TableHead>}
                        <TableHead>Cập nhật</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContent.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedContent.includes(item.id)}
                              onChange={(e) => handleSelectContent(item.id, e.target.checked)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-muted-foreground">
                                Chương {item.chapter} - Bài {item.lesson}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.subject}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Lớp {item.grade}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getDifficultyColor(item.metadata.difficulty || 'medium')}>
                              {item.metadata.difficulty === 'easy' ? 'Dễ' :
                               item.metadata.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("flex items-center gap-1 w-fit", getStatusColor(item.metadata.status))}>
                              {getStatusIcon(item.metadata.status)}
                              {item.metadata.status === 'published' ? 'Đã xuất bản' :
                               item.metadata.status === 'draft' ? 'Bản nháp' : 'Đã lưu trữ'}
                            </Badge>
                          </TableCell>
                          {enableQualityScoring && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium">{item.metadata.qualityScore}</div>
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 transition-all"
                                    style={{ width: `${item.metadata.qualityScore}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(item.metadata.lastModified).toLocaleDateString('vi-VN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Xem trước
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Sao chép
                                </DropdownMenuItem>
                                {enableVersioning && (
                                  <DropdownMenuItem>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Lịch sử phiên bản
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredContent.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      Không tìm thấy nội dung nào phù hợp với bộ lọc
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bulk">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Bulk operations interface sẽ được implement trong bước tiếp theo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {showAnalytics && (
              <TabsContent value="analytics">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      Analytics dashboard sẽ được implement trong component riêng
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

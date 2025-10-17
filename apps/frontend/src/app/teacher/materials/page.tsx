"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/types/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select";
import { Badge } from "@/components/ui/display/badge";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Grid3x3,
  List,
  RefreshCw,
  File,
  FileVideo,
  FileImage
} from "lucide-react";

// Mock material interface
interface Material {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'image' | 'document';
  subject: string;
  grade: number;
  category: string;
  fileSize: string;
  uploadedAt: Date;
  downloads: number;
  views: number;
}

/**
 * Teacher Materials Page
 * Trang quản lý tài liệu giảng dạy
 */
export default function TeacherMaterialsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    subject: 'all',
    grade: 'all'
  });

  // Mock materials data
  const mockMaterials: Material[] = [
    {
      id: '1',
      title: 'Bài giảng Hàm số bậc hai',
      description: 'Tài liệu chi tiết về hàm số bậc hai với ví dụ minh họa',
      type: 'pdf',
      subject: 'Toán',
      grade: 10,
      category: 'Bài giảng',
      fileSize: '2.5 MB',
      uploadedAt: new Date('2025-01-15'),
      downloads: 45,
      views: 128
    },
    {
      id: '2',
      title: 'Video hướng dẫn giải phương trình',
      description: 'Video bài giảng về phương pháp giải phương trình bậc hai',
      type: 'video',
      subject: 'Toán',
      grade: 10,
      category: 'Video',
      fileSize: '125 MB',
      uploadedAt: new Date('2025-01-14'),
      downloads: 32,
      views: 95
    },
    {
      id: '3',
      title: 'Hình ảnh minh họa đồ thị',
      description: 'Tập hợp hình ảnh minh họa các dạng đồ thị hàm số',
      type: 'image',
      subject: 'Toán',
      grade: 11,
      category: 'Hình ảnh',
      fileSize: '5.8 MB',
      uploadedAt: new Date('2025-01-13'),
      downloads: 28,
      views: 76
    }
  ];

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return mockMaterials.filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                           material.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.type === 'all' || material.type === filters.type;
      const matchesSubject = filters.subject === 'all' || material.subject === filters.subject;
      const matchesGrade = filters.grade === 'all' || material.grade.toString() === filters.grade;

      return matchesSearch && matchesType && matchesSubject && matchesGrade;
    });
  }, [mockMaterials, filters]);

  // Get material icon
  const getMaterialIcon = (type: Material['type']) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <File className="h-5 w-5" />;
      case 'video':
        return <FileVideo className="h-5 w-5" />;
      case 'image':
        return <FileImage className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type: Material['type']) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return 'bg-red-100 text-red-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'image':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Check authorization
  if (!user || (user.role !== UserRole.USER_ROLE_TEACHER && user.role !== UserRole.USER_ROLE_ADMIN)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Không có quyền truy cập
            </CardTitle>
            <CardDescription>
              Bạn cần có quyền giáo viên để truy cập trang này.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Về Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-600" />
              Quản lý Tài liệu
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Quản lý và chia sẻ tài liệu giảng dạy
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Upload className="h-4 w-4 mr-2" />
            Tải lên tài liệu
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm tài liệu..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại tài liệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Hình ảnh</SelectItem>
                  <SelectItem value="document">Tài liệu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.subject} onValueChange={(value) => setFilters({ ...filters, subject: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn</SelectItem>
                  <SelectItem value="Toán">Toán</SelectItem>
                  <SelectItem value="Lý">Lý</SelectItem>
                  <SelectItem value="Hóa">Hóa</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Select value={filters.grade} onValueChange={(value) => setFilters({ ...filters, grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="10">Lớp 10</SelectItem>
                    <SelectItem value="11">Lớp 11</SelectItem>
                    <SelectItem value="12">Lớp 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Tìm thấy <span className="font-semibold">{filteredMaterials.length}</span> tài liệu
              </p>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Grid/List */}
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">Không tìm thấy tài liệu nào</p>
              <p className="text-sm text-gray-500 mt-2">Thử thay đổi bộ lọc hoặc tải lên tài liệu mới</p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate flex items-center gap-2">
                          {getMaterialIcon(material.type)}
                          {material.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {material.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getTypeBadgeColor(material.type)}>
                        {material.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{material.subject}</Badge>
                      <Badge variant="outline">Lớp {material.grade}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Kích thước:</span>
                        <span className="font-medium">{material.fileSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lượt xem:</span>
                        <span className="font-medium">{material.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tải xuống:</span>
                        <span className="font-medium">{material.downloads}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Tải
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getMaterialIcon(material.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{material.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{material.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getTypeBadgeColor(material.type)} variant="secondary">
                            {material.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{material.subject}</Badge>
                          <Badge variant="outline">Lớp {material.grade}</Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm text-gray-600">{material.fileSize}</p>
                        <p className="text-xs text-gray-500">{material.views} lượt xem</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


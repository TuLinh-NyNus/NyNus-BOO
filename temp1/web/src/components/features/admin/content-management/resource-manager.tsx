'use client';

import {
  Upload,
  Download,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Trash2,
  Edit,
  Eye,
  Search,
  Filter,
  FolderPlus,
  Folder,
  MoreVertical,
  Share,
  Copy,
  Star,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Info
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress
} from '@/components/ui';
import logger from '@/lib/utils/logger';

interface ResourceFile {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'ppt' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  size: string;
  url: string;
  description: string;
  categoryId: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
  isPublic: boolean;
  isFavorite: boolean;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
}

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  fileCount: number;
  parentId?: string;
}

interface ResourceManagerProps {
  courseId?: string;
  lessonId?: string;
  onResourceSelect?: (resources: ResourceFile[]) => void;
  selectionMode?: boolean;
}

export function ResourceManager({
  courseId,
  lessonId,
  onResourceSelect,
  selectionMode = false
}: ResourceManagerProps): JSX.Element {
  const [resources, setResources] = useState<ResourceFile[]>([
    {
      id: 'r1',
      name: 'Slide bài giảng - Đạo hàm.pdf',
      type: 'pdf',
      size: '2.5 MB',
      url: '/resources/slides/dao-ham.pdf',
      description: 'Slide bài giảng về đạo hàm và ứng dụng',
      categoryId: 'cat1',
      tags: ['slide', 'dao-ham', 'toan-hoc'],
      uploadedBy: 'Thầy Minh',
      uploadedAt: '2024-01-15T10:30:00Z',
      downloadCount: 45,
      isPublic: true,
      isFavorite: true,
      status: 'ready'
    },
    {
      id: 'r2',
      name: 'Bài tập thực hành.docx',
      type: 'doc',
      size: '1.2 MB',
      url: '/resources/exercises/bai-tap.docx',
      description: 'Bài tập thực hành về đạo hàm',
      categoryId: 'cat2',
      tags: ['bai-tap', 'thuc-hanh'],
      uploadedBy: 'Thầy Minh',
      uploadedAt: '2024-01-14T14:20:00Z',
      downloadCount: 32,
      isPublic: true,
      isFavorite: false,
      status: 'ready'
    },
    {
      id: 'r3',
      name: 'Video giải bài tập.mp4',
      type: 'video',
      size: '125 MB',
      url: '/resources/videos/giai-bai-tap.mp4',
      description: 'Video hướng dẫn giải bài tập chi tiết',
      categoryId: 'cat3',
      tags: ['video', 'huong-dan', 'giai-bai-tap'],
      uploadedBy: 'Thầy Minh',
      uploadedAt: '2024-01-13T16:45:00Z',
      downloadCount: 28,
      isPublic: false,
      isFavorite: true,
      status: 'ready'
    },
    {
      id: 'r4',
      name: 'Uploading file.pdf',
      type: 'pdf',
      size: '3.8 MB',
      url: '',
      description: 'Đang tải lên...',
      categoryId: 'cat1',
      tags: [],
      uploadedBy: 'Thầy Minh',
      uploadedAt: '2024-01-16T09:15:00Z',
      downloadCount: 0,
      isPublic: false,
      isFavorite: false,
      status: 'uploading',
      progress: 65
    }
  ]);

  const [categories, setCategories] = useState<ResourceCategory[]>([
    {
      id: 'cat1',
      name: 'Slide bài giảng',
      description: 'Slide PowerPoint và PDF cho bài giảng',
      color: 'blue',
      fileCount: 15
    },
    {
      id: 'cat2',
      name: 'Bài tập',
      description: 'Bài tập và đề kiểm tra',
      color: 'green',
      fileCount: 8
    },
    {
      id: 'cat3',
      name: 'Video hướng dẫn',
      description: 'Video giải thích và hướng dẫn',
      color: 'purple',
      fileCount: 12
    },
    {
      id: 'cat4',
      name: 'Tài liệu tham khảo',
      description: 'Sách, bài báo và tài liệu tham khảo',
      color: 'orange',
      fileCount: 6
    }
  ]);

  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [activeTab, setActiveTab] = useState('files');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileTypes = [
    { value: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-600' },
    { value: 'doc', label: 'Word', icon: FileText, color: 'text-blue-600' },
    { value: 'ppt', label: 'PowerPoint', icon: FileText, color: 'text-orange-600' },
    { value: 'image', label: 'Hình ảnh', icon: Image, color: 'text-green-600' },
    { value: 'video', label: 'Video', icon: Video, color: 'text-purple-600' },
    { value: 'audio', label: 'Audio', icon: Music, color: 'text-pink-600' },
    { value: 'archive', label: 'Archive', icon: Archive, color: 'text-yellow-600' }
  ];

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || resource.categoryId === selectedCategory;
    const matchesType = !selectedType || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleResourceSelect = (resourceId: string) => {
    if (!selectionMode) return;

    setSelectedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const newResource: ResourceFile = {
        id: `r-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: getFileType(file.name),
        size: formatFileSize(file.size),
        url: '',
        description: '',
        categoryId: selectedCategory || 'cat1',
        tags: [],
        uploadedBy: 'Current User',
        uploadedAt: new Date().toISOString(),
        downloadCount: 0,
        isPublic: false,
        isFavorite: false,
        status: 'uploading',
        progress: 0
      };

      setResources(prev => [newResource, ...prev]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Update resource status
          setResources(current =>
            current.map(r =>
              r.id === newResource.id
                ? {
                    ...r,
                    status: 'ready' as const,
                    url: `/resources/uploads/${file.name}`,
                    progress: undefined
                  }
                : r
            )
          );
        } else {
          setResources(current =>
            current.map(r =>
              r.id === newResource.id
                ? { ...r, progress }
                : r
            )
          );
        }
      }, 200);
    });
  };

  const getFileType = (filename: string): ResourceFile['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'doc':
      case 'docx': return 'doc';
      case 'ppt':
      case 'pptx': return 'ppt';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'image';
      case 'mp4':
      case 'avi':
      case 'mov': return 'video';
      case 'mp3':
      case 'wav': return 'audio';
      case 'zip':
      case 'rar': return 'archive';
      default: return 'other';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: ResourceFile['type']) => {
    const fileType = fileTypes.find(ft => ft.value === type);
    if (!fileType) return FileText;
    return fileType.icon;
  };

  const getFileColor = (type: ResourceFile['type']) => {
    const fileType = fileTypes.find(ft => ft.value === type);
    return fileType?.color || 'text-slate-600';
  };

  const handleBulkAction = (action: 'delete' | 'download' | 'move') => {
    const selectedFiles = resources.filter(r => selectedResources.includes(r.id));

    switch (action) {
      case 'delete':
        if (confirm(`Bạn có chắc muốn xóa ${selectedResources.length} tài liệu?`)) {
          setResources(prev => prev.filter(r => !selectedResources.includes(r.id)));
          setSelectedResources([]);
        }
        break;
      case 'download':
        logger.info('Downloading files:', selectedFiles);
        break;
      case 'move':
        logger.info('Moving files:', selectedFiles);
        break;
    }
  };

  const renderFileCard = (resource: ResourceFile) => {
    const FileIcon = getFileIcon(resource.type);

    return (
      <Card
        key={resource.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedResources.includes(resource.id) ? 'ring-2 ring-purple-500' : ''
        }`}
        onClick={() => handleResourceSelect(resource.id)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-100 ${getFileColor(resource.type)}`}>
                  <FileIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate" title={resource.name}>
                    {resource.name}
                  </h3>
                  <p className="text-sm text-slate-600">{resource.size}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {resource.isFavorite && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {selectionMode && (
                  <input
                    type="checkbox"
                    checked={selectedResources.includes(resource.id)}
                    onChange={() => handleResourceSelect(resource.id)}
                    className="rounded"
                  />
                )}
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {resource.status === 'uploading' && (
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Đang tải lên...</span>
                    <span>{resource.progress}%</span>
                  </div>
                  <Progress value={resource.progress} className="h-1" />
                </div>
              )}

              {resource.status === 'ready' && (
                <Badge variant={resource.isPublic ? 'default' : 'secondary'}>
                  {resource.isPublic ? 'Công khai' : 'Riêng tư'}
                </Badge>
              )}

              {resource.status === 'error' && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Lỗi
                </Badge>
              )}
            </div>

            {/* Description */}
            {resource.description && (
              <p className="text-sm text-slate-600 line-clamp-2">
                {resource.description}
              </p>
            )}

            {/* Tags */}
            {resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {resource.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{resource.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {resource.uploadedBy}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {resource.downloadCount}
                </span>
              </div>
              <span>{new Date(resource.uploadedAt).toLocaleDateString('vi-VN')}</span>
            </div>

            {/* Actions */}
            {resource.status === 'ready' && (
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Tải xuống
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFilesTab = () => (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Tải lên tài liệu
            </h3>
            <p className="text-slate-600 mb-4">
              Kéo thả file vào đây hoặc click để chọn
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Chọn file
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">Tất cả loại file</option>
          {fileTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      {selectionMode && selectedResources.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <span className="text-sm font-medium text-purple-900">
            Đã chọn {selectedResources.length} tài liệu
          </span>
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('download')}>
            <Download className="h-4 w-4 mr-2" />
            Tải xuống
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('move')}>
            <Folder className="h-4 w-4 mr-2" />
            Di chuyển
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
        </div>
      )}

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(renderFileCard)}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Không tìm thấy tài liệu nào
            </h3>
            <p className="text-slate-600">
              Thử điều chỉnh bộ lọc hoặc tải lên tài liệu mới
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quản lý danh mục</CardTitle>
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              Thêm danh mục
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded bg-${category.color}-500`}></div>
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-slate-600">{category.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {category.fileCount} file
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {resources.length}
            </div>
            <div className="text-sm text-slate-600">Tổng tài liệu</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {resources.reduce((sum, r) => sum + r.downloadCount, 0)}
            </div>
            <div className="text-sm text-slate-600">Lượt tải xuống</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {categories.length}
            </div>
            <div className="text-sm text-slate-600">Danh mục</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {resources.filter(r => r.isPublic).length}
            </div>
            <div className="text-sm text-slate-600">Công khai</div>
          </CardContent>
        </Card>
      </div>

      {/* File Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bố loại file</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fileTypes.map(type => {
              const count = resources.filter(r => r.type === type.value).length;
              const percentage = resources.length > 0 ? (count / resources.length) * 100 : 0;

              return (
                <div key={type.value} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-24">
                    <type.icon className={`h-4 w-4 ${type.color}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="text-sm text-slate-600 w-16 text-right">
                    {count} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tài liệu</h1>
          <p className="text-slate-600">
            Tải lên, tổ chức và chia sẻ tài liệu học tập
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất danh sách
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Tải lên
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="files">Tài liệu</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          {renderFilesTab()}
        </TabsContent>

        <TabsContent value="categories">
          {renderCategoriesTab()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalyticsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

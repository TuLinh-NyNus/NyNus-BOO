'use client';

import { 
  Upload, 
  Video, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Download,
  Trash2,
  Edit,
  Eye,
  Clock,
  FileVideo,
  CheckCircle,
  AlertCircle,
  Settings
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress
} from '@/components/ui';

interface VideoFile {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  duration: string;
  size: string;
  format: string;
  uploadDate: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
}

interface VideoManagerProps {
  lessonId?: string;
  onVideoSelect?: (video: VideoFile) => void;
  selectedVideoId?: string;
}

export function VideoManager({ lessonId, onVideoSelect, selectedVideoId }: VideoManagerProps): JSX.Element {
  const [videos, setVideos] = useState<VideoFile[]>([
    {
      id: '1',
      name: 'Giới thiệu về đạo hàm.mp4',
      url: '/videos/lessons/dao-ham-intro.mp4',
      thumbnail: '/images/thumbnails/dao-ham-intro.jpg',
      duration: '15:30',
      size: '125 MB',
      format: 'MP4',
      uploadDate: '2024-01-15',
      status: 'ready'
    },
    {
      id: '2',
      name: 'Bài tập đạo hàm cơ bản.mp4',
      url: '/videos/lessons/dao-ham-baitap.mp4',
      thumbnail: '/images/thumbnails/dao-ham-baitap.jpg',
      duration: '22:45',
      size: '198 MB',
      format: 'MP4',
      uploadDate: '2024-01-14',
      status: 'ready'
    },
    {
      id: '3',
      name: 'Uploading video.mp4',
      url: '',
      thumbnail: '',
      duration: '',
      size: '89 MB',
      format: 'MP4',
      uploadDate: '2024-01-16',
      status: 'uploading',
      progress: 65
    }
  ]);

  const [activeTab, setActiveTab] = useState('library');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Mock upload process
    setIsUploading(true);
    setUploadProgress(0);

    const newVideo: VideoFile = {
      id: `video-${Date.now()}`,
      name: file.name,
      url: '',
      thumbnail: '',
      duration: '',
      size: `${Math.round(file.size / 1024 / 1024)} MB`,
      format: file.name.split('.').pop()?.toUpperCase() || 'MP4',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'uploading',
      progress: 0
    };

    setVideos(prev => [newVideo, ...prev]);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Update video status to processing
          setVideos(current => 
            current.map(v => 
              v.id === newVideo.id 
                ? { ...v, status: 'processing' as const }
                : v
            )
          );

          // Simulate processing
          setTimeout(() => {
            setVideos(current => 
              current.map(v => 
                v.id === newVideo.id 
                  ? { 
                      ...v, 
                      status: 'ready' as const,
                      url: '/videos/lessons/sample.mp4',
                      thumbnail: '/images/thumbnails/sample.jpg',
                      duration: '12:34'
                    }
                  : v
              )
            );
          }, 2000);

          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleVideoDelete = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const handleVideoSelect = (video: VideoFile) => {
    onVideoSelect?.(video);
  };

  const getStatusIcon = (status: VideoFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Settings className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: VideoFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Đang tải lên';
      case 'processing':
        return 'Đang xử lý';
      case 'ready':
        return 'Sẵn sàng';
      case 'error':
        return 'Lỗi';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Quản lý Video</h2>
          <p className="text-slate-600">Tải lên và quản lý video cho bài học</p>
        </div>
        
        <Button onClick={handleFileSelect} disabled={isUploading}>
          <Upload className="h-4 w-4 mr-2" />
          Tải lên video
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="library">Thư viện Video</TabsTrigger>
          <TabsTrigger value="upload">Tải lên</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Upload className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Đang tải lên video...</span>
                      <span className="text-sm text-slate-600">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card 
                key={video.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedVideoId === video.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => video.status === 'ready' && handleVideoSelect(video)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileVideo className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      
                      {/* Status Overlay */}
                      <div className="absolute top-2 left-2">
                        <Badge variant={video.status === 'ready' ? 'default' : 'secondary'}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(video.status)}
                            {getStatusText(video.status)}
                          </div>
                        </Badge>
                      </div>
                      
                      {/* Duration */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="secondary" className="bg-black/70 text-white">
                            {video.duration}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Play Button */}
                      {video.status === 'ready' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm truncate" title={video.name}>
                        {video.name}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{video.format}</span>
                        <span>{video.size}</span>
                      </div>
                      
                      <div className="text-xs text-slate-500">
                        Tải lên: {new Date(video.uploadDate).toLocaleDateString('vi-VN')}
                      </div>

                      {/* Progress Bar for uploading videos */}
                      {video.status === 'uploading' && video.progress !== undefined && (
                        <Progress value={video.progress} className="h-1" />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        {video.status === 'ready' && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoDelete(video.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {videos.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Chưa có video nào
                </h3>
                <p className="text-slate-600 mb-4">
                  Tải lên video đầu tiên để bắt đầu
                </p>
                <Button onClick={handleFileSelect}>
                  <Upload className="h-4 w-4 mr-2" />
                  Tải lên video
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tải lên video mới</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Video className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Kéo thả video vào đây
                </h3>
                <p className="text-slate-600 mb-4">
                  Hoặc click để chọn file từ máy tính
                </p>
                <Button onClick={handleFileSelect} disabled={isUploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  Chọn video
                </Button>
              </div>
              
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>Định dạng hỗ trợ:</strong> MP4, MOV, AVI, WMV</p>
                <p><strong>Kích thước tối đa:</strong> 500MB</p>
                <p><strong>Độ phân giải khuyến nghị:</strong> 1920x1080 (Full HD)</p>
                <p><strong>Tỷ lệ khung hình:</strong> 16:9</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chất lượng mặc định</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="auto">Tự động</option>
                    <option value="1080p">1080p (Full HD)</option>
                    <option value="720p">720p (HD)</option>
                    <option value="480p">480p (SD)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tự động tạo thumbnail</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="middle">Giữa video</option>
                    <option value="start">Đầu video</option>
                    <option value="custom">Tùy chỉnh</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Thư mục lưu trữ</Label>
                <Input value="/videos/lessons/" readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

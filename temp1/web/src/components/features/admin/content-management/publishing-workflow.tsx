'use client';

import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Send,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Settings,
  Play,
  Pause,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2
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

interface PublishingItem {
  id: string;
  type: 'course' | 'lesson' | 'quiz';
  title: string;
  author: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'published';
  currentStep: number;
  totalSteps: number;
  reviewers: string[];
  comments: WorkflowComment[];
  validationResults: ValidationResult[];
  scheduledPublishDate?: string;
}

interface WorkflowComment {
  id: string;
  author: string;
  content: string;
  type: 'comment' | 'approval' | 'rejection' | 'request_changes';
  createdAt: string;
  attachments?: string[];
}

interface ValidationResult {
  id: string;
  category: 'content' | 'technical' | 'accessibility' | 'seo';
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  autoFixable?: boolean;
}

interface PublishingWorkflowProps {
  itemId?: string;
  onStatusChange?: (itemId: string, status: string) => void;
}

export function PublishingWorkflow({ itemId, onStatusChange }: PublishingWorkflowProps): JSX.Element {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // Mock data
  const publishingItems: PublishingItem[] = [
    {
      id: 'p1',
      type: 'course',
      title: 'Toán học lớp 12 - Ôn thi THPT Quốc gia',
      author: 'Thầy Minh',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'in_review',
      currentStep: 2,
      totalSteps: 4,
      reviewers: ['Admin 1', 'Admin 2'],
      comments: [
        {
          id: 'c1',
          author: 'Admin 1',
          content: 'Nội dung khóa học rất tốt, tuy nhiên cần bổ sung thêm bài tập thực hành.',
          type: 'request_changes',
          createdAt: '2024-01-15T14:20:00Z'
        }
      ],
      validationResults: [
        {
          id: 'v1',
          category: 'content',
          type: 'warning',
          message: 'Thiếu mô tả cho 3 bài học',
          details: 'Bài học 5, 8, 12 chưa có mô tả chi tiết'
        },
        {
          id: 'v2',
          category: 'accessibility',
          type: 'error',
          message: 'Video chưa có phụ đề',
          details: '5 video trong khóa học chưa có phụ đề tiếng Việt',
          autoFixable: false
        }
      ]
    },
    {
      id: 'p2',
      type: 'lesson',
      title: 'Bài 15: Ứng dụng đạo hàm trong khảo sát hàm số',
      author: 'Thầy Minh',
      submittedAt: '2024-01-14T09:15:00Z',
      status: 'approved',
      currentStep: 4,
      totalSteps: 4,
      reviewers: ['Admin 1'],
      comments: [
        {
          id: 'c2',
          author: 'Admin 1',
          content: 'Bài học đã đạt yêu cầu, có thể xuất bản.',
          type: 'approval',
          createdAt: '2024-01-14T16:30:00Z'
        }
      ],
      validationResults: [],
      scheduledPublishDate: '2024-01-20T08:00:00Z'
    },
    {
      id: 'p3',
      type: 'quiz',
      title: 'Kiểm tra cuối chương: Đạo hàm',
      author: 'Thầy Minh',
      submittedAt: '2024-01-16T11:45:00Z',
      status: 'submitted',
      currentStep: 1,
      totalSteps: 4,
      reviewers: [],
      comments: [],
      validationResults: [
        {
          id: 'v3',
          category: 'content',
          type: 'error',
          message: 'Câu hỏi số 5 thiếu đáp án đúng',
          autoFixable: false
        }
      ]
    }
  ];

  const workflowSteps = [
    { id: 1, name: 'Nộp bài', description: 'Tác giả nộp nội dung để xem xét' },
    { id: 2, name: 'Kiểm tra tự động', description: 'Hệ thống kiểm tra lỗi cơ bản' },
    { id: 3, name: 'Xem xét nội dung', description: 'Admin xem xét và phê duyệt' },
    { id: 4, name: 'Xuất bản', description: 'Nội dung được xuất bản công khai' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Bản nháp';
      case 'submitted': return 'Đã nộp';
      case 'in_review': return 'Đang xem xét';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      case 'published': return 'Đã xuất bản';
      default: return status;
    }
  };

  const getValidationIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    onStatusChange?.(itemId, newStatus);
  };

  const handleAddComment = (itemId: string, type: 'comment' | 'approval' | 'rejection') => {
    if (!newComment.trim()) return;
    
    // Mock adding comment
    logger.info('Adding comment:', { itemId, type, content: newComment });
    setNewComment('');
  };

  const renderWorkflowProgress = (item: PublishingItem) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Tiến trình phê duyệt</h3>
        <Badge className={getStatusColor(item.status)}>
          {getStatusLabel(item.status)}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index < item.currentStep 
                ? 'bg-green-500 text-white' 
                : index === item.currentStep 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index < item.currentStep ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                step.id
              )}
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-slate-900">{step.name}</div>
              <div className="text-sm text-slate-600">{step.description}</div>
            </div>
            
            {index === item.currentStep && (
              <Clock className="h-4 w-4 text-blue-500" />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <Progress value={(item.currentStep / item.totalSteps) * 100} className="h-2" />
      </div>
    </div>
  );

  const renderValidationResults = (results: ValidationResult[]) => (
    <div className="space-y-3">
      <h3 className="font-semibold">Kết quả kiểm tra</h3>
      
      {results.length === 0 ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Không có lỗi nào được phát hiện</span>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map(result => (
            <div key={result.id} className="flex items-start gap-3 p-3 border rounded-lg">
              {getValidationIcon(result.type)}
              <div className="flex-1">
                <div className="font-medium text-slate-900">{result.message}</div>
                {result.details && (
                  <div className="text-sm text-slate-600 mt-1">{result.details}</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {result.category}
                  </Badge>
                  {result.autoFixable && (
                    <Button size="sm" variant="outline">
                      Tự động sửa
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderComments = (item: PublishingItem) => (
    <div className="space-y-4">
      <h3 className="font-semibold">Nhận xét và phản hồi</h3>
      
      <div className="space-y-3">
        {item.comments.map(comment => (
          <div key={comment.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{comment.author}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
              
              <Badge variant={
                comment.type === 'approval' ? 'default' :
                comment.type === 'rejection' ? 'destructive' :
                comment.type === 'request_changes' ? 'secondary' : 'outline'
              }>
                {comment.type === 'approval' ? 'Phê duyệt' :
                 comment.type === 'rejection' ? 'Từ chối' :
                 comment.type === 'request_changes' ? 'Yêu cầu sửa' : 'Nhận xét'}
              </Badge>
            </div>
            
            <p className="text-slate-700">{comment.content}</p>
          </div>
        ))}
      </div>
      
      {/* Add Comment */}
      <div className="border-t pt-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Thêm nhận xét..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              onClick={() => handleAddComment(item.id, 'comment')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Nhận xét
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAddComment(item.id, 'approval')}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Phê duyệt
            </Button>
            
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleAddComment(item.id, 'rejection')}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Từ chối
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderItemCard = (item: PublishingItem) => (
    <Card 
      key={item.id}
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedItem === item.id ? 'ring-2 ring-purple-500' : ''
      }`}
      onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">
                Tác giả: {item.author} • {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {item.type === 'course' ? 'Khóa học' :
                 item.type === 'lesson' ? 'Bài học' : 'Quiz'}
              </Badge>
              <Badge className={getStatusColor(item.status)}>
                {getStatusLabel(item.status)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Bước {item.currentStep}/{item.totalSteps}
            </div>
            <Progress value={(item.currentStep / item.totalSteps) * 100} className="w-24 h-2" />
          </div>
          
          {item.validationResults.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-700">
                {item.validationResults.length} vấn đề cần xem xét
              </span>
            </div>
          )}
          
          {item.scheduledPublishDate && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Calendar className="h-4 w-4" />
              <span>
                Xuất bản: {new Date(item.scheduledPublishDate).toLocaleString('vi-VN')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const filterItemsByStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return publishingItems.filter(item => ['submitted', 'in_review'].includes(item.status));
      case 'approved':
        return publishingItems.filter(item => item.status === 'approved');
      case 'published':
        return publishingItems.filter(item => item.status === 'published');
      case 'rejected':
        return publishingItems.filter(item => item.status === 'rejected');
      default:
        return publishingItems;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quy trình xuất bản</h1>
          <p className="text-slate-600">
            Quản lý quy trình phê duyệt và xuất bản nội dung
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Cài đặt workflow
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Báo cáo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
              <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
              <TabsTrigger value="published">Đã xuất bản</TabsTrigger>
              <TabsTrigger value="rejected">Từ chối</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {filterItemsByStatus(activeTab).map(renderItemCard)}
              
              {filterItemsByStatus(activeTab).length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Không có mục nào
                    </h3>
                    <p className="text-slate-600">
                      Chưa có nội dung nào trong trạng thái này
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Detail Panel */}
        <div className="space-y-6">
          {selectedItem ? (
            (() => {
              const item = publishingItems.find(i => i.id === selectedItem);
              if (!item) return null;
              
              return (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderWorkflowProgress(item)}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      {renderValidationResults(item.validationResults)}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      {renderComments(item)}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Thao tác</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem trước
                      </Button>
                      
                      <Button variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                      
                      {item.status === 'approved' && (
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Play className="h-4 w-4 mr-2" />
                          Xuất bản ngay
                        </Button>
                      )}
                      
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </Button>
                    </CardContent>
                  </Card>
                </>
              );
            })()
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Chọn một mục
                </h3>
                <p className="text-slate-600">
                  Chọn một mục từ danh sách để xem chi tiết
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

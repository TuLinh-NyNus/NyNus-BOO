'use client';

import {
  MessageCircle,
  Flag,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Pin,
  Lock,
  Unlock,
  Search,
  Filter,
  MoreVertical,
  User,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Activity
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
  TabsTrigger
} from '@/components/ui';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: 'student' | 'instructor' | 'admin';
  };
  courseId: string;
  lessonId?: string;
  category: 'general' | 'question' | 'announcement' | 'feedback';
  status: 'active' | 'closed' | 'pinned' | 'archived';
  visibility: 'public' | 'private' | 'instructor_only';
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  viewCount: number;
  likeCount: number;
  isReported: boolean;
  reportCount: number;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
}

interface DiscussionReply {
  id: string;
  discussionId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: 'student' | 'instructor' | 'admin';
  };
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isReported: boolean;
  parentReplyId?: string;
  status: 'active' | 'hidden' | 'deleted';
}

interface ModerationAction {
  id: string;
  type: 'hide' | 'delete' | 'warn' | 'ban' | 'approve';
  targetType: 'discussion' | 'reply' | 'user';
  targetId: string;
  moderatorId: string;
  moderatorName: string;
  reason: string;
  createdAt: string;
  details?: unknown;
}

interface DiscussionManagerProps {
  courseId?: string;
  lessonId?: string;
}

export function DiscussionManager({ courseId, lessonId }: DiscussionManagerProps): JSX.Element {
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: 'd1',
      title: 'Câu hỏi về bài tập đạo hàm số 15',
      content: 'Em không hiểu cách giải bài tập số 15 trong phần đạo hàm. Thầy có thể giải thích chi tiết được không ạ?',
      author: {
        id: 'u1',
        name: 'Nguyễn Văn An',
        avatar: '/avatars/student1.jpg',
        role: 'student'
      },
      courseId: 'c1',
      lessonId: 'l1',
      category: 'question',
      status: 'active',
      visibility: 'public',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      replyCount: 8,
      viewCount: 45,
      likeCount: 12,
      isReported: false,
      reportCount: 0,
      tags: ['dao-ham', 'bai-tap', 'toan-hoc'],
      isPinned: false,
      isLocked: false
    },
    {
      id: 'd2',
      title: 'Thông báo: Lịch kiểm tra giữa kỳ',
      content: 'Lịch kiểm tra giữa kỳ môn Toán học sẽ được tổ chức vào ngày 25/01/2024. Các em chuẩn bị kỹ nội dung từ chương 1 đến chương 3.',
      author: {
        id: 'u2',
        name: 'Thầy Minh',
        avatar: '/avatars/teacher1.jpg',
        role: 'instructor'
      },
      courseId: 'c1',
      category: 'announcement',
      status: 'pinned',
      visibility: 'public',
      createdAt: '2024-01-14T09:00:00Z',
      updatedAt: '2024-01-14T09:00:00Z',
      replyCount: 3,
      viewCount: 120,
      likeCount: 25,
      isReported: false,
      reportCount: 0,
      tags: ['thong-bao', 'kiem-tra'],
      isPinned: true,
      isLocked: false
    },
    {
      id: 'd3',
      title: 'Spam content - cần xem xét',
      content: 'Đây là nội dung spam không liên quan đến bài học...',
      author: {
        id: 'u3',
        name: 'User Spam',
        avatar: '/avatars/default.jpg',
        role: 'student'
      },
      courseId: 'c1',
      category: 'general',
      status: 'active',
      visibility: 'public',
      createdAt: '2024-01-16T08:15:00Z',
      updatedAt: '2024-01-16T08:15:00Z',
      replyCount: 0,
      viewCount: 5,
      likeCount: 0,
      isReported: true,
      reportCount: 3,
      tags: [],
      isPinned: false,
      isLocked: false
    }
  ]);

  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([
    {
      id: 'ma1',
      type: 'hide',
      targetType: 'discussion',
      targetId: 'd3',
      moderatorId: 'admin1',
      moderatorName: 'Admin System',
      reason: 'Nội dung spam, không phù hợp',
      createdAt: '2024-01-16T09:00:00Z'
    }
  ]);

  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showReported, setShowReported] = useState(false);

  const categories = [
    { value: 'general', label: 'Thảo luận chung', color: 'bg-blue-100 text-blue-800' },
    { value: 'question', label: 'Câu hỏi', color: 'bg-green-100 text-green-800' },
    { value: 'announcement', label: 'Thông báo', color: 'bg-purple-100 text-purple-800' },
    { value: 'feedback', label: 'Phản hồi', color: 'bg-orange-100 text-orange-800' }
  ];

  const statuses = [
    { value: 'active', label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
    { value: 'closed', label: 'Đã đóng', color: 'bg-gray-100 text-gray-800' },
    { value: 'pinned', label: 'Đã ghim', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'archived', label: 'Lưu trữ', color: 'bg-slate-100 text-slate-800' }
  ];

  // Filter discussions
  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || discussion.category === selectedCategory;
    const matchesStatus = !selectedStatus || discussion.status === selectedStatus;
    const matchesReported = !showReported || discussion.isReported;

    return matchesSearch && matchesCategory && matchesStatus && matchesReported;
  });

  const handleModerationAction = (
    discussionId: string,
    action: ModerationAction['type'],
    reason: string
  ) => {
    const newAction: ModerationAction = {
      id: `ma-${Date.now()}`,
      type: action,
      targetType: 'discussion',
      targetId: discussionId,
      moderatorId: 'current-admin',
      moderatorName: 'Current Admin',
      reason,
      createdAt: new Date().toISOString()
    };

    setModerationActions(prev => [newAction, ...prev]);

    // Update discussion status based on action
    setDiscussions(prev => prev.map(d => {
      if (d.id === discussionId) {
        switch (action) {
          case 'hide':
            return { ...d, status: 'archived' as const };
          case 'delete':
            return { ...d, status: 'archived' as const };
          case 'approve':
            return { ...d, isReported: false, reportCount: 0 };
          default:
            return d;
        }
      }
      return d;
    }));
  };

  const togglePin = (discussionId: string) => {
    setDiscussions(prev => prev.map(d =>
      d.id === discussionId
        ? {
            ...d,
            isPinned: !d.isPinned,
            status: !d.isPinned ? 'pinned' : 'active'
          }
        : d
    ));
  };

  const toggleLock = (discussionId: string) => {
    setDiscussions(prev => prev.map(d =>
      d.id === discussionId
        ? { ...d, isLocked: !d.isLocked }
        : d
    ));
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const renderDiscussionCard = (discussion: Discussion) => (
    <Card key={discussion.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCategoryInfo(discussion.category).color}>
                  {getCategoryInfo(discussion.category).label}
                </Badge>
                <Badge className={getStatusInfo(discussion.status).color}>
                  {getStatusInfo(discussion.status).label}
                </Badge>
                {discussion.isPinned && (
                  <Badge variant="outline" className="text-yellow-600">
                    <Pin className="h-3 w-3 mr-1" />
                    Ghim
                  </Badge>
                )}
                {discussion.isLocked && (
                  <Badge variant="outline" className="text-red-600">
                    <Lock className="h-3 w-3 mr-1" />
                    Khóa
                  </Badge>
                )}
                {discussion.isReported && (
                  <Badge variant="destructive">
                    <Flag className="h-3 w-3 mr-1" />
                    Báo cáo ({discussion.reportCount})
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {discussion.title}
              </h3>

              <p className="text-slate-600 line-clamp-2 mb-3">
                {discussion.content}
              </p>

              {/* Tags */}
              {discussion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {discussion.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Author and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {discussion.author.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {discussion.author.role === 'instructor' ? 'Giảng viên' :
                     discussion.author.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {discussion.replyCount}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {discussion.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {discussion.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(discussion.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Moderation Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => togglePin(discussion.id)}
            >
              <Pin className="h-4 w-4 mr-2" />
              {discussion.isPinned ? 'Bỏ ghim' : 'Ghim'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleLock(discussion.id)}
            >
              {discussion.isLocked ? (
                <Unlock className="h-4 w-4 mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {discussion.isLocked ? 'Mở khóa' : 'Khóa'}
            </Button>

            {discussion.isReported && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerationAction(discussion.id, 'approve', 'Nội dung phù hợp')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Duyệt
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerationAction(discussion.id, 'hide', 'Ẩn do vi phạm')}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ẩn
                </Button>
              </>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleModerationAction(discussion.id, 'delete', 'Xóa do vi phạm nghiêm trọng')}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDiscussionsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm thảo luận..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Danh mục</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Tất cả trạng thái</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Bộ lọc</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-reported"
                  checked={showReported}
                  onChange={(e) => setShowReported(e.target.checked)}
                />
                <label htmlFor="show-reported" className="text-sm">
                  Chỉ hiện bài bị báo cáo
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {discussions.length}
            </div>
            <div className="text-sm text-slate-600">Tổng thảo luận</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {discussions.filter(d => d.status === 'active').length}
            </div>
            <div className="text-sm text-slate-600">Đang hoạt động</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {discussions.filter(d => d.isReported).length}
            </div>
            <div className="text-sm text-slate-600">Bị báo cáo</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {discussions.reduce((sum, d) => sum + d.replyCount, 0)}
            </div>
            <div className="text-sm text-slate-600">Tổng phản hồi</div>
          </CardContent>
        </Card>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map(renderDiscussionCard)}
      </div>

      {filteredDiscussions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Không tìm thấy thảo luận nào
            </h3>
            <p className="text-slate-600">
              Thử điều chỉnh bộ lọc hoặc tạo thảo luận mới
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderModerationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử kiểm duyệt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moderationActions.map(action => (
              <div key={action.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      action.type === 'approve' ? 'default' :
                      action.type === 'hide' ? 'secondary' :
                      action.type === 'delete' ? 'destructive' : 'outline'
                    }>
                      {action.type === 'approve' ? 'Duyệt' :
                       action.type === 'hide' ? 'Ẩn' :
                       action.type === 'delete' ? 'Xóa' :
                       action.type === 'warn' ? 'Cảnh báo' : 'Cấm'}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      {action.targetType === 'discussion' ? 'Thảo luận' : 'Phản hồi'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-900 mb-1">
                    <strong>{action.moderatorName}</strong> đã {action.type === 'approve' ? 'duyệt' : action.type === 'hide' ? 'ẩn' : 'xóa'} một {action.targetType === 'discussion' ? 'thảo luận' : 'phản hồi'}
                  </p>

                  <p className="text-sm text-slate-600 mb-2">
                    Lý do: {action.reason}
                  </p>

                  <p className="text-xs text-slate-500">
                    {new Date(action.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt thảo luận</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Cho phép thảo luận</Label>
                <p className="text-sm text-slate-600">Học viên có thể tạo thảo luận mới</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Kiểm duyệt trước khi đăng</Label>
                <p className="text-sm text-slate-600">Thảo luận cần được duyệt trước khi hiển thị</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Cho phép báo cáo</Label>
                <p className="text-sm text-slate-600">Học viên có thể báo cáo nội dung không phù hợp</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Tự động ẩn nội dung bị báo cáo nhiều</Label>
                <p className="text-sm text-slate-600">Ẩn tự động khi có từ 3 báo cáo trở lên</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Từ khóa cấm</h3>
            <Textarea
              placeholder="Nhập các từ khóa cấm, mỗi từ một dòng..."
              rows={4}
            />
            <p className="text-sm text-slate-600">
              Thảo luận chứa các từ khóa này sẽ bị ẩn tự động
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông báo</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Thông báo khi có thảo luận mới</Label>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Thông báo khi có báo cáo</Label>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Thông báo hàng ngày</Label>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
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
          <h1 className="text-2xl font-bold text-slate-900">Quản lý thảo luận</h1>
          <p className="text-slate-600">
            Kiểm duyệt và quản lý các thảo luận trong khóa học
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc nâng cao
          </Button>
          <Button>
            <MessageCircle className="h-4 w-4 mr-2" />
            Tạo thảo luận
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="discussions">Thảo luận</TabsTrigger>
          <TabsTrigger value="moderation">Kiểm duyệt</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions">
          {renderDiscussionsTab()}
        </TabsContent>

        <TabsContent value="moderation">
          {renderModerationTab()}
        </TabsContent>

        <TabsContent value="settings">
          {renderSettingsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

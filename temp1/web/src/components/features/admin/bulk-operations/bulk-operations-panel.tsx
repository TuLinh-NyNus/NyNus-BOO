'use client';

import {
  CheckSquare,
  Square,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Download,
  Copy,
  Move,
  Tag,
  Calendar,
  User,
  Settings,
  Play,
  Pause,
  Archive,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Filter,
  Search
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

interface BulkItem {
  id: string;
  type: 'course' | 'lesson' | 'quiz' | 'resource' | 'user';
  title: string;
  status: 'draft' | 'published' | 'archived' | 'active' | 'inactive';
  category?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: unknown;
}

interface BulkOperation {
  id: string;
  type: 'edit' | 'delete' | 'publish' | 'unpublish' | 'archive' | 'move' | 'copy' | 'tag';
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requiresConfirmation: boolean;
  fields?: BulkOperationField[];
}

interface BulkOperationField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'checkbox' | 'tags';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface BulkOperationsPanelProps {
  items: BulkItem[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onOperationComplete?: (operation: string, items: string[]) => void;
}

export function BulkOperationsPanel({
  items,
  selectedItems,
  onSelectionChange,
  onOperationComplete
}: BulkOperationsPanelProps): JSX.Element {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationData, setOperationData] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const bulkOperations: BulkOperation[] = [
    {
      id: 'edit',
      type: 'edit',
      name: 'Chỉnh sửa hàng loạt',
      description: 'Cập nhật thông tin cho nhiều mục cùng lúc',
      icon: <Edit className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800',
      requiresConfirmation: false,
      fields: [
        {
          name: 'category',
          label: 'Danh mục',
          type: 'select',
          options: [
            { value: 'math', label: 'Toán học' },
            { value: 'physics', label: 'Vật lý' },
            { value: 'chemistry', label: 'Hóa học' }
          ]
        },
        {
          name: 'tags',
          label: 'Thẻ',
          type: 'tags',
          placeholder: 'Nhập thẻ, phân cách bằng dấu phẩy'
        },
        {
          name: 'description',
          label: 'Mô tả',
          type: 'textarea',
          placeholder: 'Cập nhật mô tả...'
        }
      ]
    },
    {
      id: 'publish',
      type: 'publish',
      name: 'Xuất bản',
      description: 'Xuất bản các mục đã chọn',
      icon: <Eye className="h-4 w-4" />,
      color: 'bg-green-100 text-green-800',
      requiresConfirmation: true,
      fields: [
        {
          name: 'publishDate',
          label: 'Ngày xuất bản',
          type: 'date'
        },
        {
          name: 'notifyUsers',
          label: 'Thông báo cho người dùng',
          type: 'checkbox'
        }
      ]
    },
    {
      id: 'unpublish',
      type: 'unpublish',
      name: 'Hủy xuất bản',
      description: 'Ẩn các mục khỏi người dùng',
      icon: <EyeOff className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-800',
      requiresConfirmation: true
    },
    {
      id: 'archive',
      type: 'archive',
      name: 'Lưu trữ',
      description: 'Chuyển các mục vào kho lưu trữ',
      icon: <Archive className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-800',
      requiresConfirmation: true,
      fields: [
        {
          name: 'reason',
          label: 'Lý do lưu trữ',
          type: 'textarea',
          required: true,
          placeholder: 'Nhập lý do lưu trữ...'
        }
      ]
    },
    {
      id: 'delete',
      type: 'delete',
      name: 'Xóa',
      description: 'Xóa vĩnh viễn các mục đã chọn',
      icon: <Trash2 className="h-4 w-4" />,
      color: 'bg-red-100 text-red-800',
      requiresConfirmation: true,
      fields: [
        {
          name: 'confirmation',
          label: 'Xác nhận xóa',
          type: 'text',
          required: true,
          placeholder: 'Nhập "XÓA" để xác nhận'
        }
      ]
    },
    {
      id: 'copy',
      type: 'copy',
      name: 'Sao chép',
      description: 'Tạo bản sao của các mục đã chọn',
      icon: <Copy className="h-4 w-4" />,
      color: 'bg-indigo-100 text-indigo-800',
      requiresConfirmation: false,
      fields: [
        {
          name: 'prefix',
          label: 'Tiền tố tên',
          type: 'text',
          placeholder: 'Bản sao - '
        },
        {
          name: 'copyContent',
          label: 'Sao chép nội dung',
          type: 'checkbox'
        }
      ]
    },
    {
      id: 'move',
      type: 'move',
      name: 'Di chuyển',
      description: 'Di chuyển các mục sang danh mục khác',
      icon: <Move className="h-4 w-4" />,
      color: 'bg-orange-100 text-orange-800',
      requiresConfirmation: false,
      fields: [
        {
          name: 'targetCategory',
          label: 'Danh mục đích',
          type: 'select',
          required: true,
          options: [
            { value: 'math', label: 'Toán học' },
            { value: 'physics', label: 'Vật lý' },
            { value: 'chemistry', label: 'Hóa học' }
          ]
        }
      ]
    }
  ];

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || item.type === filterType;
    const matchesStatus = !filterStatus || item.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedFilteredItems = filteredItems.filter(item => selectedItems.includes(item.id));

  const handleSelectAll = () => {
    const allFilteredIds = filteredItems.map(item => item.id);
    const isAllSelected = allFilteredIds.every(id => selectedItems.includes(id));

    if (isAllSelected) {
      onSelectionChange(selectedItems.filter(id => !allFilteredIds.includes(id)));
    } else {
      onSelectionChange([...new Set([...selectedItems, ...allFilteredIds])]);
    }
  };

  const handleItemSelect = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  const executeOperation = async (operation: BulkOperation) => {
    if (operation.requiresConfirmation) {
      const confirmMessage = `Bạn có chắc muốn ${operation.name.toLowerCase()} ${selectedItems.length} mục?`;
      if (!confirm(confirmMessage)) return;
    }

    // Validate required fields
    if (operation.fields) {
      for (const field of operation.fields) {
        if (field.required && !operationData[field.name]) {
          alert(`Vui lòng nhập ${field.label}`);
          return;
        }
      }
    }

    // Special validation for delete operation
    if (operation.type === 'delete' && operationData.confirmation !== 'XÓA') {
      alert('Vui lòng nhập "XÓA" để xác nhận');
      return;
    }

    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      // Simulate operation execution
      for (let i = 0; i <= selectedItems.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setExecutionProgress((i / selectedItems.length) * 100);
      }

      onOperationComplete?.(operation.type, selectedItems);
      setActiveOperation(null);
      setOperationData({});
      onSelectionChange([]);

    } catch (error) {
      alert('Có lỗi xảy ra khi thực hiện thao tác');
    } finally {
      setIsExecuting(false);
      setExecutionProgress(0);
    }
  };

  const renderOperationForm = (operation: BulkOperation) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {operation.icon}
            {operation.name}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setActiveOperation(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Sẽ áp dụng cho {selectedItems.length} mục:</strong> {operation.description}
          </p>
        </div>

        {operation.fields && (
          <div className="space-y-4">
            {operation.fields.map(field => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {field.type === 'text' && (
                  <Input
                    id={field.name}
                    placeholder={field.placeholder}
                    value={operationData[field.name] || ''}
                    onChange={(e) => setOperationData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                  />
                )}

                {field.type === 'textarea' && (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={operationData[field.name] || ''}
                    onChange={(e) => setOperationData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                    rows={3}
                  />
                )}

                {field.type === 'select' && (
                  <select
                    id={field.name}
                    value={operationData[field.name] || ''}
                    onChange={(e) => setOperationData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Chọn {field.label.toLowerCase()}</option>
                    {field.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'date' && (
                  <Input
                    id={field.name}
                    type="datetime-local"
                    value={operationData[field.name] || ''}
                    onChange={(e) => setOperationData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                  />
                )}

                {field.type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={field.name}
                      checked={operationData[field.name] || false}
                      onChange={(e) => setOperationData(prev => ({
                        ...prev,
                        [field.name]: e.target.checked
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor={field.name}>{field.label}</Label>
                  </div>
                )}

                {field.type === 'tags' && (
                  <Input
                    id={field.name}
                    placeholder={field.placeholder}
                    value={operationData[field.name] || ''}
                    onChange={(e) => setOperationData(prev => ({
                      ...prev,
                      [field.name]: e.target.value
                    }))}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {isExecuting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Đang thực hiện...</span>
              <span>{Math.round(executionProgress)}%</span>
            </div>
            <Progress value={executionProgress} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={() => executeOperation(operation)}
            disabled={isExecuting}
            className={operation.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isExecuting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Đang thực hiện...
              </>
            ) : (
              <>
                {operation.icon}
                <span className="ml-2">{operation.name}</span>
              </>
            )}
          </Button>

          <Button variant="outline" onClick={() => setActiveOperation(null)} disabled={isExecuting}>
            Hủy
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Thao tác hàng loạt</h2>
          <p className="text-slate-600">
            Chọn nhiều mục để thực hiện thao tác cùng lúc
          </p>
        </div>

        {selectedItems.length > 0 && (
          <Badge variant="secondary" className="text-base px-3 py-1">
            Đã chọn {selectedItems.length} mục
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Tất cả loại</option>
              <option value="course">Khóa học</option>
              <option value="lesson">Bài học</option>
              <option value="quiz">Quiz</option>
              <option value="resource">Tài liệu</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="published">Đã xuất bản</option>
              <option value="archived">Lưu trữ</option>
            </select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterStatus('');
            }}>
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selection Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {filteredItems.every(item => selectedItems.includes(item.id)) ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Chọn tất cả ({filteredItems.length})
              </Button>

              {selectedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectionChange([])}
                >
                  Bỏ chọn tất cả
                </Button>
              )}
            </div>

            <div className="text-sm text-slate-600">
              {selectedFilteredItems.length} / {filteredItems.length} mục được chọn
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations */}
      {selectedItems.length > 0 && !activeOperation && (
        <Card>
          <CardHeader>
            <CardTitle>Chọn thao tác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bulkOperations.map(operation => (
                <Button
                  key={operation.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => setActiveOperation(operation.id)}
                >
                  <div className="flex items-center gap-2">
                    {operation.icon}
                    <span className="font-medium">{operation.name}</span>
                  </div>
                  <p className="text-sm text-slate-600 text-left">
                    {operation.description}
                  </p>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operation Form */}
      {activeOperation && (
        <div>
          {renderOperationForm(bulkOperations.find(op => op.id === activeOperation)!)}
        </div>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${
                  selectedItems.includes(item.id) ? 'bg-purple-50 border-purple-200' : ''
                }`}
                onClick={() => handleItemSelect(item.id)}
              >
                <div className="flex items-center">
                  {selectedItems.includes(item.id) ? (
                    <CheckSquare className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900">{item.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {item.type === 'course' ? 'Khóa học' :
                       item.type === 'lesson' ? 'Bài học' :
                       item.type === 'quiz' ? 'Quiz' : 'Tài liệu'}
                    </Badge>
                    <Badge variant={
                      item.status === 'published' ? 'default' :
                      item.status === 'draft' ? 'secondary' : 'outline'
                    }>
                      {item.status === 'published' ? 'Đã xuất bản' :
                       item.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    {item.author && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.author}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600">Không tìm thấy mục nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

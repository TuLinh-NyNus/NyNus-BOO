'use client';

import { 
  Search, 
  Filter, 
  HelpCircle, 
  BookOpen, 
  Users,
  Calendar,
  MoreHorizontal,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import React, { useState, memo, useCallback, useMemo } from 'react';

// Task 2.2.2 - Component Performance: Import performance optimization utilities
import { VirtualQuestionList } from '../../performance/virtual-scrolling';
import { useRenderPerformance, useAdvancedMemo } from '../../performance/memoization-optimization';

import { Button } from '@/components/ui/form/button';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Input } from "@/components/ui/form/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/display/table';

/**
 * Question List Component
 * 
 * Component hiển thị danh sách câu hỏi với:
 * - Tìm kiếm và lọc câu hỏi
 * - Hiển thị thông tin câu hỏi
 * - Quản lý trạng thái câu hỏi
 * - Phân trang
 */

interface Question {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY' | 'FILL_BLANK';
  subject: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  author: string;
  createdAt: string;
  updatedAt: string;
  UsageCount: number;
  correctRate?: number;
}

function QuestionRow({ question }: { question: any }): JSX.Element { // TODO: Define Question type
  const getTypeColor = (type: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return 'default';
      case 'TRUE_FALSE': return 'secondary';
      case 'ESSAY': return 'outline';
      case 'FILL_BLANK': return 'destructive';
      default: return 'outline';
    }
  };

  const getDifficultyColor = (difficulty: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (difficulty) {
      case 'EASY': return 'default';
      case 'MEDIUM': return 'secondary';
      case 'HARD': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'APPROVED': return 'default';
      case 'PENDING': return 'secondary';
      case 'DRAFT': return 'outline';
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeText = (type: string): string => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return 'Trắc nghiệm';
      case 'TRUE_FALSE': return 'Đúng/Sai';
      case 'ESSAY': return 'Tự luận';
      case 'FILL_BLANK': return 'Điền khuyết';
      default: return type;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'Dễ';
      case 'MEDIUM': return 'Trung bình';
      case 'HARD': return 'Khó';
      default: return difficulty;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Đã duyệt';
      case 'PENDING': return 'Chờ duyệt';
      case 'DRAFT': return 'Bản nháp';
      case 'REJECTED': return 'Từ chối';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="max-w-md">
          <div className="font-medium line-clamp-2">{question.content}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {question.subject} • {question.topic}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getTypeColor(question.type)}>
          {getTypeText(question.type)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getDifficultyColor(question.difficulty)}>
          {getDifficultyText(question.difficulty)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getStatusIcon(question.status)}
          <Badge variant={getStatusColor(question.status)}>
            {getStatusText(question.status)}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {question.author}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(question.createdAt).toLocaleDateString('vi-VN')}
      </TableCell>
      <TableCell className="text-center">
        {question.UsageCount}
      </TableCell>
      <TableCell className="text-center">
        {question.correctRate ? `${question.correctRate.toFixed(1)}%` : '-'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function QuestionList(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Mock data - trong thực tế sẽ fetch từ API
  const mockQuestions: any[] = [ // TODO: Define Question type
    {
      id: '1',
      content: 'Tính đạo hàm của hàm số f(x) = x² + 3x - 2',
      type: 'MULTIPLE_CHOICE',
      subject: 'Toán học',
      topic: 'Đạo hàm',
      difficulty: 'MEDIUM',
      status: 'APPROVED',
      author: 'Nguyễn Văn A',
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2024-06-02T00:00:00Z',
      UsageCount: 45,
      correctRate: 78.5,
    },
    {
      id: '2',
      content: 'Định luật bảo toàn năng lượng có đúng trong mọi trường hợp không?',
      type: 'TRUE_FALSE',
      subject: 'Vật lý',
      topic: 'Năng lượng',
      difficulty: 'EASY',
      status: 'APPROVED',
      author: 'Trần Thị B',
      createdAt: '2024-06-03T00:00:00Z',
      updatedAt: '2024-06-03T00:00:00Z',
      UsageCount: 67,
      correctRate: 85.2,
    },
    {
      id: '3',
      content: 'Giải thích cơ chế phản ứng thế nucleophile của hợp chất hữu cơ',
      type: 'ESSAY',
      subject: 'Hóa học',
      topic: 'Hóa hữu cơ',
      difficulty: 'HARD',
      status: 'PENDING',
      author: 'Lê Văn C',
      createdAt: '2024-06-05T00:00:00Z',
      updatedAt: '2024-06-05T00:00:00Z',
      UsageCount: 0,
    },
    {
      id: '4',
      content: 'Quá trình _____ là quá trình tổng hợp protein từ mRNA',
      type: 'FILL_BLANK',
      subject: 'Sinh học',
      topic: 'Sinh học phân tử',
      difficulty: 'MEDIUM',
      status: 'APPROVED',
      author: 'Phạm Thị D',
      createdAt: '2024-06-04T00:00:00Z',
      updatedAt: '2024-06-04T00:00:00Z',
      UsageCount: 23,
      correctRate: 72.1,
    },
    {
      id: '5',
      content: 'Tìm nghiệm của phương trình bậc hai ax² + bx + c = 0',
      type: 'MULTIPLE_CHOICE',
      subject: 'Toán học',
      topic: 'Phương trình',
      difficulty: 'EASY',
      status: 'DRAFT',
      author: 'Hoàng Văn E',
      createdAt: '2024-06-06T00:00:00Z',
      updatedAt: '2024-06-06T00:00:00Z',
      UsageCount: 0,
    },
    {
      id: '6',
      content: 'Phân tích tác động của biến đổi khí hậu đến hệ sinh thái',
      type: 'ESSAY',
      subject: 'Địa lý',
      topic: 'Môi trường',
      difficulty: 'HARD',
      status: 'REJECTED',
      author: 'Vũ Thị F',
      createdAt: '2024-06-02T00:00:00Z',
      updatedAt: '2024-06-07T00:00:00Z',
      UsageCount: 0,
    },
  ];

  const types = [
    { value: '', label: 'Tất cả loại' },
    { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm' },
    { value: 'TRUE_FALSE', label: 'Đúng/Sai' },
    { value: 'ESSAY', label: 'Tự luận' },
    { value: 'FILL_BLANK', label: 'Điền khuyết' },
  ];

  const statuses = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'PENDING', label: 'Chờ duyệt' },
    { value: 'DRAFT', label: 'Bản nháp' },
    { value: 'REJECTED', label: 'Từ chối' },
  ];

  const subjects = [
    { value: '', label: 'Tất cả môn học' },
    { value: 'Toán học', label: 'Toán học' },
    { value: 'Vật lý', label: 'Vật lý' },
    { value: 'Hóa học', label: 'Hóa học' },
    { value: 'Sinh học', label: 'Sinh học' },
    { value: 'Địa lý', label: 'Địa lý' },
  ];

  const filteredQuestions = mockQuestions.filter(question => {
    const matchesSearch = question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || question.type === selectedType;
    const matchesStatus = !selectedStatus || question.status === selectedStatus;
    const matchesSubject = !selectedSubject || question.subject === selectedSubject;
    return matchesSearch && matchesType && matchesStatus && matchesSubject;
  });

  const stats = {
    total: mockQuestions.length,
    approved: mockQuestions.filter(q => q.status === 'APPROVED').length,
    pending: mockQuestions.filter(q => q.status === 'PENDING').length,
    draft: mockQuestions.filter(q => q.status === 'DRAFT').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ngân hàng câu hỏi</h1>
          <p className="text-muted-foreground">Quản lý và tổ chức câu hỏi cho các bài thi</p>
        </div>
        <Button>
          <HelpCircle className="h-4 w-4 mr-2" />
          Thêm câu hỏi mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
            <Edit className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {subjects.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách câu hỏi</CardTitle>
          <CardDescription>
            {filteredQuestions.length} câu hỏi được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nội dung câu hỏi</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Độ khó</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-center">Sử dụng</TableHead>
                <TableHead className="text-center">Tỷ lệ đúng</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <QuestionRow key={question._id} question={question} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for lazy loading
export default QuestionList;

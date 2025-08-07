'use client';

import { 
  HelpCircle, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  MoreHorizontal
} from 'lucide-react';
import React, { useState } from 'react';

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
 * Question Bank Component
 * 
 * Component quản lý ngân hàng câu hỏi
 * Placeholder component - cần implement đầy đủ functionality
 */

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  UsageCount: number;
}

function QuestionBank(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Mock data - trong thực tế sẽ fetch từ API
  const mockQuestions: any[] = [ // TODO: Define Question type
    {
      id: '1',
      question: 'Tính đạo hàm của hàm số f(x) = x² + 2x + 1',
      type: 'multiple-choice',
      category: 'Toán học',
      difficulty: 'medium',
      points: 2,
      tags: ['đạo hàm', 'hàm số', 'giải tích'],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z',
      UsageCount: 15
    },
    {
      id: '2',
      question: 'Định luật Newton thứ nhất phát biểu như thế nào?',
      type: 'short-answer',
      category: 'Vật lý',
      difficulty: 'easy',
      points: 1,
      tags: ['newton', 'định luật', 'cơ học'],
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-05-15T00:00:00Z',
      UsageCount: 23
    },
    {
      id: '3',
      question: 'Phân tử nước có công thức hóa học là H2O',
      type: 'true-false',
      category: 'Hóa học',
      difficulty: 'easy',
      points: 0.5,
      tags: ['phân tử', 'nước', 'công thức'],
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-06-10T00:00:00Z',
      UsageCount: 8
    },
    {
      id: '4',
      question: 'Phân tích tác phẩm "Truyện Kiều" của Nguyễn Du',
      type: 'essay',
      category: 'Ngữ văn',
      difficulty: 'hard',
      points: 5,
      tags: ['truyện kiều', 'nguyễn du', 'văn học'],
      createdAt: '2024-04-01T00:00:00Z',
      updatedAt: '2024-06-05T00:00:00Z',
      UsageCount: 3
    }
  ];

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      'multiple-choice': 'Trắc nghiệm',
      'true-false': 'Đúng/Sai',
      'short-answer': 'Trả lời ngắn',
      'essay': 'Tự luận'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyConfig = {
      easy: { label: 'Dễ', variant: 'default' as const },
      medium: { label: 'Trung bình', variant: 'secondary' as const },
      hard: { label: 'Khó', variant: 'destructive' as const }
    };
    return difficultyConfig[difficulty as keyof typeof difficultyConfig] || { label: difficulty, variant: 'outline' as const };
  };

  const filteredQuestions = mockQuestions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || question.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || question.difficulty === selectedDifficulty;
    const matchesType = !selectedType || question.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const categories = [...new Set(mockQuestions.map(q => q.category))];

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Ngân hàng câu hỏi</h1>
              <p className="text-muted-foreground">Quản lý và tổ chức câu hỏi cho các bài thi</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo câu hỏi
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{mockQuestions.length}</p>
                  <p className="text-sm text-muted-foreground">Tổng câu hỏi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">E</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockQuestions.filter(q => q.difficulty === 'easy').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Dễ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">M</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockQuestions.filter(q => q.difficulty === 'medium').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Trung bình</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">H</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {mockQuestions.filter(q => q.difficulty === 'hard').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Khó</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select 
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Tất cả độ khó</option>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>

              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Tất cả loại</option>
                <option value="multiple-choice">Trắc nghiệm</option>
                <option value="true-false">Đúng/Sai</option>
                <option value="short-answer">Trả lời ngắn</option>
                <option value="essay">Tự luận</option>
              </select>
            </div>
          </CardContent>
        </Card>

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
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Độ khó</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Sử dụng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => {
                  const difficultyBadge = getDifficultyBadge(question.difficulty);
                  return (
                    <TableRow key={question._id}>
                      <TableCell className="max-w-md">
                        <div>
                          <p className="font-medium line-clamp-2">{question.question}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {question.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {question.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{question.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getTypeLabel(question.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.category}</TableCell>
                      <TableCell>
                        <Badge variant={difficultyBadge.variant}>
                          {difficultyBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.points}</TableCell>
                      <TableCell>{question.UsageCount}</TableCell>
                      <TableCell>
                        {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy câu hỏi</h3>
              <p className="text-muted-foreground mb-4">
                Thử thay đổi bộ lọc hoặc tạo câu hỏi mới
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo câu hỏi đầu tiên
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Default export for lazy loading
export default QuestionBank;

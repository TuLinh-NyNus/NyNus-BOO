'use client';

import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Tag, 
  BookOpen,
  HelpCircle,
  CheckCircle,
  Star,
  MoreVertical,
  Download,
  Upload,
  FolderPlus,
  Folder,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
import logger from '@/lib/utils/logger';

interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  questionCount: number;
  parentId?: string;
}

interface QuestionTag {
  id: string;
  name: string;
  color: string;
  UsageCount: number;
}

interface BankQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  categoryId: string;
  tags: string[];
  points: number;
  UsageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPublic: boolean;
  isFavorite: boolean;
}

interface QuestionBankProps {
  courseId?: string;
  onQuestionSelect?: (questions: BankQuestion[]) => void;
  selectionMode?: boolean;
}

export function QuestionBank({ courseId, onQuestionSelect, selectionMode = false }: QuestionBankProps): JSX.Element {
  const [questions, setQuestions] = useState<BankQuestion[]>([
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'Đạo hàm của hàm số f(x) = x² + 3x - 2 tại x = 1 là?',
      options: ['5', '4', '3', '2'],
      correctAnswer: 0,
      explanation: 'f\'(x) = 2x + 3, nên f\'(1) = 2(1) + 3 = 5',
      difficulty: 'easy',
      categoryId: 'cat1',
      tags: ['dao-ham', 'co-ban'],
      points: 1,
      UsageCount: 15,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      createdBy: 'Thầy Minh',
      isPublic: true,
      isFavorite: false
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'Hàm số y = x³ - 3x + 1 có cực trị tại x = ±1',
      options: ['Đúng', 'Sai'],
      correctAnswer: 0,
      explanation: 'y\' = 3x² - 3 = 0 ⟺ x = ±1. Kiểm tra đạo hàm cấp 2 ta có y\'\'(1) = 6 > 0 và y\'\'(-1) = -6 < 0',
      difficulty: 'medium',
      categoryId: 'cat1',
      tags: ['cuc-tri', 'dao-ham'],
      points: 2,
      UsageCount: 8,
      createdAt: '2024-01-14',
      updatedAt: '2024-01-14',
      createdBy: 'Thầy Minh',
      isPublic: true,
      isFavorite: true
    }
  ]);

  const [categories, setCategories] = useState<QuestionCategory[]>([
    {
      id: 'cat1',
      name: 'Toán học',
      description: 'Câu hỏi về toán học các cấp',
      color: 'blue',
      questionCount: 45
    },
    {
      id: 'cat2',
      name: 'Đạo hàm',
      description: 'Câu hỏi về đạo hàm và ứng dụng',
      color: 'green',
      questionCount: 23,
      parentId: 'cat1'
    },
    {
      id: 'cat3',
      name: 'Tích phân',
      description: 'Câu hỏi về tích phân',
      color: 'purple',
      questionCount: 18,
      parentId: 'cat1'
    }
  ]);

  const [tags, setTags] = useState<QuestionTag[]>([
    { id: 'tag1', name: 'dao-ham', color: 'blue', UsageCount: 25 },
    { id: 'tag2', name: 'co-ban', color: 'green', UsageCount: 40 },
    { id: 'tag3', name: 'cuc-tri', color: 'purple', UsageCount: 12 },
    { id: 'tag4', name: 'nang-cao', color: 'red', UsageCount: 8 }
  ]);

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'created' | 'usage' | 'difficulty'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('questions');

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.explanation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || question.categoryId === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || question.difficulty === selectedDifficulty;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => question.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesTags;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'usage':
        comparison = a.UsageCount - b.UsageCount;
        break;
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleQuestionSelect = (QuestionID: string) => {
    if (!selectionMode) return;
    
    setSelectedQuestions(prev => 
      prev.includes(QuestionID) 
        ? prev.filter(id => id !== QuestionID)
        : [...prev, QuestionID]
    );
  };

  const handleBulkAction = (action: 'delete' | 'copy' | 'export') => {
    const selectedQs = questions.filter(q => selectedQuestions.includes(q.id));
    
    switch (action) {
      case 'delete':
        if (confirm(`Bạn có chắc muốn xóa ${selectedQuestions.length} câu hỏi?`)) {
          setQuestions(prev => prev.filter(q => !selectedQuestions.includes(q.id)));
          setSelectedQuestions([]);
        }
        break;
      case 'copy':
        // Logic to copy questions
        logger.info('Copying questions:', selectedQs);
        break;
      case 'export':
        // Logic to export questions
        logger.info('Exporting questions:', selectedQs);
        break;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return '○';
      case 'true-false': return '✓';
      case 'fill-blank': return '___';
      case 'essay': return '📝';
      default: return '?';
    }
  };

  const renderQuestionCard = (question: BankQuestion) => (
    <Card 
      key={question.id}
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedQuestions.includes(question.id) ? 'ring-2 ring-purple-500' : ''
      }`}
      onClick={() => handleQuestionSelect(question.id)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getQuestionTypeIcon(question.type)}</span>
              <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                {getDifficultyLabel(question.difficulty)}
              </Badge>
              <Badge variant="outline">
                {question.points} điểm
              </Badge>
              {question.isFavorite && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {selectionMode && (
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(question.id)}
                  onChange={() => handleQuestionSelect(question.id)}
                  className="rounded"
                />
              )}
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Question Content */}
          <div>
            <h3 className="font-medium text-slate-900 mb-2 line-clamp-2">
              {question.question}
            </h3>
            
            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-1 text-sm text-slate-600">
                {question.options.slice(0, 2).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className={index === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                      {String.fromCharCode(65 + index)}. {option}
                      {index === question.correctAnswer && ' ✓'}
                    </span>
                  </div>
                ))}
                {question.options.length > 2 && (
                  <div className="text-xs text-slate-500">
                    +{question.options.length - 2} lựa chọn khác
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {question.tags.slice(0, 3).map(tagName => {
              const tag = tags.find(t => t.name === tagName);
              return (
                <Badge key={tagName} variant="secondary" className="text-xs">
                  {tagName}
                </Badge>
              );
            })}
            {question.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{question.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
            <div className="flex items-center gap-3">
              <span>Tạo: {new Date(question.createdAt).toLocaleDateString('vi-VN')}</span>
              <span>Dùng: {question.UsageCount} lần</span>
            </div>
            <span>{question.createdBy}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCategoryTree = () => (
    <div className="space-y-2">
      {categories.filter(cat => !cat.parentId).map(category => (
        <div key={category.id}>
          <div 
            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-50 ${
              selectedCategory === category.id ? 'bg-purple-50 text-purple-700' : ''
            }`}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
          >
            <Folder className="h-4 w-4" />
            <span className="font-medium">{category.name}</span>
            <Badge variant="secondary" className="ml-auto">
              {category.questionCount}
            </Badge>
          </div>
          
          {/* Subcategories */}
          <div className="ml-6 space-y-1">
            {categories.filter(cat => cat.parentId === category.id).map(subcat => (
              <div 
                key={subcat.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-50 ${
                  selectedCategory === subcat.id ? 'bg-purple-50 text-purple-700' : ''
                }`}
                onClick={() => setSelectedCategory(selectedCategory === subcat.id ? '' : subcat.id)}
              >
                <Folder className="h-3 w-3" />
                <span className="text-sm">{subcat.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {subcat.questionCount}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ngân hàng câu hỏi</h1>
          <p className="text-slate-600">
            Quản lý và tổ chức câu hỏi theo danh mục và thẻ
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectionMode && selectedQuestions.length > 0 && (
            <>
              <Button variant="outline" onClick={() => handleBulkAction('copy')}>
                <Copy className="h-4 w-4 mr-2" />
                Sao chép ({selectedQuestions.length})
              </Button>
              <Button variant="outline" onClick={() => handleBulkAction('export')}>
                <Download className="h-4 w-4 mr-2" />
                Xuất file
              </Button>
              <Button variant="destructive" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </>
          )}
          
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Nhập file
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm câu hỏi
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
          <TabsTrigger value="tags">Thẻ</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filters */}
            <div className="space-y-6">
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tìm kiếm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Tìm câu hỏi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Danh mục</CardTitle>
                    <Button variant="ghost" size="sm">
                      <FolderPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderCategoryTree()}
                </CardContent>
              </Card>

              {/* Difficulty Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Độ khó</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['easy', 'medium', 'hard'].map(difficulty => (
                      <label key={difficulty} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="difficulty"
                          value={difficulty}
                          checked={selectedDifficulty === difficulty}
                          onChange={(e) => setSelectedDifficulty(e.target.checked ? difficulty : '')}
                        />
                        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(difficulty)}`}>
                          {getDifficultyLabel(difficulty)}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tags Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thẻ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tags.map(tag => (
                      <label key={tag.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags(prev => [...prev, tag.name]);
                            } else {
                              setSelectedTags(prev => prev.filter(t => t !== tag.name));
                            }
                          }}
                        />
                        <Badge variant="secondary" className="text-xs">
                          {tag.name} ({tag.UsageCount})
                        </Badge>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">
                    {filteredQuestions.length} câu hỏi
                  </span>
                  
                  {(searchTerm || selectedCategory || selectedDifficulty || selectedTags.length > 0) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                        setSelectedDifficulty('');
                        setSelectedTags([]);
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="created">Ngày tạo</option>
                    <option value="usage">Lượt sử dụng</option>
                    <option value="difficulty">Độ khó</option>
                  </select>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuestions.map(renderQuestionCard)}
              </div>

              {filteredQuestions.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Không tìm thấy câu hỏi nào
                    </h3>
                    <p className="text-slate-600">
                      Thử điều chỉnh bộ lọc hoặc tạo câu hỏi mới
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quản lý danh mục</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
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
                        {category.questionCount} câu hỏi
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
        </TabsContent>

        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quản lý thẻ</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thẻ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tags.map(tag => (
                  <div key={tag.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">
                        {tag.name}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">
                      Sử dụng: {tag.UsageCount} lần
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {questions.length}
                </div>
                <div className="text-sm text-slate-600">Tổng câu hỏi</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {categories.length}
                </div>
                <div className="text-sm text-slate-600">Danh mục</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {tags.length}
                </div>
                <div className="text-sm text-slate-600">Thẻ</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.round(questions.reduce((sum, q) => sum + q.UsageCount, 0) / questions.length)}
                </div>
                <div className="text-sm text-slate-600">Lượt dùng TB</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

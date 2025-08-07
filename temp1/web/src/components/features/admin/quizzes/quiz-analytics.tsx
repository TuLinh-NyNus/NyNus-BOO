'use client';

import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Clock, 
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Download,
  Filter,
  Calendar,
  Eye,
  FileText
} from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress
} from '@/components/ui';

interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  uniqueStudents: number;
  averageScore: number;
  passRate: number;
  averageTime: number;
  completionRate: number;
  lastUpdated: string;
}

interface QuestionAnalytics {
  QuestionID: string;
  questionText: string;
  correctRate: number;
  averageTime: number;
  totalAttempts: number;
  difficulty: 'easy' | 'medium' | 'hard';
  discriminationIndex: number;
}

interface StudentPerformance {
  studentId: string;
  studentName: string;
  attempts: number;
  bestScore: number;
  averageScore: number;
  timeSpent: number;
  status: 'passed' | 'failed' | 'in_progress';
  lastAttempt: string;
}

interface QuizAnalyticsProps {
  quizId: string;
  courseId?: string;
}

export function QuizAnalytics({ quizId, courseId }: QuizAnalyticsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');

  // Mock data
  const analytics: QuizAnalytics = {
    quizId,
    quizTitle: 'Kiểm tra cuối chương: Đạo hàm',
    totalAttempts: 156,
    uniqueStudents: 45,
    averageScore: 78.5,
    passRate: 82.2,
    averageTime: 18.5,
    completionRate: 91.1,
    lastUpdated: '2024-01-16T10:30:00Z'
  };

  const questionAnalytics: QuestionAnalytics[] = [
    {
      QuestionID: 'q1',
      questionText: 'Đạo hàm của hàm số f(x) = x² + 3x - 2 tại x = 1 là?',
      correctRate: 85.5,
      averageTime: 45,
      totalAttempts: 156,
      difficulty: 'easy',
      discriminationIndex: 0.65
    },
    {
      QuestionID: 'q2',
      questionText: 'Tìm cực trị của hàm số y = x³ - 3x + 1',
      correctRate: 62.8,
      averageTime: 120,
      totalAttempts: 156,
      difficulty: 'medium',
      discriminationIndex: 0.72
    },
    {
      QuestionID: 'q3',
      questionText: 'Chứng minh định lý Rolle cho hàm số liên tục',
      correctRate: 34.6,
      averageTime: 180,
      totalAttempts: 156,
      difficulty: 'hard',
      discriminationIndex: 0.58
    }
  ];

  const studentPerformance: StudentPerformance[] = [
    {
      studentId: 's1',
      studentName: 'Nguyễn Văn An',
      attempts: 2,
      bestScore: 95,
      averageScore: 87.5,
      timeSpent: 32,
      status: 'passed',
      lastAttempt: '2024-01-15T14:30:00Z'
    },
    {
      studentId: 's2',
      studentName: 'Trần Thị Bình',
      attempts: 3,
      bestScore: 88,
      averageScore: 82.3,
      timeSpent: 45,
      status: 'passed',
      lastAttempt: '2024-01-15T16:20:00Z'
    },
    {
      studentId: 's3',
      studentName: 'Lê Văn Cường',
      attempts: 1,
      bestScore: 65,
      averageScore: 65,
      timeSpent: 28,
      status: 'failed',
      lastAttempt: '2024-01-14T09:15:00Z'
    }
  ];

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tổng lượt làm</p>
                <p className="text-3xl font-bold text-slate-900">{analytics.totalAttempts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-slate-600 ml-1">so với tuần trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Học viên tham gia</p>
                <p className="text-3xl font-bold text-slate-900">{analytics.uniqueStudents}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-slate-600">
                {Math.round((analytics.uniqueStudents / 50) * 100)}% lớp đã tham gia
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Điểm trung bình</p>
                <p className="text-3xl font-bold text-slate-900">{analytics.averageScore}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={analytics.averageScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tỷ lệ đậu</p>
                <p className="text-3xl font-bold text-slate-900">{analytics.passRate}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">
                {Math.round((analytics.passRate / 100) * analytics.uniqueStudents)} học viên đậu
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Phân bố điểm số</CardTitle>
            <div className="flex items-center gap-2">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="7d">7 ngày qua</option>
                <option value="30d">30 ngày qua</option>
                <option value="90d">3 tháng qua</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Score Distribution */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { range: '90-100', count: 12, percentage: 26.7 },
                { range: '80-89', count: 15, percentage: 33.3 },
                { range: '70-79', count: 10, percentage: 22.2 },
                { range: '60-69', count: 5, percentage: 11.1 },
                { range: '0-59', count: 3, percentage: 6.7 }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-slate-100 rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-slate-900">{item.count}</div>
                    <div className="text-xs text-slate-600">{item.percentage}%</div>
                  </div>
                  <div className="text-sm font-medium text-slate-700">{item.range}</div>
                </div>
              ))}
            </div>

            {/* Time Analysis */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Phân tích thời gian</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{analytics.averageTime}m</div>
                  <div className="text-sm text-blue-700">Thời gian trung bình</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">12m</div>
                  <div className="text-sm text-green-700">Nhanh nhất</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-900">28m</div>
                  <div className="text-sm text-red-700">Chậm nhất</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuestionAnalysis = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Phân tích từng câu hỏi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionAnalytics.map((question, index) => (
              <div key={question.QuestionID} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Câu {index + 1}</Badge>
                      <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty === 'easy' ? 'Dễ' : 
                         question.difficulty === 'medium' ? 'TB' : 'Khó'}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-slate-900 mb-2">
                      {question.questionText}
                    </h3>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getPerformanceColor(question.correctRate)}`}>
                      {question.correctRate}%
                    </div>
                    <div className="text-sm text-slate-600">Tỷ lệ đúng</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <div className="text-lg font-semibold text-slate-900">
                      {question.totalAttempts}
                    </div>
                    <div className="text-xs text-slate-600">Lượt làm</div>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <div className="text-lg font-semibold text-slate-900">
                      {question.averageTime}s
                    </div>
                    <div className="text-xs text-slate-600">Thời gian TB</div>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <div className="text-lg font-semibold text-slate-900">
                      {question.discriminationIndex.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-600">Chỉ số phân biệt</div>
                  </div>
                  
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <Progress value={question.correctRate} className="mb-1" />
                    <div className="text-xs text-slate-600">Độ khó thực tế</div>
                  </div>
                </div>

                {/* Recommendations */}
                {question.correctRate < 50 && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium">Khuyến nghị</p>
                        <p>Câu hỏi này có tỷ lệ đúng thấp. Cân nhắc xem lại nội dung hoặc cách diễn đạt.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentPerformance = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kết quả học viên</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Xuất danh sách
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-slate-700">Học viên</th>
                  <th className="text-center p-3 font-medium text-slate-700">Lần làm</th>
                  <th className="text-center p-3 font-medium text-slate-700">Điểm cao nhất</th>
                  <th className="text-center p-3 font-medium text-slate-700">Điểm TB</th>
                  <th className="text-center p-3 font-medium text-slate-700">Thời gian</th>
                  <th className="text-center p-3 font-medium text-slate-700">Trạng thái</th>
                  <th className="text-center p-3 font-medium text-slate-700">Lần cuối</th>
                  <th className="text-center p-3 font-medium text-slate-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {studentPerformance.map((student) => (
                  <tr key={student.studentId} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{student.studentName}</div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline">{student.attempts}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-semibold ${getPerformanceColor(student.bestScore)}`}>
                        {student.bestScore}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-slate-600">{student.averageScore}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-slate-600">{student.timeSpent}m</span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge 
                        variant={student.status === 'passed' ? 'default' :
                                student.status === 'failed' ? 'destructive' : 'secondary'}
                      >
                        {student.status === 'passed' ? 'Đậu' :
                         student.status === 'failed' ? 'Rớt' : 'Đang làm'}
                      </Badge>
                    </td>
                    <td className="p-3 text-center text-sm text-slate-600">
                      {new Date(student.lastAttempt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo và xuất dữ liệu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Báo cáo tổng quan</h3>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Báo cáo chi tiết quiz
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Phân tích thống kê
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Danh sách học viên
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Xuất dữ liệu</h3>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel (.xlsx)
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất CSV (.csv)
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất PDF (.pdf)
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Lưu ý về báo cáo</p>
                <p>Dữ liệu được cập nhật theo thời gian thực. Báo cáo sẽ phản ánh tình trạng hiện tại của quiz.</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Thống kê Quiz</h1>
          <p className="text-slate-600">{analytics.quizTitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            Cập nhật: {new Date(analytics.lastUpdated).toLocaleString('vi-VN')}
          </Badge>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="questions">Phân tích câu hỏi</TabsTrigger>
          <TabsTrigger value="students">Kết quả học viên</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="questions">
          {renderQuestionAnalysis()}
        </TabsContent>

        <TabsContent value="students">
          {renderStudentPerformance()}
        </TabsContent>

        <TabsContent value="reports">
          {renderReports()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

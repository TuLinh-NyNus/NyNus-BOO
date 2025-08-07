'use client';

import React from 'react';

import { BarChart2, TrendingUp, Users, BookOpen, FileText, MessageSquare, Download, Calendar, BarChart, PieChart, LineChart, ArrowDownRight, FileDown, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Card } from "@/components/ui/card";
import {
  getAnalyticsOverview,
  mockSystemMetrics
} from '@/lib/mockdata/analytics';

// Interface cho overview metrics để đảm bảo type safety
interface OverviewMetric {
  id: number;
  name: string;
  value: string;
  trend: string;
  timeframe: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Interface cho popular documents
interface PopularDocument {
  id: string;
  title: string;
  type: string;
  downloads: number;
  trend: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// Interface cho activity history
interface ActivityHistoryItem {
  id: string;
  type: 'user' | 'document' | 'forum' | 'system' | 'course';
  title: string;
  subtitle: string;
  timestamp: string;
  color: string;
}

// Time options cho dropdown
const timeOptions = [
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: '90d', label: '90 ngày qua' },
  { value: '12m', label: '12 tháng qua' },
];

export default function AnalyticsPage() {
  const [selectedTime, setSelectedTime] = useState('30d');
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetric[]>([]);
  const [popularDocuments, setPopularDocuments] = useState<PopularDocument[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryItem[]>([]);

  // Load data từ mockdata khi component mount
  useEffect(() => {
    const analyticsOverview = getAnalyticsOverview();
    
    // Tạo overview metrics từ mockdata
    const metrics: OverviewMetric[] = [
      { 
        id: 1, 
        name: 'Người dùng', 
        value: analyticsOverview.totalUsers.toLocaleString(), 
        trend: '+12%', 
        timeframe: '30 ngày qua', 
        icon: Users, 
        color: 'blue' 
      },
      { 
        id: 2, 
        name: 'Sách & tài liệu', 
        value: analyticsOverview.totalQuestions.toLocaleString(), 
        trend: '+5%', 
        timeframe: '30 ngày qua', 
        icon: BookOpen, 
        color: 'green' 
      },
      { 
        id: 3, 
        name: 'Lượt thi & kiểm tra', 
        value: analyticsOverview.totalSessions.toLocaleString(), 
        trend: '+28%', 
        timeframe: '30 ngày qua', 
        icon: FileText, 
        color: 'purple' 
      },
      { 
        id: 4, 
        name: 'Hoạt động diễn đàn', 
        value: mockSystemMetrics.userActivity.currentOnline.toLocaleString(), 
        trend: '-3%', 
        timeframe: '30 ngày qua', 
        icon: MessageSquare, 
        color: 'orange' 
      },
    ];

    // Tạo popular documents từ mockdata
    const documents: PopularDocument[] = [
      {
        id: 'doc-001',
        title: 'Sách giáo khoa Toán học 12',
        type: 'SGK',
        downloads: 1245,
        trend: '+12%',
        icon: BookOpen,
        color: 'blue'
      },
      {
        id: 'doc-002', 
        title: 'Đề thi thử THPT QG môn Văn 2024',
        type: 'Đề thi',
        downloads: 965,
        trend: '+24%',
        icon: FileText,
        color: 'purple'
      },
      {
        id: 'doc-003',
        title: 'Bí quyết học tốt Hóa học 11', 
        type: 'Sách tham khảo',
        downloads: 842,
        trend: '+8%',
        icon: BookOpen,
        color: 'green'
      },
      {
        id: 'doc-004',
        title: 'Đề cương ôn tập Vật lý 12',
        type: 'Đề cương', 
        downloads: 720,
        trend: '+15%',
        icon: FileText,
        color: 'orange'
      }
    ];

    // Tạo activity history từ mockdata
    const activities: ActivityHistoryItem[] = [
      {
        id: 'activity-001',
        type: 'user',
        title: 'Người dùng mới đăng ký: Nguyễn Văn A',
        subtitle: 'ID: USER12345',
        timestamp: 'Hôm nay, 10:30',
        color: 'green'
      },
      {
        id: 'activity-002',
        type: 'document', 
        title: 'Tài liệu mới: Đề thi thử THPT QG môn Toán 2024',
        subtitle: 'Tải lên bởi: Trần Thị B (Giáo viên)',
        timestamp: 'Hôm nay, 09:15',
        color: 'blue'
      },
      {
        id: 'activity-003',
        type: 'forum',
        title: 'Bài viết mới trên diễn đàn: Phương pháp giải nhanh đạo hàm',
        subtitle: 'Đăng bởi: Lê Văn C (Học sinh)',
        timestamp: 'Hôm qua, 18:45', 
        color: 'purple'
      },
      {
        id: 'activity-004',
        type: 'system',
        title: 'Cập nhật dữ liệu ChatAI: Bổ sung kiến thức về Vật lý học',
        subtitle: 'Thực hiện bởi: Admin',
        timestamp: 'Hôm qua, 14:20',
        color: 'yellow'
      },
      {
        id: 'activity-005',
        type: 'course',
        title: 'Khóa học mới: Luyện đề THPT QG môn Hóa học',
        subtitle: 'Tạo bởi: Phạm Thị D (Giáo viên)',
        timestamp: '06/03/2024, 11:30',
        color: 'orange'
      }
    ];

    setOverviewMetrics(metrics);
    setPopularDocuments(documents);
    setActivityHistory(activities);
  }, []);

  // Handler cho refresh data
  const handleRefreshData = () => {
    // Simulate data refresh - trong thực tế sẽ gọi API
    console.log('Refreshing analytics data...');
  };

  // Handler cho export report
  const handleExportReport = () => {
    // Simulate report export - trong thực tế sẽ generate và download file
    console.log('Exporting analytics report...');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Thống kê & Báo cáo</h1>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button 
            onClick={handleRefreshData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 hover:scale-105 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Cập nhật dữ liệu
          </button>
          <button 
            onClick={handleExportReport}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 hover:scale-105 flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Các metric tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewMetrics.map((metric) => (
          <Card key={metric.id} className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300 hover:scale-105">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <metric.icon className={`h-5 w-5 text-${metric.color}-600 dark:text-${metric.color}-400 transition-colors duration-300`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{metric.name}</p>
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">{metric.value}</p>
                <div className="flex items-center gap-1.5">
                  {metric.trend.startsWith('+') ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 transition-colors duration-300" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400 transition-colors duration-300" />
                  )}
                  <span className={`text-xs ${metric.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} transition-colors duration-300`}>
                    {metric.trend} ({metric.timeframe})
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Biểu đồ người dùng */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8 p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 transition-colors duration-300">
              <Users className="h-5 w-5" />
              Người dùng hoạt động
            </h2>
            <select className="bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1 text-slate-800 dark:text-white text-sm transition-colors duration-300">
              <option value="daily">Theo ngày</option>
              <option value="weekly">Theo tuần</option>
              <option value="monthly">Theo tháng</option>
            </select>
          </div>
          <div className="h-80 w-full bg-slate-100 dark:bg-slate-800/80 rounded-lg flex items-center justify-center transition-colors duration-300">
            <LineChart className="h-16 w-16 text-slate-400 dark:text-slate-600 transition-colors duration-300" />
            <p className="text-slate-600 dark:text-slate-400 ml-4 transition-colors duration-300">Biểu đồ người dùng hoạt động sẽ được hiển thị ở đây</p>
          </div>
        </Card>

        <Card className="md:col-span-4 p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-6 transition-colors duration-300">
            <PieChart className="h-5 w-5" />
            Phân bố người dùng
          </h2>
          <div className="h-80 w-full bg-slate-100 dark:bg-slate-800/80 rounded-lg flex flex-col items-center justify-center transition-colors duration-300">
            <PieChart className="h-16 w-16 text-slate-400 dark:text-slate-600 mb-4 transition-colors duration-300" />
            <p className="text-slate-600 dark:text-slate-400 text-center transition-colors duration-300">Biểu đồ phân bố người dùng theo vai trò sẽ được hiển thị ở đây</p>
          </div>
        </Card>
      </div>

      {/* Hoạt động trên hệ thống */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-6 p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-6 transition-colors duration-300">
            <Download className="h-5 w-5" />
            Tài liệu được tải xuống nhiều nhất
          </h2>
          <div className="space-y-4">
            {popularDocuments.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-${document.color}-100 dark:bg-${document.color}-500/20 rounded-lg flex items-center justify-center transition-colors duration-300`}>
                    <document.icon className={`h-5 w-5 text-${document.color}-600 dark:text-${document.color}-400 transition-colors duration-300`} />
                  </div>
                  <div>
                    <p className="text-slate-800 dark:text-white font-medium transition-colors duration-300">{document.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">{document.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-800 dark:text-white font-medium transition-colors duration-300">{document.downloads.toLocaleString()}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 transition-colors duration-300">{document.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="md:col-span-6 p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-6 transition-colors duration-300">
            <BarChart className="h-5 w-5" />
            Hoạt động diễn đàn
          </h2>
          <div className="h-80 w-full bg-slate-100 dark:bg-slate-800/80 rounded-lg flex items-center justify-center transition-colors duration-300">
            <BarChart className="h-16 w-16 text-slate-400 dark:text-slate-600 transition-colors duration-300" />
            <p className="text-slate-600 dark:text-slate-400 ml-4 transition-colors duration-300">Biểu đồ hoạt động diễn đàn sẽ được hiển thị ở đây</p>
          </div>
        </Card>
      </div>

      {/* Lịch sử hoạt động */}
      <Card className="p-6 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 transition-colors duration-300">
            <Calendar className="h-5 w-5" />
            Lịch sử hoạt động
          </h2>
          <select className="bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1 text-slate-800 dark:text-white text-sm transition-colors duration-300">
            <option value="all">Tất cả</option>
            <option value="users">Người dùng</option>
            <option value="documents">Tài liệu</option>
            <option value="exams">Đề thi</option>
            <option value="forum">Diễn đàn</option>
          </select>
        </div>

        <div className="space-y-4">
          {activityHistory.map((activity, index) => (
            <div key={activity.id} className={`relative pl-6 ${index < activityHistory.length - 1 ? 'pb-8 border-l-2' : ''} border-slate-300 dark:border-slate-700 transition-colors duration-300`}>
              <div className={`absolute w-4 h-4 bg-${activity.color}-500 rounded-full -left-[9px] top-0`}></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-800 dark:text-white font-medium transition-colors duration-300">{activity.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 transition-colors duration-300">{activity.subtitle}</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


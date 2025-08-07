'use client';

import { 
  ProgressLineChart, 
  ChapterProgressChart, 
  ActivityHeatMap 
} from './charts';

import { ProgressInsights } from './insights';

export { 
  ProgressLineChart, 
  ChapterProgressChart, 
  ActivityHeatMap,
  ProgressInsights
};

// Combine all analytics components into a single dashboard component
export default function AnalyticsDashboard() {
  // Mock data
  const weeklyData = [
    { date: '2023-07-01', progress: 35, timeSpent: 45 },
    { date: '2023-07-02', progress: 45, timeSpent: 60 },
    { date: '2023-07-03', progress: 55, timeSpent: 75 },
    { date: '2023-07-04', progress: 60, timeSpent: 90 },
    { date: '2023-07-05', progress: 70, timeSpent: 105 },
    { date: '2023-07-06', progress: 80, timeSpent: 120 },
    { date: '2023-07-07', progress: 85, timeSpent: 90 },
  ];

  const chapterProgress = [
    { id: '1', name: 'Chương 1: Cơ bản', progress: 100, averageScore: 8.5, timeSpent: 180, status: 'completed' },
    { id: '2', name: 'Chương 2: Nâng cao', progress: 75, averageScore: 7.2, timeSpent: 120, status: 'in-progress' },
    { id: '3', name: 'Chương 3: Chuyên sâu', progress: 20, averageScore: 0, timeSpent: 45, status: 'in-progress' },
    { id: '4', name: 'Chương 4: Tổng hợp', progress: 0, averageScore: 0, timeSpent: 0, status: 'not-started' },
  ];

  const insightData = {
    strengths: [
      { subject: 'Đại số', score: 9.2, improvement: 15 },
      { subject: 'Hình học', score: 8.7, improvement: 12 },
    ],
    weaknesses: [
      { subject: 'Giải tích', score: 5.6, decline: 8 },
      { subject: 'Xác suất', score: 6.2, decline: 5 },
    ],
    recommendations: [
      { 
        type: 'practice', 
        title: 'Luyện tập Giải tích', 
        description: 'Tập trung vào đạo hàm và tích phân', 
        action: 'practice/calculus', 
        priority: 'high' 
      },
      { 
        type: 'review', 
        title: 'Ôn tập Xác suất', 
        description: 'Xem lại các khái niệm cơ bản', 
        action: 'review/probability', 
        priority: 'medium' 
      }
    ],
    goals: {
      current: 68,
      target: 90,
      deadline: '2023-08-15',
      status: 'behind'
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <ProgressLineChart weeklyData={weeklyData} />
        <ChapterProgressChart chapterProgress={chapterProgress} />
      </div>
      <ActivityHeatMap />
      <ProgressInsights data={insightData} />
    </div>
  );
} 

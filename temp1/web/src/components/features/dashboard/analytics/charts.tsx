'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';

import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';

interface ProgressData {
  date: string;
  progress: number;
  timeSpent: number;
}

interface ChapterProgress {
  id: string;
  name: string;
  progress: number;
  averageScore: number;
  timeSpent: number;
  status: 'completed' | 'in-progress' | 'not-started';
  weakPoints?: string[];
  strongPoints?: string[];
}

interface ProgressChartsProps {
  weeklyData: ProgressData[];
  chapterProgress: ChapterProgress[];
  className?: string;
}

export function ProgressLineChart({ weeklyData, className }: { weeklyData: ProgressData[], className?: string }): JSX.Element {
  const maxProgress = Math.max(...weeklyData.map(d => d.progress));
  const maxTime = Math.max(...weeklyData.map(d => d.timeSpent));

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Biểu đồ tiến độ 7 ngày qua
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Area */}
          <div className="relative h-48 bg-slate-900/30 rounded-lg p-4">
            <div className="flex items-end justify-between h-full gap-2">
              {weeklyData.map((data, index) => (
                <motion.div
                  key={data.date}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.progress / maxProgress) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-sm relative group cursor-pointer"
                  style={{ minHeight: '4px' }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div>{data.progress}% hoàn thành</div>
                      <div>{data.timeSpent}m học tập</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              {weeklyData.map((data) => (
                <span key={data.date}>
                  {new Date(data.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                </span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded"></div>
              <span className="text-slate-300">Tiến độ học tập</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChapterProgressChart({ chapterProgress, className }: { chapterProgress: ChapterProgress[], className?: string }): JSX.Element {
  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tiến độ theo chương
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chapterProgress.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    chapter.status === 'completed' ? 'bg-green-500' :
                    chapter.status === 'in-progress' ? 'bg-yellow-500' :
                    'bg-slate-500'
                  }`} />
                  <span className="text-white font-medium">{chapter.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={chapter.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                    {chapter.progress}%
                  </Badge>
                  {chapter.averageScore > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {chapter.averageScore}/10
                    </Badge>
                  )}
                </div>
              </div>
              
              <Progress value={chapter.progress} className="h-2" />
              
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{Math.floor(chapter.timeSpent / 60)}h {chapter.timeSpent % 60}m</span>
                </div>
                <div className="flex items-center gap-2">
                  {chapter.status === 'completed' && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                  {chapter.status === 'in-progress' && chapter.averageScore < 6 && (
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityHeatMap({ className }: { className?: string }): JSX.Element {
  // Generate mock activity data for the last 12 weeks
  const generateHeatMapData = () => {
    const data = [];
    const today = new Date();
    
    for (let week = 11; week >= 0; week--) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + day));
        
        // Random activity level (0-4)
        const activity = Math.floor(Math.random() * 5);
        data.push({
          date: date.toISOString().split('T')[0],
          activity,
          day: date.getDay()
        });
      }
    }
    return data;
  };

  const heatMapData = generateHeatMapData();
  const weeks = [];
  for (let i = 0; i < heatMapData.length; i += 7) {
    weeks.push(heatMapData.slice(i, i + 7));
  }

  const getActivityColor = (level: number) => {
    const colors = [
      'bg-slate-800', // No activity
      'bg-green-900/50', // Low
      'bg-green-700/70', // Medium-low
      'bg-green-500/80', // Medium-high
      'bg-green-400' // High
    ];
    return colors[level] || colors[0];
  };

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Hoạt động học tập (12 tuần qua)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heat map grid */}
          <div className="flex gap-1 overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                    className={`w-3 h-3 rounded-sm ${getActivityColor(day.activity)} cursor-pointer group relative`}
                    title={`${day.date}: ${day.activity > 0 ? `${day.activity * 30}m học tập` : 'Không hoạt động'}`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        <div>{new Date(day.date).toLocaleDateString('vi-VN')}</div>
                        <div>{day.activity > 0 ? `${day.activity * 30}m học tập` : 'Không hoạt động'}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ít</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`} />
              ))}
            </div>
            <span>Nhiều</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Charts component that combines all charts
export default function AnalyticsCharts({ className }: { className?: string }): JSX.Element {
  // Mock data
  const weeklyData: ProgressData[] = [
    { date: '2024-01-01', progress: 75, timeSpent: 120 },
    { date: '2024-01-08', progress: 80, timeSpent: 135 },
    { date: '2024-01-15', progress: 85, timeSpent: 150 },
  ];

  const chapterProgress: ChapterProgress[] = [
    { chapter: 'Đại số', completed: 8, total: 12, difficulty: 'medium' },
    { chapter: 'Hình học', completed: 5, total: 10, difficulty: 'hard' },
    { chapter: 'Giải tích', completed: 3, total: 8, difficulty: 'easy' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <ProgressLineChart weeklyData={weeklyData} />
      <ChapterProgressChart chapterProgress={chapterProgress} />
      <ActivityHeatMap />
    </div>
  );
}

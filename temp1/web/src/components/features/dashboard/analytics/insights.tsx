'use client';

import { motion } from 'framer-motion';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  PenTool,
  Clock,
  Star
} from 'lucide-react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";


interface InsightData {
  strengths: {
    subject: string;
    score: number;
    improvement: number;
  }[];
  weaknesses: {
    subject: string;
    score: number;
    decline: number;
  }[];
  recommendations: {
    type: 'study' | 'practice' | 'review' | 'time';
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  goals: {
    current: number;
    target: number;
    deadline: string;
    status: 'on-track' | 'behind' | 'ahead';
  };
}

interface ProgressInsightsProps {
  data: InsightData;
  onActionClick?: (action: string) => void;
  className?: string;
}

export function ProgressInsights({ data, onActionClick, className }: ProgressInsightsProps): JSX.Element {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-400';
      case 'on-track': return 'text-blue-400';
      case 'behind': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case 'ahead': return <TrendingUp className="h-4 w-4" />;
      case 'on-track': return <Target className="h-4 w-4" />;
      case 'behind': return <TrendingDown className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Điểm mạnh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.strengths.map((strength, index) => (
                <motion.div
                  key={strength.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">{strength.subject}</div>
                    <div className="text-sm text-slate-400">Điểm số: {strength.score}/10</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">
                      +{strength.improvement}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                Cần cải thiện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.weaknesses.map((weakness, index) => (
                <motion.div
                  key={weakness.subject}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">{weakness.subject}</div>
                    <div className="text-sm text-slate-400">Điểm số: {weakness.score}/10</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">
                      -{weakness.decline}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Goal Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Mục tiêu học tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {data.goals.current}% / {data.goals.target}%
                  </div>
                  <div className="text-sm text-slate-400">
                    Mục tiêu đến {new Date(data.goals.deadline).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${getGoalStatusColor(data.goals.status)}`}>
                  {getGoalStatusIcon(data.goals.status)}
                  <span className="font-medium capitalize">
                    {data.goals.status === 'ahead' ? 'Vượt tiến độ' :
                     data.goals.status === 'on-track' ? 'Đúng tiến độ' : 'Chậm tiến độ'}
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.goals.current / data.goals.target) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-3 rounded-full ${
                    data.goals.status === 'ahead' ? 'bg-green-500' :
                    data.goals.status === 'on-track' ? 'bg-blue-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Đề xuất cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recommendations.map((rec, index) => {
              const getTypeIcon = (type: string) => {
                switch (type) {
                  case 'study': return <BookOpen className="h-4 w-4" />;
                  case 'practice': return <PenTool className="h-4 w-4" />;
                  case 'review': return <Brain className="h-4 w-4" />;
                  case 'time': return <Clock className="h-4 w-4" />;
                  default: return <Star className="h-4 w-4" />;
                }
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-blue-400">
                          {getTypeIcon(rec.type)}
                        </div>
                        <h4 className="text-white font-medium">{rec.title}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority === 'high' ? 'Cao' : 
                           rec.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm mb-3">{rec.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 hover:bg-slate-700"
                        onClick={() => onActionClick?.(rec.action)}
                      >
                        {rec.action}
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Default export for lazy loading
export default ProgressInsights;

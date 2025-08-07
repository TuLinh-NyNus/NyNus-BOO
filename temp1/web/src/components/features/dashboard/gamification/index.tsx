'use client';

import { motion } from 'framer-motion';
import { 
  Trophy,
  Medal,
  Star,
  Flame,
  Target,
  Crown,
  Award,
  Zap,
  BookOpen,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

import { Badge, Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';


interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  isCurrentUser?: boolean;
}

interface GamificationData {
  achievements: Achievement[];
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  leaderboard: LeaderboardEntry[];
  weeklyRank: number;
  totalUsers: number;
}

interface GamificationProps {
  data: GamificationData;
  className?: string;
}

export function GamificationPanel({ data, className }: GamificationProps): JSX.Element {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-slate-500 bg-slate-500/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-slate-500 bg-slate-500/10';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return Medal;
      case 'rare': return Star;
      case 'epic': return Crown;
      case 'legendary': return Trophy;
      default: return Award;
    }
  };

  const getAchievementIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      medal: Medal,
      star: Star,
      flame: Flame,
      target: Target,
      crown: Crown,
      award: Award,
      zap: Zap,
      book: BookOpen,
      clock: Clock
    };
    return icons[iconName] || Award;
  };

  const levelProgress = (data.totalPoints % 1000) / 10; // Assuming 1000 points per level

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level & Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-white mb-1">
                  Cấp độ {data.level}
                </div>
                <div className="text-purple-300">
                  {data.totalPoints.toLocaleString()} điểm
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-300 mb-1">
                  Cần {data.nextLevelPoints - data.totalPoints} điểm nữa
                </div>
                <div className="text-xs text-slate-400">
                  để lên cấp {data.level + 1}
                </div>
              </div>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" />
              Chuỗi học tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {data.currentStreak}
                </div>
                <div className="text-sm text-slate-300">Ngày hiện tại</div>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <div className="text-2xl font-bold text-white mb-1">
                  {data.longestStreak}
                </div>
                <div className="text-sm text-slate-400">Kỷ lục cá nhân</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Thành tích ({data.achievements.filter(a => a.earned).length}/{data.achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.achievements.map((achievement, index) => {
                const IconComponent = getAchievementIcon(achievement.icon);
                const RarityIcon = getRarityIcon(achievement.rarity);
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                      achievement.earned 
                        ? getRarityColor(achievement.rarity)
                        : 'border-slate-600 bg-slate-700/30 opacity-60'
                    }`}
                  >
                    {/* Rarity indicator */}
                    <div className="absolute top-1 right-1">
                      <RarityIcon className={`h-3 w-3 ${
                        achievement.earned 
                          ? achievement.rarity === 'legendary' ? 'text-yellow-400' :
                            achievement.rarity === 'epic' ? 'text-purple-400' :
                            achievement.rarity === 'rare' ? 'text-blue-400' : 'text-slate-400'
                          : 'text-slate-600'
                      }`} />
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-white/10' : 'bg-slate-600/30'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          achievement.earned ? 'text-white' : 'text-slate-500'
                        }`} />
                      </div>
                      <div className={`text-sm font-medium mb-1 ${
                        achievement.earned ? 'text-white' : 'text-slate-500'
                      }`}>
                        {achievement.title}
                      </div>
                      <div className={`text-xs ${
                        achievement.earned ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {achievement.description}
                      </div>
                      
                      {/* Progress bar for unearned achievements */}
                      {!achievement.earned && achievement.progress !== undefined && achievement.maxProgress && (
                        <div className="mt-2">
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="h-1" 
                          />
                          <div className="text-xs text-slate-500 mt-1">
                            {achievement.progress}/{achievement.maxProgress}
                          </div>
                        </div>
                      )}

                      {/* Earned date */}
                      {achievement.earned && achievement.earnedDate && (
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(achievement.earnedDate).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bảng xếp hạng tuần
              <Badge variant="outline" className="ml-auto">
                #{data.weeklyRank}/{data.totalUsers}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.isCurrentUser 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'bg-slate-700/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    entry.rank === 1 ? 'bg-yellow-500 text-black' :
                    entry.rank === 2 ? 'bg-slate-300 text-black' :
                    entry.rank === 3 ? 'bg-orange-500 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {entry.rank}
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {entry.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className={`font-medium ${entry.isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                      {entry.name} {entry.isCurrentUser && '(Bạn)'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-yellow-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">{entry.score.toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default GamificationDashboard;

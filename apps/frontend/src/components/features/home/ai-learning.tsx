"use client";

import { Brain, LineChart, Target, Users, Sparkles, TrendingUp, BookOpen, ArrowRight, Zap, Lightbulb, Award } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Import mockdata
import { aiLearningData } from "@/lib/mockdata";

// Import new interactive components
// import { InteractiveChart } from "@/components/ui/display";

// Icon mapping
const iconMap = {
  Target: Target,
  LineChart: LineChart,
  Brain: Brain,
  Users: Users,
  Sparkles: Sparkles
};

const AILearning = () => {
  // Interactive chart data for learning progress with percentage completion
  const learningProgressData = [
    { label: "Đại số", value: 75, color: "text-blue-400", target: 90, growthRate: 12 },
    { label: "Hình học", value: 60, color: "text-purple-400", target: 85, growthRate: 8 },
    { label: "Giải tích", value: 45, color: "text-pink-400", target: 80, growthRate: 15 },
    { label: "Số học", value: 90, color: "text-emerald-400", target: 95, growthRate: 5 }
  ];

  // Real progress data for second chart with percentage completion
  const realProgressData = [
    { label: "Tuần 1", value: 85, color: "text-emerald-400", growthRate: 20 },
    { label: "Tuần 2", value: 78, color: "text-blue-400", growthRate: 25 },
    { label: "Tuần 3", value: 92, color: "text-purple-400", growthRate: 40 },
    { label: "Tuần 4", value: 88, color: "text-amber-400", growthRate: 60 }
  ];



  // Progress chart data - 8 chapters
  const progressData = [
    { label: "Chương 1", current: 8, target: 10, color: "text-emerald-400", status: "completed" as const },
    { label: "Chương 2", current: 6, target: 10, color: "text-blue-400", status: "in-progress" as const },
    { label: "Chương 3", current: 3, target: 10, color: "text-amber-400", status: "in-progress" as const },
    { label: "Chương 4", current: 0, target: 10, color: "text-slate-400", status: "pending" as const },
    { label: "Chương 5", current: 0, target: 10, color: "text-slate-400", status: "pending" as const },
    { label: "Chương 6", current: 0, target: 10, color: "text-slate-400", status: "pending" as const },
    { label: "Chương 7", current: 0, target: 10, color: "text-slate-400", status: "pending" as const },
    { label: "Chương 8", current: 0, target: 10, color: "text-slate-400", status: "pending" as const }
  ];

  // New achievements data
  const newAchievements = [
    { title: "Hoàn thành 5 bài học liên tiếp", points: 50, icon: "🎯" },
    { title: "Đạt điểm tối đa môn Toán", points: 100, icon: "🏆" },
    { title: "Học tập 7 ngày liên tục", points: 75, icon: "🔥" }
  ];

  return (
    <section
      id="ai-learning-section"
      className="relative h-[1080px] overflow-hidden bg-background" // Tăng height để chứa ScrollIndicator
    >
      <div className="container px-4 mx-auto relative z-10 h-full flex flex-col mt-25">

        {/* HEADER SECTION - Compact 100px để đảm bảo text hiển thị đầy đủ */}
        <div className="h-[100px] flex items-start justify-center pt-6 pb-4">
          <div className="text-center">
            {/* Enhanced badge with modern design similar to Features component */}
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-emerald-500/15 text-blue-400 backdrop-blur-sm mb-4 transition-all duration-500 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: `linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 50%, rgba(16, 185, 129, 0.15) 100%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`
              }}
            >
              {/* Subtle background pattern for badge */}
              <div className="absolute inset-0 opacity-30">
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(147, 197, 253, 0.4) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.4) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px, 30px 30px',
                    animation: 'float-subtle 8s ease-in-out infinite'
                  }}
                />
              </div>
              
              {/* Enhanced icon with glow effect */}
              <motion.div
                className="relative z-10 mr-2"
                animate={{
                  scale: [1, 1.05, 1],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }}
              >
                <div className="relative">
                  <Zap className="h-4 w-4 text-badge-light drop-shadow-lg" />
                  {/* Glow effect */}
                  <div className="absolute inset-0 h-4 w-4 bg-badge-light rounded-full opacity-20 blur-sm animate-pulse"></div>
                </div>
              </motion.div>

              {/* Enhanced text with better typography - Improved Light mode contrast */}
              <span className="font-bold text-badge-light text-sm tracking-wide relative z-10">
                {aiLearningData.badge.text}
              </span>
              
              {/* Subtle border glow effect */}
              <div className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Hover shine effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 leading-relaxed py-1">
              {aiLearningData.title}
            </h2>
            <p className="text-foreground text-sm max-w-2xl mx-auto leading-relaxed">
              {aiLearningData.subtitle}
            </p>
          </div>
        </div>

        {/* MAIN CONTENT SECTION - Căn chỉnh từ trên xuống để tránh bị dịch lên */}
        <div className="flex-1 py-4" style={{ marginTop: '140px' }}>
          <div className="grid grid-cols-3 gap-8 items-start w-full max-h-[884px]">

            {/* LEFT COLUMN - 1/3 width - AI Features + CTA */}
            <div className="col-span-1 space-y-3">
              {aiLearningData.features.map((feature, index) => {
                const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
                const accentColors = [
                  "from-blue-400/20 to-blue-500/20 border-blue-400/30 text-blue-400",
                  "from-purple-400/20 to-purple-500/20 border-purple-400/30 text-purple-400",
                  "from-emerald-400/20 to-emerald-500/20 border-emerald-400/30 text-emerald-400"
                ];

                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="bg-card/50 backdrop-blur-md border border-border rounded-lg p-4 hover:bg-card hover:border-blue-400/30 hover:shadow-xl hover:shadow-blue-400/10 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md bg-gradient-to-br ${accentColors[index]} flex items-center justify-center transition-all duration-300`}>
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-blue-300 transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-foreground text-xs leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* CTA Button */}
              <div className="mt-3">
                <Link
                  href={aiLearningData.ctaButton.href}
                  className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 text-sm"
                >
                  {aiLearningData.ctaButton.text}
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN - 2/3 width - Charts + AI Analysis + Progress Overview */}
            <div className="col-span-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-emerald-400/10 rounded-3xl blur-2xl"></div>

              <div className="relative space-y-6 max-h-[780px]">

                {/* TOP ROW - Two Progress Charts Side by Side */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Chart 1: Tiến độ học tập - Bar Chart */}
                  <div className="bg-card/50 backdrop-blur-md border border-border rounded-lg p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-400/20 to-blue-500/20 text-blue-400 flex items-center justify-center">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">Tiến độ học tập</h4>
                    </div>

                    {/* Bar Chart Container */}
                    <div className="relative" style={{ height: '156px' }}>
                      {/* Bar chart for learning progress */}
                      <div className="absolute inset-0 flex items-end justify-between gap-3 px-2">
                        {learningProgressData.map((point, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            {/* Single progress bar with gradient */}
                            <div className="relative w-full max-w-[40px] mx-auto">
                              {/* Background bar */}
                              <div className="w-full bg-muted/50 rounded-lg" style={{ height: '120px' }} />
                              {/* Progress bar with gradient */}
                              <div
                                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-lg transition-all duration-500 hover:from-blue-400 hover:to-blue-200"
                                style={{ height: `${(point.value / 100) * 120}px` }}
                              />
                              {/* Value label on top of bar */}
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-blue-300">
                                {point.value}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="mt-2 flex justify-between text-xs text-foreground">
                      {learningProgressData.map((point, index) => (
                        <span key={index} className="text-center flex-1 truncate">
                          {point.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chart 2: Tiến bộ thực tế - Line Chart */}
                  <div className="bg-card/50 backdrop-blur-md border border-border rounded-lg p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400/20 to-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">Tiến bộ thực tế</h4>
                    </div>

                    {/* Line Chart Container */}
                    <div className="relative" style={{ height: '156px' }}>
                      {/* Grid background */}
                      <div className="absolute inset-0">
                        {/* Horizontal grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-px bg-border" />
                          ))}
                        </div>
                        {/* Vertical grid lines */}
                        <div className="absolute inset-0 flex justify-between">
                          {realProgressData.map((_, i) => (
                            <div key={i} className="w-px bg-border h-full" />
                          ))}
                        </div>
                      </div>

                      {/* Line chart */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#34D399" />
                          </linearGradient>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>

                        {/* Area under the line */}
                        <path
                          fill="url(#areaGradient)"
                          d={`M ${realProgressData.map((point, index) =>
                            `${(index / (realProgressData.length - 1)) * 100} ${100 - point.value}`
                          ).join(' L ')} L 100 100 L 0 100 Z`}
                        />

                        {/* Main line */}
                        <polyline
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={realProgressData.map((point, index) =>
                            `${(index / (realProgressData.length - 1)) * 100},${100 - point.value}`
                          ).join(' ')}
                        />

                        {/* Data points */}
                        {realProgressData.map((point, index) => (
                          <circle
                            key={index}
                            cx={(index / (realProgressData.length - 1)) * 100}
                            cy={100 - point.value}
                            r="2"
                            fill="#10B981"
                            stroke="#ffffff"
                            strokeWidth="1"
                            className="hover:r-3 transition-all duration-200"
                          />
                        ))}
                      </svg>

                      {/* Value labels */}
                      <div className="absolute inset-0">
                        {realProgressData.map((point, index) => (
                          <div
                            key={index}
                            className="absolute text-xs font-semibold text-emerald-300 bg-card/80 px-1 py-0.5 rounded"
                            style={{
                              left: `${(index / (realProgressData.length - 1)) * 100}%`,
                              top: `${100 - point.value}%`,
                              transform: 'translate(-50%, -120%)'
                            }}
                          >
                            {point.value}%
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Labels */}
                    <div className="mt-2 flex justify-between text-xs text-foreground">
                      {realProgressData.map((point, index) => (
                        <span key={index} className="text-center flex-1 truncate">
                          {point.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ROW - New Achievements + Progress Overview */}
                <div className="grid grid-cols-3 gap-6">
                  {/* New Achievements - Left side */}
                  <div className="col-span-1 bg-card/50 backdrop-blur-md border border-border rounded-lg p-3 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400/20 to-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Award className="h-3 w-3" />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">Thành tích mới</h4>
                    </div>

                    <div className="space-y-2">
                      {newAchievements.map((achievement, index) => (
                        <div key={index} className="bg-muted/50 rounded-md p-2 border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{achievement.icon}</span>
                            <span className="text-xs text-foreground flex-1 truncate">{achievement.title}</span>
                          </div>
                          <div className="text-xs text-amber-400 font-medium">+{achievement.points} điểm</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Overview - Right side (2/3 width) */}
                  <div className="col-span-2 bg-card/50 backdrop-blur-md border border-border rounded-lg p-3 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400/20 to-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <BookOpen className="h-3 w-3" />
                      </div>
                      <h4 className="font-semibold text-foreground text-base">Tổng quan chương trình</h4>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {progressData.map((chapter, index) => (
                        <div key={index} className="text-center">
                          <div className={`w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-medium ${
                            chapter.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            chapter.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {chapter.current}/{chapter.target}
                          </div>
                          <div className="text-sm text-foreground truncate">{chapter.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating notification - Cải thiện vị trí để không che khuất nội dung */}
                <div className="absolute bg-gradient-to-r from-emerald-500/90 to-blue-500/90 backdrop-blur-md border border-white/20 p-2 rounded-lg shadow-2xl w-48 transition-all duration-300 z-20" style={{ bottom: '-36px', right: '-24px' }}>
                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-white/20 text-white">
                      <Lightbulb className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium text-white text-xs">{aiLearningData.dashboard.notification.title}</h5>
                      <p className="text-xs text-white/80 mt-0.5 leading-relaxed">{aiLearningData.dashboard.notification.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>





      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.02); }
        }
      `}</style>
    </section>
  );
};

export default AILearning;

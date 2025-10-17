/**
 * Leaderboard Coming Soon Page
 * Trang Coming Soon cho tính năng Leaderboard - dự kiến ra mắt Q2 2025
 * 
 * Features:
 * - Amber-yellow-lime gradient background
 * - BarChart3 icon with pulse animation
 * - 4 feature preview cards
 * - SEO optimized metadata
 * - Responsive design
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, Home, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LeaderboardComingSoonPage() {
  // Feature preview cards data
  const featureCards = [
    {
      title: "Xếp hạng toàn cầu",
      description: "Cạnh tranh với học sinh trên toàn quốc và xem vị trí của bạn trên bảng xếp hạng"
    },
    {
      title: "Bảng xếp hạng theo môn",
      description: "Xem thứ hạng riêng cho từng môn học và chủ đề cụ thể"
    },
    {
      title: "Cuộc thi hàng tuần/tháng",
      description: "Tham gia các cuộc thi định kỳ với phần thưởng hấp dẫn cho top performers"
    },
    {
      title: "Showcase thành tích",
      description: "Hiển thị huy hiệu và thành tích nổi bật trên profile cá nhân"
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background - Amber-Yellow-Lime theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-lime-500/20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-lime-500/5"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              Tính năng này đang được phát triển và sẽ ra mắt trong Q2 2025. 
              <Link href="/contact" className="ml-2 underline hover:text-blue-600 dark:hover:text-blue-400">
                Liên hệ để biết thêm
              </Link>
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Icon & Title Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-16"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-24 h-24 bg-gradient-to-br from-amber-500 to-lime-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
          >
            <BarChart3 className="h-12 w-12 text-white" />
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-400 to-lime-400">
            Leaderboard
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Bảng xếp hạng toàn diện, tạo động lực cạnh tranh lành mạnh và ghi nhận thành tích học tập
          </p>
          
          {/* Timeline */}
          <p className="text-lg text-muted-foreground mt-4">
            Dự kiến ra mắt: <span className="font-semibold text-foreground">Q2 2025</span>
          </p>
        </motion.div>

        {/* Feature Preview Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:bg-card hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {card.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 min-h-[44px]"
          >
            <Link href="/contact">
              <ArrowRight className="w-5 h-5 mr-2" />
              Liên hệ tư vấn
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}


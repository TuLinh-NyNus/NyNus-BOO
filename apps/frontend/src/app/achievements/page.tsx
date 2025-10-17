/**
 * Achievements Coming Soon Page
 * Trang Coming Soon cho tính năng Achievements - dự kiến ra mắt Q2 2025
 * 
 * Features:
 * - Yellow-orange-red gradient background
 * - Trophy icon with pulse animation
 * - 4 feature preview cards
 * - SEO optimized metadata
 * - Responsive design
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Home, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AchievementsComingSoonPage() {
  // Feature preview cards data
  const featureCards = [
    {
      title: "Bộ sưu tập huy hiệu",
      description: "Thu thập hàng trăm huy hiệu đặc biệt khi đạt được các thành tích trong học tập"
    },
    {
      title: "Hệ thống điểm",
      description: "Tích lũy điểm kinh nghiệm và level up qua các hoạt động học tập hàng ngày"
    },
    {
      title: "Tích hợp bảng xếp hạng",
      description: "So sánh thành tích với bạn bè và cộng đồng học sinh trên toàn quốc"
    },
    {
      title: "Chia sẻ xã hội",
      description: "Khoe thành tích trên mạng xã hội và truyền cảm hứng cho người khác"
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background - Yellow-Orange-Red theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-red-500/20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

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
            className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
          >
            <Trophy className="h-12 w-12 text-white" />
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
            Achievements
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Hệ thống thành tích và phần thưởng, tạo động lực học tập thông qua gamification
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
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
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


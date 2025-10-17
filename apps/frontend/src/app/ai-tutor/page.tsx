/**
 * AI Tutor Coming Soon Page
 * Trang Coming Soon cho tính năng AI Tutor - dự kiến ra mắt Q1 2025
 *
 * Features:
 * - Purple-blue-cyan gradient background
 * - Bot icon with pulse animation
 * - 4 feature preview cards
 * - SEO optimized metadata
 * - Responsive design
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Home, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AITutorComingSoonPage() {
  // Feature preview cards data
  const featureCards = [
    {
      title: "Học tập cá nhân hóa",
      description: "AI phân tích điểm mạnh/yếu và đề xuất lộ trình học tập phù hợp với từng học sinh"
    },
    {
      title: "Phản hồi thời gian thực",
      description: "Nhận giải thích chi tiết và gợi ý ngay lập tức khi làm bài tập"
    },
    {
      title: "Độ khó thích ứng",
      description: "Hệ thống tự động điều chỉnh độ khó dựa trên năng lực và tiến độ học tập"
    },
    {
      title: "Hỗ trợ 24/7",
      description: "AI Tutor luôn sẵn sàng giải đáp thắc mắc mọi lúc mọi nơi"
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background - Purple-Blue-Cyan theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-cyan-500/20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

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
              Tính năng này đang được phát triển và sẽ ra mắt trong Q1 2025. 
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
            className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
          >
            <Bot className="h-12 w-12 text-white" />
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            AI Tutor
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Trợ lý học tập thông minh được hỗ trợ bởi AI, giúp bạn học tập hiệu quả hơn với lộ trình cá nhân hóa
          </p>
          
          {/* Timeline */}
          <p className="text-lg text-muted-foreground mt-4">
            Dự kiến ra mắt: <span className="font-semibold text-foreground">Q1 2025</span>
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
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]"
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


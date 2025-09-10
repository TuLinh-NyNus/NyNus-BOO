"use client";

import { Book, Play, Users, MessageSquare, Search, ArrowRight, CheckCircle, Star, Clock, FileText, Video, Headphones, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const quickActions = [
  {
    icon: Search,
    title: "Tìm kiếm nhanh",
    description: "Tìm kiếm câu trả lời trong cơ sở dữ liệu",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400",
    href: "/faq"
  },
  {
    icon: Video,
    title: "Video hướng dẫn",
    description: "Xem video hướng dẫn chi tiết",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-400",
    href: "/huong-dan"
  },
  {
    icon: MessageSquare,
    title: "Chat trực tiếp",
    description: "Trò chuyện với đội ngũ hỗ trợ",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
    href: "/support"
  },
  {
    icon: Phone,
    title: "Gọi hotline",
    description: "Liên hệ qua điện thoại",
    gradient: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-400",
    href: "tel:1900-xxxx"
  }
];

const helpCategories = [
  {
    id: "getting-started",
    title: "Bắt đầu với NyNus",
    icon: Book,
    gradient: "from-blue-500/20 via-blue-400/10 to-indigo-500/20",
    iconColor: "text-blue-400",
    articles: [
      { title: "Tạo tài khoản và đăng nhập", duration: "3 phút đọc" },
      { title: "Thiết lập hồ sơ học tập", duration: "5 phút đọc" },
      { title: "Khám phá giao diện chính", duration: "4 phút đọc" },
      { title: "Chọn khóa học phù hợp", duration: "6 phút đọc" },
      { title: "Cài đặt thông báo", duration: "2 phút đọc" }
    ]
  },
  {
    id: "learning-features",
    title: "Tính năng học tập",
    icon: Play,
    gradient: "from-purple-500/20 via-purple-400/10 to-violet-500/20",
    iconColor: "text-purple-400",
    articles: [
      { title: "Sử dụng AI để học tập cá nhân", duration: "8 phút đọc" },
      { title: "Làm bài tập và kiểm tra", duration: "6 phút đọc" },
      { title: "Theo dõi tiến độ học tập", duration: "4 phút đọc" },
      { title: "Tạo lộ trình học tập", duration: "7 phút đọc" },
      { title: "Sử dụng flashcards", duration: "3 phút đọc" }
    ]
  },
  {
    id: "account-management",
    title: "Quản lý tài khoản",
    icon: Users,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-teal-500/20",
    iconColor: "text-emerald-400",
    articles: [
      { title: "Nâng cấp lên Premium", duration: "5 phút đọc" },
      { title: "Quản lý thông tin cá nhân", duration: "3 phút đọc" },
      { title: "Cài đặt bảo mật", duration: "4 phút đọc" },
      { title: "Chia sẻ tài khoản gia đình", duration: "6 phút đọc" },
      { title: "Xuất dữ liệu học tập", duration: "3 phút đọc" }
    ]
  },
  {
    id: "troubleshooting",
    title: "Khắc phục sự cố",
    icon: MessageSquare,
    gradient: "from-amber-500/20 via-amber-400/10 to-orange-500/20",
    iconColor: "text-amber-400",
    articles: [
      { title: "Giải quyết lỗi đăng nhập", duration: "4 phút đọc" },
      { title: "Khắc phục lỗi video không tải", duration: "5 phút đọc" },
      { title: "Đồng bộ dữ liệu giữa thiết bị", duration: "6 phút đọc" },
      { title: "Khôi phục tiến độ bị mất", duration: "7 phút đọc" },
      { title: "Tối ưu hiệu suất ứng dụng", duration: "5 phút đọc" }
    ]
  }
];

const commonIssues = [
  {
    title: "Không thể đăng nhập",
    description: "Hướng dẫn chi tiết để giải quyết vấn đề đăng nhập",
    rating: 4.9,
    views: "12.5k",
    category: "Tài khoản"
  },
  {
    title: "AI không hoạt động đúng",
    description: "Cách cải thiện độ chính xác của AI cá nhân hóa",
    rating: 4.8,
    views: "8.3k",
    category: "Học tập"
  },
  {
    title: "Video bài học không tải",
    description: "Khắc phục lỗi phát video và kết nối mạng",
    rating: 4.7,
    views: "15.2k",
    category: "Kỹ thuật"
  },
  {
    title: "Thanh toán không thành công",
    description: "Giải quyết vấn đề thanh toán và nâng cấp gói",
    rating: 4.9,
    views: "6.1k",
    category: "Thanh toán"
  }
];

function HelpCategory({ category, index }: { category: typeof helpCategories[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`bg-gradient-to-br ${category.gradient} backdrop-blur-sm border border-white/10 rounded-2xl p-6`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10`}>
          <category.icon className={`w-6 h-6 ${category.iconColor}`} />
        </div>
        <h3 className="text-2xl font-bold text-foreground">{category.title}</h3>
      </div>
      
      <div className="space-y-3">
        {category.articles.map((article, articleIndex) => (
          <Link 
            key={articleIndex}
            href={`/help/${category.id}/${articleIndex + 1}`}
            className="group block p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-foreground font-medium group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{article.duration}</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Multiple Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F1F47] via-[#252560] to-[#2D2B69]"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-pink-500/10"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Trung tâm trợ giúp
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Tìm hướng dẫn, mẹo và giải pháp cho mọi vấn đề của bạn
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              className="relative max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hướng dẫn, FAQ, video..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="relative z-10 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hành động nhanh
            </h2>
            <p className="text-slate-300 text-lg">
              Những cách nhanh nhất để nhận được sự hỗ trợ
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link 
                  href={action.href}
                  className={`group block p-6 bg-gradient-to-br ${action.gradient} backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{action.title}</h3>
                    <p className="text-slate-300 text-sm">{action.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="relative z-10 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Danh mục hướng dẫn
            </h2>
            <p className="text-slate-300 text-lg">
              Tìm hướng dẫn chi tiết theo từng chủ đề
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {helpCategories.map((category, index) => (
              <HelpCategory key={category.id} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="relative z-10 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Vấn đề phổ biến
            </h2>
            <p className="text-slate-300 text-lg">
              Những bài hướng dẫn được xem nhiều nhất
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commonIssues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link 
                  href={`/help/article/${index + 1}`}
                  className="group block p-6 bg-gradient-to-br from-white/5 via-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                      {issue.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-slate-400">{issue.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-slate-300 text-sm mb-3">{issue.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{issue.views} lượt xem</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Hỗ trợ đa dạng và chuyên nghiệp
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                Chúng tôi cung cấp nhiều kênh hỗ trợ khác nhau để đảm bảo bạn luôn nhận được sự giúp đỡ khi cần
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: FileText, text: "Hướng dẫn chi tiết từng bước" },
                  { icon: Video, text: "Video hướng dẫn trực quan" },
                  { icon: Headphones, text: "Hỗ trợ trực tiếp 24/7" },
                  { icon: CheckCircle, text: "Giải quyết nhanh chóng" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Liên hệ trực tiếp
              </h3>
              
              <div className="space-y-4">
                <Link 
                  href="mailto:support@nynus.edu.vn"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Email hỗ trợ</h4>
                    <p className="text-slate-400 text-sm">support@nynus.edu.vn</p>
                  </div>
                </Link>
                
                <Link 
                  href="tel:1900-xxxx"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Hotline</h4>
                    <p className="text-slate-400 text-sm">1900-xxxx</p>
                  </div>
                </Link>
                
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Giờ làm việc</h4>
                    <p className="text-slate-400 text-sm">8:00 - 22:00 hàng ngày</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  href="/support"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                  Trung tâm hỗ trợ
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
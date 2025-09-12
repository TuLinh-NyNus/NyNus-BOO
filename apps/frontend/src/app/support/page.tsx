"use client";

import { HelpCircle, MessageCircle, Phone, Mail, Clock, Users, Headphones, Search, ArrowRight, CheckCircle, AlertCircle, Book, Video } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const supportCategories = [
  {
    id: "technical",
    title: "Hỗ trợ kỹ thuật",
    icon: HelpCircle,
    gradient: "from-blue-500/20 via-blue-400/10 to-indigo-500/20",
    iconColor: "text-blue-400",
    description: "Giải quyết các vấn đề kỹ thuật và lỗi hệ thống",
    items: [
      "Không thể đăng nhập vào tài khoản",
      "Lỗi tải trang hoặc chức năng không hoạt động",
      "Vấn đề với video hoặc âm thanh",
      "Khôi phục mật khẩu",
      "Đồng bộ dữ liệu giữa các thiết bị"
    ]
  },
  {
    id: "account",
    title: "Quản lý tài khoản",
    icon: Users,
    gradient: "from-purple-500/20 via-purple-400/10 to-violet-500/20",
    iconColor: "text-purple-400",
    description: "Hỗ trợ về tài khoản, thanh toán và gói dịch vụ",
    items: [
      "Nâng cấp hoặc hủy gói Premium",
      "Thay đổi thông tin cá nhân",
      "Vấn đề thanh toán và hóa đơn",
      "Chuyển đổi loại tài khoản",
      "Xóa tài khoản vĩnh viễn"
    ]
  },
  {
    id: "learning",
    title: "Hỗ trợ học tập",
    icon: Book,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-teal-500/20",
    iconColor: "text-emerald-400",
    description: "Hướng dẫn sử dụng tính năng và phương pháp học",
    items: [
      "Cách sử dụng AI để học tập hiệu quả",
      "Theo dõi tiến độ và báo cáo kết quả",
      "Tạo lộ trình học tập cá nhân",
      "Sử dụng bài tập và kiểm tra",
      "Tối ưu hóa thời gian học"
    ]
  },
  {
    id: "content",
    title: "Nội dung khóa học",
    icon: Video,
    gradient: "from-amber-500/20 via-amber-400/10 to-orange-500/20",
    iconColor: "text-amber-400",
    description: "Câu hỏi về nội dung bài học và chương trình",
    items: [
      "Giải thích bài tập khó",
      "Yêu cầu thêm ví dụ minh họa",
      "Báo cáo lỗi nội dung",
      "Đề xuất chủ đề mới",
      "Tìm kiếm tài liệu bổ sung"
    ]
  }
];

const contactMethods = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    subtitle: "Phản hồi ngay lập tức",
    description: "Trò chuyện trực tiếp với đội ngũ hỗ trợ",
    availability: "24/7",
    color: "text-green-400",
    gradient: "from-green-500/20 to-emerald-500/20",
    href: "#"
  },
  {
    icon: Mail,
    title: "Email",
    subtitle: "support@nynus.edu.vn",
    description: "Gửi email chi tiết về vấn đề của bạn",
    availability: "Phản hồi trong 2-4 giờ",
    color: "text-blue-400",
    gradient: "from-blue-500/20 to-indigo-500/20",
    href: "mailto:support@nynus.edu.vn"
  },
  {
    icon: Phone,
    title: "Hotline",
    subtitle: "1900-xxxx",
    description: "Gọi trực tiếp để được hỗ trợ nhanh chóng",
    availability: "8:00 - 22:00 hàng ngày",
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-red-500/20",
    href: "tel:1900-xxxx"
  }
];

const commonIssues = [
  {
    question: "Tôi quên mật khẩu, làm sao để đặt lại?",
    answer: "Truy cập trang đăng nhập, nhấn 'Quên mật khẩu', nhập email của bạn và làm theo hướng dẫn trong email được gửi."
  },
  {
    question: "Tại sao video bài học không tải được?",
    answer: "Kiểm tra kết nối internet, xóa cache trình duyệt, hoặc thử trình duyệt khác. Nếu vẫn không được, liên hệ với chúng tôi."
  },
  {
    question: "Làm thế nào để nâng cấp lên gói Premium?",
    answer: "Vào Cài đặt tài khoản > Gói dịch vụ > Chọn gói Premium và thanh toán theo hướng dẫn."
  },
  {
    question: "AI không đưa ra gợi ý phù hợp, tại sao?",
    answer: "AI cần thời gian để học về phong cách học của bạn. Hãy làm thêm bài tập để cải thiện độ chính xác của gợi ý."
  }
];

function SupportCategory({ category, index }: { category: typeof supportCategories[0], index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`bg-gradient-to-br ${category.gradient} backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10`}>
          <category.icon className={`w-6 h-6 ${category.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowRight className="h-5 w-5 text-muted-foreground transform rotate-90" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-white/10">
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIssues = commonIssues.filter(issue =>
    issue.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Theme Gradients */}
      <div className="absolute inset-0 gradient-hero"></div>
      <div className="absolute inset-0 gradient-overlay"></div>
      
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
              Trung tâm hỗ trợ
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Chúng tôi luôn sẵn sàng hỗ trợ bạn trong hành trình học tập
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
                  placeholder="Tìm kiếm vấn đề cần hỗ trợ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Contact Methods */}
      <section className="relative z-10 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Liên hệ với chúng tôi
            </h2>
            <p className="text-slate-300 text-lg">
              Chọn phương thức liên hệ phù hợp với nhu cầu của bạn
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link 
                  href={method.href}
                  className={`group block p-6 bg-gradient-to-br ${method.gradient} backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <method.icon className={`w-8 h-8 ${method.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                    <p className={`font-medium mb-2 ${method.color}`}>{method.subtitle}</p>
                    <p className="text-slate-300 text-sm mb-3">{method.description}</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{method.availability}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="relative z-10 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Danh mục hỗ trợ
            </h2>
            <p className="text-slate-300 text-lg">
              Tìm hiểu về các dịch vụ hỗ trợ mà chúng tôi cung cấp
            </p>
          </motion.div>

          <div className="space-y-6">
            {supportCategories.map((category, index) => (
              <SupportCategory key={category.id} category={category} index={index} />
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
              Vấn đề thường gặp
            </h2>
            <p className="text-slate-300 text-lg">
              Các câu hỏi được hỏi nhiều nhất và cách giải quyết
            </p>
          </motion.div>

          <div className="space-y-4">
            {(searchQuery ? filteredIssues : commonIssues).map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/5 via-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-400" />
                  {issue.question}
                </h3>
                <p className="text-slate-300 leading-relaxed">{issue.answer}</p>
              </motion.div>
            ))}
          </div>

          {searchQuery && filteredIssues.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">Không tìm thấy kết quả phù hợp</p>
              <p className="text-slate-400">Hãy thử từ khóa khác hoặc liên hệ trực tiếp với chúng tôi</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Support Hours */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Headphones className="h-16 w-16 text-blue-400 mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Giờ làm việc hỗ trợ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-white font-semibold mb-2">Live Chat</h4>
                <p className="text-slate-300">24/7 - Luôn sẵn sàng</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Điện thoại & Email</h4>
                <p className="text-slate-300">8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
              </div>
            </div>
            
            <div className="space-x-4">
              <Link 
                href="/faq"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                Xem FAQ
              </Link>
              <Link 
                href="/lien-he"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Liên hệ ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
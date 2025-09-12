"use client";

import { Bug, Info, Send, Camera, FileText, MessageCircle, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const bugTypes = [
  {
    value: "ui-ux",
    label: "Giao diện người dùng",
    description: "Lỗi về layout, màu sắc, font chữ, responsive",
    icon: "🎨",
    gradient: "from-blue-500/20 to-indigo-500/20"
  },
  {
    value: "functionality",
    label: "Chức năng",
    description: "Lỗi về tính năng, không hoạt động như mong đợi",
    icon: "⚙️",
    gradient: "from-purple-500/20 to-violet-500/20"
  },
  {
    value: "performance",
    label: "Hiệu suất",
    description: "Chậm, lag, tải trang lâu, crash",
    icon: "🚀",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    value: "content",
    label: "Nội dung",
    description: "Lỗi về bài học, câu hỏi, đáp án",
    icon: "📚",
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  {
    value: "account",
    label: "Tài khoản",
    description: "Lỗi đăng nhập, đăng ký, quản lý profile",
    icon: "👤",
    gradient: "from-pink-500/20 to-rose-500/20"
  },
  {
    value: "payment",
    label: "Thanh toán",
    description: "Lỗi về giao dịch, thanh toán, gói Premium",
    icon: "💳",
    gradient: "from-cyan-500/20 to-blue-500/20"
  }
];

const priorityLevels = [
  {
    value: "low",
    label: "Thấp",
    description: "Lỗi nhỏ, không ảnh hưởng đến việc sử dụng",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30"
  },
  {
    value: "medium",
    label: "Trung bình",
    description: "Lỗi gây khó chịu nhưng vẫn có thể sử dụng",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30"
  },
  {
    value: "high",
    label: "Cao",
    description: "Lỗi nghiêm trọng, ảnh hưởng đến trải nghiệm",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30"
  },
  {
    value: "critical",
    label: "Nghiêm trọng",
    description: "Lỗi khiến không thể sử dụng được tính năng",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30"
  }
];

const reportingTips = [
  {
    icon: Camera,
    title: "Chụp ảnh màn hình",
    description: "Chụp ảnh màn hình lỗi để chúng tôi hiểu rõ hơn về vấn đề",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400"
  },
  {
    icon: FileText,
    title: "Mô tả chi tiết",
    description: "Mô tả các bước thực hiện trước khi gặp lỗi",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-400"
  },
  {
    icon: MessageCircle,
    title: "Thông tin hệ thống",
    description: "Cung cấp thông tin về trình duyệt, thiết bị, hệ điều hành",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  }
];

const processSteps = [
  {
    step: "1",
    title: "Tiếp nhận",
    description: "Chúng tôi nhận báo cáo và phân loại mức độ ưu tiên",
    icon: CheckCircle,
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400"
  },
  {
    step: "2",
    title: "Phân tích",
    description: "Đội ngũ kỹ thuật phân tích và tái hiện lỗi",
    icon: AlertCircle,
    gradient: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-400"
  },
  {
    step: "3",
    title: "Khắc phục",
    description: "Phát triển và kiểm tra giải pháp khắc phục",
    icon: Zap,
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400"
  },
  {
    step: "4",
    title: "Cập nhật",
    description: "Triển khai bản cập nhật và thông báo cho bạn",
    icon: Clock,
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400"
  }
];

export function BugReportForm() {
  const [selectedBugType, setSelectedBugType] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

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
      <section className="relative z-10 pt-32 pb-20">
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
              Báo cáo{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
                lỗi
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Giúp chúng tôi cải thiện NyNus bằng cách báo cáo lỗi hoặc vấn đề bạn gặp phải. 
              Mỗi báo cáo đều rất quan trọng để chúng tôi tạo ra trải nghiệm tốt hơn.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Reporting Tips */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Mẹo báo cáo lỗi hiệu quả</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Để chúng tôi có thể khắc phục lỗi nhanh chóng, hãy cung cấp thông tin chi tiết nhất có thể
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {reportingTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className={`p-6 bg-gradient-to-br ${tip.gradient} backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105`}>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <tip.icon className={`w-6 h-6 ${tip.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3 text-center">{tip.title}</h3>
                  <p className="text-slate-300 text-center">{tip.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bug Report Form */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Form báo cáo lỗi</h2>
            
            <form className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-slate-400 transition-all duration-300"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-slate-400 transition-all duration-300"
                    placeholder="Nhập email"
                  />
                </div>
              </div>

              {/* Bug Type */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-4">
                  Loại lỗi *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bugTypes.map((type) => (
                    <label 
                      key={type.value} 
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedBugType === type.value 
                          ? 'border-blue-400 bg-blue-500/20' 
                          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bugType"
                        value={type.value}
                        required
                        checked={selectedBugType === type.value}
                        onChange={(e) => setSelectedBugType(e.target.value)}
                        className="mt-1 w-4 h-4 text-blue-400 border-white/30 focus:ring-blue-400"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{type.icon}</span>
                          <div className="font-medium text-white">{type.label}</div>
                        </div>
                        <div className="text-sm text-slate-300">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Level */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-4">
                  Mức độ nghiêm trọng *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {priorityLevels.map((level) => (
                    <label 
                      key={level.value} 
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedPriority === level.value 
                          ? `${level.borderColor} ${level.bgColor}` 
                          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={level.value}
                        required
                        checked={selectedPriority === level.value}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="mt-1 w-4 h-4 text-blue-400 border-white/30 focus:ring-blue-400"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${level.color} mb-1`}>{level.label}</div>
                        <div className="text-sm text-slate-300">{level.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bug Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-200 mb-2">
                  Tiêu đề lỗi *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-slate-400 transition-all duration-300"
                  placeholder="Mô tả ngắn gọn về lỗi (VD: Không thể đăng nhập vào tài khoản)"
                />
              </div>

              {/* Bug Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
                  Mô tả chi tiết *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  required
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-slate-400 resize-none transition-all duration-300"
                  placeholder="Mô tả chi tiết về lỗi, bao gồm:&#10;- Các bước thực hiện trước khi gặp lỗi&#10;- Kết quả mong đợi&#10;- Kết quả thực tế&#10;- Tần suất xảy ra lỗi"
                ></textarea>
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label htmlFor="steps" className="block text-sm font-medium text-slate-200 mb-2">
                  Các bước tái hiện lỗi
                </label>
                <textarea
                  id="steps"
                  name="steps"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-slate-400 resize-none transition-all duration-300"
                  placeholder="1. Truy cập trang...&#10;2. Nhấn vào nút...&#10;3. Điền thông tin...&#10;4. Lỗi xảy ra..."
                ></textarea>
              </div>

              {/* System Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="browser" className="block text-sm font-medium text-slate-200 mb-2">
                    Trình duyệt
                  </label>
                  <input
                    type="text"
                    id="browser"
                    name="browser"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-slate-400 transition-all duration-300"
                    placeholder="VD: Chrome 120.0.6099.109"
                  />
                </div>
                <div>
                  <label htmlFor="device" className="block text-sm font-medium text-slate-200 mb-2">
                    Thiết bị
                  </label>
                  <input
                    type="text"
                    id="device"
                    name="device"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-slate-400 transition-all duration-300"
                    placeholder="VD: iPhone 15, Windows 11, MacBook Pro"
                  />
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <label htmlFor="screenshots" className="block text-sm font-medium text-slate-200 mb-2">
                  Ảnh chụp màn hình (nếu có)
                </label>
                <input
                  type="file"
                  id="screenshots"
                  name="screenshots"
                  multiple
                  accept="image/*"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30"
                />
                <p className="text-sm text-slate-400 mt-2">
                  Chụp ảnh màn hình lỗi để giúp chúng tôi hiểu rõ hơn về vấn đề
                </p>
              </div>

              {/* Additional Information */}
              <div>
                <label htmlFor="additional" className="block text-sm font-medium text-slate-200 mb-2">
                  Thông tin bổ sung
                </label>
                <textarea
                  id="additional"
                  name="additional"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-slate-400 resize-none transition-all duration-300"
                  placeholder="Bất kỳ thông tin bổ sung nào khác mà bạn nghĩ có thể hữu ích..."
                ></textarea>
              </div>

              {/* Privacy Consent */}
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  required
                  className="mt-1 w-4 h-4 text-blue-400 border-white/30 rounded focus:ring-blue-400"
                />
                <label htmlFor="privacy" className="text-sm text-slate-300">
                  Tôi đồng ý với{" "}
                  <a href="/privacy" className="text-blue-400 hover:underline">
                    Chính sách bảo mật
                  </a>{" "}
                  và cho phép NyNus sử dụng thông tin này để khắc phục lỗi
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 px-6 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                Gửi báo cáo lỗi
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Cách khác để báo cáo lỗi</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Nếu bạn gặp khó khăn với form trên, hãy sử dụng các phương thức khác
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Bug className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Email trực tiếp</h3>
              <p className="text-slate-300 mb-4">
                Gửi email chi tiết về lỗi cho đội ngũ kỹ thuật
              </p>
              <a
                href="mailto:bugs@nynus.edu.vn"
                className="text-blue-400 hover:underline font-medium"
              >
                bugs@nynus.edu.vn
              </a>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Chat hỗ trợ</h3>
              <p className="text-slate-300 mb-4">
                Chat trực tiếp với đội ngũ hỗ trợ để báo cáo lỗi
              </p>
              <a
                href="/lien-he"
                className="text-purple-400 hover:underline font-medium"
              >
                Mở chat ngay
              </a>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Info className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Xem FAQ</h3>
              <p className="text-slate-300 mb-4">
                Kiểm tra xem lỗi của bạn đã được giải quyết chưa
              </p>
              <a
                href="/faq"
                className="text-emerald-400 hover:underline font-medium"
              >
                Xem câu hỏi thường gặp
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Điều gì xảy ra tiếp theo?</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Quy trình xử lý báo cáo lỗi của chúng tôi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-300">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Cảm ơn bạn đã giúp cải thiện NyNus!
          </motion.h2>
          <motion.p 
            className="text-xl text-slate-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Mỗi báo cáo lỗi đều giúp chúng tôi tạo ra trải nghiệm tốt hơn cho tất cả người dùng
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a
              href="/lien-he"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300 font-medium transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Liên hệ hỗ trợ
            </a>
            <a
              href="/faq"
              className="inline-flex items-center px-8 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-300 font-medium text-white"
            >
              Xem FAQ
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

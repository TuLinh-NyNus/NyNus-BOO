"use client";

import { Shield, FileText, AlertTriangle, Scale, Users, Phone, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const termsData = [
  {
    id: "introduction",
    title: "1. Giới thiệu",
    icon: FileText,
    gradient: "from-blue-500/20 via-blue-400/10 to-indigo-500/20",
    iconColor: "text-blue-400",
    content: [
      "Chào mừng bạn đến với NyNus - nền tảng học toán thông minh với AI. Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây.",
      "Các điều khoản này có hiệu lực kể từ ngày bạn bắt đầu sử dụng dịch vụ và sẽ tiếp tục có hiệu lực cho đến khi bị chấm dứt theo quy định."
    ]
  },
  {
    id: "services",
    title: "2. Dịch vụ cung cấp",
    icon: Users,
    gradient: "from-purple-500/20 via-purple-400/10 to-violet-500/20",
    iconColor: "text-purple-400",
    content: [
      "NyNus cung cấp nền tảng học toán trực tuyến với các tính năng AI hỗ trợ học tập, bao gồm:",
      "• Khóa học toán từ lớp 1 đến lớp 12",
      "• Bài tập và kiểm tra trực tuyến",
      "• Hệ thống AI cá nhân hóa lộ trình học tập",
      "• Theo dõi tiến độ và báo cáo kết quả",
      "• Hỗ trợ từ đội ngũ giáo viên chuyên nghiệp"
    ]
  },
  {
    id: "user-responsibilities",
    title: "3. Trách nhiệm người dùng",
    icon: Shield,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-teal-500/20",
    iconColor: "text-emerald-400",
    content: [
      "Người dùng cam kết:",
      "• Cung cấp thông tin chính xác và đầy đủ khi đăng ký tài khoản",
      "• Không chia sẻ tài khoản hoặc thông tin đăng nhập với người khác",
      "• Sử dụng dịch vụ cho mục đích học tập và giáo dục",
      "• Không thực hiện các hành vi gian lận hoặc vi phạm bản quyền",
      "• Tuân thủ các quy định và hướng dẫn của NyNus"
    ]
  },
  {
    id: "intellectual-property",
    title: "4. Quyền sở hữu trí tuệ",
    icon: Scale,
    gradient: "from-amber-500/20 via-amber-400/10 to-orange-500/20",
    iconColor: "text-amber-400",
    content: [
      "Tất cả nội dung trên NyNus bao gồm văn bản, hình ảnh, video, bài tập và thuật toán AI đều thuộc sở hữu của NyNus hoặc các đối tác được ủy quyền.",
      "Người dùng không được:",
      "• Sao chép, phân phối hoặc sử dụng nội dung cho mục đích thương mại",
      "• Dịch ngược, giải mã hoặc tìm cách truy cập mã nguồn",
      "• Tạo ra các sản phẩm cạnh tranh dựa trên nội dung của NyNus"
    ]
  },
  {
    id: "payment-refund",
    title: "5. Thanh toán và hoàn tiền",
    icon: FileText,
    gradient: "from-pink-500/20 via-pink-400/10 to-rose-500/20",
    iconColor: "text-pink-400",
    content: [
      "Chính sách thanh toán:",
      "• Thanh toán được thực hiện qua các phương thức được chấp thuận",
      "• Phí dịch vụ được tính theo gói đăng ký đã chọn",
      "• Thuế VAT sẽ được áp dụng theo quy định pháp luật",
      "Chính sách hoàn tiền:",
      "• Hoàn tiền trong vòng 7 ngày nếu chưa sử dụng dịch vụ",
      "• Hoàn tiền tỷ lệ theo thời gian sử dụng cho các trường hợp đặc biệt",
      "• Không hoàn tiền cho các gói đã sử dụng quá 30% thời gian"
    ]
  },
  {
    id: "limitation",
    title: "6. Giới hạn trách nhiệm",
    icon: AlertTriangle,
    gradient: "from-red-500/20 via-red-400/10 to-pink-500/20",
    iconColor: "text-red-400",
    content: [
      "NyNus không chịu trách nhiệm cho:",
      "• Thiệt hại gián tiếp, ngẫu nhiên hoặc do hậu quả",
      "• Mất mát dữ liệu do lỗi kỹ thuật hoặc bất khả kháng",
      "• Gián đoạn dịch vụ do bảo trì hoặc nâng cấp hệ thống",
      "• Kết quả học tập không đạt như mong đợi của người dùng",
      "Trách nhiệm tối đa của NyNus giới hạn ở mức phí dịch vụ đã thanh toán."
    ]
  },
  {
    id: "termination",
    title: "7. Chấm dứt dịch vụ",
    icon: Users,
    gradient: "from-cyan-500/20 via-cyan-400/10 to-sky-500/20",
    iconColor: "text-cyan-400",
    content: [
      "NyNus có quyền chấm dứt tài khoản người dùng trong các trường hợp:",
      "• Vi phạm điều khoản sử dụng",
      "• Sử dụng dịch vụ cho mục đích bất hợp pháp",
      "• Không thanh toán phí dịch vụ đúng hạn",
      "• Theo yêu cầu của cơ quan có thẩm quyền",
      "Người dùng có thể hủy tài khoản bất cứ lúc nào thông qua cài đặt tài khoản."
    ]
  },
  {
    id: "updates",
    title: "8. Cập nhật điều khoản",
    icon: FileText,
    gradient: "from-violet-500/20 via-violet-400/10 to-purple-500/20",
    iconColor: "text-violet-400",
    content: [
      "NyNus có quyền cập nhật các điều khoản này khi cần thiết. Các thay đổi sẽ được thông báo trước ít nhất 15 ngày.",
      "Việc tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi đó.",
      "Chúng tôi khuyến khích bạn thường xuyên kiểm tra trang điều khoản để cập nhật thông tin mới nhất."
    ]
  }
];

function TermSection({ section, index }: { section: typeof termsData[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`bg-gradient-to-br ${section.gradient} backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 bg-gradient-to-br ${section.gradient} rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10`}>
          <section.icon className={`w-6 h-6 ${section.iconColor}`} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">{section.title}</h2>
      </div>
      
      <div className="space-y-4">
        {section.content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-slate-300 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

export default function TermsPage() {
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
              Điều khoản sử dụng
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Vui lòng đọc kỹ các điều khoản và điều kiện sử dụng dịch vụ NyNus
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Important Notice */}
      <section className="relative z-10 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="bg-gradient-to-br from-amber-500/20 via-orange-400/10 to-red-500/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Lưu ý quan trọng</h3>
            <p className="text-slate-300 leading-relaxed">
              Các điều khoản này có hiệu lực từ ngày 01/01/2024 và được cập nhật lần cuối vào ngày 15/01/2024. 
              Bằng việc sử dụng dịch vụ NyNus, bạn đồng ý tuân thủ tất cả các điều khoản và điều kiện được nêu dưới đây.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="relative z-10 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {termsData.map((section, index) => (
              <TermSection key={section.id} section={section} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cần hỗ trợ thêm?
            </h3>
            <p className="text-xl text-slate-300 mb-8">
              Liên hệ với chúng tôi nếu bạn có thắc mắc về điều khoản sử dụng
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link 
                href="mailto:legal@nynus.edu.vn"
                className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <Mail className="h-8 w-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold text-white mb-1">Email pháp lý</h4>
                <p className="text-slate-300 text-sm">legal@nynus.edu.vn</p>
              </Link>
              
              <Link 
                href="tel:1900-xxxx"
                className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <Phone className="h-8 w-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold text-white mb-1">Hotline</h4>
                <p className="text-slate-300 text-sm">1900-xxxx</p>
              </Link>
            </div>

            <div className="space-x-4">
              <Link 
                href="/privacy"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                Chính sách bảo mật
              </Link>
              <Link 
                href="/lien-he"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Liên hệ với chúng tôi
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
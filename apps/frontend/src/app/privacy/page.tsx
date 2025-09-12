"use client";

import { Shield, Eye, Lock, Database, Users, Settings, FileText, Phone, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const privacyData = [
  {
    id: "data-collection",
    title: "1. Thu thập thông tin",
    icon: Database,
    gradient: "from-blue-500/20 via-blue-400/10 to-indigo-500/20",
    iconColor: "text-blue-400",
    content: [
      "Chúng tôi thu thập các loại thông tin sau:",
      "• Thông tin cá nhân: họ tên, email, số điện thoại, ngày sinh",
      "• Thông tin học tập: lớp học, môn học, kết quả bài tập và kiểm tra",
      "• Thông tin kỹ thuật: địa chỉ IP, thiết bị, trình duyệt, thời gian truy cập",
      "• Dữ liệu sử dụng: các tính năng được sử dụng, thời gian học tập, tiến độ",
      "Việc thu thập này nhằm cung cấp dịch vụ tốt nhất và cá nhân hóa trải nghiệm học tập."
    ]
  },
  {
    id: "data-usage",
    title: "2. Sử dụng thông tin",
    icon: Settings,
    gradient: "from-purple-500/20 via-purple-400/10 to-violet-500/20",
    iconColor: "text-purple-400",
    content: [
      "Thông tin của bạn được sử dụng để:",
      "• Cung cấp và cải thiện chất lượng dịch vụ",
      "• Cá nhân hóa nội dung học tập với AI",
      "• Gửi thông báo về khóa học, bài tập và tiến độ",
      "• Hỗ trợ kỹ thuật và giải đáp thắc mắc",
      "• Phân tích và báo cáo thống kê (dạng ẩn danh)",
      "• Tuân thủ các yêu cầu pháp lý khi cần thiết"
    ]
  },
  {
    id: "data-sharing",
    title: "3. Chia sẻ thông tin",
    icon: Users,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-teal-500/20",
    iconColor: "text-emerald-400",
    content: [
      "NyNus cam kết không bán hoặc cho thuê thông tin cá nhân của bạn.",
      "Chúng tôi chỉ chia sẻ thông tin trong các trường hợp:",
      "• Với sự đồng ý rõ ràng của bạn",
      "• Với các đối tác cung cấp dịch vụ (đã ký thỏa thuận bảo mật)",
      "• Khi có yêu cầu từ cơ quan có thẩm quyền",
      "• Để bảo vệ quyền lợi và an toàn của NyNus và người dùng",
      "• Trong trường hợp sáp nhập hoặc chuyển nhượng công ty"
    ]
  },
  {
    id: "data-security",
    title: "4. Bảo mật dữ liệu",
    icon: Lock,
    gradient: "from-amber-500/20 via-amber-400/10 to-orange-500/20",
    iconColor: "text-amber-400",
    content: [
      "Chúng tôi áp dụng các biện pháp bảo mật tiên tiến:",
      "• Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải",
      "• Mã hóa dữ liệu nhạy cảm trong cơ sở dữ liệu",
      "• Kiểm soát truy cập nghiêm ngặt với xác thực đa yếu tố",
      "• Giám sát bảo mật 24/7 và phát hiện xâm nhập",
      "• Sao lưu dữ liệu định kỳ và khôi phục thảm họa",
      "• Đào tạo nhân viên về bảo mật và quyền riêng tư"
    ]
  },
  {
    id: "user-rights",
    title: "5. Quyền của người dùng",
    icon: Eye,
    gradient: "from-pink-500/20 via-pink-400/10 to-rose-500/20",
    iconColor: "text-pink-400",
    content: [
      "Bạn có các quyền sau đối với dữ liệu cá nhân:",
      "• Quyền truy cập: Xem thông tin chúng tôi có về bạn",
      "• Quyền chỉnh sửa: Cập nhật thông tin cá nhân không chính xác",
      "• Quyền xóa: Yêu cầu xóa tài khoản và dữ liệu cá nhân",
      "• Quyền hạn chế: Giới hạn cách chúng tôi xử lý dữ liệu",
      "• Quyền di chuyển: Nhận bản sao dữ liệu ở định dạng có cấu trúc",
      "Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi."
    ]
  },
  {
    id: "cookies",
    title: "6. Cookies và theo dõi",
    icon: Settings,
    gradient: "from-red-500/20 via-red-400/10 to-pink-500/20",
    iconColor: "text-red-400",
    content: [
      "Chúng tôi sử dụng cookies và công nghệ tương tự để:",
      "• Ghi nhớ thông tin đăng nhập và tùy chọn của bạn",
      "• Phân tích cách sử dụng website để cải thiện trải nghiệm",
      "• Cung cấp nội dung và quảng cáo được cá nhân hóa",
      "• Đảm bảo an toàn và ngăn chặn gian lận",
      "Bạn có thể quản lý cookies trong cài đặt trình duyệt.",
      "Việc tắt cookies có thể ảnh hưởng đến một số tính năng của dịch vụ."
    ]
  },
  {
    id: "children-privacy",
    title: "7. Quyền riêng tư trẻ em",
    icon: Shield,
    gradient: "from-cyan-500/20 via-cyan-400/10 to-sky-500/20",
    iconColor: "text-cyan-400",
    content: [
      "NyNus đặc biệt chú trọng bảo vệ quyền riêng tư của trẻ em:",
      "• Trẻ em dưới 13 tuổi cần có sự đồng ý của phụ huynh",
      "• Chúng tôi chỉ thu thập thông tin tối thiểu cần thiết",
      "• Không chia sẻ thông tin trẻ em với bên thứ ba",
      "• Phụ huynh có quyền xem, chỉnh sửa hoặc xóa dữ liệu của con em",
      "• Cung cấp các công cụ kiểm soát phù hợp với độ tuổi",
      "Phụ huynh có thể liên hệ để được hỗ trợ về quyền riêng tư của trẻ."
    ]
  },
  {
    id: "policy-updates",
    title: "8. Cập nhật chính sách",
    icon: FileText,
    gradient: "from-violet-500/20 via-violet-400/10 to-purple-500/20",
    iconColor: "text-violet-400",
    content: [
      "Chính sách bảo mật này có thể được cập nhật định kỳ:",
      "• Chúng tôi sẽ thông báo trước ít nhất 30 ngày về các thay đổi quan trọng",
      "• Thông báo sẽ được gửi qua email và hiển thị trên website",
      "• Phiên bản mới nhất luôn có sẵn tại trang này",
      "• Ngày cập nhật cuối cùng được ghi rõ ở đầu chính sách",
      "Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận các thay đổi."
    ]
  }
];

const dataProtectionMeasures = [
  {
    icon: Lock,
    title: "Mã hóa dữ liệu",
    description: "Sử dụng AES-256 để mã hóa dữ liệu nhạy cảm"
  },
  {
    icon: Shield,
    title: "Tường lửa bảo mật",
    description: "Hệ thống tường lửa đa lớp bảo vệ server"
  },
  {
    icon: Eye,
    title: "Giám sát 24/7",
    description: "Theo dõi hoạt động bất thường liên tục"
  },
  {
    icon: Users,
    title: "Kiểm soát truy cập",
    description: "Xác thực đa yếu tố cho tất cả tài khoản"
  }
];

function PrivacySection({ section, index }: { section: typeof privacyData[0], index: number }) {
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
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{section.title}</h2>
      </div>
      
      <div className="space-y-4">
        {section.content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

export default function PrivacyPage() {
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
              Chính sách bảo mật
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Data Protection Measures */}
      <section className="relative z-10 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Các biện pháp bảo vệ dữ liệu
            </h2>
            <p className="text-slate-300 text-lg">
              Chúng tôi áp dụng công nghệ bảo mật hàng đầu để bảo vệ thông tin của bạn
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataProtectionMeasures.map((measure, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <measure.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{measure.title}</h3>
                <p className="text-slate-300 text-sm">{measure.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="relative z-10 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {privacyData.map((section, index) => (
              <PrivacySection key={section.id} section={section} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Your Rights Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-teal-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-8">
              <Shield className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Quyền của bạn
              </h3>
              <p className="text-xl text-slate-300">
                Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { title: "Truy cập dữ liệu", desc: "Xem tất cả thông tin chúng tôi có về bạn" },
                { title: "Chỉnh sửa thông tin", desc: "Cập nhật hoặc sửa đổi dữ liệu cá nhân" },
                { title: "Xóa dữ liệu", desc: "Yêu cầu xóa hoàn toàn tài khoản và dữ liệu" },
                { title: "Di chuyển dữ liệu", desc: "Nhận bản sao dữ liệu ở định dạng có cấu trúc" }
              ].map((right, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-2xl">
                  <h4 className="text-white font-semibold mb-2">{right.title}</h4>
                  <p className="text-slate-300 text-sm">{right.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-slate-300 mb-6">
                Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi
              </p>
              <Link 
                href="mailto:privacy@nynus.edu.vn"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
              >
                <Mail className="h-5 w-5" />
                Liên hệ về quyền riêng tư
              </Link>
            </div>
          </motion.div>
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
              Có thắc mắc về quyền riêng tư?
            </h3>
            <p className="text-xl text-slate-300 mb-8">
              Đội ngũ bảo mật của chúng tôi sẵn sàng hỗ trợ bạn
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link 
                href="mailto:privacy@nynus.edu.vn"
                className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <Mail className="h-8 w-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold text-white mb-1">Email riêng tư</h4>
                <p className="text-slate-300 text-sm">privacy@nynus.edu.vn</p>
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
                href="/terms"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium rounded-2xl hover:bg-white/20 transition-all duration-300"
              >
                Điều khoản sử dụng
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
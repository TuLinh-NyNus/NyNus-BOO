"use client";

import { ChevronDown, BookOpen, Users, CreditCard, Shield, HelpCircle, ArrowRight, Search, Phone, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const faqData = [
  {
    category: "Tài khoản & Đăng ký",
    icon: Users,
    gradient: "from-blue-500/20 via-blue-400/10 to-indigo-500/20",
    iconColor: "text-blue-400",
    questions: [
      {
        question: "Làm thế nào để đăng ký tài khoản NyNus?",
        answer: "Bạn có thể đăng ký tài khoản bằng cách truy cập trang chủ, nhấn nút 'Đăng ký' và điền thông tin cá nhân. Hoặc bạn có thể đăng ký bằng tài khoản Google/Facebook để tiện lợi hơn."
      },
      {
        question: "Tôi có thể sử dụng NyNus miễn phí không?",
        answer: "Có, NyNus cung cấp nhiều tính năng miễn phí bao gồm truy cập vào một số khóa học cơ bản, bài tập luyện tập và tài liệu tham khảo. Để truy cập đầy đủ tính năng, bạn có thể nâng cấp lên gói Premium."
      },
      {
        question: "Làm sao để đổi mật khẩu?",
        answer: "Vào trang 'Cài đặt tài khoản', chọn 'Đổi mật khẩu' và làm theo hướng dẫn. Bạn sẽ nhận được email xác nhận để hoàn tất quá trình đổi mật khẩu."
      }
    ]
  },
  {
    category: "Khóa học & Học tập",
    icon: BookOpen,
    gradient: "from-purple-500/20 via-purple-400/10 to-violet-500/20",
    iconColor: "text-purple-400",
    questions: [
      {
        question: "NyNus có những khóa học nào?",
        answer: "NyNus cung cấp các khóa học toán từ lớp 1 đến lớp 12, bao gồm Toán cơ bản, Toán nâng cao, luyện thi đại học và các chuyên đề đặc biệt. Mỗi khóa học được thiết kế phù hợp với từng cấp độ."
      },
      {
        question: "Làm thế nào để AI cá nhân hóa bài học cho tôi?",
        answer: "AI của NyNus phân tích kết quả học tập, thời gian làm bài, và các lỗi thường gặp để tạo ra lộ trình học tập phù hợp. Hệ thống sẽ đề xuất bài tập và khóa học phù hợp với trình độ của bạn."
      },
      {
        question: "Tôi có thể học offline không?",
        answer: "Hiện tại NyNus chủ yếu hoạt động online để đảm bảo tính tương tác và cập nhật nội dung. Tuy nhiên, bạn có thể tải về một số tài liệu PDF để học offline."
      }
    ]
  },
  {
    category: "Thanh toán & Gói Premium",
    icon: CreditCard,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-teal-500/20",
    iconColor: "text-emerald-400",
    questions: [
      {
        question: "Gói Premium có những tính năng gì?",
        answer: "Gói Premium bao gồm: truy cập tất cả khóa học, bài tập không giới hạn, hỗ trợ 1-1 với giáo viên, báo cáo tiến độ chi tiết, và nhiều tính năng nâng cao khác."
      },
      {
        question: "Tôi có thể hủy gói Premium bất cứ lúc nào không?",
        answer: "Có, bạn có thể hủy gói Premium bất cứ lúc nào trong phần 'Cài đặt tài khoản'. Gói sẽ tiếp tục hoạt động đến hết kỳ đã thanh toán."
      },
      {
        question: "NyNus chấp nhận những phương thức thanh toán nào?",
        answer: "Chúng tôi chấp nhận thanh toán qua thẻ tín dụng/ghi nợ, chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay), và các cổng thanh toán trực tuyến khác."
      }
    ]
  },
  {
    category: "Bảo mật & Quyền riêng tư",
    icon: Shield,
    gradient: "from-amber-500/20 via-amber-400/10 to-orange-500/20",
    iconColor: "text-amber-400",
    questions: [
      {
        question: "Thông tin cá nhân của tôi có được bảo mật không?",
        answer: "Có, NyNus cam kết bảo vệ thông tin cá nhân của bạn. Chúng tôi sử dụng các biện pháp bảo mật tiên tiến và tuân thủ các quy định về bảo vệ dữ liệu."
      },
      {
        question: "Dữ liệu học tập của tôi có được chia sẻ với bên thứ ba không?",
        answer: "Không, dữ liệu học tập cá nhân của bạn chỉ được sử dụng để cải thiện trải nghiệm học tập và không bao giờ được chia sẻ với bên thứ ba mà không có sự đồng ý của bạn."
      }
    ]
  },
  {
    category: "Hỗ trợ & Liên hệ",
    icon: HelpCircle,
    gradient: "from-pink-500/20 via-pink-400/10 to-rose-500/20",
    iconColor: "text-pink-400",
    questions: [
      {
        question: "Làm thế nào để liên hệ với đội ngũ hỗ trợ?",
        answer: "Bạn có thể liên hệ với chúng tôi qua email support@nynus.edu.vn, hotline 1900-xxxx, hoặc sử dụng form liên hệ trên website. Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ."
      },
      {
        question: "Tôi gặp lỗi kỹ thuật, phải làm gì?",
        answer: "Nếu gặp lỗi kỹ thuật, bạn có thể báo cáo qua trang 'Báo cáo lỗi' hoặc gửi email với mô tả chi tiết về lỗi. Chúng tôi sẽ khắc phục trong thời gian sớm nhất."
      },
      {
        question: "NyNus có hỗ trợ học sinh khuyết tật không?",
        answer: "Có, NyNus cam kết hỗ trợ tất cả học sinh, bao gồm cả học sinh khuyết tật. Chúng tôi đang phát triển các tính năng accessibility để đảm bảo mọi người đều có thể sử dụng nền tảng."
      }
    ]
  }
];

function FAQItem({ question, answer, gradient }: { question: string; answer: string; gradient: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className={`bg-gradient-to-br ${gradient} backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden`}
      layout
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300"
      >
        <span className="font-semibold text-foreground text-lg">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-0">
              <p className="text-muted-foreground leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter FAQ data based on search query
  const filteredFaqData = faqData.filter(category =>
    category.questions.some(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with #0A0E1A */}
      <div className="absolute inset-0" style={{ backgroundColor: '#0A0E1A' }}></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/3 to-pink-500/5"></div>
      
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
              Câu hỏi thường gặp
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Tìm câu trả lời cho các câu hỏi thường gặp về NyNus - nền tảng học toán thông minh với AI
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
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Categories */}
      <section className="relative z-10 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-16">
            {(searchQuery ? filteredFaqData : faqData).map((category, categoryIndex) => (
              <motion.div 
                key={categoryIndex}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10`}>
                    <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">{category.category}</h2>
                </div>
                
                {/* FAQ Items */}
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <FAQItem
                      key={faqIndex}
                      question={faq.question}
                      answer={faq.answer}
                      gradient={category.gradient}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Vẫn có thắc mắc?
            </h3>
            <p className="text-xl text-slate-300 mb-8">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Mail,
                  title: "Email",
                  subtitle: "support@nynus.edu.vn",
                  href: "mailto:support@nynus.edu.vn"
                },
                {
                  icon: Phone,
                  title: "Hotline",
                  subtitle: "1900-xxxx",
                  href: "tel:1900-xxxx"
                },
                {
                  icon: MessageCircle,
                  title: "Live Chat",
                  subtitle: "Trò chuyện trực tiếp",
                  href: "/support"
                }
              ].map((contact, index) => (
                <Link 
                  key={index}
                  href={contact.href}
                  className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
                >
                  <contact.icon className="h-8 w-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-semibold text-white mb-1">{contact.title}</h4>
                  <p className="text-slate-300 text-sm">{contact.subtitle}</p>
                </Link>
              ))}
            </div>
            
            <div className="mt-8">
              <Link 
                href="/lien-he"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
              >
                Liên hệ với chúng tôi
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
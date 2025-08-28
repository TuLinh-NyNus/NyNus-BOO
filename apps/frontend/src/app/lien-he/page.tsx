import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Liên hệ - Liên hệ với NyNus",
  description: "Liên hệ với đội ngũ NyNus để được hỗ trợ, tư vấn hoặc đóng góp ý kiến về nền tảng học toán thông minh.",
  keywords: "liên hệ, hỗ trợ, tư vấn, NyNus, contact",
  openGraph: {
    title: "Liên hệ - Liên hệ với NyNus",
    description: "Liên hệ với đội ngũ NyNus để được hỗ trợ và tư vấn",
    type: "website",
  }
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "support@nynus.edu.vn",
    description: "Gửi email cho chúng tôi",
    link: "mailto:support@nynus.edu.vn"
  },
  {
    icon: Phone,
    title: "Hotline",
    value: "1900-xxxx",
    description: "Gọi điện thoại hỗ trợ",
    link: "tel:1900-xxxx"
  },
  {
    icon: MapPin,
    title: "Địa chỉ",
    value: "Hà Nội, Việt Nam",
    description: "Trụ sở chính",
    link: "#"
  },
  {
    icon: Clock,
    title: "Giờ làm việc",
    value: "8:00 - 18:00",
    description: "Thứ 2 - Thứ 6",
    link: "#"
  }
];

const departments = [
  {
    name: "Hỗ trợ kỹ thuật",
    email: "tech@nynus.edu.vn",
    description: "Hỗ trợ về lỗi kỹ thuật, tài khoản, thanh toán"
  },
  {
    name: "Tư vấn khóa học",
    email: "courses@nynus.edu.vn",
    description: "Tư vấn về khóa học, lộ trình học tập"
  },
  {
    name: "Hợp tác kinh doanh",
    email: "business@nynus.edu.vn",
    description: "Đối tác, hợp tác, đầu tư"
  },
  {
    name: "Tuyển dụng",
    email: "careers@nynus.edu.vn",
    description: "Cơ hội nghề nghiệp tại NyNus"
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Liên hệ{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                với chúng tôi
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi 
              để được tư vấn, hỗ trợ hoặc đóng góp ý kiến.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{info.title}</h3>
                <a
                  href={info.link}
                  className="text-primary hover:underline font-medium block mb-2"
                >
                  {info.value}
                </a>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Departments */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <p className="text-muted-foreground mb-8">
                Điền form bên dưới và chúng tôi sẽ phản hồi trong vòng 24 giờ
              </p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      placeholder="Nhập email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Chủ đề *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="support">Hỗ trợ kỹ thuật</option>
                    <option value="courses">Tư vấn khóa học</option>
                    <option value="billing">Thanh toán</option>
                    <option value="feedback">Góp ý</option>
                    <option value="partnership">Hợp tác</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground resize-none"
                    placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
                  ></textarea>
                </div>
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    name="privacy"
                    required
                    className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <label htmlFor="privacy" className="text-sm text-muted-foreground">
                    Tôi đồng ý với{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Chính sách bảo mật
                    </a>{" "}
                    và{" "}
                    <a href="/terms" className="text-primary hover:underline">
                      Điều khoản sử dụng
                    </a>
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Gửi tin nhắn
                </button>
              </form>
            </div>

            {/* Departments */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Liên hệ theo bộ phận</h2>
              <p className="text-muted-foreground mb-8">
                Chọn bộ phận phù hợp để được hỗ trợ nhanh chóng và hiệu quả nhất
              </p>
              
              <div className="space-y-6">
                {departments.map((dept, index) => (
                  <div key={index} className="p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-card-foreground">{dept.name}</h3>
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-4">{dept.description}</p>
                    <a
                      href={`mailto:${dept.email}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {dept.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Câu hỏi thường gặp</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tìm câu trả lời nhanh cho các câu hỏi phổ biến
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-border rounded-xl bg-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-3">
                Thời gian phản hồi là bao lâu?
              </h3>
              <p className="text-muted-foreground">
                Chúng tôi cam kết phản hồi trong vòng 24 giờ làm việc. Với các vấn đề khẩn cấp, 
                bạn có thể gọi hotline để được hỗ trợ ngay lập tức.
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-xl bg-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-3">
                Tôi có thể liên hệ ngoài giờ làm việc không?
              </h3>
              <p className="text-muted-foreground">
                Có, bạn có thể gửi email hoặc để lại tin nhắn bất cứ lúc nào. 
                Chúng tôi sẽ phản hồi ngay khi bắt đầu giờ làm việc.
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-xl bg-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-3">
                Có hỗ trợ tiếng Anh không?
              </h3>
              <p className="text-muted-foreground">
                Có, đội ngũ hỗ trợ của chúng tôi có thể giao tiếp bằng tiếng Anh. 
                Bạn có thể gửi email bằng tiếng Anh hoặc yêu cầu hỗ trợ bằng tiếng Anh.
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-xl bg-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-3">
                Tôi muốn đóng góp ý kiến về sản phẩm?
              </h3>
              <p className="text-muted-foreground">
                Chúng tôi rất mong nhận được phản hồi từ bạn! Hãy chọn chủ đề &quot;Góp ý&quot; 
                trong form liên hệ hoặc gửi email trực tiếp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Cần hỗ trợ khẩn cấp?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Gọi ngay hotline hoặc sử dụng chat trực tuyến để được hỗ trợ ngay lập tức
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:1900-xxxx"
              className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Phone className="w-5 h-5 mr-2" />
              Gọi hotline ngay
            </a>
            <a
              href="/faq"
              className="inline-flex items-center px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Xem FAQ
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

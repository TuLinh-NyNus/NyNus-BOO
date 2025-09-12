import { Metadata } from "next";
import { BookOpen, Play, Target, Users, Award, Zap, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng - NyNus",
  description: "Hướng dẫn chi tiết cách sử dụng NyNus - nền tảng học toán thông minh với AI để đạt hiệu quả học tập tốt nhất.",
  keywords: "hướng dẫn, sử dụng, tutorial, NyNus, học toán, AI",
  openGraph: {
    title: "Hướng dẫn sử dụng - NyNus",
    description: "Hướng dẫn chi tiết cách sử dụng NyNus hiệu quả",
    type: "website",
  }
};

const gettingStartedSteps = [
  {
    step: 1,
    title: "Đăng ký tài khoản",
    description: "Tạo tài khoản miễn phí để bắt đầu hành trình học tập",
    icon: Users,
    details: [
      "Truy cập trang chủ NyNus",
      "Nhấn nút 'Đăng ký'",
      "Điền thông tin cá nhân hoặc đăng ký bằng Google/Facebook",
      "Xác nhận email để kích hoạt tài khoản"
    ]
  },
  {
    step: 2,
    title: "Hoàn thành bài kiểm tra đầu vào",
    description: "Giúp AI hiểu trình độ hiện tại của bạn",
    icon: Target,
    details: [
      "Làm bài kiểm tra 15-20 câu hỏi",
      "Bao gồm các chủ đề toán học cơ bản",
      "Kết quả sẽ xác định điểm xuất phát của bạn",
      "AI sẽ đề xuất lộ trình học tập phù hợp"
    ]
  },
  {
    step: 3,
    title: "Chọn khóa học phù hợp",
    description: "Khám phá các khóa học được thiết kế riêng cho bạn",
    icon: BookOpen,
    details: [
      "Xem các khóa học được đề xuất",
      "Đọc mô tả và mục tiêu của từng khóa học",
      "Chọn khóa học phù hợp với mục tiêu",
      "Bắt đầu với khóa học cơ bản nếu bạn mới bắt đầu"
    ]
  },
  {
    step: 4,
    title: "Bắt đầu học tập",
    description: "Tham gia các bài học tương tác và bài tập thực hành",
    icon: Play,
    details: [
      "Xem video bài giảng chất lượng cao",
      "Làm bài tập tương tác",
      "Nhận phản hồi tức thì từ AI",
      "Theo dõi tiến độ học tập"
    ]
  }
];

const features = [
  {
    icon: Zap,
    title: "Học tập thông minh",
    description: "AI phân tích và cá nhân hóa lộ trình học tập cho từng học sinh",
    tips: [
      "Làm bài tập đều đặn để AI hiểu rõ điểm mạnh/yếu",
      "Không bỏ qua các bài kiểm tra định kỳ",
      "Sử dụng tính năng 'Ôn tập' khi cần thiết"
    ]
  },
  {
    icon: Target,
    title: "Mục tiêu rõ ràng",
    description: "Đặt mục tiêu cụ thể và theo dõi tiến độ đạt được",
    tips: [
      "Đặt mục tiêu thực tế và có thể đo lường được",
      "Chia nhỏ mục tiêu lớn thành các bước nhỏ",
      "Cập nhật mục tiêu khi cần thiết"
    ]
  },
  {
    icon: Users,
    title: "Học tập cộng đồng",
    description: "Tham gia cộng đồng học sinh để chia sẻ kinh nghiệm",
    tips: [
      "Tham gia các nhóm học tập theo chủ đề",
      "Đặt câu hỏi và chia sẻ kiến thức",
      "Tham gia các cuộc thi và thử thách"
    ]
  },
  {
    icon: Award,
    title: "Ghi nhận thành tích",
    description: "Hệ thống điểm thưởng và chứng chỉ để khuyến khích học tập",
    tips: [
      "Hoàn thành các nhiệm vụ hàng ngày để nhận điểm",
      "Tham gia các cuộc thi để nhận chứng chỉ",
      "Chia sẻ thành tích với bạn bè và gia đình"
    ]
  }
];

const tips = [
  {
    category: "Tối ưu hóa học tập",
    items: [
      "Học đều đặn 30-60 phút mỗi ngày thay vì học dồn",
      "Làm bài tập ngay sau khi xem video bài giảng",
      "Sử dụng tính năng ghi chú để lưu lại kiến thức quan trọng",
      "Ôn tập lại các bài đã học định kỳ"
    ]
  },
  {
    category: "Sử dụng AI hiệu quả",
    items: [
      "Trả lời thành thật các câu hỏi của AI để nhận đề xuất chính xác",
      "Sử dụng tính năng 'Giải thích chi tiết' khi gặp khó khăn",
      "Báo cáo lỗi hoặc góp ý để cải thiện hệ thống",
      "Khám phá các tính năng mới được cập nhật"
    ]
  },
  {
    category: "Duy trì động lực",
    items: [
      "Đặt mục tiêu ngắn hạn và dài hạn rõ ràng",
      "Theo dõi tiến độ và ăn mừng những thành tích nhỏ",
      "Tham gia cộng đồng để được hỗ trợ và khuyến khích",
      "Thay đổi môi trường học tập để tránh nhàm chán"
    ]
  }
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Hướng dẫn{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                sử dụng
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Khám phá cách sử dụng NyNus hiệu quả nhất để đạt được kết quả học tập tốt nhất. 
              Từ người mới bắt đầu đến học sinh nâng cao, chúng tôi có hướng dẫn phù hợp cho bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Bắt đầu với NyNus</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chỉ cần 4 bước đơn giản để bắt đầu hành trình học tập thông minh với AI
            </p>
          </div>

          <div className="space-y-8">
            {gettingStartedSteps.map((step, index) => (
              <div key={index} className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="lg:w-1/3">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-primary font-medium">Bước {step.step}</div>
                      <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                
                <div className="lg:w-2/3">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h4 className="font-semibold text-card-foreground mb-4">Chi tiết thực hiện:</h4>
                    <ul className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features & Tips */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Tính năng chính & Mẹo sử dụng</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Khám phá các tính năng mạnh mẽ của NyNus và cách sử dụng chúng hiệu quả
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border border-border rounded-xl bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <div>
                  <h4 className="font-semibold text-card-foreground mb-3">Mẹo sử dụng:</h4>
                  <ul className="space-y-2">
                    {feature.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips & Best Practices */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Mẹo & Thực hành tốt nhất</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những lời khuyên từ đội ngũ chuyên gia và học sinh thành công
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tips.map((tipCategory, index) => (
              <div key={index} className="p-6 border border-border rounded-xl bg-card">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">{tipCategory.category}</h3>
                <ul className="space-y-3">
                  {tipCategory.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Video hướng dẫn</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Xem các video hướng dẫn chi tiết để hiểu rõ hơn về cách sử dụng NyNus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Play className="w-12 h-12 text-primary" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-card-foreground mb-2">Hướng dẫn đăng ký và thiết lập</h3>
                <p className="text-sm text-muted-foreground mb-4">5 phút</p>
                <button className="text-primary hover:underline text-sm font-medium">
                  Xem video →
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Play className="w-12 h-12 text-primary" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-card-foreground mb-2">Cách sử dụng AI tutor</h3>
                <p className="text-sm text-muted-foreground mb-4">8 phút</p>
                <button className="text-primary hover:underline text-sm font-medium">
                  Xem video →
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Play className="w-12 h-12 text-primary" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-card-foreground mb-2">Theo dõi tiến độ học tập</h3>
                <p className="text-sm text-muted-foreground mb-4">6 phút</p>
                <button className="text-primary hover:underline text-sm font-medium">
                  Xem video →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Bắt đầu ngay hôm nay</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sẵn sàng để bắt đầu hành trình học tập thông minh với NyNus?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/courses"
              className="p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300 text-center"
            >
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Khám phá khóa học</h3>
              <p className="text-muted-foreground mb-4">
                Xem các khóa học được thiết kế riêng cho bạn
              </p>
              <span className="text-primary font-medium">Xem khóa học →</span>
            </Link>

            <Link
              href="/practice"
              className="p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300 text-center"
            >
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Bắt đầu luyện tập</h3>
              <p className="text-muted-foreground mb-4">
                Thực hành với các bài tập tương tác
              </p>
              <span className="text-primary font-medium">Luyện tập ngay →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Cần hỗ trợ thêm?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/faq"
              className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Xem FAQ
            </Link>
            <Link
              href="/lien-he"
              className="inline-flex items-center px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


import { Metadata } from "next";
import { Clock, Target, BookOpen, TrendingUp, Star, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Luyện tập - NyNus | Nền tảng học tập toán học tương tác với AI",
  description: "Luyện tập với hàng nghìn đề thi toán học được tạo bởi AI. Cải thiện kỹ năng và chuẩn bị cho các kỳ thi quan trọng.",
  keywords: "luyện tập toán, đề thi toán, AI toán học, ôn thi, NyNus",
  openGraph: {
    title: "Luyện tập - NyNus",
    description: "Luyện tập với hàng nghìn đề thi toán học được tạo bởi AI",
    type: "website",
  }
};

// Mock data cho practice tests
const practiceCategories = [
  {
    id: 1,
    title: "Đại số",
    description: "Phương trình, bất phương trình, hệ phương trình",
    testCount: 156,
    difficulty: "Cơ bản đến Nâng cao",
    icon: "📐",
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Hình học",
    description: "Hình học phẳng, không gian, tọa độ",
    testCount: 124,
    difficulty: "Trung bình đến Khó",
    icon: "📏",
    color: "bg-green-500"
  },
  {
    id: 3,
    title: "Giải tích",
    description: "Đạo hàm, tích phân, giới hạn",
    testCount: 98,
    difficulty: "Nâng cao",
    icon: "📊",
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "Xác suất thống kê",
    description: "Xác suất, thống kê, tổ hợp",
    testCount: 76,
    difficulty: "Cơ bản đến Trung bình",
    icon: "🎲",
    color: "bg-orange-500"
  }
];

const recentTests = [
  {
    id: 1,
    title: "Đề thi thử THPT Quốc gia 2024 - Đề 1",
    questions: 50,
    duration: 90,
    difficulty: "Khó",
    participants: 1234,
    rating: 4.8
  },
  {
    id: 2,
    title: "Luyện tập Đại số - Phương trình bậc 2",
    questions: 20,
    duration: 30,
    difficulty: "Trung bình",
    participants: 856,
    rating: 4.6
  },
  {
    id: 3,
    title: "Hình học không gian - Khối đa diện",
    questions: 15,
    duration: 45,
    difficulty: "Nâng cao",
    participants: 567,
    rating: 4.7
  }
];

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Luyện tập với{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                AI Toán học
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Hàng nghìn đề thi được tạo bởi AI, phân tích chi tiết kết quả và đề xuất lộ trình học tập cá nhân hóa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/practice/start"
                className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Target className="w-5 h-5 mr-2" />
                Bắt đầu luyện tập
              </Link>
              <Link
                href="/practice/mock-exam"
                className="inline-flex items-center px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
              >
                <Clock className="w-5 h-5 mr-2" />
                Thi thử THPT
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Đề thi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Câu hỏi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">5K+</div>
              <div className="text-sm text-muted-foreground">Học sinh</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.9</div>
              <div className="text-sm text-muted-foreground">Đánh giá</div>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Categories */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Chọn chủ đề luyện tập</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Luyện tập theo từng chủ đề cụ thể để nắm vững kiến thức và cải thiện kỹ năng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {practiceCategories.map((category) => (
              <div
                key={category.id}
                className="p-6 border border-border rounded-xl hover:shadow-lg transition-all duration-300 bg-card"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">{category.title}</h3>
                    <p className="text-muted-foreground mb-3">{category.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {category.testCount} đề thi
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {category.difficulty}
                      </span>
                    </div>
                    <Link
                      href={`/practice/category/${category.id}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Bắt đầu luyện tập →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Tests */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Đề thi phổ biến</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những đề thi được nhiều học sinh lựa chọn và đánh giá cao
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentTests.map((test) => (
              <div
                key={test.id}
                className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-card-foreground mb-3">{test.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Số câu hỏi:</span>
                    <span className="font-medium">{test.questions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">{test.duration} phút</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Độ khó:</span>
                    <span className="font-medium">{test.difficulty}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {test.participants.toLocaleString()} người tham gia
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {test.rating}
                  </div>
                </div>

                <Link
                  href={`/practice/test/${test.id}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Làm bài ngay
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Sẵn sàng cải thiện kết quả học tập?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Bắt đầu luyện tập ngay hôm nay với AI và đạt điểm số mong muốn
          </p>
          <Link
            href="/practice/start"
            className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
          >
            <Target className="w-5 h-5 mr-2" />
            Bắt đầu ngay
          </Link>
        </div>
      </section>
    </div>
  );
}

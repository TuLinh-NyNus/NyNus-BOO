import { Metadata } from "next";
import { Users, MapPin, Clock, DollarSign, Heart, Zap, Target, Globe } from "lucide-react";
import Link from "next/link";

// Disable static generation temporarily to avoid SSR auth issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Tuyển dụng - Cơ hội nghề nghiệp tại NyNus",
  description: "Tham gia đội ngũ NyNus - nơi kết hợp đam mê giáo dục và công nghệ để tạo ra tác động tích cực cho hàng nghìn học sinh.",
  keywords: "tuyển dụng, việc làm, cơ hội nghề nghiệp, NyNus, giáo dục, công nghệ",
  openGraph: {
    title: "Tuyển dụng - Cơ hội nghề nghiệp tại NyNus",
    description: "Tham gia đội ngũ NyNus và cùng chúng tôi cách mạng hóa giáo dục toán học",
    type: "website",
  }
};

const jobOpenings = [
  {
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Hà Nội / Remote",
    type: "Full-time",
    salary: "25-40 triệu VND",
    description: "Phát triển giao diện người dùng cho nền tảng học tập với React/Next.js",
    requirements: [
      "3+ năm kinh nghiệm với React/TypeScript",
      "Thành thạo Next.js và Tailwind CSS",
      "Có kinh nghiệm với state management (Zustand/Redux)",
      "Hiểu biết về UX/UI principles"
    ]
  },
  {
    title: "AI/ML Engineer",
    department: "AI Research",
    location: "Hà Nội",
    type: "Full-time",
    salary: "30-50 triệu VND",
    description: "Phát triển các thuật toán AI cho hệ thống học tập thông minh",
    requirements: [
      "Thạc sĩ/PhD về Computer Science hoặc AI",
      "Thành thạo Python, TensorFlow/PyTorch",
      "Có kinh nghiệm với NLP và recommendation systems",
      "Có publication trong lĩnh vực AI/ML"
    ]
  },
  {
    title: "Content Creator - Toán học",
    department: "Education",
    location: "Hà Nội / Remote",
    type: "Full-time",
    salary: "15-25 triệu VND",
    description: "Tạo nội dung học tập chất lượng cao cho các khóa học toán",
    requirements: [
      "Cử nhân Toán học hoặc Sư phạm Toán",
      "Có kinh nghiệm giảng dạy toán học",
      "Kỹ năng viết và biên tập nội dung tốt",
      "Thành thạo LaTeX và các công cụ soạn thảo toán học"
    ]
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "Hà Nội",
    type: "Full-time",
    salary: "35-50 triệu VND",
    description: "Quản lý sản phẩm và định hướng phát triển nền tảng học tập",
    requirements: [
      "3+ năm kinh nghiệm Product Management",
      "Có kinh nghiệm trong lĩnh vực EdTech",
      "Kỹ năng phân tích dữ liệu và A/B testing",
      "Khả năng làm việc với cross-functional teams"
    ]
  }
];

const benefits = [
  {
    icon: Heart,
    title: "Bảo hiểm sức khỏe",
    description: "Bảo hiểm sức khỏe toàn diện cho bạn và gia đình"
  },
  {
    icon: Zap,
    title: "Linh hoạt thời gian",
    description: "Làm việc từ xa và lịch trình linh hoạt"
  },
  {
    icon: Target,
    title: "Phát triển nghề nghiệp",
    description: "Cơ hội học tập và thăng tiến không giới hạn"
  },
  {
    icon: Globe,
    title: "Môi trường quốc tế",
    description: "Làm việc với đội ngũ đa quốc gia"
  },
  {
    icon: Users,
    title: "Văn hóa startup",
    description: "Môi trường năng động, sáng tạo và thân thiện"
  },
  {
    icon: DollarSign,
    title: "Lương thưởng cạnh tranh",
    description: "Lương thưởng xứng đáng với năng lực và đóng góp"
  }
];

const values = [
  {
    title: "Đam mê giáo dục",
    description: "Chúng tôi tin vào sức mạnh của giáo dục để thay đổi cuộc sống"
  },
  {
    title: "Đổi mới liên tục",
    description: "Luôn tìm kiếm cách thức mới để cải thiện trải nghiệm học tập"
  },
  {
    title: "Làm việc nhóm",
    description: "Tôn trọng sự đa dạng và hợp tác để đạt kết quả tốt nhất"
  },
  {
    title: "Tác động xã hội",
    description: "Mỗi dòng code đều hướng đến việc giúp học sinh thành công"
  }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Gia nhập đội ngũ{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                NyNus
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Cùng chúng tôi cách mạng hóa giáo dục toán học và tạo ra tác động tích cực 
              cho hàng nghìn học sinh Việt Nam.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>50+ thành viên</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Hà Nội, Việt Nam</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Remote-friendly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Tại sao chọn NyNus?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi không chỉ tạo ra sản phẩm, mà còn tạo ra tác động tích cực cho xã hội
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Vị trí đang tuyển</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Khám phá các cơ hội nghề nghiệp phù hợp với kỹ năng và đam mê của bạn
            </p>
          </div>

          <div className="space-y-6">
            {jobOpenings.map((job, index) => (
              <div key={index} className="p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/careers/${job.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="mt-4 lg:mt-0 inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Ứng tuyển ngay
                  </Link>
                </div>
                <p className="text-muted-foreground mb-4">{job.description}</p>
                <div>
                  <h4 className="font-semibold text-card-foreground mb-2">Yêu cầu:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {job.requirements.map((req, reqIndex) => (
                      <li key={reqIndex}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Giá trị của chúng tôi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những giá trị định hướng cách chúng tôi làm việc và phát triển
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="p-6 border border-border rounded-xl bg-card">
                <h3 className="text-xl font-semibold text-card-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Quy trình ứng tuyển</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quy trình đơn giản và minh bạch để bạn gia nhập đội ngũ NyNus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nộp hồ sơ</h3>
              <p className="text-sm text-muted-foreground">Gửi CV và cover letter qua email hoặc form online</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Phỏng vấn sơ bộ</h3>
              <p className="text-sm text-muted-foreground">Trao đổi về kinh nghiệm và mong muốn</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Bài test kỹ thuật</h3>
              <p className="text-sm text-muted-foreground">Đánh giá kỹ năng chuyên môn</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Phỏng vấn cuối</h3>
              <p className="text-sm text-muted-foreground">Gặp gỡ team lead và CEO</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Sẵn sàng gia nhập đội ngũ NyNus?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Hãy gửi CV của bạn và cùng chúng tôi tạo ra tác động tích cực cho giáo dục Việt Nam
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:careers@nynus.edu.vn"
              className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Gửi CV ngay
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Tìm hiểu thêm về chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


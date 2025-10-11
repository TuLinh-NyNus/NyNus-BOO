import { Metadata } from "next";
import { Target, Users, Award, Lightbulb, Heart, Globe } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Về NyNus - Nền tảng học tập toán học tương tác với AI",
  description: "Tìm hiểu về NyNus - nền tảng học tập toán học thông minh sử dụng AI để cá nhân hóa trải nghiệm học tập và giúp học sinh đạt kết quả tốt nhất.",
  keywords: "về NyNus, AI toán học, nền tảng học tập, giáo dục thông minh",
  openGraph: {
    title: "Về NyNus - Nền tảng học tập toán học tương tác với AI",
    description: "Tìm hiểu về sứ mệnh và tầm nhìn của NyNus trong việc cách mạng hóa giáo dục toán học",
    type: "website",
  }
};

const teamMembers = [
  {
    name: "Nguyễn Văn A",
    role: "CEO & Founder",
    description: "15+ năm kinh nghiệm trong lĩnh vực giáo dục và công nghệ",
    image: "/images/team/ceo.svg"
  },
  {
    name: "Trần Thị B",
    role: "CTO",
    description: "Chuyên gia AI và Machine Learning với 10+ năm kinh nghiệm",
    image: "/images/team/cto.svg"
  },
  {
    name: "Lê Văn C",
    role: "Head of Education",
    description: "Giáo sư Toán học với 20+ năm kinh nghiệm giảng dạy",
    image: "/images/team/education.svg"
  }
];

const achievements = [
  {
    icon: Users,
    number: "50K+",
    label: "Học sinh tin tưởng",
    description: "Hơn 50,000 học sinh đã sử dụng NyNus để cải thiện kết quả học tập"
  },
  {
    icon: Award,
    number: "95%",
    label: "Tỷ lệ hài lòng",
    description: "95% học sinh đánh giá NyNus giúp họ hiểu toán học tốt hơn"
  },
  {
    icon: Target,
    number: "85%",
    label: "Cải thiện điểm số",
    description: "85% học sinh cải thiện điểm số sau 3 tháng sử dụng"
  },
  {
    icon: Globe,
    number: "3",
    label: "Quốc gia",
    description: "Đã mở rộng ra 3 quốc gia trong khu vực Đông Nam Á"
  }
];

const values = [
  {
    icon: Lightbulb,
    title: "Đổi mới sáng tạo",
    description: "Chúng tôi luôn tìm kiếm những cách thức mới để làm cho việc học toán trở nên thú vị và hiệu quả hơn."
  },
  {
    icon: Heart,
    title: "Tận tâm với học sinh",
    description: "Mỗi quyết định của chúng tôi đều hướng đến việc mang lại trải nghiệm học tập tốt nhất cho học sinh."
  },
  {
    icon: Users,
    title: "Cộng đồng học tập",
    description: "Chúng tôi xây dựng một cộng đồng học tập tích cực, nơi mọi người cùng nhau phát triển."
  },
  {
    icon: Target,
    title: "Chất lượng cao",
    description: "Chúng tôi cam kết cung cấp nội dung và công nghệ chất lượng cao nhất cho người học."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Về{" "}
              <span className="logo-gradient-text" style={{ color: 'transparent', WebkitTextFillColor: 'transparent' }}>
                NyNus
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Chúng tôi tin rằng mỗi học sinh đều có thể thành công trong toán học với sự hỗ trợ đúng đắn. 
              NyNus được tạo ra để biến niềm tin đó thành hiện thực.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Sứ mệnh của chúng tôi</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Sứ mệnh của NyNus là democratize việc học toán học chất lượng cao thông qua công nghệ AI, 
                giúp mọi học sinh, bất kể xuất phát điểm như thế nào, đều có thể tiếp cận và thành công 
                trong môn toán học.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Chúng tôi tin rằng toán học không chỉ là một môn học, mà là nền tảng tư duy logic 
                giúp học sinh phát triển khả năng giải quyết vấn đề trong cuộc sống.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Khám phá khóa học
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Tầm nhìn 2030</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Trở thành nền tảng học toán số 1 Đông Nam Á, 
                    giúp 1 triệu học sinh thành công
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Thành tựu của chúng tôi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những con số ấn tượng thể hiện sự tin tưởng và thành công của cộng đồng NyNus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{achievement.number}</div>
                <div className="text-lg font-semibold text-foreground mb-2">{achievement.label}</div>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Giá trị cốt lõi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những giá trị định hướng mọi hoạt động và quyết định của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Đội ngũ lãnh đạo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những người đam mê giáo dục và công nghệ, cùng nhau xây dựng tương lai của việc học toán
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="text-4xl">👤</div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{member.name}</h3>
                <div className="text-primary font-medium mb-3">{member.role}</div>
                <p className="text-muted-foreground text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Câu chuyện của chúng tôi</h2>
          </div>

          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg leading-relaxed mb-6">
              NyNus được sinh ra từ một quan sát đơn giản: nhiều học sinh gặp khó khăn với toán học 
              không phải vì thiếu khả năng, mà vì thiếu phương pháp học tập phù hợp và sự hỗ trợ cá nhân hóa.
            </p>
            
            <p className="text-lg leading-relaxed mb-6">
              Vào năm 2023, đội ngũ sáng lập gồm các chuyên gia giáo dục và công nghệ đã quyết định 
              kết hợp sức mạnh của AI với kinh nghiệm giảng dạy để tạo ra một nền tảng học tập 
              thực sự hiệu quả.
            </p>
            
            <p className="text-lg leading-relaxed mb-8">
              Ngày hôm nay, NyNus đã trở thành người bạn đồng hành tin cậy của hàng chục nghìn học sinh, 
              giúp họ không chỉ cải thiện điểm số mà còn yêu thích toán học hơn.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Tham gia cùng hàng nghìn học sinh đã thành công với NyNus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Bắt đầu học ngay
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Liên hệ với chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

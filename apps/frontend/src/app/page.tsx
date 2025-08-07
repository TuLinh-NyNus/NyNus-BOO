import { Metadata } from "next";

// Import home components từ index files
import { Hero, Features, AILearning, FeaturedCourses, FAQ } from "@/components/features/home";

export const metadata: Metadata = {
  title: "NyNus - Nền tảng học tập toán học tương tác với AI",
  description: "Học toán thông minh với AI, nền tảng học tập cá nhân hóa giúp học sinh đạt kết quả tốt hơn với sự hỗ trợ của trí tuệ nhân tạo.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <AILearning />
      <FeaturedCourses />
      <FAQ />
    </>
  );
}


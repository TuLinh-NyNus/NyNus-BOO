import { Metadata } from "next";

import AILearning from "@/components/features/home/ai-learning";
import FAQ from "@/components/features/home/faq";
import FeaturedCourses from "@/components/features/home/featured-courses";
import Features from "@/components/features/home/features";
import Hero from "@/components/features/home/hero";


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

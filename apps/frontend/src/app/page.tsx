import { Metadata } from "next";
import dynamic from 'next/dynamic';

// Import home components từ index files
import { Hero, Features, FAQ } from "@/components/features/home";

// Dynamic imports cho performance optimization
const AILearning = dynamic(() => import('@/components/features/home/ai-learning'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded-lg" />
});

const FeaturedCourses = dynamic(() => import('@/components/features/home/featured-courses'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded-lg" />
});

const Testimonials = dynamic(() => import('@/components/features/home/testimonials'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded-lg" />
});

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
      <Testimonials />
      <FAQ />
    </>
  );
}


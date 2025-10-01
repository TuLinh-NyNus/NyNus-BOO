import { Metadata } from "next";
import dynamic from 'next/dynamic';

// Direct imports for client components (Next.js 15 best practice)
// Avoid barrel exports for client components to prevent module resolution issues
import Hero from "@/components/features/home/hero";
import Features from "@/components/features/home/features";
import FAQ from "@/components/features/home/faq";
import ProgressScrollIndicator from "@/components/features/home/progress-scroll-indicator";
import { HeroForcer } from "@/components/ui/theme/hero-forcer";

// Dynamic imports cho performance optimization
const AILearning = dynamic(() => import('@/components/features/home/ai-learning'), {
  loading: () => <div className="h-96 animate-pulse bg-muted rounded-lg" />
});

const FeaturedCourses = dynamic(() => import('@/components/features/home/featured-courses'), {
  loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />
});

const Testimonials = dynamic(() => import('@/components/features/home/testimonials'), {
  loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />
});

export const metadata: Metadata = {
  title: "NyNus - Nền tảng học tập toán học tương tác với AI",
  description: "Học toán thông minh với AI, nền tảng học tập cá nhân hóa giúp học sinh đạt kết quả tốt hơn với sự hỗ trợ của trí tuệ nhân tạo.",
};

export default function Home() {
  return (
    <div>
      <HeroForcer>
        <Hero />
      </HeroForcer>
      <Features />
      <AILearning />
      <FeaturedCourses />
      <Testimonials />  
      <FAQ />
      <ProgressScrollIndicator />
    </div>
  );
}

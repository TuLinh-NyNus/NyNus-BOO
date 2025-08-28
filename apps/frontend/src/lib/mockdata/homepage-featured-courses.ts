// Featured courses mockdata for homepage
export interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  students: number;
  duration: number;
  image: string;
  rating: number;
  color: string;
  topics?: { label: string; badgeColor?: string }[];
}

export const featuredCourses: FeaturedCourse[] = [
  // 1) TUYỂN SINH 10
  {
    id: "1",
    title: "Toán học",
    description: "Chuẩn bị và ôn tập kiến thức nền tảng vững chắc cho kỳ thi vào lớp 10 THPT",
    level: "TUYỂN SINH 10",
    students: 0,
    duration: 0,
    image: "/courses/card-1-tuyen-sinh-10.svg",
    rating: 0,
    color: "orange",
    topics: [
      { label: "HÌNH HỌC", badgeColor: "amber" },
      { label: "XÁC SUẤT VÀ THỐNG KÊ", badgeColor: "amber" },
      { label: "Đại số", badgeColor: "amber" }
    ]
  },
  // 2) LỚP 10
  {
    id: "2",
    title: "Toán học",
    description: "Nền tảng vững chắc cho chương trình THPT và chuẩn bị cho kỳ thi đại học",
    level: "LỚP 10",
    students: 0,
    duration: 0,
    image: "/courses/card-2-lop-10.svg",
    rating: 0,
    color: "green",
    topics: [
      { label: "HÌNH HỌC", badgeColor: "emerald" },
      { label: "XÁC SUẤT VÀ THỐNG KÊ", badgeColor: "emerald" },
      { label: "Đại số", badgeColor: "emerald" }
    ]
  },
  // 3) LỚP 11
  {
    id: "3",
    title: "Toán học",
    description: "Chuyên sâu kiến thức và kỹ năng giải bài tập toán học nâng cao trong chương trình THPT",
    level: "LỚP 11",
    students: 0,
    duration: 0,
    image: "/courses/card-3-lop-11.svg",
    rating: 0,
    color: "indigo",
    topics: [
      { label: "HÌNH HỌC", badgeColor: "indigo" },
      { label: "XÁC SUẤT VÀ THỐNG KÊ", badgeColor: "indigo" },
      { label: "Đại số và Giải tích", badgeColor: "indigo" }
    ]
  },
  // 4) LỚP 12
  {
    id: "4",
    title: "Toán học",
    description: "Luyện đề và kỹ năng làm bài thi trắc nghiệm hiệu quả với các dạng bài tập đa dạng",
    level: "LỚP 12",
    students: 0,
    duration: 0,
    image: "/courses/card-4-lop-12.svg",
    rating: 0,
    color: "purple",
    topics: [
      { label: "HÌNH HỌC", badgeColor: "purple" },
      { label: "XÁC SUẤT VÀ THỐNG KÊ", badgeColor: "purple" },
      { label: "Đại số và Giải tích", badgeColor: "purple" }
    ]
  }
];

export const getGradient = (color: string | undefined) => {
  if (!color) return "from-primary/60 to-primary/40";

  // NyNus semantic colors with soft gradients for light mode
  const gradients = {
    blue: "from-primary/60 to-primary/40",        // Gold gradient (primary)
    purple: "from-secondary/60 to-secondary/40",  // Terracotta gradient (secondary)
    pink: "from-accent/60 to-accent/40",          // Pink gradient (accent)
    green: "from-primary/60 to-primary/40",       // Gold gradient (primary)
    orange: "from-secondary/60 to-secondary/40"   // Terracotta gradient (secondary)
  };

  return gradients[color as keyof typeof gradients] || "from-primary/60 to-primary/40";
};

// Function to get homepage featured courses
export const getHomepageFeaturedCourses = () => {
  return Promise.resolve(featuredCourses);
};

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
}

export const featuredCourses: FeaturedCourse[] = [
  {
    id: "1",
    title: "Toán học lớp 9 cơ bản và nâng cao",
    description: "Chuẩn bị hành trang vững chắc cho kỳ thi vào lớp 10",
    level: "Lớp 9",
    students: 1245,
    duration: 48,
    image: "/images/courses/algebra.jpg",
    rating: 4.8,
    color: "blue"
  },
  {
    id: "2",
    title: "Ôn thi THPT Quốc gia môn Toán",
    description: "Luyện đề và kỹ năng làm bài thi trắc nghiệm hiệu quả",
    level: "Lớp 12",
    students: 958,
    duration: 72,
    image: "/images/courses/calculus.jpg",
    rating: 4.9,
    color: "purple"
  },
  {
    id: "3",
    title: "Hình học không gian lớp 11",
    description: "Nắm vững kiến thức và kỹ năng giải bài tập hình học không gian",
    level: "Lớp 11",
    students: 720,
    duration: 36,
    image: "/images/courses/geometry.jpg",
    rating: 4.7,
    color: "pink"
  },
  {
    id: "4",
    title: "Đại số và Giải tích lớp 10",
    description: "Nền tảng vững chắc cho chương trình THPT",
    level: "Lớp 10",
    students: 890,
    duration: 42,
    image: "/images/courses/math.jpg",
    rating: 4.6,
    color: "green"
  },
  {
    id: "5",
    title: "Toán nâng cao cho học sinh lớp 12",
    description: "Ôn luyện chuyên sâu cho kỳ thi đại học khối A",
    level: "Lớp 12",
    students: 632,
    duration: 54,
    image: "/images/courses/advanced.jpg",
    rating: 4.8,
    color: "orange"
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

// Function to get featured courses
export const getFeaturedCourses = () => {
  return Promise.resolve(featuredCourses);
};

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
  school: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  achievement?: string;
  studyTime?: string;
  improvement?: string;
}

export const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: "Nguyễn Minh An",
    role: "Học sinh lớp 12",
    content: "NyNus giúp em cải thiện điểm Toán từ 6 lên 8.5 chỉ trong 3 tháng! AI của NyNus thực sự hiểu được điểm yếu của em và đưa ra lộ trình học phù hợp.",
    avatar: "/avatars/student-1.svg",
    rating: 5,
    school: "THPT Chu Văn An",
    achievement: "Tăng điểm từ 6.0 → 8.5",
    studyTime: "3 tháng",
    improvement: "41.7%"
  },
  {
    id: 2,
    name: "Trần Thị Bảo",
    role: "Học sinh lớp 11",
    content: "Giao diện thân thiện, bài tập phong phú và có giải thích chi tiết. Em đặc biệt thích tính năng thi thử với kết quả phân tích ngay lập tức.",
    avatar: "/avatars/student-2.svg",
    rating: 5,
    school: "THPT Lê Quý Đôn",
    achievement: "Hoàn thành 85% chương trình",
    studyTime: "6 tháng",
    improvement: "Từ 7.0 → 8.8"
  },
  {
    id: 3,
    name: "Lê Văn Đức",
    role: "Học sinh lớp 10",
    content: "Trước đây em rất sợ môn Toán, nhưng với NyNus, học Toán trở nên thú vị hơn nhiều. Các video bài giảng dễ hiểu và bài tập được sắp xếp từ dễ đến khó rất logic.",
    avatar: "/avatars/student-3.svg",
    rating: 5,
    school: "THPT Nguyễn Huệ",
    achievement: "Vượt qua nỗi sợ Toán",
    studyTime: "4 tháng",
    improvement: "Từ 5.5 → 8.2"
  },
  {
    id: 4,
    name: "Phạm Thị Hương",
    role: "Học sinh lớp 12",
    content: "NyNus giúp em ôn thi đại học hiệu quả. Hệ thống AI đề xuất bài tập phù hợp với trình độ và mục tiêu của em. Kết quả: đạt 9.0 điểm Toán trong kỳ thi THPT.",
    avatar: "/avatars/student-4.svg",
    rating: 5,
    school: "THPT Trần Phú",
    achievement: "Đạt 9.0 điểm Toán THPT",
    studyTime: "8 tháng",
    improvement: "Từ 7.5 → 9.0"
  },
  {
    id: 5,
    name: "Hoàng Văn Nam",
    role: "Học sinh lớp 11",
    content: "Em thích cách NyNus phân tích điểm yếu và đưa ra lộ trình học cá nhân hóa. Mỗi bài tập đều có giải thích chi tiết và video hướng dẫn rõ ràng.",
    avatar: "/avatars/student-5.svg",
    rating: 5,
    school: "THPT Lý Thường Kiệt",
    achievement: "Hoàn thành 12 chương",
    studyTime: "5 tháng",
    improvement: "Từ 6.8 → 8.5"
  },
  {
    id: 6,
    name: "Vũ Thị Lan",
    role: "Học sinh lớp 10",
    content: "NyNus giúp em xây dựng nền tảng Toán vững chắc. Các khái niệm được giải thích từ cơ bản đến nâng cao, giúp em hiểu sâu và nhớ lâu.",
    avatar: "/avatars/student-6.svg",
    rating: 5,
    school: "THPT Nguyễn Trãi",
    achievement: "Nền tảng Toán vững chắc",
    studyTime: "3 tháng",
    improvement: "Từ 6.0 → 8.0"
  },
  {
    id: 7,
    name: "Đỗ Văn Hùng",
    role: "Học sinh lớp 12",
    content: "Nhờ NyNus, em đã cải thiện điểm số một cách đáng kể. Hệ thống AI thông minh giúp em tập trung vào những phần còn yếu và luyện tập hiệu quả.",
    avatar: "/avatars/student-7.svg",
    rating: 5,
    school: "THPT Hà Nội - Amsterdam",
    achievement: "Top 10% học sinh giỏi",
    studyTime: "10 tháng",
    improvement: "Từ 7.0 → 9.2"
  },
  {
    id: 8,
    name: "Lý Thị Mai",
    role: "Học sinh lớp 11",
    content: "Em rất thích cách NyNus tổ chức nội dung học tập. Mỗi chương đều có bài kiểm tra và đánh giá chi tiết, giúp em theo dõi tiến độ học tập.",
    avatar: "/avatars/student-8.svg",
    rating: 5,
    school: "THPT Chuyên Sư phạm",
    achievement: "Hoàn thành 90% chương trình",
    studyTime: "7 tháng",
    improvement: "Từ 6.5 → 8.7"
  }
];

export const testimonialsStats = {
  totalStudents: 1500,
  averageRating: 4.9,
  improvementRate: 87,
  totalStudyTime: "3.2 triệu giờ",
  completedChapters: "18,500+",
  averageImprovement: "2.5 điểm"
};

export const videoTestimonials = [
  {
    id: 1,
    name: "Nguyễn Minh An",
    role: "Học sinh lớp 12",
    videoUrl: "/videos/testimonial-1.mp4",
    thumbnailUrl: "/thumbnails/testimonial-1.svg",
    duration: "2:15",
    content: "Chia sẻ về hành trình cải thiện điểm Toán với NyNus"
  },
  {
    id: 2,
    name: "Trần Thị Bảo",
    role: "Học sinh lớp 11",
    videoUrl: "/videos/testimonial-2.mp4",
    thumbnailUrl: "/thumbnails/testimonial-2.svg",
    duration: "1:48",
    content: "Trải nghiệm học tập với AI tutor thông minh"
  },
  {
    id: 3,
    name: "Lê Văn Đức",
    role: "Học sinh lớp 10",
    videoUrl: "/videos/testimonial-3.mp4",
    thumbnailUrl: "/thumbnails/testimonial-3.svg",
    duration: "2:32",
    content: "Hành trình vượt qua nỗi sợ Toán với NyNus"
  }
];

// Thêm dữ liệu cho courses layout testimonials
export const coursesTestimonials = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    role: "Học sinh lớp 12",
    avatar: "/avatars/student-1.svg",
    content: "Nhờ có NyNus mà em đã cải thiện được điểm Toán từ 6 lên 9. Các bài giảng rất dễ hiểu và có nhiều bài tập thực hành.",
    rating: 5,
    achievement: "Tăng điểm từ 6.0 → 9.0",
    studyTime: "8 tháng",
    improvement: "50%"
  },
  {
    id: 2,
    name: "Trần Văn Hùng",
    role: "Phụ huynh",
    avatar: "/avatars/parent-1.svg",
    content: "Con tôi học trên NyNus được 6 tháng, tiến bộ rất rõ rệt. Giao diện thân thiện, nội dung chất lượng cao.",
    rating: 5,
    achievement: "Tiến bộ rõ rệt",
    studyTime: "6 tháng",
    improvement: "Từ 7.0 → 8.5"
  },
  {
    id: 3,
    name: "Lê Thị Mai",
    role: "Học sinh lớp 10",
    avatar: "/avatars/student-2.svg",
    content: "Em rất thích cách giảng dạy của các thầy cô trên NyNus. Học online mà vẫn cảm thấy như được học trực tiếp.",
    rating: 5,
    achievement: "Trải nghiệm học tập tốt",
    studyTime: "4 tháng",
    improvement: "Từ 6.5 → 8.0"
  },
  {
    id: 4,
    name: "Phạm Đức Nam",
    role: "Học sinh lớp 11",
    avatar: "/avatars/student-3.svg",
    content: "Hệ thống bài tập trên NyNus rất phong phú, giúp em luyện tập và củng cố kiến thức hiệu quả.",
    rating: 5,
    achievement: "Hoàn thành 10 chương",
    studyTime: "5 tháng",
    improvement: "Từ 7.0 → 8.8"
  },
  {
    id: 5,
    name: "Hoàng Thị Lan",
    role: "Giáo viên",
    avatar: "/avatars/teacher-1.svg",
    content: "Tôi thường giới thiệu NyNus cho học sinh của mình. Nội dung bài giảng rất chất lượng và phù hợp với chương trình học.",
    rating: 5,
    achievement: "Được giáo viên tin tưởng",
    studyTime: "12 tháng",
    improvement: "N/A"
  }
];

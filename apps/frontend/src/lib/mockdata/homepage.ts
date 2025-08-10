// Homepage mockdata for NyNus platform
export interface HeroData {
  badge: {
    icon: string;
    text: string;
  };
  title: string;
  subtitle: string;
  description: string;
  ctaButtons: {
    primary: {
      text: string;
      href: string;
      price?: string;
      originalPrice?: string;
      description?: string;
    };
    secondary: {
      text: string;
      action: string;
    };
  };
  stats: {
    studentsCount: number;
    studentsText: string;
  };
}

export interface FeatureItem {
  id: number;
  icon: string;
  title: string;
  description: string;
  color: string;
  link: string;
  // Enhanced content for Phase 2
  stats?: {
    value: string;
    label: string;
    trend?: 'up' | 'down' | 'stable';
  };
  benefits: string[];
  detailedDescription: string;
  cta: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary';
  };
  highlights: string[];
}

export interface FeaturesData {
  badge: {
    icon: string;
    text: string;
  };
  title: string;
  subtitle: string;
  features: FeatureItem[];
  ctaButton: {
    text: string;
    href: string;
  };
}

export interface AILearningData {
  badge: {
    icon: string;
    text: string;
  };
  title: string;
  subtitle: string;
  features: {
    id: number;
    icon: string;
    title: string;
    description: string;
    color: string;
  }[];
  dashboard: {
    profile: {
      title: string;
      subtitle: string;
    };
    analytics: {
      title: string;
      lastUpdate: string;
      subjects: {
        name: string;
        percentage: number;
        color: string;
      }[];
    };
    roadmap: {
      title: string;
      tasks: {
        id: number;
        title: string;
        progress: number;
        color: string;
      }[];
    };
    notification: {
      title: string;
      message: string;
    };
  };
  ctaButton: {
    text: string;
    href: string;
  };
}

// Hero Section Data
export const heroData: HeroData = {
  badge: {
    icon: "✨",
    text: "✨ NyNus ✨"
  },
  title: "Học Toán  \n cùng NyNus",
  subtitle: "Nền tảng học toán trực tuyến được cá nhân hóa bởi AI",
  description: "Nền tảng học toán tương tác, cá nhân hóa trải nghiệm học tập, giúp học viên nâng cao kỹ năng.",
  ctaButtons: {
    primary: {
      text: "BẮT ĐẦU HỌC MIỄN PHÍ",
      href: "/auth/register",
      price: "Miễn phí 2 năm - 1 triệu",
      originalPrice: "",
      description: ""
    },
    secondary: {
      text: "Xem giới thiệu",
      action: "openVideoModal"
    }
  },
  stats: {
    studentsCount: 1200,
    studentsText: "Hơn 1,200 học viên đã trải nghiệm học tập cùng NyNus"
  }
};

// Features Section Data
export const featuresData: FeaturesData = {
  badge: {
    icon: "Info",
    text: "Tính năng nổi bật"
  },
  title: "Học tập thông minh",
  subtitle: "Khám phá các công cụ giúp bạn học toán hiệu quả hơn bao giờ hết",
  features: [
    {
      id: 1,
      icon: "Trophy",
      title: "Phòng thi trực tuyến",
      description: "Làm đề có sẵn, tùy chỉnh, thi đấu trực tiếp với bạn bè",
      color: "primary",
      link: "#",
      stats: {
        value: "1,200+",
        label: "Học viên tham gia",
        trend: "up"
      },
      benefits: [
        "Thi thử không giới hạn",
        "Chấm điểm tự động",
        "Phân tích chi tiết kết quả",
        "Xếp hạng realtime"
      ],
      detailedDescription: "Hệ thống phòng thi trực tuyến hiện đại với công nghệ chống gian lận, hỗ trợ nhiều định dạng câu hỏi và tự động tạo báo cáo chi tiết.\nVí dụ: Thi thử THPT QG với 40 câu hỏi, thời gian 90 phút, kết quả chi tiết theo từng chủ đề",
      cta: {
        text: "Thi thử ngay",
        href: "/exam/demo",
        variant: "primary"
      },
      highlights: ["Miễn phí", "Không giới hạn", "Kết quả tức thì"]
    },
    {
      id: 2,
      icon: "Search",
      title: "Tìm kiếm thông minh",
      description: "Gợi ý câu hỏi phù hợp, bộ lọc nâng cao theo chủ đề",
      color: "secondary",
      link: "#",
      stats: {
        value: "95%",
        label: "Độ chính xác gợi ý",
        trend: "stable"
      },
      benefits: [
        "AI phân tích nhu cầu học tập",
        "Gợi ý câu hỏi cá nhân hóa",
        "Bộ lọc thông minh",
        "Lưu lịch sử tìm kiếm"
      ],
      detailedDescription: "Công cụ tìm kiếm được trang bị AI giúp tìm ra những câu hỏi phù hợp nhất với trình độ và mục tiêu học tập của bạn.\nVí dụ: Tìm 'phương trình bậc 2' → AI gợi ý 15 dạng bài từ cơ bản đến nâng cao",
      cta: {
        text: "Khám phá ngay",
        href: "/search",
        variant: "secondary"
      },
      highlights: ["AI-powered", "Cá nhân hóa", "Thông minh"]
    },
    {
      id: 3,
      icon: "Video",
      title: "Khóa học tương tác",
      description: "Video bài giảng, bài tập tự động chấm điểm chi tiết",
      color: "accent",
      link: "#",
      stats: {
        value: "50+",
        label: "Khóa học chất lượng",
        trend: "up"
      },
      benefits: [
        "Video HD chất lượng cao",
        "Bài tập tương tác",
        "Theo dõi tiến độ",
        "Chứng chỉ hoàn thành"
      ],
      detailedDescription: "Thư viện khóa học phong phú với video bài giảng chất lượng cao, bài tập tương tác và hệ thống theo dõi tiến độ chi tiết.\nVí dụ: Khóa 'Hàm số lớp 12' - 24 video, 120 bài tập, hoàn thành 85% nhận chứng chỉ",
      cta: {
        text: "Xem khóa học",
        href: "/courses",
        variant: "primary"
      },
      highlights: ["HD Quality", "Tương tác", "Chứng chỉ"]
    },
    {
      id: 4,
      icon: "Bot",
      title: "Chatbot AI hỗ trợ",
      description: "Giải bài tập, gợi ý phương pháp học hiệu quả",
      color: "primary",
      link: "#",
      stats: {
        value: "24/7",
        label: "Hỗ trợ không ngừng",
        trend: "stable"
      },
      benefits: [
        "Giải thích từng bước",
        "Gợi ý phương pháp học",
        "Trả lời tức thì",
        "Học máy liên tục"
      ],
      detailedDescription: "Trợ lý AI thông minh có thể giải thích bài tập, đưa ra gợi ý học tập và hỗ trợ bạn 24/7 trong quá trình học.\nVí dụ: 'Làm sao giải phương trình này?' → AI giải từng bước + 3 phương pháp khác",
      cta: {
        text: "Chat ngay",
        href: "/ai-chat",
        variant: "secondary"
      },
      highlights: ["24/7", "Thông minh", "Tức thì"]
    }
  ],
  ctaButton: {
    text: "Xem tất cả tính năng",
    href: "/features"
  }
};

// AI Learning Section Data
export const aiLearningData: AILearningData = {
  badge: {
    icon: "Sparkles",
    text: "Công nghệ AI tiên tiến"
  },
  title: "Học tập cá nhân hóa với AI",
  subtitle: "Công nghệ AI giúp đánh giá năng lực, gợi ý lộ trình học tập tối ưu dựa trên điểm mạnh và điểm yếu của từng học sinh.",
  features: [
    {
      id: 1,
      icon: "Target",
      title: "Phân tích điểm mạnh yếu",
      description: "AI phân tích chi tiết năng lực theo từng chủ đề và dạng bài, giúp bạn hiểu rõ những lĩnh vực cần cải thiện.",
      color: "blue"
    },
    {
      id: 2,
      icon: "LineChart",
      title: "Theo dõi tiến độ trực quan",
      description: "Biểu đồ hiển thị sự tiến bộ và tốc độ học tập theo thời gian, giúp duy trì động lực học tập.",
      color: "purple"
    },
    {
      id: 3,
      icon: "Brain",
      title: "Gợi ý cá nhân hóa",
      description: "Đề xuất bài tập và phương pháp học tối ưu cho từng học sinh dựa trên phong cách học và mục tiêu.",
      color: "pink"
    }
  ],
  dashboard: {
    profile: {
      title: "Hồ sơ học tập",
      subtitle: "Lớp 12 • Chuyên Toán"
    },
    analytics: {
      title: "Phân tích kỹ năng",
      lastUpdate: "Cập nhật gần nhất: Hôm nay",
      subjects: [
        { name: "Đại số", percentage: 60, color: "primary" },
        { name: "Hình học", percentage: 80, color: "primary" },
        { name: "Giải tích", percentage: 40, color: "primary" },
        { name: "Xác suất", percentage: 70, color: "secondary" },
        { name: "Thống kê", percentage: 55, color: "secondary" },
        { name: "Tổ hợp", percentage: 65, color: "accent" }
      ]
    },
    roadmap: {
      title: "Đề xuất lộ trình học",
      tasks: [
        {
          id: 1,
          title: "Ôn tập phương trình bậc hai",
          progress: 75,
          color: "primary"
        },
        {
          id: 2,
          title: "Luyện tập bất đẳng thức Cauchy",
          progress: 50,
          color: "secondary"
        },
        {
          id: 3,
          title: "Làm đề thi Hình học không gian",
          progress: 25,
          color: "accent"
        }
      ]
    },
    notification: {
      title: "Thành tích mới!",
      message: "Bạn đã hoàn thành 5 bài tập liên tiếp chính xác."
    }
  },
  ctaButton: {
    text: "Tìm hiểu thêm về công nghệ AI",
    href: "/ai-learning"
  }
};
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
  subtitle: "Dễ dàng - Chính Xác - Thuận tiện",
  description: "Nền tảng học toán tương tác, cá nhân hóa trải nghiệm học tập, giúp học viên nâng cao kỹ năng.",
  ctaButtons: {
    primary: {
      text: "NÂNG CẤP PRO MIỄN PHÍ",
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
    studentsText: "Chưa có ai đăng kí hết, đăng kí để làm chuột bạch nhé!"
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
      link: "#"
    },
    {
      id: 2,
      icon: "Search",
      title: "Tìm kiếm thông minh",
      description: "Gợi ý câu hỏi phù hợp, bộ lọc nâng cao theo chủ đề",
      color: "secondary",
      link: "#"
    },
    {
      id: 3,
      icon: "Video",
      title: "Khóa học tương tác",
      description: "Video bài giảng, bài tập tự động chấm điểm chi tiết",
      color: "accent",
      link: "#"
    },
    {
      id: 4,
      icon: "Bot",
      title: "Chatbot AI hỗ trợ",
      description: "Giải bài tập, gợi ý phương pháp học hiệu quả",
      color: "primary",
      link: "#"
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
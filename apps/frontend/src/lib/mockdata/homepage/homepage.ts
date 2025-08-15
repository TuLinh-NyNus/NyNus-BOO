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
      icon: "Calculator",
      title: "Luyện tập theo chương",
      description: "Hệ thống bài tập được phân loại theo từng chương, từ cơ bản đến nâng cao",
      color: "primary",
      link: "#",
      stats: {
        value: "1,200+",
        label: "Học viên tham gia",
        trend: "up"
      },
      benefits: [
        "Bài tập phân cấp độ khó",
        "Chấm điểm tự động tức thì",
        "Gợi ý khi làm sai"
      ],
      detailedDescription: "Hệ thống luyện tập được thiết kế theo chương trình SGK, giúp học sinh nắm vững kiến thức từng bước một cách có hệ thống.",
      cta: {
        text: "Thử bài mẫu",
        href: "/practice/demo",
        variant: "primary"
      },
      highlights: ["Theo SGK", "Phân cấp", "Tự động"]
    },
    {
      id: 2,
      icon: "Brain",
      title: "AI gợi ý từng bước",
      description: "Trợ lý AI giải thích chi tiết cách làm bài, gợi ý phương pháp tối ưu",
      color: "secondary",
      link: "#",
      stats: {
        value: "24/7",
        label: "Hỗ trợ không ngừng",
        trend: "stable"
      },
      benefits: [
        "Giải thích từng bước chi tiết",
        "Gợi ý nhiều cách giải",
        "Trả lời tức thì mọi lúc"
      ],
      detailedDescription: "AI thông minh phân tích bài toán và đưa ra lời giải chi tiết, giúp học sinh hiểu rõ phương pháp và tự tin giải các bài tương tự.",
      cta: {
        text: "Chat với AI",
        href: "/ai-chat",
        variant: "secondary"
      },
      highlights: ["24/7", "Chi tiết", "Thông minh"]
    },
    {
      id: 3,
      icon: "Trophy",
      title: "Thi thử miễn phí",
      description: "Làm đề thi thử THPT Quốc gia, thi vào 10 với kết quả chi tiết",
      color: "accent",
      link: "#",
      stats: {
        value: "50+",
        label: "Đề thi chất lượng",
        trend: "up"
      },
      benefits: [
        "Đề thi chuẩn Bộ GD&ĐT",
        "Chấm điểm tự động",
        "Phân tích chi tiết kết quả"
      ],
      detailedDescription: "Hệ thống thi thử với đề thi được biên soạn theo chuẩn Bộ GD&ĐT, giúp học sinh làm quen với format thi và đánh giá năng lực.",
      cta: {
        text: "Làm đề thử",
        href: "/exam/demo",
        variant: "primary"
      },
      highlights: ["Miễn phí", "Chuẩn BGD", "Chi tiết"]
    },
    {
      id: 4,
      icon: "Video",
      title: "Học qua video bài giảng",
      description: "Thư viện video HD với giảng viên kinh nghiệm, dễ hiểu và sinh động",
      color: "primary",
      link: "#",
      stats: {
        value: "200+",
        label: "Video chất lượng",
        trend: "up"
      },
      benefits: [
        "Video HD chất lượng cao",
        "Giảng viên kinh nghiệm",
        "Học mọi lúc mọi nơi"
      ],
      detailedDescription: "Thư viện video bài giảng phong phú với các giảng viên có nhiều năm kinh nghiệm, giúp học sinh hiểu bài một cách trực quan và sinh động.",
      cta: {
        text: "Xem video mẫu",
        href: "/courses/demo",
        variant: "secondary"
      },
      highlights: ["HD", "Kinh nghiệm", "Linh hoạt"]
    },
    {
      id: 5,
      icon: "Progress",
      title: "Theo dõi tiến độ học tập",
      description: "Báo cáo chi tiết về quá trình học, điểm mạnh yếu và lộ trình cải thiện",
      color: "secondary",
      link: "#",
      stats: {
        value: "95%",
        label: "Độ chính xác phân tích",
        trend: "stable"
      },
      benefits: [
        "Phân tích điểm mạnh yếu",
        "Lộ trình học cá nhân hóa",
        "Báo cáo tiến độ chi tiết"
      ],
      detailedDescription: "Hệ thống AI phân tích quá trình học tập và đưa ra báo cáo chi tiết về năng lực, giúp học sinh và phụ huynh theo dõi tiến độ hiệu quả.",
      cta: {
        text: "Xem báo cáo mẫu",
        href: "/progress/demo",
        variant: "secondary"
      },
      highlights: ["AI phân tích", "Cá nhân hóa", "Chi tiết"]
    },
    {
      id: 6,
      icon: "Users",
      title: "Tài nguyên cho giáo viên",
      description: "Ngân hàng đề thi, bài giảng và công cụ quản lý lớp học hiện đại",
      color: "accent",
      link: "#",
      stats: {
        value: "500+",
        label: "Tài liệu chất lượng",
        trend: "up"
      },
      benefits: [
        "Ngân hàng đề thi phong phú",
        "Công cụ quản lý lớp học",
        "Báo cáo học sinh chi tiết"
      ],
      detailedDescription: "Bộ công cụ toàn diện dành cho giáo viên với ngân hàng đề thi, bài giảng và hệ thống quản lý lớp học hiện đại.",
      cta: {
        text: "Dành cho giáo viên",
        href: "/teacher/resources",
        variant: "primary"
      },
      highlights: ["Giáo viên", "Quản lý", "Toàn diện"]
    },
    {
      id: 7,
      icon: "BookOpen",
      title: "Lý thuyết toán học",
      description: "Hệ thống lý thuyết đầy đủ từ cơ bản đến nâng cao, được trình bày rõ ràng và dễ hiểu",
      color: "primary",
      link: "#",
      stats: {
        value: "300+",
        label: "Chuyên đề lý thuyết",
        trend: "up"
      },
      benefits: [
        "Lý thuyết đầy đủ theo SGK",
        "Ví dụ minh họa chi tiết",
        "Công thức và định lý quan trọng"
      ],
      detailedDescription: "Hệ thống lý thuyết toán học được biên soạn theo chương trình SGK, giúp học sinh nắm vững kiến thức nền tảng trước khi làm bài tập.",
      cta: {
        text: "Xem lý thuyết",
        href: "/courses",
        variant: "primary"
      },
      highlights: ["Đầy đủ", "Dễ hiểu", "Theo SGK"]
    },
    {
      id: 8,
      icon: "GraduationCap",
      title: "Khóa học trực tuyến",
      description: "Các khóa học được thiết kế bài bản từ giáo viên kinh nghiệm, học theo lộ trình rõ ràng",
      color: "primary",
      link: "#",
      stats: {
        value: "50+",
        label: "Khóa học chất lượng",
        trend: "up"
      },
      benefits: [
        "Lộ trình học có hệ thống",
        "Giáo viên kinh nghiệm",
        "Chứng chỉ hoàn thành"
      ],
      detailedDescription: "Các khóa học trực tuyến được thiết kế theo lộ trình khoa học, giúp học sinh học tập hiệu quả và đạt kết quả cao.",
      cta: {
        text: "Xem khóa học",
        href: "/courses",
        variant: "primary"
      },
      highlights: ["Có hệ thống", "Kinh nghiệm", "Chứng chỉ"]
    },
    {
      id: 9,
      icon: "Target",
      title: "Luyện đề thi",
      description: "Hệ thống đề thi đa dạng từ cơ bản đến nâng cao, giúp rèn luyện kỹ năng làm bài",
      color: "accent",
      link: "#",
      stats: {
        value: "100+",
        label: "Đề thi đa dạng",
        trend: "up"
      },
      benefits: [
        "Đề thi phân cấp độ khó",
        "Giải thích chi tiết đáp án",
        "Thống kê kết quả học tập"
      ],
      detailedDescription: "Ngân hàng đề thi phong phú với các mức độ khác nhau, giúp học sinh rèn luyện và nâng cao kỹ năng làm bài thi.",
      cta: {
        text: "Luyện đề ngay",
        href: "/practice-tests",
        variant: "primary"
      },
      highlights: ["Đa dạng", "Phân cấp", "Chi tiết"]
    },
    {
      id: 10,
      icon: "HelpCircle",
      title: "Hỏi đáp câu hỏi",
      description: "Đặt câu hỏi và nhận câu trả lời từ giáo viên, AI hoặc cộng đồng học sinh",
      color: "secondary",
      link: "#",
      stats: {
        value: "24/7",
        label: "Hỗ trợ liên tục",
        trend: "stable"
      },
      benefits: [
        "Hỏi đáp trực tiếp với giáo viên",
        "AI trả lời tức thì",
        "Cộng đồng học sinh hỗ trợ"
      ],
      detailedDescription: "Hệ thống hỏi đáp thông minh giúp học sinh giải quyết mọi thắc mắc trong quá trình học tập một cách nhanh chóng.",
      cta: {
        text: "Đặt câu hỏi",
        href: "/questions",
        variant: "secondary"
      },
      highlights: ["24/7", "Đa dạng", "Tức thì"]
    },
    {
      id: 11,
      icon: "MessageSquare",
      title: "Thảo luận cộng đồng",
      description: "Tham gia thảo luận với học sinh và giáo viên, chia sẻ kinh nghiệm học tập",
      color: "accent",
      link: "#",
      stats: {
        value: "5,000+",
        label: "Thành viên tích cực",
        trend: "up"
      },
      benefits: [
        "Cộng đồng học tập sôi động",
        "Chia sẻ kinh nghiệm học tập",
        "Hỗ trợ lẫn nhau trong học tập"
      ],
      detailedDescription: "Diễn đàn thảo luận nơi học sinh có thể trao đổi, chia sẻ kinh nghiệm và cùng nhau tiến bộ trong học tập.",
      cta: {
        text: "Tham gia thảo luận",
        href: "/discussions",
        variant: "secondary"
      },
      highlights: ["Cộng đồng", "Chia sẻ", "Hỗ trợ"]
    },
    {
      id: 12,
      icon: "Bot",
      title: "Nhắn tin với AI",
      description: "Trò chuyện trực tiếp với AI để được hỗ trợ học tập 24/7, giải đáp mọi thắc mắc",
      color: "secondary",
      link: "#",
      stats: {
        value: "∞",
        label: "Không giới hạn",
        trend: "stable"
      },
      benefits: [
        "AI thông minh và hiểu biết",
        "Trả lời tức thì mọi lúc",
        "Hỗ trợ đa dạng chủ đề"
      ],
      detailedDescription: "Trợ lý AI thông minh có thể trò chuyện và hỗ trợ học tập 24/7, giúp giải quyết mọi thắc mắc của học sinh.",
      cta: {
        text: "Chat với AI",
        href: "/ai-chat",
        variant: "primary"
      },
      highlights: ["24/7", "Thông minh", "Tức thì"]
    },
    {
      id: 13,
      icon: "Library",
      title: "Thư viện tài liệu",
      description: "Kho tàng tài liệu học tập phong phú với sách, bài giảng và tài liệu tham khảo",
      color: "primary",
      link: "#",
      stats: {
        value: "1,000+",
        label: "Tài liệu chất lượng",
        trend: "up"
      },
      benefits: [
        "Tài liệu đa dạng và phong phú",
        "Được cập nhật thường xuyên",
        "Dễ dàng tìm kiếm và tải về"
      ],
      detailedDescription: "Thư viện tài liệu số với hàng nghìn tài liệu học tập chất lượng cao, giúp học sinh mở rộng kiến thức.",
      cta: {
        text: "Khám phá thư viện",
        href: "/library",
        variant: "secondary"
      },
      highlights: ["Phong phú", "Chất lượng", "Cập nhật"]
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
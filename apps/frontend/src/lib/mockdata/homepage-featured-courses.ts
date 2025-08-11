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
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhbGdlYnJhR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNCODJGNjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxRTQwQUY7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjYWxnZWJyYUdyYWQpIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjMwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIxNjAiIHI9IjQwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48dGV4dCB4PSIyMDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPsSQ4bqhaSBz4buRPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOCkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+VG/DoW4gaOG7jWMgbOG7m3AgOTwvdGV4dD48L3N2Zz4=",
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
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJjYWxjdWx1c0dyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjVDRjY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNUIyMUI2O3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSJ1cmwoI2NhbGN1bHVzR3JhZCkiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjYwIiByPSIyNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPjxjaXJjbGUgY3g9IjMyMCIgY3k9IjE4MCIgcj0iMzUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+R2nhuqNpIHTDrWNoPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOCkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+VEhQVCBRdeG7kWMgZ2lhPC90ZXh0Pjwvc3ZnPg==",
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
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnZW9tZXRyeUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNFQzQ4OTk7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojQkUxODVEO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSJ1cmwoI2dlb21ldHJ5R3JhZCkiLz48cG9seWdvbiBwb2ludHM9IjEyMCw4MCAxNjAsNDAgMjAwLDgwIDE2MCwxMjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjxjaXJjbGUgY3g9IjI4MCIgY3k9IjE2MCIgcj0iMzAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48dGV4dCB4PSIyMDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkjDrG5oIGjhu41jPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOCkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+S2jDtG5nIGdpYW4gbOG7m3AgMTE8L3RleHQ+PC9zdmc+",
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
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJtYXRoR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzEwQjk4MTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNDc4NTc7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjbWF0aEdyYWQpIi8+PHJlY3QgeD0iOTAiIHk9IjcwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgcng9IjUiLz48Y2lyY2xlIGN4PSIzMTAiIGN5PSIxNzAiIHI9IjI1IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpIi8+PHRleHQgeD0iMjAwIiB5PSIxMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIj5Ub8OhbiDEkeG7jWM8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIxNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij7EkOG6oWkgc+G7kSBs4bubcCAxMDwvdGV4dD48L3N2Zz4=",
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
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhZHZhbmNlZEdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGOTczMTY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojQzI0MTBDO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSJ1cmwoI2FkdmFuY2VkR3JhZCkiLz48cG9seWdvbiBwb2ludHM9IjEwMCw2MCAxNDAsNjAgMTIwLDEwMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIi8+PHJlY3QgeD0iMjYwIiB5PSIxNDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPk7DonEgY2FvPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOCkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+VG/DoW4gbOG7m3AgMTI8L3RleHQ+PC9zdmc+",
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

// Function to get homepage featured courses
export const getHomepageFeaturedCourses = () => {
  return Promise.resolve(featuredCourses);
};

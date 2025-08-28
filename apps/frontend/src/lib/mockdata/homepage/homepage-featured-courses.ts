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
    title: "Ôn thi vào lớp 10 môn Toán",
    description: "Chuẩn bị hành trang vững chắc cho kỳ thi vào lớp 10 THPT",
    level: "TUYỂN SINH 10",
    students: 1245,
    duration: 48,
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhbGdlYnJhR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNCODJGNjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLW9wYWNpdHk6IzFFNDBBRjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNhbGdlYnJhR3JhZCkiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjE2MCIgcj0iNDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+VG/DoW4gaOG7jWM8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIxNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5U4bqjbiB2w6FvIGzhu5twIDEwPC90ZXh0Pjwvc3ZnPg==",
    rating: 4.8,
    color: "blue"
  },
  {
    id: "2",
    title: "Toán học cơ bản lớp 10",
    description: "Nền tảng vững chắc cho chương trình THPT và chuẩn bị cho kỳ thi đại học",
    level: "LỚP 10",
    students: 958,
    duration: 72,
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJjbGFzc0dyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLW9wYWNpdHk6IzEwQjk4MTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLW9wYWNpdHk6IzA0Nzg1NztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNjbGFzc0dyYWQpIi8+PHJlY3QgeD0iOTAiIHk9IjcwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgcng9IjUiLz48Y2lyY2xlIGN4PSIzMTAiIGN5PSIxNzAiIHI9IjI1IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpIi8+PHRleHQgeD0iMjAwIiB5PSIxMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIj5Ub8OhbiBI4bqjaDwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjE1NSIgdGV4dC1hbmNob3I9Im1pZGdsZSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjgpIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkzhu5twIDEwPC90ZXh0Pjwvc3ZnPg==",
    rating: 4.9,
    color: "green"
  },
  {
    id: "3",
    title: "Toán học nâng cao lớp 11",
    description: "Chuyên sâu kiến thức và kỹ năng giải bài tập toán học nâng cao",
    level: "LỚP 11",
    students: 720,
    duration: 36,
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhZHZhbmNlZEdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLW9wYWNpdHk6I0Y5NzMxNjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLW9wYWNpdHk6I0MyNDEwQztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNhZHZhbmNlZEdyYWQpIi8+PHBvbHlnb24gcG9pbnRzPSIxMDAsNjAgMTQwLDYwIDEyMCwxMDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjxyZWN0IHg9IjI2MCIgeT0iMTQwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiIHJ4PSI4Ii8+PHRleHQgeD0iMjAwIiB5PSIxMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIj5O4bqhIGNhbzwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjE1NSIgdGV4dC1hbmNob3I9Im1pZGdsZSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjgpIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkzhu5twIDExPC90ZXh0Pjwvc3ZnPg==",
    rating: 4.7,
    color: "orange"
  },
  {
    id: "4",
    title: "Ôn thi THPT Quốc gia môn Toán",
    description: "Luyện đề và kỹ năng làm bài thi trắc nghiệm hiệu quả",
    level: "LỚP 12",
    students: 890,
    duration: 42,
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJ1bml2ZXJzaXR5R3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzhCNUNGNjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLW9wYWNpdHk6IzVCMjFCNjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCN1bml2ZXJzaXR5R3JhZCkiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjYwIiByPSIyNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPjxjaXJjbGUgY3g9IjMyMCIgY3k9IjE4MCIgcj0iMzUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+VG/DoW4gxJHhu41jPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOCkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+VHV54bqjbiBzaW5oIMSR4bqjaSBo4bqjYzwvdGV4dD48L3N2Zz4=",
    rating: 4.6,
    color: "purple"
  }
];

// Modern gradient system với enhanced color schemes
export const getGradient = (color: string | undefined) => {
  if (!color) return "from-blue-500/60 via-blue-600/50 to-blue-700/40";

  // Enhanced gradients với modern color palette
  const gradients = {
    blue: "from-blue-500/60 via-blue-600/50 to-blue-700/40",           // Modern blue
    purple: "from-purple-500/60 via-purple-600/50 to-purple-700/40",   // Rich purple
    pink: "from-pink-500/60 via-pink-600/50 to-pink-700/40",           // Vibrant pink
    green: "from-emerald-500/60 via-emerald-600/50 to-emerald-700/40",  // Fresh green
    orange: "from-orange-500/60 via-orange-600/50 to-orange-700/40"    // Warm orange
  };

  return gradients[color as keyof typeof gradients] || "from-blue-500/60 via-blue-600/50 to-blue-700/40";
};

// Function to get homepage featured courses
export const getHomepageFeaturedCourses = () => {
  return Promise.resolve(featuredCourses);
};

export const LIBRARY_TYPES = [
  { value: 'book', label: 'Sách', description: 'Giáo trình, tài liệu ôn luyện, ebook' },
  { value: 'exam', label: 'Đề thi', description: 'Đề chính thức, thi thử, đánh giá năng lực' },
  { value: 'video', label: 'Video', description: 'Bài giảng, hướng dẫn chuyên đề' },
] as const;

export const SUBJECT_OPTIONS = [
  { value: 'Toán học', label: 'Toán học' },
  { value: 'Vật lý', label: 'Vật lý' },
  { value: 'Hóa học', label: 'Hóa học' },
  { value: 'Sinh học', label: 'Sinh học' },
  { value: 'Ngữ văn', label: 'Ngữ văn' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Lịch sử', label: 'Lịch sử' },
  { value: 'Địa lý', label: 'Địa lý' },
] as const;

export const GRADE_OPTIONS = [
  { value: '12', label: 'Lớp 12' },
  { value: '11', label: 'Lớp 11' },
  { value: '10', label: 'Lớp 10' },
  { value: '9', label: 'Lớp 9' },
  { value: '8', label: 'Lớp 8' },
  { value: '7', label: 'Lớp 7' },
  { value: '6', label: 'Lớp 6' },
  { value: '5', label: 'Lớp 5' },
] as const;

export const BOOK_TYPE_OPTIONS = [
  { value: 'textbook', label: 'Sách giáo khoa' },
  { value: 'workbook', label: 'Sách bài tập' },
  { value: 'reference', label: 'Tài liệu tham khảo' },
] as const;

export const EXAM_TYPE_OPTIONS = [
  { value: 'official', label: 'Đề chính thức' },
  { value: 'practice', label: 'Đề luyện tập' },
  { value: 'sample', label: 'Đề minh họa' },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó' },
] as const;

export const VIDEO_QUALITY_OPTIONS = [
  { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' },
  { value: '480p', label: '480p' },
] as const;

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Mới nhất' },
  { value: 'download_count', label: 'Tải nhiều' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'title', label: 'Theo tên A-Z' },
] as const;

export const ROLE_OPTIONS = [
  { value: 'GUEST', label: 'Khách' },
  { value: 'STUDENT', label: 'Học sinh' },
  { value: 'TUTOR', label: 'Gia sư' },
  { value: 'TEACHER', label: 'Giáo viên' },
  { value: 'ADMIN', label: 'Quản trị' },
] as const;

export const PROVINCE_OPTIONS = [
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Hải Phòng', label: 'Hải Phòng' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'An Giang', label: 'An Giang' },
  { value: 'Bà Rịa - Vũng Tàu', label: 'Bà Rịa - Vũng Tàu' },
  { value: 'Bắc Giang', label: 'Bắc Giang' },
  { value: 'Bắc Kạn', label: 'Bắc Kạn' },
  { value: 'Bạc Liêu', label: 'Bạc Liêu' },
  { value: 'Bắc Ninh', label: 'Bắc Ninh' },
  { value: 'Bến Tre', label: 'Bến Tre' },
  { value: 'Bình Định', label: 'Bình Định' },
  { value: 'Bình Dương', label: 'Bình Dương' },
  { value: 'Bình Phước', label: 'Bình Phước' },
  { value: 'Bình Thuận', label: 'Bình Thuận' },
  { value: 'Cà Mau', label: 'Cà Mau' },
  { value: 'Cao Bằng', label: 'Cao Bằng' },
  { value: 'Đắk Lắk', label: 'Đắk Lắk' },
  { value: 'Đắk Nông', label: 'Đắk Nông' },
  { value: 'Điện Biên', label: 'Điện Biên' },
  { value: 'Đồng Nai', label: 'Đồng Nai' },
  { value: 'Đồng Tháp', label: 'Đồng Tháp' },
  { value: 'Gia Lai', label: 'Gia Lai' },
  { value: 'Hà Giang', label: 'Hà Giang' },
  { value: 'Hà Nam', label: 'Hà Nam' },
  { value: 'Hà Tĩnh', label: 'Hà Tĩnh' },
  { value: 'Hải Dương', label: 'Hải Dương' },
  { value: 'Hậu Giang', label: 'Hậu Giang' },
  { value: 'Hòa Bình', label: 'Hòa Bình' },
  { value: 'Hưng Yên', label: 'Hưng Yên' },
  { value: 'Khánh Hòa', label: 'Khánh Hòa' },
  { value: 'Kiên Giang', label: 'Kiên Giang' },
  { value: 'Kon Tum', label: 'Kon Tum' },
  { value: 'Lai Châu', label: 'Lai Châu' },
  { value: 'Lâm Đồng', label: 'Lâm Đồng' },
  { value: 'Lạng Sơn', label: 'Lạng Sơn' },
  { value: 'Lào Cai', label: 'Lào Cai' },
  { value: 'Long An', label: 'Long An' },
  { value: 'Nam Định', label: 'Nam Định' },
  { value: 'Nghệ An', label: 'Nghệ An' },
  { value: 'Ninh Bình', label: 'Ninh Bình' },
  { value: 'Ninh Thuận', label: 'Ninh Thuận' },
  { value: 'Phú Thọ', label: 'Phú Thọ' },
  { value: 'Phú Yên', label: 'Phú Yên' },
  { value: 'Quảng Bình', label: 'Quảng Bình' },
  { value: 'Quảng Nam', label: 'Quảng Nam' },
  { value: 'Quảng Ngãi', label: 'Quảng Ngãi' },
  { value: 'Quảng Ninh', label: 'Quảng Ninh' },
  { value: 'Quảng Trị', label: 'Quảng Trị' },
  { value: 'Sóc Trăng', label: 'Sóc Trăng' },
  { value: 'Sơn La', label: 'Sơn La' },
  { value: 'Tây Ninh', label: 'Tây Ninh' },
  { value: 'Thái Bình', label: 'Thái Bình' },
  { value: 'Thái Nguyên', label: 'Thái Nguyên' },
  { value: 'Thanh Hóa', label: 'Thanh Hóa' },
  { value: 'Thừa Thiên Huế', label: 'Thừa Thiên Huế' },
  { value: 'Tiền Giang', label: 'Tiền Giang' },
  { value: 'Trà Vinh', label: 'Trà Vinh' },
  { value: 'Tuyên Quang', label: 'Tuyên Quang' },
  { value: 'Vĩnh Long', label: 'Vĩnh Long' },
  { value: 'Vĩnh Phúc', label: 'Vĩnh Phúc' },
  { value: 'Yên Bái', label: 'Yên Bái' },
] as const;

export const ACADEMIC_YEAR_OPTIONS = [
  { value: '2024-2025', label: '2024-2025' },
  { value: '2023-2024', label: '2023-2024' },
  { value: '2022-2023', label: '2022-2023' },
  { value: '2021-2022', label: '2021-2022' },
  { value: '2020-2021', label: '2020-2021' },
  { value: '2019-2020', label: '2019-2020' },
] as const;

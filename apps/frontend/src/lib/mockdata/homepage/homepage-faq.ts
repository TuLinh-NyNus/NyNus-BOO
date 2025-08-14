// Homepage FAQ mockdata
export interface HomepageFAQ {
  id: number;
  question: string;
  answer: string;
}

export const homepageFAQData: HomepageFAQ[] = [
  {
    id: 1,
    question: "NyNus hỗ trợ học sinh những cấp học nào?",
    answer: "NyNus hỗ trợ học sinh từ lớp 9 đến lớp 12, với trọng tâm là ôn luyện cho các kỳ thi quan trọng như thi vào lớp 10 và thi tốt nghiệp THPT Quốc gia."
  },
  {
    id: 2,
    question: "Làm thế nào để bắt đầu sử dụng nền tảng?",
    answer: "Bạn chỉ cần đăng ký tài khoản, sau đó hệ thống sẽ đánh giá năng lực và gợi ý lộ trình học tập phù hợp. Bạn có thể bắt đầu với các bài học miễn phí hoặc nâng cấp tài khoản để mở khóa tất cả nội dung."
  },
  {
    id: 3,
    question: "Phần mềm sử dụng trí tuệ nhân tạo như thế nào?",
    answer: "AI của chúng tôi phân tích dữ liệu học tập của bạn để xác định điểm mạnh, điểm yếu và đề xuất các bài học, đề thi phù hợp. Ngoài ra, chatbot AI có thể giải thích các bài tập khó và hướng dẫn phương pháp giải chi tiết, giống như một gia sư cá nhân."
  },
  {
    id: 4,
    question: "Tôi có thể truy cập NyNus trên thiết bị nào?",
    answer: "NyNus hoạt động trên tất cả các thiết bị có kết nối internet, bao gồm máy tính, tablet và điện thoại di động. Giao diện được tối ưu cho mọi kích thước màn hình."
  },
  {
    id: 5,
    question: "Làm thế nào để liên hệ với đội ngũ hỗ trợ?",
    answer: "Bạn có thể liên hệ qua email support@nynus.edu.vn, hotline 1900-xxxx hoặc chat trực tiếp trên website. Đội ngũ hỗ trợ sẵn sàng giúp đỡ từ 8h đến 22h hàng ngày, kể cả cuối tuần."
  }
];

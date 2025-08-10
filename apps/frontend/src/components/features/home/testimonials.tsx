"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Nguyễn Minh An",
    role: "Học sinh lớp 12",
    content: "NyNus giúp em cải thiện điểm Toán từ 6 lên 8.5 chỉ trong 3 tháng! AI của NyNus thực sự hiểu được điểm yếu của em và đưa ra lộ trình học phù hợp.",
    avatar: "/avatars/student-1.jpg",
    rating: 5,
    school: "THPT Chu Văn An"
  },
  {
    id: 2,
    name: "Trần Thị Bảo",
    role: "Học sinh lớp 11",
    content: "Giao diện thân thiện, bài tập phong phú và có giải thích chi tiết. Em đặc biệt thích tính năng thi thử với kết quả phân tích ngay lập tức.",
    avatar: "/avatars/student-2.jpg",
    rating: 5,
    school: "THPT Lê Quý Đôn"
  },
  {
    id: 3,
    name: "Lê Văn Đức",
    role: "Học sinh lớp 10",
    content: "Trước đây em rất sợ môn Toán, nhưng với NyNus, học Toán trở nên thú vị hơn nhiều. Các video bài giảng dễ hiểu và bài tập được sắp xếp từ dễ đến khó rất logic.",
    avatar: "/avatars/student-3.jpg",
    rating: 5,
    school: "THPT Nguyễn Huệ"
  }
];

// Component chính
const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Học viên nói gì về{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              NyNus
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hơn 1,200 học viên đã trải nghiệm và đạt được kết quả tích cực với NyNus
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                
                {/* Quote icon */}
                <div className="relative z-10">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" aria-hidden="true" />
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {/* Fallback avatar với initials */}
                        <span className="text-sm font-semibold text-primary">
                          {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.school}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              1,200+
            </div>
            <div className="text-muted-foreground">
              Học viên tin tưởng
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
              4.8/5
            </div>
            <div className="text-muted-foreground">
              Đánh giá trung bình
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
              85%
            </div>
            <div className="text-muted-foreground">
              Cải thiện điểm số
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;

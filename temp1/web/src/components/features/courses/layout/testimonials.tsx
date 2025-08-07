'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    role: "Học sinh lớp 12",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    content: "Nhờ có NyNus mà em đã cải thiện được điểm Toán từ 6 lên 9. Các bài giảng rất dễ hiểu và có nhiều bài tập thực hành.",
    rating: 5
  },
  {
    id: 2,
    name: "Trần Văn Hùng",
    role: "Phụ huynh",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "Con tôi học trên NyNus được 6 tháng, tiến bộ rất rõ rệt. Giao diện thân thiện, nội dung chất lượng cao.",
    rating: 5
  },
  {
    id: 3,
    name: "Lê Thị Mai",
    role: "Học sinh lớp 10",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "Em rất thích cách giảng dạy của các thầy cô trên NyNus. Học online mà vẫn cảm thấy như được học trực tiếp.",
    rating: 5
  }
];

export default function CourseTestimonials(): JSX.Element {
  return (
    <section className="relative py-16 sm:py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-100/20 to-slate-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
            Học viên nói gì về chúng tôi
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Những phản hồi tích cực từ cộng đồng học viên NyNus
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
              
              <div className="relative">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-slate-800 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

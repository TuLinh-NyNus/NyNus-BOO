'use client';

import { motion } from "framer-motion";

const features = [
  {
    icon: "🎯",
    title: "Học theo lộ trình",
    description: "Chương trình học được thiết kế bài bản, từ cơ bản đến nâng cao"
  },
  {
    icon: "👨‍🏫",
    title: "Giảng viên chất lượng",
    description: "Đội ngũ giảng viên giàu kinh nghiệm, tận tâm với học viên"
  },
  {
    icon: "📱",
    title: "Học mọi lúc mọi nơi",
    description: "Truy cập khóa học trên mọi thiết bị, học tập linh hoạt"
  },
  {
    icon: "🏆",
    title: "Chứng chỉ hoàn thành",
    description: "Nhận chứng chỉ sau khi hoàn thành khóa học"
  },
  {
    icon: "💬",
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ hỗ trợ sẵn sàng giải đáp mọi thắc mắc"
  },
  {
    icon: "📊",
    title: "Theo dõi tiến độ",
    description: "Báo cáo chi tiết về quá trình học tập của bạn"
  }
];

export default function CourseFeatures(): JSX.Element {
  return (
    <section className="relative py-16 sm:py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-slate-900 dark:via-purple-900/10 dark:to-slate-900" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
            Tại sao chọn NyNus?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Những tính năng vượt trội giúp bạn học tập hiệu quả hơn
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
              
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

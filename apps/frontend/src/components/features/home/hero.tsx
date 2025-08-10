"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Play, FileText, BookOpen, Search,
  LayoutDashboard, PlayCircle, Settings, CheckCircle, Monitor,
  Grid3X3, Layers, Moon, Home, MessageCircle, Send, MoreHorizontal,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAnalytics } from "@/lib/analytics";

// Import mockdata
import { heroData } from "@/lib/mockdata";
import ScrollIndicator from "@/components/ui/scroll-indicator";

const Hero = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const analytics = useAnalytics();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Data cho complex SwiftUI interface - commented out unused data
  // const sidebarItems = [
  //   { icon: LayoutDashboard, label: 'Dashboard' },
  //   { icon: BookOpen, label: 'Courses' },
  //   { icon: PlayCircle, label: 'Tutorials' },
  //   { icon: FileText, label: 'Resources' },
  //   { icon: Settings, label: 'Settings' }
  // ];

  // const courses = {
  //   red: {
  //     id: 1,
  //     title: "Khóa học Thiết kế",
  //     duration: "6:08",
  //     color: "red",
  //     lessons: [
  //       { id: 1, title: "Thiết kế cơ bản", duration: "6:08", active: true, progress: 100 },
  //       { id: 2, title: "Nguyên tắc thiết kế", duration: "9:02", active: false, progress: 0 },
  //       { id: 3, title: "Màu sắc và gradient", duration: "9:31", active: false, progress: 0 }
  //     ]
  //   },
  //   purple: {
  //     id: 3,
  //     title: "Khóa học Lập trình",
  //     color: "purple",
  //     lessons: [
  //       { id: 1, title: "Lập trình cơ bản", duration: "10:08", progress: 80 },
  //       { id: 2, title: "Layout và Grid", duration: "8:02", progress: 60 },
  //       { id: 3, title: "Màu sắc nâng cao", duration: "11:12", progress: 40 }
  //     ]
  //   }
  // };

  const userInfo = {
    name: "CÔNG THÀNH",
    avatar: "👤",
    certificateProgress: 75
  };

  // const scrollToNextSection = () => {
  //   const featuresSection = document.getElementById('features-section');
  //   if (featuresSection) {
  //     featuresSection.scrollIntoView({ behavior: 'smooth' });
  //   }
  // };

  return (
    <section id="hero-section" className="relative py-20 lg:py-36 overflow-hidden min-h-screen">
      {/* Gradient Background with Waves */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4417DB] via-[#E57885] to-[#F18582]">
        {/* Wave Layers */}
        <div className="absolute bottom-0 left-0 right-0 h-96">
          {/* Wave 1 - Top layer */}
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            style={{ zIndex: 5 }}
          >
            <path
              d="M0,200 C300,150 600,250 900,180 C1050,140 1150,160 1200,180 L1200,400 L0,400 Z"
              fill="rgba(65, 23, 219, 0.4)"
            />
          </svg>

          {/* Wave 2 - Second layer */}
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            style={{ zIndex: 4 }}
          >
            <path
              d="M0,180 C250,120 550,220 850,160 C1000,120 1120,140 1200,150 L1200,400 L0,400 Z"
              fill="rgba(65, 23, 219, 0.3)"
            />
          </svg>

          {/* Wave 3 - Third layer */}
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            style={{ zIndex: 3 }}
          >
            <path
              d="M0,250 C200,200 500,300 800,220 C950,180 1100,200 1200,220 L1200,400 L0,400 Z"
              fill="rgba(229, 120, 133, 0.4)"
            />
          </svg>

          {/* Wave 4 - Fourth layer */}
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            style={{ zIndex: 2 }}
          >
            <path
              d="M0,280 C350,230 650,330 950,260 C1080,240 1140,250 1200,260 L1200,400 L0,400 Z"
              fill="rgba(229, 120, 133, 0.2)"
            />
          </svg>

          {/* Wave 5 - Bottom layer */}
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            style={{ zIndex: 1 }}
          >
            <path
              d="M0,300 C400,250 700,350 1000,280 C1100,260 1150,270 1200,280 L1200,400 L0,400 Z"
              fill="rgba(241, 133, 130, 0.3)"
            />
          </svg>
        </div>

        {/* Stars effect */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(25)].map((_, i) => {
            // Tạo giá trị pseudo-random dựa trên index để tránh hydration mismatch
            const pseudoRandomX = ((i * 17) % 100);
            const pseudoRandomY = ((i * 23) % 60);
            const pseudoRandomDelay = ((i * 7) % 30) / 10; // 0-3s
            const pseudoRandomDuration = 2 + ((i * 11) % 20) / 10; // 2-4s

            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${pseudoRandomX}%`,
                  top: `${pseudoRandomY}%`,
                  animationDelay: `${pseudoRandomDelay}s`,
                  animationDuration: `${pseudoRandomDuration}s`
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="container px-4 mx-auto relative z-10 max-w-7xl" style={{ transform: 'translateY(-8px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left mt-8"
          >
            {/* New Badge Design */}
            <div className="mb-8 text-center lg:text-left">
              <div
                className="text-white font-bold text-lg mb-3"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
              >
                {heroData.badge.text}
              </div>
              <div
                className="text-white/90 text-base"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
              >
                {heroData.subtitle}
              </div>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6 text-center lg:text-left"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
            >
              {heroData.title.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}
            </h1>

            <p
              className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto lg:mx-0 mb-8 text-center lg:text-left"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
            >
              {heroData.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 items-center">
              {/* Primary CTA with Card Icon */}
              <motion.div
                whileHover={{ scale: 1.21 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center"
              >
                <Link
                  href={heroData.ctaButtons.primary.href}
                  className="flex items-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ width: '280px', height: '80px' }}
                  onClick={() => {
                    analytics.ctaClick('hero_section', heroData.ctaButtons.primary.text);
                  }}
                >
                  {/* Card Icon with Animation */}
                  <div className="flex items-center justify-center w-16 h-16 ml-4">
                    <motion.div
                      className="relative w-10 h-10 rounded-full flex items-center justify-center group"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      }}
                      whileHover={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <CreditCard className="w-5 h-5 text-white/80" />

                      {/* Animated Ring với custom dash pattern sử dụng SVG */}
                      <motion.div
                        className="absolute"
                        style={{
                          inset: '-4px', // Tăng bán kính +2px so với ban đầu
                        }}
                        whileHover={{
                          inset: '-5px', // Tăng thêm 1px nữa khi hover
                          transition: {
                            duration: 0.3,
                            ease: "easeInOut"
                          }
                        }}
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          rotate: {
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                          }
                        }}
                      >
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 60 60"
                          style={{ overflow: 'visible' }}
                        >
                          <circle
                            cx="30"
                            cy="30"
                            r="28"
                            fill="none"
                            stroke="#ec4899"
                            strokeWidth="2"
                            strokeDasharray="8 3 15 5 4 7 12 2 6 4 10 3 5 8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-gray-800 text-sm mb-1">
                      {heroData.ctaButtons.primary.text}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {heroData.ctaButtons.primary.price}
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Video Icon - căn giữa với CTA */}
              <motion.button
                className="w-12 h-12 rounded-full backdrop-blur-sm bg-white/20 border border-white/30 text-white flex items-center justify-center hover:bg-white/30 hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                whileHover={{ scale: 1.26 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsVideoModalOpen(true);
                  analytics.videoModalOpen('hero_section');
                }}
                aria-label="Phát video giới thiệu"
              >
                <Play className="h-5 w-5" aria-hidden="true" />
              </motion.button>
            </div>

            <div className="hidden lg:flex items-center gap-6 text-sm text-white/80">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white/30 bg-gradient-to-br ${
                    ['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-yellow-400 to-orange-600'][i]
                  }`}></div>
                ))}
              </div>
              <p>{heroData.stats.studentsText}</p>
            </div>
          </motion.div>

          {!isMobile && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
            {/* Pages Group Container */}
            <div
              className="relative hidden lg:block group"
              style={{
                perspective: '1200px',
                transform: 'scale(0.95) translateY(16px)',
                transformOrigin: 'center center'
              }}
            >


              {/* Side Content Right */}
              <motion.div
                className="absolute top-16 -right-32 w-24 space-y-3 group-hover:rotate-0 group-hover:translate-x-2 group-hover:scale-105 transition-all duration-500"
                initial={{ opacity: 0, x: 30, rotateY: -15, rotateX: 5 }}
                animate={{ opacity: 1, x: 0, rotateY: -15, rotateX: 5 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Study Progress */}
                <div className="w-full h-16 bg-white/5 rounded-lg border border-white/10 p-2">
                  <div className="w-full h-1 bg-white/10 rounded-full mb-2">
                    <div className="w-3/4 h-full bg-white/40 rounded-full"></div>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full mb-2">
                    <div className="w-1/2 h-full bg-white/30 rounded-full"></div>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full">
                    <div className="w-2/3 h-full bg-white/25 rounded-full"></div>
                  </div>
                </div>
                <div className="w-full h-16 bg-white/5 rounded-lg border border-white/10 p-2">
                  <div className="w-4 h-4 bg-white/20 rounded-full mx-auto mb-1"></div>
                  <div className="w-full h-1 bg-white/10 rounded-full mb-1"></div>
                  <div className="w-3/4 h-1 bg-white/10 rounded-full mx-auto"></div>
                </div>
              </motion.div>

              {/* Main UI Container - Navbar + Content Combined */}
              <motion.div
                className="relative backdrop-blur-2xl bg-white/3 border border-white/5 rounded-3xl overflow-hidden shadow-2xl z-10 group-hover:rotate-0 group-hover:scale-121 transition-all duration-500"
                initial={{ opacity: 0, scale: 0.95, rotateY: -15, rotateX: 5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotateY: -15,
                  rotateX: 5,
                  y: [0, -52, 0],
                  rotateZ: [0, 2, 0, -2, 0]
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  y: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop"
                  },
                  rotateZ: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop"
                  }
                }}
                whileHover={{
                  rotateY: 0,
                  rotateX: 0,
                  scale: 1.18,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Navbar Section */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    {/* Left - Logo with Gradient */}
                    <motion.div
                      className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      NyNus
                    </motion.div>

                    {/* Center - 5 Navigation Icons */}
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Home className="w-4 h-4 text-white/80" />
                      </motion.div>
                      <motion.div
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <BookOpen className="w-4 h-4 text-white/80" />
                      </motion.div>
                      <motion.div
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Settings className="w-4 h-4 text-white/80" />
                      </motion.div>
                      <motion.div
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <LayoutDashboard className="w-4 h-4 text-white/80" />
                      </motion.div>
                      <motion.div
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        <PlayCircle className="w-4 h-4 text-white/80" />
                      </motion.div>
                    </div>

                    {/* Right - Theme, Search, User */}
                    <div className="flex items-center gap-3">
                      {/* Theme Icon */}
                      <motion.div
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.26 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Moon className="w-4 h-4 text-white/80" />
                      </motion.div>

                      {/* Search Icon */}
                      <motion.div
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.26 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Search className="w-4 h-4 text-white/80" />
                      </motion.div>

                      {/* User Info */}
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">{userInfo.avatar}</span>
                        </div>
                        <span className="text-white/80 text-sm font-medium">{userInfo.name}</span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Main Content - Learning Interface */}
                <div className="p-8 grid grid-cols-3 gap-6 h-80">
                  {/* Left Side - Learning Progress */}
                  <div className="space-y-4">
                    <motion.div
                      className="text-white/60 text-xs font-medium mb-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      Tiến độ học tập
                    </motion.div>

                    {/* Progress Items */}
                    <div className="space-y-3">
                      {[
                        { label: "Toán học", progress: 85, color: "bg-white/70" },
                        { label: "Vật lý", progress: 72, color: "bg-white/60" },
                        { label: "Hóa học", progress: 68, color: "bg-white/50" }
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 + index * 0.1 }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-xs">{item.label}</span>
                            <span className="text-white/50 text-xs">{item.progress}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full">
                            <motion.div
                              className={`h-full ${item.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ delay: 1.3 + index * 0.1, duration: 0.8 }}
                            ></motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Center - Main Monitor Icon */}
                  <div className="flex flex-col items-center justify-center">
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0, duration: 0.6 }}
                    >
                      <Monitor className="w-16 h-16 text-white/80" />
                    </motion.div>

                    {/* Main Progress */}
                    <div className="w-full max-w-xs space-y-3">
                      <motion.div
                        className="w-full h-2 bg-white/10 rounded-full"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "100%" }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                      >
                        <motion.div
                          className="h-full bg-white/60 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ delay: 1.4, duration: 1.0 }}
                        ></motion.div>
                      </motion.div>
                      <motion.div
                        className="w-3/4 h-2 bg-white/10 rounded-full"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "75%" }}
                        transition={{ delay: 1.3, duration: 0.8 }}
                      >
                        <motion.div
                          className="h-full bg-white/40 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "60%" }}
                          transition={{ delay: 1.5, duration: 1.0 }}
                        ></motion.div>
                      </motion.div>
                    </div>

                    {/* Bottom Dots */}
                    <motion.div
                      className="flex gap-3 mt-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.6, duration: 0.6 }}
                    >
                      <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                      <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    </motion.div>
                  </div>

                  {/* Right Side - Recent Activity */}
                  <div className="space-y-4">
                    <motion.div
                      className="text-white/60 text-xs font-medium mb-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      Hoạt động gần đây
                    </motion.div>

                    {/* Activity Items */}
                    <div className="space-y-3">
                      {[
                        { time: "10:30", activity: "Hoàn thành bài tập" },
                        { time: "09:15", activity: "Xem video bài học" },
                        { time: "08:45", activity: "Làm đề thi thử" }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 + index * 0.1 }}
                        >
                          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                          <div className="flex-1">
                            <div className="text-white/70 text-xs">{item.activity}</div>
                            <div className="text-white/40 text-xs">{item.time}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Stats */}
                    <motion.div
                      className="mt-6 p-3 bg-white/5 rounded-lg"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 }}
                    >
                      <div className="text-white/60 text-xs mb-2">Hôm nay</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">Thời gian học</span>
                        <span className="text-white/50">2h 30m</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Exam Page - Left Lower (95% size) */}
              <motion.div
                className="absolute top-39 -left-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 z-20 group-hover:rotate-0 group-hover:scale-121 hover:scale-126 transition-all duration-500"
                style={{
                  width: '243px', // 64 * 4 * 0.95 = 243px
                  height: '304px', // 80 * 4 * 0.95 = 304px
                  transformStyle: 'preserve-3d'
                }}
                initial={{ opacity: 0, x: -50, rotateY: -15, rotateX: 5 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  rotateY: -15,
                  rotateX: 5,
                  y: [0, -70, 0],
                  rotateZ: [0, 3, 0, -1, 0]
                }}
                transition={{
                  delay: 0.6,
                  duration: 0.8,
                  y: {
                    duration: 2.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop",
                    delay: 0.6
                  },
                  rotateZ: {
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop",
                    delay: 1.2
                  }
                }}
              >
                {/* Exam Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white/80" />
                  </div>
                </div>

                {/* Progress Bars - No Text */}
                <div className="space-y-4">
                  <div className="w-full h-3 bg-white/10 rounded-full">
                    <div className="w-4/5 h-full bg-white/60 rounded-full"></div>
                  </div>
                  <div className="w-3/4 h-3 bg-white/10 rounded-full">
                    <div className="w-2/3 h-full bg-white/40 rounded-full"></div>
                  </div>
                  <div className="w-5/6 h-3 bg-white/10 rounded-full">
                    <div className="w-1/2 h-full bg-white/30 rounded-full"></div>
                  </div>
                </div>

                {/* Question Indicators */}
                <div className="mt-8 grid grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-lg ${
                        i < 8 ? 'bg-white/60' : 'bg-white/20'
                      }`}
                    ></div>
                  ))}
                </div>

                {/* Bottom Action */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="w-full h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white/80" />
                  </div>
                </div>
              </motion.div>

              {/* Chat AI Page - Behind and Above Main (1/4 size) */}
              <motion.div
                className="absolute -top-18 -right-12 w-48 h-64 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-4 z-5 group-hover:rotate-0 group-hover:translate-x-3 group-hover:scale-110 transition-all duration-500"
                initial={{ opacity: 0, x: 30, rotateY: -15, rotateX: 5 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  rotateY: -15,
                  rotateX: 5,
                  y: [0, -60, 0],
                  rotateZ: [0, -1.5, 0, 1.5, 0]
                }}
                transition={{
                  delay: 0.7,
                  duration: 0.8,
                  y: {
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop",
                    delay: 0.3
                  },
                  rotateZ: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop",
                    delay: 0.8
                  }
                }}
                whileHover={{
                  rotateY: 0,
                  rotateX: 0,
                  x: 10,
                  scale: 1.26,
                  y: 0,
                  z: 25,
                  transition: { duration: 0.5, ease: "easeOut" }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Chat AI Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white/80" />
                  </div>
                </div>

                {/* Chat Bubbles Mockup */}
                <div className="space-y-3 mb-4">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="w-3/4 h-6 bg-white/20 rounded-lg"></div>
                  </div>
                  {/* AI response */}
                  <div className="flex justify-start">
                    <div className="w-5/6 h-4 bg-white/15 rounded-lg"></div>
                  </div>
                  <div className="flex justify-start">
                    <div className="w-2/3 h-4 bg-white/15 rounded-lg"></div>
                  </div>
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="w-1/2 h-6 bg-white/20 rounded-lg"></div>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <MoreHorizontal className="w-4 h-4 text-white/60 animate-pulse" />
                  <span className="text-white/40 text-xs">AI đang trả lời...</span>
                </div>

                {/* Input Area */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-8 bg-white/10 rounded-lg"></div>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Send className="w-3 h-3 text-white/60" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Search Page - Right Lower (1/4 size) */}
              <motion.div
                className="absolute top-41 right-0 w-48 h-64 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-4 z-35 group-hover:rotate-0 group-hover:translate-x-4 group-hover:scale-126 transition-all duration-500"
                initial={{ opacity: 0, x: 50, rotateY: -15, rotateX: 5 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  rotateY: -15,
                  rotateX: 5,
                  y: [0, -38, 0],
                  rotateZ: [0, -2.5, 0, 2.5, 0]
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.8,
                  y: {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop",
                    delay: 0.9
                  },
                  rotateZ: {
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop",
                    delay: 1.5
                  }
                }}
                whileHover={{
                  rotateY: 0,
                  rotateX: 0,
                  x: 15,
                  scale: 1.26,
                  y: 0,
                  z: 60,
                  transition: { duration: 0.5, ease: "easeOut" }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Search Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-white/80" />
                  </div>
                </div>

                {/* Search Input Mockup */}
                <div className="w-full h-8 bg-white/10 rounded-lg mb-4 flex items-center px-3">
                  <div className="w-4 h-4 bg-white/30 rounded-full"></div>
                </div>

                {/* Search Results */}
                <div className="space-y-3">
                  <div className="w-full h-2 bg-white/20 rounded-full"></div>
                  <div className="w-4/5 h-2 bg-white/15 rounded-full"></div>
                  <div className="w-3/4 h-2 bg-white/15 rounded-full"></div>
                  <div className="w-5/6 h-2 bg-white/10 rounded-full"></div>
                  <div className="w-2/3 h-2 bg-white/10 rounded-full"></div>
                </div>

                {/* Filter Icons */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <Layers className="w-3 h-3 text-white/60" />
                  </div>
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="w-3 h-3 text-white/60" />
                  </div>
                </div>
              </motion.div>


            </div>
          </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <ScrollIndicator
          targetSectionId="features-section"
          style={{ bottom: '-160px' }}
        />

      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-title"
        >
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full transition-colors duration-300"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <h3 id="video-title" className="font-medium text-slate-800 dark:text-white transition-colors duration-300">Video giới thiệu NyNus</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-white transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Đóng video"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors duration-300">
              <div className="text-center p-8">
                <Play className="h-20 w-20 mx-auto mb-4 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
                <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">Video demo sẽ xuất hiện ở đây</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}


    </section>
  );
};

export default Hero;

"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useNewsletter } from "@/hooks/use-newsletter";

// Lazy load components
const SocialLinks = dynamic(() => import("./social-links"), {
  loading: () => <div className="flex space-x-3">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="w-9 h-9 bg-muted rounded-full animate-pulse" />
    ))}
  </div>
});

const LanguageSelector = dynamic(() => import("./language-selector"), {
  loading: () => <div className="w-full h-10 bg-muted rounded-lg animate-pulse" />
});

const QuickContact = dynamic(() => import("./quick-contact"), {
  loading: () => <div className="bg-card border border-border rounded-2xl p-6">
    <div className="h-6 bg-muted rounded mb-4 animate-pulse" />
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded animate-pulse" />
      ))}
    </div>
  </div>
});

const FooterOptimized = () => {
  const currentYear = new Date().getFullYear();
  const {
    email,
    setEmail,
    isSubscribed,
    isLoading,
    error,
    handleSubscribe
  } = useNewsletter();

  return (
    <footer className="relative pt-24 pb-8 overflow-hidden transition-colors duration-300" style={{ backgroundColor: '#1F1F47' }}>
      {/* Background decorations using semantic colors */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[20%] right-[30%] w-1/3 h-1/3 bg-primary/5 blur-[150px] rounded-full"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-1/3 h-1/3 bg-accent/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="container px-4 mx-auto">
        {/* Newsletter Subscription */}
        <div className="mb-16 border border-border rounded-2xl p-8 bg-card transition-colors duration-300 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3 transition-colors duration-300">
                Nhận thông tin mới nhất
              </h3>
              <p className="text-muted-foreground mb-4 transition-colors duration-300">
                Đăng ký nhận thông báo về các khóa học, đề thi và tính năng mới nhất.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-300">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Không spam, chỉ tin tức hữu ích</span>
              </div>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:border-ring text-foreground transition-colors ${
                      error ? 'border-destructive' : 'border-input'
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {isSubscribed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="h-5 w-5 text-success" />
                    </motion.div>
                  )}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : isSubscribed ? (
                    "Đã đăng ký!"
                  ) : (
                    <>
                      Đăng ký <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Company Info */}
          <div>
            <Link href="/" className="text-2xl font-bold mb-6 inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary transition-colors duration-300">
                NyNus
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 transition-colors duration-300">
              Nền tảng học toán thông minh với AI, giúp học sinh cải thiện kỹ năng và đạt kết quả cao trong các kỳ thi quan trọng.
            </p>

            {/* Social Links */}
            <div className="mb-6">
              <Suspense fallback={<div className="flex space-x-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-9 h-9 bg-muted rounded-full animate-pulse" />
                ))}
              </div>}>
                <SocialLinks />
              </Suspense>
            </div>

            {/* Language Selector */}
            <Suspense fallback={<div className="w-full h-10 bg-muted rounded-lg animate-pulse" />}>
              <LanguageSelector />
            </Suspense>
          </div>

          {/* Links Column 1 */}
          <div className="lg:ml-auto">
            <h3 className="font-semibold text-lg text-foreground mb-5 transition-colors duration-300">
              Liên kết
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                  Về NyNus
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                  Khóa học
                </Link>
              </li>
              <li>
                <Link href="/practice" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                  Luyện tập
                </Link>
              </li>
              <li>
                <Link href="/questions" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                  Câu hỏi
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-5 transition-colors duration-300">
              Hỗ trợ
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/huong-dan" className="text-muted-foreground hover:text-primary transition-colors">
                  Hướng dẫn
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="text-muted-foreground hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/bao-cao-loi" className="text-muted-foreground hover:text-primary transition-colors">
                  Báo cáo lỗi
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                  Hỗ trợ kỹ thuật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-5 transition-colors duration-300">
              Liên hệ
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground transition-colors duration-300">Email</p>
                  <Link href="mailto:support@nynus.edu.vn" className="text-primary hover:underline">
                    support@nynus.edu.vn
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground transition-colors duration-300">Hotline</p>
                  <Link href="tel:1900-xxxx" className="text-primary hover:underline">
                    1900-xxxx
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground transition-colors duration-300">Địa chỉ</p>
                  <p className="text-muted-foreground transition-colors duration-300">
                    Việt Nam
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Contact Section */}
        <div className="mb-16">
          <Suspense fallback={<div className="bg-card border border-border rounded-2xl p-6">
            <div className="h-6 bg-muted rounded mb-4 animate-pulse" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>}>
            <QuickContact />
          </Suspense>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border pt-8 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-muted-foreground text-sm transition-colors duration-300">
              © {currentYear} NyNus. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                Điều khoản sử dụng
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                Chính sách bảo mật
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                Liên hệ
              </Link>
              <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md">
                Trợ giúp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterOptimized;

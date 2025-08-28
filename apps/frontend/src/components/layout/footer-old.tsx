"use client";

import { motion } from "framer-motion";
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter, 
  Mail, 
  MapPin, 
  Phone, 
  Globe, 
  ChevronDown, 
  ArrowRight, 
  CheckCircle 
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Newsletter subscription:', email);
      setIsSubscribed(true);
      setEmail('');
      // Reset the subscription state after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: 'Japanese' }
  ];

  return (
    <footer className="relative pt-16 pb-8 overflow-hidden transition-all duration-500 ease-out">
      {/* Background với gradient tối tối ưu */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      
      {/* Background decorations cải thiện */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[20%] right-[30%] w-1/3 h-1/3 bg-blue-500/10 blur-[80px] rounded-full animate-pulse footer-bg-decoration"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-1/3 h-1/3 bg-purple-500/10 blur-[80px] rounded-full animate-pulse footer-bg-decoration"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 bg-cyan-500/5 blur-[100px] rounded-full footer-bg-decoration"></div>
      </div>

      <div className="container px-6 mx-auto">

        {/* Newsletter Subscription - cải thiện với visual hierarchy */}
        <motion.div 
          className="mb-12 border border-slate-600/50 rounded-xl p-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm shadow-2xl transition-all duration-500 ease-out mt-8 newsletter-box"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center newsletter-form">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-4 transition-all duration-300">
                Nhận thông tin mới nhất
              </h3>
              <p className="text-slate-300 text-base leading-relaxed mb-4 transition-all duration-300">
                Đăng ký nhận thông báo về các khóa học, đề thi và tính năng mới nhất.
              </p>
              <div className="flex items-center gap-3 text-base text-slate-400 transition-all duration-300">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>Không spam, chỉ tin tức hữu ích</span>
              </div>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 placeholder-slate-500 transition-all duration-300 newsletter-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {isSubscribed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 min-w-[120px] newsletter-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubscribed ? "Đã đăng ký!" : <>Đăng ký <ArrowRight className="h-4 w-4" /></>}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Main footer content - spacing và typography cải thiện */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 footer-grid">
          {/* Company Info */}
          <div>
            <Link href="/" className="text-3xl font-bold mb-6 inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4179FF] to-[#912BFB] transition-all duration-300 hover:from-[#5A8AFF] hover:to-[#A23CFC]">
                NyNus
              </span>
            </Link>
            <p className="text-slate-300 text-base leading-relaxed mb-6 transition-all duration-300">
              Nền tảng học toán thông minh với AI, giúp học sinh cải thiện kỹ năng và đạt kết quả cao trong các kỳ thi quan trọng.
            </p>
            
            {/* Social Links - cải thiện với hover effects mạnh mẽ */}
            <div className="flex space-x-3 mb-6 social-icons">
              <motion.div
                className="social-icon"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                  <Facebook className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div
                className="social-icon"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 text-slate-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-pink-500/25">
                  <Instagram className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div
                className="social-icon"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-red-500/25">
                  <Youtube className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div
                className="social-icon"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 hover:bg-sky-500 text-slate-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-sky-500/25">
                  <Twitter className="h-5 w-5" />
                </Link>
              </motion.div>
            </div>

            {/* Language Selector - cải thiện với visual feedback */}
            <div className="relative language-selector">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-slate-200 hover:border-blue-500 hover:bg-slate-700/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">
                    {languages.find(lang => lang.code === selectedLanguage)?.name || 'Tiếng Việt'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLanguageMenuOpen && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 border border-slate-600 rounded-lg overflow-hidden z-20 backdrop-blur-sm shadow-2xl"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-700/80 transition-all duration-200 ${
                        selectedLanguage === language.code 
                          ? 'text-blue-400 bg-blue-500/10' 
                          : 'text-slate-300 hover:text-slate-100'
                      }`}
                      onClick={() => {
                        setSelectedLanguage(language.code);
                        setIsLanguageMenuOpen(false);
                      }}
                    >
                      {language.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:ml-auto">
            <h3 className="font-bold text-xl text-slate-100 mb-6 transition-all duration-300">Liên kết</h3>
            <ul className="space-y-4">
              {[
                { href: "/about", text: "Về NyNus" },
                { href: "/courses", text: "Khóa học" },
                { href: "/practice", text: "Luyện tập" },
                { href: "/question", text: "Câu hỏi" },
                { href: "/careers", text: "Tuyển dụng" }
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-slate-300 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md footer-link"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-bold text-xl text-slate-100 mb-6 transition-all duration-300">Hỗ trợ</h3>
            <ul className="space-y-4">
              {[
                { href: "/huong-dan", text: "Hướng dẫn" },
                { href: "/faq", text: "FAQ" },
                { href: "/lien-he", text: "Liên hệ" },
                { href: "/bao-cao-loi", text: "Báo cáo lỗi" },
                { href: "/support", text: "Hỗ trợ kỹ thuật" }
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-slate-300 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md footer-link"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-xl text-slate-100 mb-6 transition-all duration-300">Liên hệ</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 group-hover:bg-blue-600 transition-all duration-300 contact-icon">
                  <Mail className="h-5 w-5 text-slate-300 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium transition-all duration-300">Email</p>
                  <Link href="mailto:support@nynus.edu.vn" className="text-blue-400 hover:text-blue-300 transition-all duration-300 font-medium">
                    support@nynus.edu.vn
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 group-hover:bg-green-600 transition-all duration-300 contact-icon">
                  <Phone className="h-5 w-5 text-slate-300 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium transition-all duration-300">Hotline</p>
                  <Link href="tel:1900-xxxx" className="text-blue-400 hover:text-blue-300 transition-all duration-300 font-medium">
                    1900-xxxx
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 group-hover:bg-purple-600 transition-all duration-300 contact-icon">
                  <MapPin className="h-5 w-5 text-slate-300 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium transition-all duration-300">Địa chỉ</p>
                  <p className="text-slate-300 transition-all duration-300 font-medium">
                    Việt Nam
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section - cải thiện với visual separation */}
        <div className="border-t border-slate-600/50 pt-8 transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-400 text-base transition-all duration-300 font-medium">
              © {currentYear} NyNus. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex flex-wrap gap-6 text-base">
              {[
                { href: "/terms", text: "Điều khoản sử dụng" },
                { href: "/privacy", text: "Chính sách bảo mật" },
                { href: "/contact", text: "Liên hệ" },
                { href: "/help", text: "Trợ giúp" }
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-slate-400 hover:text-blue-400 transition-all duration-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-md footer-link"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


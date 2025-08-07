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
              <h3 className="text-xl font-semibold text-card-foreground mb-3 transition-colors duration-300">Nhận thông tin mới nhất</h3>
              <p className="text-muted-foreground mb-4 transition-colors duration-300">Đăng ký nhận thông báo về các khóa học, đề thi và tính năng mới nhất.</p>
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
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:border-ring text-foreground transition-colors"
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
                      <CheckCircle className="h-5 w-5 text-success" />
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubscribed ? "Đã đăng ký!" : <>Đăng ký <ArrowRight className="h-4 w-4" /></>}
                </motion.button>
              </form>
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
            <div className="flex space-x-3 mb-6">
              <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all duration-200">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent/20 hover:text-accent transition-all duration-200">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-200">
                <Youtube className="h-4 w-4" />
              </Link>
              <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-secondary/20 hover:text-secondary transition-all duration-200">
                <Twitter className="h-4 w-4" />
              </Link>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-background border border-border rounded-lg text-foreground hover:border-ring transition-colors duration-300"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>
                    {languages.find(lang => lang.code === selectedLanguage)?.name || 'Tiếng Việt'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLanguageMenuOpen && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden z-20 transition-colors duration-300"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300 ${selectedLanguage === language.code ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
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
            <h3 className="font-semibold text-lg text-foreground mb-5 transition-colors duration-300">Liên kết</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/gioi-thieu" className="text-muted-foreground hover:text-primary transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/khoa-hoc" className="text-muted-foreground hover:text-primary transition-colors">
                  Khóa học
                </Link>
              </li>
              <li>
                <Link href="/de-thi" className="text-muted-foreground hover:text-primary transition-colors">
                  Đề thi
                </Link>
              </li>
              <li>
                <Link href="/cau-hoi" className="text-muted-foreground hover:text-primary transition-colors">
                  Câu hỏi
                </Link>
              </li>
              <li>
                <Link href="/thao-luan" className="text-muted-foreground hover:text-primary transition-colors">
                  Thảo luận
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-5 transition-colors duration-300">Hỗ trợ</h3>
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
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-5 transition-colors duration-300">Liên hệ</h3>
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

        {/* Bottom section */}
        <div className="border-t border-border pt-8 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-muted-foreground text-sm transition-colors duration-300">
              © {currentYear} NyNus. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/dieu-khoan" className="text-muted-foreground hover:text-primary transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link href="/chinh-sach-bao-mat" className="text-muted-foreground hover:text-primary transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/cookie" className="text-muted-foreground hover:text-primary transition-colors">
                Chính sách Cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


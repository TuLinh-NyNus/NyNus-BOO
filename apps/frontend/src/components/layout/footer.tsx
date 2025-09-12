"use client";

import { motion, useScroll } from "framer-motion";
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
import { useState, useRef } from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  
  const footerRef = useRef<HTMLElement>(null);
  const _scrollYProgress = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" as const }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  const socialIconVariants = {
    hover: {
      scale: 1.15,
      y: -5,
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.9 }
  };

  // Enhanced Link component với improved underline effect
  const EnhancedLink = ({ href, text, highlight, className = "" }: { href: string; text: string; highlight?: string; className?: string }) => {
    return (
      <Link 
        href={href} 
        className={`text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md group relative pb-2 ${className}`}
      >
        <span className="relative">
          {text}{highlight && " "}
          {highlight && (
            <span 
              className="text-transparent bg-clip-text font-semibold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #FFB869 0%, #F86166 50%, #AB6EE4 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text"
              }}
            >
              {highlight}
            </span>
          )}
          <motion.span
            className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300 ease-out"
            initial={false}
          />
        </span>
      </Link>
    );
  };

  return (
    <footer 
      ref={footerRef}
      className="relative pt-20 pb-8 overflow-hidden transition-all duration-500 ease-out bg-background"
      style={{ position: 'relative' }} // Fix for motion-utils scroll offset calculation
    >
      {/* Enhanced Background decorations */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute -top-[20%] right-[30%] w-1/3 h-1/3 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 blur-[100px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-[10%] left-[20%] w-1/3 h-1/3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-[100px] rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 blur-[120px] rounded-full"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      <div className="container px-6 mx-auto">
        {/* Enhanced Newsletter Subscription với glassmorphism */}
        <motion.div 
          className="mb-16 border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-md shadow-2xl transition-all duration-500 ease-out mt-8"
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div variants={itemVariants}>
              <div className="mb-4">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Nhận thông tin mới nhất
                </h3>
              </div>
              <p className="text-foreground text-lg leading-relaxed mb-6">
                Đăng ký nhận thông báo về các khóa học, đề thi và tính năng mới nhất.
              </p>
              <div className="flex items-center gap-3 text-base text-muted-foreground">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                </motion.div>
                <span>Không spam, chỉ tin tức hữu ích</span>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 text-foreground placeholder-muted-foreground transition-all duration-300 backdrop-blur-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {isSubscribed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 min-w-[120px]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubscribed ? "Đã đăng ký!" : <>Đăng ký <ArrowRight className="h-4 w-4" /></>}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>

        {/* Main footer content với enhanced animations */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Company Info */}
          <motion.div variants={itemVariants}>
            <Link href="/" className="text-3xl font-bold mb-6 inline-block group">
              <motion.span 
                className="text-transparent bg-clip-text font-black tracking-tight transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #FFB869 0%, #F86166 50%, #AB6EE4 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  textShadow: "0 0 30px rgba(255, 184, 105, 0.4), 0 0 60px rgba(248, 97, 102, 0.3), 0 0 90px rgba(171, 110, 228, 0.2)",
                  fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
                  letterSpacing: "-0.02em",
                  lineHeight: "1.3",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem"
                }}
                whileHover={{ scale: 1.05 }}
              >
                NyNus
              </motion.span>
            </Link>
            <p className="text-foreground text-base leading-relaxed mb-6">
              Nền tảng học toán thông minh với AI, giúp học sinh cải thiện kỹ năng và đạt kết quả cao trong các kỳ thi quan trọng.
            </p>
            
            {/* Enhanced Social Links */}
            <div className="flex space-x-3 mb-6">
              {[
                { 
                  icon: Facebook, 
                  href: "#", 
                  hoverBg: "hover:bg-[#1877F2]", 
                  hoverText: "hover:text-white",
                  shadow: "hover:shadow-[#1877F2]/30" 
                },
                { 
                  icon: Instagram, 
                  href: "#", 
                  hoverBg: "hover:bg-gradient-to-r hover:from-[#E4405F] hover:to-[#833AB4]", 
                  hoverText: "hover:text-white",
                  shadow: "hover:shadow-[#E4405F]/30" 
                },
                { 
                  icon: Youtube, 
                  href: "#", 
                  hoverBg: "hover:bg-[#FF0000]", 
                  hoverText: "hover:text-white",
                  shadow: "hover:shadow-[#FF0000]/30" 
                },
                { 
                  icon: Twitter, 
                  href: "#", 
                  hoverBg: "hover:bg-[#1DA1F2]", 
                  hoverText: "hover:text-white",
                  shadow: "hover:shadow-[#1DA1F2]/30" 
                }
              ].map((social, index) => (
                <motion.div
                  key={index}
                  className="social-icon"
                  variants={socialIconVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link 
                    href={social.href} 
                    className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/10 ${social.hoverBg} text-muted-foreground ${social.hoverText} transition-all duration-300 shadow-lg ${social.shadow} border border-white/20 hover:border-white/40`}
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Language Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-foreground hover:border-primary hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {languages.find(lang => lang.code === selectedLanguage)?.name || 'Tiếng Việt'}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isLanguageMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </motion.button>

              {isLanguageMenuOpen && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-lg overflow-hidden z-20 backdrop-blur-md shadow-2xl"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {languages.map((language) => (
                    <motion.button
                      key={language.code}
                      className={`w-full text-left px-4 py-3 hover:bg-white/20 transition-all duration-200 ${
                        selectedLanguage === language.code 
                          ? 'text-primary bg-primary/20' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => {
                        setSelectedLanguage(language.code);
                        setIsLanguageMenuOpen(false);
                      }}
                      whileHover={{ x: 5 }}
                    >
                      {language.name}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Links Column 1 */}
          <motion.div className="lg:ml-auto" variants={itemVariants}>
            <h3 className="font-bold text-xl text-foreground mb-6">
              Liên kết
            </h3>
            <ul className="space-y-4">
              {[
                { href: "/about", text: "Về", highlight: "NyNus" },
                { href: "/courses", text: "Khóa học" },
                { href: "/practice", text: "Luyện tập" },
                { href: "/questions", text: "Câu hỏi" },
                { href: "/careers", text: "Tuyển dụng" }
              ].map((link, index) => (
                <motion.li 
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <EnhancedLink href={link.href} text={link.text} highlight={link.highlight} />
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Links Column 2 */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-xl text-foreground mb-6">
              Hỗ trợ
            </h3>
            <ul className="space-y-4">
              {[
                { href: "/huong-dan", text: "Hướng dẫn" },
                { href: "/faq", text: "FAQ" },
                { href: "/lien-he", text: "Liên hệ" },
                { href: "/bao-cao-loi", text: "Báo cáo lỗi" },
                { href: "/support", text: "Hỗ trợ kỹ thuật" }
              ].map((link, index) => (
                <motion.li 
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <EnhancedLink href={link.href} text={link.text} />
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Enhanced Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-xl text-white mb-6">
              Liên hệ
            </h3>
            <ul className="space-y-5">
              {[
                { icon: Mail, label: "Email", value: "support@nynus.edu.vn", href: "mailto:support@nynus.edu.vn", color: "group-hover:bg-blue-600" },
                { icon: Phone, label: "Hotline", value: "1900-xxxx", href: "tel:1900-xxxx", color: "group-hover:bg-green-600" },
                { icon: MapPin, label: "Địa chỉ", value: "Việt Nam", href: null, color: "group-hover:bg-purple-600" }
              ].map((contact, index) => (
                <motion.li 
                  key={contact.label}
                  className="flex items-start gap-3 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/10 ${contact.color} transition-all duration-300 border border-white/20 group-hover:border-white/40`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <contact.icon className="h-5 w-5 text-slate-300 group-hover:text-white" />
                  </motion.div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{contact.label}</p>
                    {contact.href ? (
                      <Link 
                        href={contact.href} 
                        className="text-blue-400 hover:text-blue-300 transition-all duration-300 font-medium"
                      >
                        {contact.value}
                      </Link>
                    ) : (
                      <p className="text-slate-300 font-medium">{contact.value}</p>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Enhanced Bottom section */}
        <motion.div 
          className="border-t border-white/10 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-400 text-base font-medium">
              © {currentYear}{" "}
              <span 
                className="text-transparent bg-clip-text font-semibold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #FFB869 0%, #F86166 50%, #AB6EE4 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text"
                }}
              >
                NyNus
              </span>
              . Tất cả quyền được bảo lưu.
            </div>
            <div className="flex flex-wrap gap-6 text-base">
              {[
                { href: "/terms", text: "Điều khoản sử dụng" },
                { href: "/privacy", text: "Chính sách bảo mật" },
                { href: "/lien-he", text: "Liên hệ" },
                { href: "/help", text: "Trợ giúp" }
              ].map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <EnhancedLink href={link.href} text={link.text} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

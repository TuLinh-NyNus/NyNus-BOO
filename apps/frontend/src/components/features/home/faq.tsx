"use client";

import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import ScrollIndicator from "@/components/ui/scroll-indicator";
import { motion } from "framer-motion";
import { useState } from "react";

// Import mockdata
import { homepageFAQData } from "@/lib/mockdata";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FAQItem = ({ question, answer, isOpen, toggleOpen }: FAQItemProps) => {
  return (
    <motion.div 
      className="group rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border border-border bg-card/50 hover:bg-card"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <button
        className={`w-full p-5 md:p-6 flex items-center justify-between text-left font-semibold transition-all duration-300 ${
          isOpen 
            ? "bg-muted/50 text-foreground" 
            : "bg-transparent text-foreground/80 hover:bg-muted/30"
        }`}
        onClick={toggleOpen}
      >
        <div className="flex items-center">
          <div className="relative mr-3">
            <HelpCircle className={`h-5 w-5 ${isOpen ? "text-blue-300" : "text-foreground/60"}`} />
            {isOpen && (
              <motion.div
                className="absolute inset-0 h-5 w-5 bg-blue-300 rounded-full opacity-30 blur-md"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          <span className="text-base md:text-lg transition-colors duration-300">{question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-foreground/60" />
        </motion.div>
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="px-5 md:px-6 pb-5 md:pb-6 text-foreground/80 leading-relaxed text-sm md:text-base"
        >
          {answer}
        </motion.div>
      )}
    </motion.div>
  );
};

// ScrollIndicator Component


const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <section id="faq-section" className="py-16 md:py-20 lg:py-24 relative min-h-screen bg-background overflow-hidden">
        {/* Background Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />

        <div className="container px-4 md:px-6 lg:px-8 mx-auto relative z-10 max-w-4xl">
          <motion.div 
            className="text-center mb-8 md:mb-10 lg:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Enhanced Badge */}
            <motion.div
              className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 border border-white/20 backdrop-blur-xl shadow-2xl mb-4 md:mb-5"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative mr-2 md:mr-3">
                <HelpCircle className="h-4 md:h-5 w-4 md:w-5 text-blue-300" />
                <div className="absolute inset-0 h-4 md:h-5 w-4 md:w-5 bg-blue-300 rounded-full opacity-30 blur-md animate-pulse" />
              </div>
              <span className="font-bold text-blue-200 text-sm md:text-base tracking-wide">
                Hỗ trợ & Hướng dẫn
              </span>
            </motion.div>

            {/* Enhanced Typography */}
            <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-3 lg:mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-relaxed py-1">
              Câu hỏi thường gặp
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8">
              Những thắc mắc phổ biến về nền tảng học tập NyNus
            </p>
          </motion.div>

          {/* FAQ Items with Stagger Animation */}
          <motion.div 
            className="max-w-2xl lg:max-w-3xl mx-auto mb-8 md:mb-10 lg:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  staggerChildren: 0.1,
                  duration: 0.5
                }
              }
            }}
          >
            <div className="space-y-2 md:space-y-3">
              {homepageFAQData.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openIndex === index}
                    toggleOpen={() => toggleFAQ(index)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced CTA Section */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="text-foreground/70 text-sm md:text-base lg:text-lg mb-3 md:mb-4 transition-colors duration-300">
              Không tìm thấy câu trả lời bạn cần?
            </p>
            
            {/* Modern CTA Button */}
            <button className="group relative inline-flex items-center px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm md:text-base hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <MessageCircle className="h-4 md:h-5 w-4 md:w-5 mr-2 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative z-10">Liên hệ ngay</span>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </motion.div>
        </div>

        {/* ScrollIndicator Component */}
        <ScrollIndicator />

        {/* Enhanced CSS Animations */}
        <style jsx>{`
          @keyframes float-subtle {
            0%, 100% { 
              transform: translateY(0px) scale(1); 
              opacity: 0.5;
            }
            50% { 
              transform: translateY(-4px) scale(1.02); 
              opacity: 0.8;
            }
          }
          
          @keyframes glow-pulse {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            }
            50% { 
              box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
            }
          }
        `}</style>
      </section>
      </>
    );
};

export default FAQ;

"use client";

import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { useState } from "react";

// Import mockdata
import { homepageFAQData } from "@/lib/mockdata";
import ScrollIndicator from "@/components/ui/scroll-indicator";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FAQItem = ({ question, answer, isOpen, toggleOpen }: FAQItemProps) => {
  return (
    <div className="rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-200 hover:shadow-lg border border-border">
      <button
        className={`w-full p-6 flex items-center justify-between text-left font-medium ${
          isOpen ? "bg-muted" : "bg-card"
        } transition-colors duration-300`}
        onClick={toggleOpen}
      >
        <div className="flex items-center">
          <HelpCircle className={`h-5 w-5 mr-3 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-card-foreground transition-colors duration-300">{question}</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-6 text-muted-foreground bg-card border-t border-border transition-colors duration-300">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="py-24 relative min-h-screen" style={{ backgroundColor: '#1F1F47' }}>




      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-secondary backdrop-blur-sm mb-4 transition-colors duration-300">
            <HelpCircle className="h-4 w-4 mr-2" /> Hỗ trợ & Hướng dẫn
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground transition-colors duration-300">
            Câu hỏi thường gặp
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto transition-colors duration-300">
            Những thắc mắc phổ biến về nền tảng học tập NyNus
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {homepageFAQData.map((faq, index) => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                toggleOpen={() => toggleFAQ(index)}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6 transition-colors duration-300">
              Không tìm thấy câu trả lời bạn cần?
            </p>
            <button className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-200">
              <MessageCircle className="h-5 w-5 mr-2" /> Liên hệ ngay
            </button>
          </div>
        </div>
      </div>




    </section>
  );
};

export default FAQ;

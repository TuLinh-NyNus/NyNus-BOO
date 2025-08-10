"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, FileQuestion, GraduationCap, Library } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

// Updated quick links data - Thu nhỏ và tối ưu nội dung
const quickLinks = [
  {
    icon: GraduationCap,
    title: "LUYỆN ĐỀ",
    type: "mới nhất",
    href: "/practice-tests"
  },
  {
    icon: FileQuestion,
    title: "Câu hỏi",
    type: "nhiều người hỏi nhất",
    href: "/questions"
  },
  {
    icon: Library,
    title: "Thư viện",
    type: "tài liệu được xem nhiều nhất",
    href: "/library"
  }
];

export function SearchDropdown({ isOpen, onClose }: SearchDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus input when dropdown opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-0 mt-2 w-60 bg-gradient-to-b from-purple-900/66 to-purple-800/66 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.66) 0%, rgba(124, 58, 237, 0.66) 100%)',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-title"
        >
          {/* Search Input - Thu nhỏ padding */}
          <div className="p-4 border-b border-white/10">
            <h3 id="search-title" className="sr-only">Tìm kiếm</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all text-sm"
                aria-label="Tìm kiếm nội dung"
              />
            </div>
          </div>

          {/* Quick Links Section - Ẩn title và thu nhỏ */}
          <div className="p-4">
            <div className="space-y-2">
              {quickLinks.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors group"
                    onClick={onClose}
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <item.icon className="h-3 w-3 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-xs truncate">
                        {item.title}
                      </div>
                    </div>
                    <div className="text-white/60 text-xs">
                      {item.type}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

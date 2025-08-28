"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Client-side mounting check để tránh hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check scroll position to show/hide the button
  useEffect(() => {
    // Chỉ chạy sau khi component đã mounted trên client
    if (!isMounted || typeof window === 'undefined') {
      return;
    }

    const checkScroll = () => {
      // Show after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, [isMounted]);

  // Check localStorage to see if the button was previously dismissed
  useEffect(() => {
    // Chỉ chạy sau khi component đã mounted trên client
    if (!isMounted || typeof window === 'undefined') {
      return;
    }

    try {
      const dismissed = localStorage.getItem("cta-dismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    } catch (error) {
      console.error('Error reading CTA dismissed state:', error);
      // Fallback to not dismissed state
    }
  }, [isMounted]);

  const handleDismiss = () => {
    setIsDismissed(true);
    // Chỉ access localStorage trên client
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("cta-dismissed", "true");
      } catch (error) {
        console.error('Error saving CTA dismissed state:', error);
        // Continue anyway, user preference will be lost on refresh but component still works
      }
    }
  };

  // Không render gì cho đến khi component mounted trên client
  if (!isMounted) {
    return null;
  }

  // If dismissed or not visible, don't show
  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 inset-x-4 z-50 md:hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <motion.div
            className="absolute top-0 right-0 transform -translate-y-1/2 -translate-x-1/2"
            whileTap={{ scale: 0.9 }}
          >
            <button
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors duration-300"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>

          <Link href="/auth/register">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 p-4 rounded-xl shadow-lg flex items-center justify-between gap-4 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div>
                <h3 className="font-medium text-white dark:text-white transition-colors duration-300">Bắt đầu học ngay!</h3>
                <p className="text-white/90 dark:text-white/80 text-sm transition-colors duration-300">Đăng ký miễn phí để trải nghiệm</p>
              </div>
              <div className="bg-white/30 dark:bg-white/20 rounded-full p-2 transition-colors duration-300">
                <ArrowRight className="h-5 w-5 text-white dark:text-white transition-colors duration-300" />
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

FloatingCTA.displayName = 'FloatingCTA';

export default FloatingCTA;


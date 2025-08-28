"use client";

import { ArrowUpIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Client-side mounting check để tránh hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Chỉ chạy sau khi component đã mounted trên client
    if (!isMounted || typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      setShow(window.scrollY > 500);
    };

    // Thêm event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMounted]);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Không render gì cho đến khi component mounted trên client
  if (!isMounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className="fixed bottom-5 right-5 p-3 rounded-full bg-primary text-white shadow-lg z-50 hover:bg-primary/90 focus:outline-none"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUpIcon className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop; 


'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

/**
 * DarkBackground
 * Nền dark gradient thống nhất giống trang 404 cho toàn bộ trang (trừ trang chủ và admin)
 * Chỉ hiển thị khi theme hiện tại là 'dark'.
 */
export default function DarkBackground() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Chỉ render theme-dependent content sau khi component đã mount
  // để tránh hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isHomepage = pathname === '/';
  const isAdmin = pathname?.includes('/3141592654/admin');
  
  // Chờ component mount trước khi check theme
  if (!mounted) return null;
  
  const isDark = theme === 'dark';
  if (isHomepage || isAdmin || !isDark) return null;

  return (
    <>
      {/* Lớp nền chính giống trang 404 */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-br from-[#1F1F47] via-[#2A2A5A] to-[#1F1F47]"
      />
      {/* Lớp overlay gradient nhẹ giống trang 404 */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-br from-[#4417DB]/8 via-[#E57885]/6 to-[#F18582]/8"
      />
    </>
  );
}

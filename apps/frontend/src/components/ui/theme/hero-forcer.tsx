'use client';

import { useEffect, useState } from "react";

interface HeroForcerProps {
  /**
   * Component con - thường là Hero component
   */
  children: React.ReactNode;
}

/**
 * HeroForcer Component
 * 
 * Component này được sử dụng để force dark theme chỉ cho Hero component
 * mà không ảnh hưởng đến theme của toàn bộ trang.
 * 
 * Cách hoạt động:
 * - Tạo ra một div wrapper với class "dark" để force dark theme cho children
 * - Không thay đổi theme global của ứng dụng
 * - Chỉ Hero component bên trong sẽ có dark theme
 * 
 * @param children - Component con (Hero component)
 */
export function HeroForcer({ children }: HeroForcerProps) {
  const [mounted, setMounted] = useState(false);

  // Chỉ render sau khi component đã mount để tránh hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hiển thị fallback trong lúc chờ mount
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <div className="dark">
      {children}
    </div>
  );
}

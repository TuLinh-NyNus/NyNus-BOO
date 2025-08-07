'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Trang redirect từ /thao-luan sang /discussions
 * Đây là trang tạm thời để đảm bảo backward compatibility
 */
export default function ThaoLuanRedirectPage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Redirect ngay lập tức đến trang discussions
    router.replace('/discussions');
  }, [router]);

  // Hiển thị loading trong khi redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}

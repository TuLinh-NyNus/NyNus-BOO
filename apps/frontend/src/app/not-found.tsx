/**
 * 404 Not Found Page
 * Custom 404 page với dark theme styling
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/form/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F1F47] via-[#2A2A5A] to-[#1F1F47] flex items-center justify-center px-4">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4417DB]/8 via-[#E57885]/6 to-[#F18582]/8 pointer-events-none" />
      
      <div className="text-center relative z-10">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent drop-shadow-lg">
            404
          </h1>
        </div>
        
        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 drop-shadow-sm">
            Trang không tìm thấy
          </h2>
          <p className="text-gray-200 text-lg max-w-md mx-auto leading-relaxed drop-shadow-sm">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            asChild
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
        
        {/* Additional Help */}
        <div className="mt-12 text-gray-300 text-sm">
          <p>Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với chúng tôi.</p>
        </div>
      </div>
    </div>
  );
}

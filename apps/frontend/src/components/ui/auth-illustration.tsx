import React from 'react';
import Image from 'next/image';

interface AuthIllustrationProps {
  className?: string;
}

export function AuthIllustration({ className = "" }: AuthIllustrationProps) {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <Image
        src="/images/login/Ảnh1.svg"
        alt="Login Illustration"
        width={400}
        height={400}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}

import { Metadata } from 'next';
import { ReactNode } from 'react';

/**
 * Profile Section Metadata
 * SEO metadata cho profile section
 */
export const metadata: Metadata = {
  title: {
    template: '%s | Hồ sơ - NyNus',
    default: 'Hồ sơ cá nhân - NyNus'
  },
  description: 'Quản lý hồ sơ cá nhân - Cập nhật thông tin, cài đặt tài khoản và quản lý phiên đăng nhập của bạn.',
  keywords: [
    'hồ sơ',
    'profile',
    'thông tin cá nhân',
    'cài đặt tài khoản',
    'quản lý phiên',
    'bảo mật',
    'NyNus',
    'tài khoản người dùng'
  ],
  openGraph: {
    title: 'Hồ sơ cá nhân - NyNus',
    description: 'Quản lý hồ sơ và cài đặt tài khoản cá nhân',
    type: 'profile',
    siteName: 'NyNus',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary',
    title: 'Hồ sơ cá nhân - NyNus',
    description: 'Quản lý hồ sơ và cài đặt tài khoản cá nhân',
  },
  robots: {
    index: false, // Profile pages should not be indexed
    follow: false,
  },
};

/**
 * Profile Layout Component
 * Layout wrapper cho profile section
 */
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}


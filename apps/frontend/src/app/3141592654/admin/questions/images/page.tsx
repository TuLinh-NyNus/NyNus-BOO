/**
 * Admin Image Management Page
 * Comprehensive image management dashboard cho admin users
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from 'react';
import { Metadata } from 'next';
import ImageManagementDashboard from './components/ImageManagementDashboard';

// ===== METADATA =====
export const metadata: Metadata = {
  title: 'Quản lý hình ảnh câu hỏi | NyNus Admin',
  description: 'Dashboard quản lý hình ảnh câu hỏi với Cloudinary integration',
};

// ===== MAIN PAGE COMPONENT =====

export default function AdminImageManagementPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý hình ảnh câu hỏi
          </h1>
          <p className="text-gray-600 mt-1">
            Dashboard tổng quan và quản lý hình ảnh với Cloudinary CDN
          </p>
        </div>
      </div>

      {/* Main Dashboard */}
      <ImageManagementDashboard />
    </div>
  );
}

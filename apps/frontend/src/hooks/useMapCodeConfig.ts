/**
 * useMapCodeConfig Hook
 * Fetch MapCode configuration từ backend
 * 
 * Workaround: Vì GetMapCodeConfig() chưa deploy, dùng approach khác:
 * - Parse MapCode.md file trực tiếp (nếu có)
 * - Hoặc dùng hardcoded default rồi update sau
 * 
 * TODO: Update sau khi backend deploy GetMapCodeConfig()
 */

'use client';

import { useState, useEffect } from 'react';

export interface MapCodeConfigData {
  version: string;
  grades: Record<string, string>;
  subjects: Record<string, string>;
  chapters: Record<string, string>;
  levels: Record<string, string>;
  lessons: Record<string, string>;
  forms: Record<string, string>;
}

interface UseMapCodeConfigResult {
  config: MapCodeConfigData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Default fallback config - UPDATED to match MAPCODE_CONFIG from question-code.ts
// This prevents hydration mismatches between server and client rendering
const DEFAULT_CONFIG: MapCodeConfigData = {
  version: 'v2025-10-27',
  grades: {
    '0': 'Lớp 10',
    '1': 'Lớp 11',
    '2': 'Lớp 12',
    '6': 'Lớp 6',
    '7': 'Lớp 7',
    '8': 'Lớp 8',
    '9': 'Lớp 9',
    'A': 'Đại học',
    'B': 'Cao đẳng',
    'C': 'Trung cấp'
  },
  subjects: {
    'P': 'NGÂN HÀNG CHÍNH',
    'D': 'Đại số và giải tích',
    'H': 'Hình học và đo lường',
    'C': 'Chuyên đề',
    'G': 'HỌC SINH GIỎI',
    'T': 'CÂU HỎI TƯ DUY'
  },
  chapters: {
    '0': 'Xác suất',
    '1': 'Mệnh đề và tập hợp',
    '2': 'Bất phương trình và hệ bất phương trình bậc nhất hai ẩn',
    '3': 'Hàm số bậc hai và đồ thị',
    '4': 'Hệ thức lượng trong tam giác',
    '5': 'Véc tơ (chưa xét tọa độ)',
    '6': 'Thống kê',
    '7': 'Bất phương trình bậc 2 một ẩn',
    '8': 'Đại số tổ hợp',
    '9': 'Véc tơ (trong hệ tọa độ)'
  },
  levels: {
    'N': 'Nhận biết',
    'H': 'Thông Hiểu',
    'V': 'VD',
    'C': 'VD Cao',
    'T': 'VIP',
    'M': 'Note'
  },
  lessons: {
    '0': 'Chưa phân dạng',
    '1': 'Mệnh đề',
    '2': 'Tập hợp',
    '3': 'Các phép toán tập hợp',
    '4': 'Tích vô hướng (chưa xét tọa độ)',
    '5': 'Elip và các vấn đề liên quan',
    '6': 'Hypebol và các vấn đề liên quan',
    '7': 'Parabol và các vấn đề liên quan',
    '8': 'Sự thống nhất giữa ba đường Conic',
    '9': 'Tập hợp, ánh xạ (không giới hạn)',
    'A': 'Số nguyên tố - Hợp số',
    'B': 'Ước chung - Ước chung lớn nhất',
    'C': 'Bội chung - Bội chung nhỏ nhất'
  },
  forms: {
    '0': 'Câu hỏi tổng hợp',
    '1': 'Xác định mệnh đề, mệnh đề chứa biến',
    '2': 'Tính đúng-sai của mệnh đề',
    '3': 'Phủ định của một mệnh đề',
    '4': 'Mệnh đề kéo theo, đảo, tương đương',
    '5': 'Mệnh đề với mọi, tồn tại',
    '6': 'Áp dụng mệnh đề vào suy luận có lí',
    '7': 'Các phép toán với tham số',
    '8': 'Sử dụng các tính chất của đồ thị',
    '9': 'Toán thực tế',
    'A': 'Chưa phân dạng',
    'B': 'Hàm số chứa dấu giá trị tuyệt đối',
    'C': 'Các phép biến đổi đồ thị',
    'D': 'Bài toán có chứa tham số m',
    'E': 'Giới hạn dãy số có chứa tham số',
    'F': 'Giá trị lớn nhất, nhỏ nhất hàm đạo hàm',
    'G': 'GTLN/GTNN qua bảng biến thiên'
  }
};

/**
 * Hook to fetch MapCode configuration from backend
 * 
 * TEMPORARY: Returns default config until backend GetMapCodeConfig() is deployed
 */
export function useMapCodeConfig(): UseMapCodeConfigResult {
  const [config, setConfig] = useState<MapCodeConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Uncomment when backend is ready
      // const response = await MapCodeService.getMapCodeConfig();
      // setConfig(response);

      // TEMPORARY: Use default config
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      setConfig(DEFAULT_CONFIG);

    } catch (err) {
      console.error('Failed to fetch MapCode config:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to default config on error
      setConfig(DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    isLoading,
    error,
    refetch: fetchConfig
  };
}


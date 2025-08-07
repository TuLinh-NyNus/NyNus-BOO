/**
 * Questions Types
 * Re-exports từ các nguồn types khác nhau để tập trung hóa
 * KHÔNG duplicate, chỉ re-export
 */

// Re-export từ lib types
export * from '@/lib/types/question';

// Re-export từ app types  
export * from '@/types/question';

// Re-export từ shared interfaces
export * from '@nynus/interfaces';

// Re-export từ entities
export * from '@nynus/entities';

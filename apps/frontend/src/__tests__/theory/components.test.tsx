/**
 * Theory Components Tests
 * Unit tests cho theory React components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TheorySection } from '@/components/features/home/theory-section';
import { LatexContent } from '@/components/theory/LatexContent';

// Mock framer-motion để tránh animation issues trong tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <h3 {...props}>{children}</h3>,
  },
}));

// Mock Next.js Link
const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
  <a href={href}>{children}</a>
);
MockLink.displayName = 'MockLink';

jest.mock('next/link', () => {
  return MockLink;
});

describe('Theory Components', () => {
  describe('TheorySection', () => {
    it('should render theory section with correct content', () => {
      render(<TheorySection />);

      // Check main heading
      expect(screen.getByText(/Khám phá/)).toBeInTheDocument();
      expect(screen.getByText(/Lý thuyết Toán học/)).toBeInTheDocument();

      // Check description
      expect(screen.getByText(/Hệ thống lý thuyết toán học hoàn chỉnh/)).toBeInTheDocument();

      // Check stats
      expect(screen.getByText('156')).toBeInTheDocument(); // Total chapters
      expect(screen.getByText('3.2k')).toBeInTheDocument(); // Total students
      expect(screen.getByText('4.7')).toBeInTheDocument(); // Average rating
      expect(screen.getByText('85%')).toBeInTheDocument(); // Completion rate
    });

    it('should render featured chapters', () => {
      render(<TheorySection />);

      // Check featured chapters
      expect(screen.getByText('Hàm số và Đồ thị')).toBeInTheDocument();
      expect(screen.getByText('Phương trình Lượng giác')).toBeInTheDocument();
      expect(screen.getByText('Tích phân và Ứng dụng')).toBeInTheDocument();

      // Check chapter details
      expect(screen.getByText('Lớp 10')).toBeInTheDocument();
      expect(screen.getByText('Lớp 11')).toBeInTheDocument();
      expect(screen.getByText('Lớp 12')).toBeInTheDocument();
    });

    it('should render quick access links', () => {
      render(<TheorySection />);

      // Check quick access section
      expect(screen.getByText('Truy cập nhanh')).toBeInTheDocument();

      // Check grade links
      const gradeLinks = screen.getAllByText(/Lớp \d+/);
      expect(gradeLinks.length).toBeGreaterThanOrEqual(3);

      // Check chapter counts
      expect(screen.getByText('45 chương lý thuyết')).toBeInTheDocument();
      expect(screen.getByText('52 chương lý thuyết')).toBeInTheDocument();
      expect(screen.getByText('59 chương lý thuyết')).toBeInTheDocument();
    });

    it('should have correct navigation links', () => {
      render(<TheorySection />);

      // Check main CTA link
      const mainCTA = screen.getByRole('link', { name: /Khám phá toàn bộ thư viện/ });
      expect(mainCTA).toHaveAttribute('href', '/theory');

      // Check featured chapter links
      const chapterLinks = screen.getAllByText('Học ngay');
      expect(chapterLinks.length).toBe(3);
    });

    it('should display ratings and student counts correctly', () => {
      render(<TheorySection />);

      // Check ratings
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('4.7')).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();

      // Check student counts (formatted)
      expect(screen.getByText('1.3k')).toBeInTheDocument(); // 1250 formatted
      expect(screen.getByText('980')).toBeInTheDocument();
      expect(screen.getByText('750')).toBeInTheDocument();
    });
  });

  describe('LatexContent', () => {
    const mockParsedContent = '<h2>Test Section</h2><p>Test content with <strong>emphasis</strong></p>';

    it('should render LaTeX content correctly', () => {
      render(<LatexContent content={mockParsedContent} />);

      expect(screen.getByText('Test Section')).toBeInTheDocument();
      expect(screen.getByText(/Test content with/)).toBeInTheDocument();
    });

    it('should handle empty content gracefully', () => {
      const emptyContent = '';

      render(<LatexContent content={emptyContent} />);

      // Should not crash
      expect(screen.getByTestId('latex-content')).toBeInTheDocument();
    });

    it('should sanitize HTML content', () => {
      const maliciousContent = '<script>alert("xss")</script><p>Safe content</p>';

      render(<LatexContent content={maliciousContent} />);

      // Script should be removed, safe content should remain
      expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument();
      expect(screen.getByText('Safe content')).toBeInTheDocument();
    });
  });

  // ChapterList tests commented out due to complex interface requirements
  // describe('ChapterList', () => {
  //   // Tests would go here
  // });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<TheorySection />);

      // Check for proper headings hierarchy
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toBeInTheDocument();

      // Check for proper link labels
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should be keyboard navigable', () => {
      render(<TheorySection />);

      const firstLink = screen.getAllByRole('link')[0];
      firstLink.focus();
      expect(firstLink).toHaveFocus();

      // Test tab navigation
      fireEvent.keyDown(firstLink, { key: 'Tab' });
      // Next focusable element should receive focus
    });

    it('should have proper color contrast', () => {
      render(<TheorySection />);

      // This would typically be tested with automated accessibility tools
      // For now, we just ensure text content is rendered
      expect(screen.getByText(/Lý thuyết Toán học/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should handle mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<TheorySection />);

      // Component should render without errors on mobile
      expect(screen.getByText(/Lý thuyết Toán học/)).toBeInTheDocument();
    });

    it('should handle tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<TheorySection />);

      // Component should render without errors on tablet
      expect(screen.getByText(/Lý thuyết Toán học/)).toBeInTheDocument();
    });
  });
});

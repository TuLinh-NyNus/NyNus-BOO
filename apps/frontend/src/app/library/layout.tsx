/**
 * Library Layout
 * Wrap library pages with error boundary
 */

import { ReactNode } from 'react';
import { LibraryErrorBoundary } from '@/components/library';

interface LibraryLayoutProps {
  children: ReactNode;
}

export default function LibraryLayout({ children }: LibraryLayoutProps) {
  return (
    <LibraryErrorBoundary>
      {children}
    </LibraryErrorBoundary>
  );
}


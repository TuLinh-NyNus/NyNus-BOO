'use client';

import { useEffect } from 'react';

import { useToast } from "@/components/ui/feedback/use-toast";
import { useAuth } from '@/contexts/auth-context';
import logger from '@/lib/utils/logger';

/**
 * Component để quản lý token trong client-side
 * - Simplified token management với AuthContext
 */
export function TokenManager() {
  const { toast } = useToast();
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    // Log authentication status
    if (isAuthenticated && user) {
      logger.info('TokenManager: User authenticated', {
        userId: user.id,
        email: user.email,
        role: user.role
      });
    } else {
      logger.debug('TokenManager: User not authenticated');
    }
  }, [isAuthenticated, user, token]);

  // Component này không render gì cả - chỉ để logging
  return null;
}

export default TokenManager;

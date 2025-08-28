import { useState } from 'react';

interface NewsletterResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    subscribedAt?: string;
    status?: string;
  };
}

interface UseNewsletterReturn {
  email: string;
  setEmail: (email: string) => void;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  handleSubscribe: (e: React.FormEvent) => Promise<void>;
  resetState: () => void;
}

export const useNewsletter = (): UseNewsletterReturn => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'newsletter_signup_attempt', {
          event_category: 'Footer',
          event_label: 'Newsletter Subscription'
        });
      }

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: NewsletterResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi đăng ký');
      }

      // Success
      setIsSubscribed(true);
      setEmail('');
      
      // Analytics tracking for success
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'newsletter_signup_success', {
          event_category: 'Footer',
          event_label: 'Newsletter Subscription Success'
        });
      }

      // Reset subscription state after 5 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đăng ký';
      setError(errorMessage);
      
      // Analytics tracking for error
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'newsletter_signup_error', {
          event_category: 'Footer',
          event_label: 'Newsletter Subscription Error',
          value: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setEmail('');
    setIsSubscribed(false);
    setError(null);
    setIsLoading(false);
  };

  return {
    email,
    setEmail,
    isSubscribed,
    isLoading,
    error,
    handleSubscribe,
    resetState,
  };
};

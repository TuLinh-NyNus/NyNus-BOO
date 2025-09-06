"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const QuickContact = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Vui lòng nhập nội dung tin nhắn');
      return false;
    }
    if (formData.message.length < 10) {
      setError('Nội dung tin nhắn phải có ít nhất 10 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'contact_form_submit', {
          event_category: 'Footer',
          event_label: 'Quick Contact Form'
        });
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi gửi tin nhắn');
      }

      // Success
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Analytics tracking for success
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'contact_form_success', {
          event_category: 'Footer',
          event_label: 'Quick Contact Success'
        });
      }

      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi tin nhắn';
      setError(errorMessage);
      
      // Analytics tracking for error
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'contact_form_error', {
          event_category: 'Footer',
          event_label: 'Quick Contact Error',
          value: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Liên hệ nhanh</h3>
      
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">Gửi tin nhắn thành công!</h4>
          <p className="text-muted-foreground">Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Tên của bạn"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:border-ring text-foreground transition-colors"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:border-ring text-foreground transition-colors"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              name="subject"
              placeholder="Tiêu đề"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:border-ring text-foreground transition-colors"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <textarea
              name="message"
              placeholder="Nội dung tin nhắn"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:border-ring text-foreground transition-colors resize-none"
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                Gửi tin nhắn
                <Send className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
};

export default QuickContact;
























"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export function AuthModal({ isOpen, onClose, onLogin, onRegister }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      onLogin();
    } else {
      onRegister();
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
              {/* Left Side - Illustration */}
              <div className="hidden lg:flex items-center justify-center p-8 bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-sm"
                >
                  {/* Illustration placeholder - you can replace with actual illustration */}
                  <div className="aspect-square bg-gradient-to-br from-purple-400 to-blue-400 rounded-3xl flex items-center justify-center">
                    <div className="text-white text-6xl">📚</div>
                  </div>
                </motion.div>
              </div>

              {/* Right Side - Form */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {isLoginMode ? "Sign in" : "Sign up"}
                  </h2>
                  <p className="text-white/70 mb-8">
                    {isLoginMode 
                      ? "Access to 300+ hours of courses, tutorials and livestreams"
                      : "Join thousands of learners and start your journey"
                    }
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      {isLoginMode ? "Sign in" : "Sign up"}
                    </Button>

                    {/* Additional Links */}
                    <div className="space-y-4 text-center">
                      {isLoginMode && (
                        <button
                          type="button"
                          className="text-cyan-300 hover:text-cyan-200 text-sm transition-colors"
                        >
                          Reset password
                        </button>
                      )}

                      <div className="text-white/70 text-sm">
                        {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                        <button
                          type="button"
                          onClick={switchMode}
                          className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                        >
                          {isLoginMode ? "Sign up" : "Sign in"}
                        </button>
                      </div>

                      {!isLoginMode && (
                        <div className="text-white/70 text-sm">
                          Don&apos;t have a password yet?{" "}
                          <button
                            type="button"
                            className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
                          >
                            Set password
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

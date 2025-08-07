'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, X, History, Image as ImageIcon, Command } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';

import { MathBackground } from '@/components/features/courses/ui/math-background';
import { QuestionSearchTabs } from '@/components/features/questions/search';
import { SearchResponse } from '@/lib/services/question-search-service';

const recentSearches = [
  "Phương trình bậc 2",
  "Giải tích 12",
  "Hình học không gian",
];

export default function SearchPage(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [typingEffect, setTypingEffect] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [showKeyboardShortcut, setShowKeyboardShortcut] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Xử lý kết quả tìm kiếm từ QuestionSearchTabs
  const handleSearchResults = (results: SearchResponse) => {
    setSearchResults(results);
    setShowAdvancedSearch(true);
  };

  // Typing effect for placeholder
  useEffect(() => {
    const placeholders = [
      "Tìm kiếm câu hỏi...",
      "Tìm tài liệu học tập...",
      "Tìm bài giảng video...",
      "Tìm kiếm khóa học..."
    ];

    if (!isFocused) {
      const interval = setInterval(() => {
        const currentPlaceholder = placeholders[typingIndex];

        if (typingEffect.length < currentPlaceholder.length) {
          setTypingEffect(currentPlaceholder.substring(0, typingEffect.length + 1));
        } else {
          setTimeout(() => {
            setTypingEffect('');
            setTypingIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
          }, 1500);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [typingEffect, typingIndex, isFocused]);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }

      if (event.key === 'Escape' && isFocused) {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice search simulation
  const handleVoiceSearch = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      setSearchTerm('Toán học');
    }, 2000);
  };

  // Auto-complete suggestions based on search term
  const autoCompleteSuggestions = useMemo(() => {
    if (!searchTerm) return [];

    const suggestions = [
      `${searchTerm} lớp 10`,
      `${searchTerm} cơ bản`,
      `${searchTerm} nâng cao`,
      `Hướng dẫn ${searchTerm}`,
      `Bài tập ${searchTerm}`,
    ];

    return suggestions;
  }, [searchTerm]);



  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Mathematical Background for entire page */}
      <MathBackground />

      <div className="container relative z-10 mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-white mb-4"
        >
          CÂU HỎI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-center text-white/80 mb-8 max-w-2xl mx-auto"
        >
          Tìm kiếm câu hỏi từ cộng đồng học tập, tài liệu hoặc bài giảng của các giảng viên
        </motion.p>

        {/* Nút chuyển đổi giữa tìm kiếm đơn giản và nâng cao */}
        <div className="text-center mb-6">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.4 } }}
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="text-white/80 hover:text-white transition-colors duration-300 text-sm underline"
          >
            {showAdvancedSearch ? 'Tìm kiếm đơn giản' : 'Tìm kiếm nâng cao (3 phương thức)'}
          </motion.button>
        </div>



        {/* Hiển thị tìm kiếm nâng cao hoặc đơn giản */}
        {showAdvancedSearch ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <QuestionSearchTabs onSearchResults={handleSearchResults} />
          </motion.div>
        ) : (
          <div
            ref={searchRef}
            className="relative max-w-3xl mx-auto"
          >
            {/* Search Input */}
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={`relative ${isFocused
              ? 'ring-2 ring-purple-500 ring-opacity-60 shadow-lg shadow-purple-500/20'
              : 'hover:shadow-md hover:shadow-purple-500/10 transition-shadow duration-300'}`}
            onMouseEnter={() => setShowKeyboardShortcut(true)}
            onMouseLeave={() => setShowKeyboardShortcut(false)}
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                placeholder={isFocused ? "Tìm kiếm câu hỏi, bài giảng, tài liệu..." : typingEffect}
                className="w-full h-16 pl-12 pr-40 rounded-xl bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl
                  text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 border border-slate-300/50 dark:border-slate-700/50
                  focus:outline-none focus:border-purple-500/50 transition-all duration-300
                  hover:bg-white/90 dark:hover:bg-slate-800/70"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-gray-400 transition-colors duration-300">
                <Search className="h-5 w-5" />
              </div>

              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchTerm && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => setSearchTerm('')}
                    className="p-1.5 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 rounded-full transition-colors duration-300"
                  >
                    <X className="h-4 w-4 text-slate-500 dark:text-gray-400 transition-colors duration-300" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {}}
                  className="p-2 rounded-full transition-colors hover:bg-slate-200/70 dark:hover:bg-slate-700/50 text-slate-500 dark:text-gray-400 duration-300"
                >
                  <ImageIcon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-full transition-colors
                    ${isListening
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/50 text-slate-500 dark:text-gray-400 transition-colors duration-300'}`}
                >
                  <Mic className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Keyboard shortcut hint */}
              <AnimatePresence>
                {showKeyboardShortcut && !isFocused && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-4 bottom-0 transform translate-y-full mt-2 px-2 py-1
                      bg-slate-200 dark:bg-gray-800 rounded text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1 transition-colors duration-300"
                  >
                    <Command className="h-3 w-3" />
                    <span>+</span>
                    <span>K</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dropdown - Simplified */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute w-full mt-2 py-3 bg-white/10 backdrop-blur-xl rounded-xl
                    border border-white/20 shadow-xl z-50"
                >
                  {/* Auto-complete suggestions */}
                  {searchTerm && autoCompleteSuggestions.length > 0 && (
                    <div className="px-4">
                      <div className="space-y-1">
                        {autoCompleteSuggestions.slice(0, 3).map((suggestion, index) => (
                          <motion.button
                            key={suggestion}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSearchTerm(suggestion)}
                            className="flex items-center gap-2 w-full p-2 text-left text-sm text-white/80
                              hover:bg-white/10 rounded-lg transition-colors duration-300"
                          >
                            <Search className="h-3.5 w-3.5 text-white/60" />
                            <span>{suggestion}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent searches - only when no search term */}
                  {!searchTerm && recentSearches.length > 0 && (
                    <div className="px-4">
                      <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                        <History className="h-4 w-4" />
                        <span>Tìm kiếm gần đây</span>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <motion.button
                            key={search}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSearchTerm(search)}
                            className="block w-full text-left px-3 py-2 text-white/80
                              hover:bg-white/10 rounded-lg transition-colors duration-300"
                          >
                            {search}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Background blur effect when focused */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </AnimatePresence>
        </div>
        )}
      </div>
    </main>
  );
}

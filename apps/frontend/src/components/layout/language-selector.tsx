"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: Language[] = [
  {
    code: 'vi',
    name: 'Tiếng Việt',
    flag: '🇻🇳',
    nativeName: 'Tiếng Việt'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    nativeName: 'Français'
  },
  {
    code: 'ja',
    name: '日本語',
    flag: '🇯🇵',
    nativeName: '日本語'
  },
  {
    code: 'ko',
    name: '한국어',
    flag: '🇰🇷',
    nativeName: '한국어'
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    nativeName: '中文'
  }
];

const LanguageSelector = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      const language = languages.find(lang => lang.code === savedLanguage);
      if (language) {
        setSelectedLanguage(language);
      }
    }
  }, []);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);

    // Save to localStorage
    localStorage.setItem('preferred-language', language.code);

    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'language_change', {
        event_category: 'Footer',
        event_label: `Language: ${language.name}`,
        value: language.code
      });
    }

    // TODO: Implement actual i18n routing
    // For now, just log the change
    console.log(`Language changed to: ${language.name} (${language.code})`);
    
    // In a real implementation, you would:
    // 1. Update the URL with the new locale
    // 2. Reload the page with new translations
    // 3. Update all text content
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-background border border-border rounded-lg text-foreground hover:border-ring transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        aria-label="Chọn ngôn ngữ"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-lg">{selectedLanguage.flag}</span>
          <span className="hidden sm:inline">{selectedLanguage.nativeName}</span>
          <span className="sm:hidden">{selectedLanguage.code.toUpperCase()}</span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
            role="listbox"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors duration-200 focus:outline-none focus:bg-muted ${
                  selectedLanguage.code === language.code ? 'bg-muted/50' : ''
                }`}
                role="option"
                aria-selected={selectedLanguage.code === language.code}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{language.flag}</span>
                  <div className="text-left">
                    <div className="font-medium text-foreground">{language.nativeName}</div>
                    <div className="text-sm text-muted-foreground">{language.name}</div>
                  </div>
                </div>
                {selectedLanguage.code === language.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;

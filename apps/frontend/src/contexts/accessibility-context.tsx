/**
 * Accessibility Context
 * Global context để manage accessibility settings across the app
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ===== TYPES =====

export interface AccessibilitySettings {
  // Visual enhancements
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: number; // Percentage (100 = normal)
  focusIndicators: boolean;
  
  // Audio enhancements
  screenReader: boolean;
  audioFeedback: boolean;
  speechRate: number; // 0.5 - 2.0
  speechVolume: number; // 0.0 - 1.0
  
  // Motor enhancements
  keyboardNavigation: boolean;
  stickyKeys: boolean;
  clickDelay: number; // milliseconds
  
  // Cognitive enhancements
  simplifiedUI: boolean;
  autoFocus: boolean;
  skipAnimations: boolean;
}

export interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  applySettings: () => void;
  isEnabled: boolean;
  toggleAccessibility: () => void;
}

// ===== CONSTANTS =====

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 100,
  focusIndicators: true,
  screenReader: false,
  audioFeedback: false,
  speechRate: 1.0,
  speechVolume: 0.8,
  keyboardNavigation: true,
  stickyKeys: false,
  clickDelay: 0,
  simplifiedUI: false,
  autoFocus: false,
  skipAnimations: false
};

const STORAGE_KEY = 'nynus-accessibility-settings';
const ENABLED_KEY = 'nynus-accessibility-enabled';

// ===== CONTEXT =====

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// ===== PROVIDER =====

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      const savedEnabled = localStorage.getItem(ENABLED_KEY);
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
      
      if (savedEnabled) {
        setIsEnabled(JSON.parse(savedEnabled));
      }
    } catch (error) {
      console.warn('[Accessibility] Failed to load settings:', error);
    }
    
    setIsMounted(true);
  }, []);

  // Apply settings to DOM when settings change
  const applySettings = useCallback(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    const root = document.documentElement;
    
    // Remove all accessibility classes first
    root.classList.remove(
      'high-contrast',
      'reduce-motion',
      'enhanced-focus',
      'simplified-ui',
      'skip-animations'
    );

    if (!isEnabled) return;

    // Apply visual enhancements
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    }
    
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    }
    
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    }
    
    if (settings.simplifiedUI) {
      root.classList.add('simplified-ui');
    }
    
    if (settings.skipAnimations) {
      root.classList.add('skip-animations');
    }

    // Apply font size scaling
    root.style.setProperty('--accessibility-font-scale', `${settings.fontSize / 100}`);
    
    // Apply click delay
    if (settings.clickDelay > 0) {
      root.style.setProperty('--accessibility-click-delay', `${settings.clickDelay}ms`);
    }

    // Save settings to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      localStorage.setItem(ENABLED_KEY, JSON.stringify(isEnabled));
    } catch (error) {
      console.warn('[Accessibility] Failed to save settings:', error);
    }
  }, [settings, isEnabled, isMounted]);

  // Apply settings when they change
  useEffect(() => {
    applySettings();
  }, [applySettings]);

  // Update individual setting
  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Reset all settings to default
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Toggle accessibility on/off
  const toggleAccessibility = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + A: Toggle accessibility
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        toggleAccessibility();
      }
      
      // Alt + H: Toggle high contrast
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        updateSetting('highContrast', !settings.highContrast);
      }
      
      // Alt + R: Toggle reduced motion
      if (event.altKey && event.key === 'r') {
        event.preventDefault();
        updateSetting('reducedMotion', !settings.reducedMotion);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.highContrast, settings.reducedMotion, updateSetting, toggleAccessibility, isMounted]);

  // Auto-detect accessibility needs
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !settings.reducedMotion) {
      updateSetting('reducedMotion', true);
    }

    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast && !settings.highContrast) {
      updateSetting('highContrast', true);
    }

    // Check for color scheme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      // Could auto-enable high contrast for dark mode users
    }
  }, [settings.reducedMotion, settings.highContrast, updateSetting, isMounted]);

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    resetSettings,
    applySettings,
    isEnabled,
    toggleAccessibility
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// ===== HOOK =====

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// ===== UTILITIES =====

/**
 * Check if accessibility is supported
 */
export function isAccessibilitySupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(
    window.speechSynthesis &&
    window.matchMedia('(prefers-reduced-motion)') &&
    document.documentElement.classList
  );
}

/**
 * Get accessibility score (0-100)
 */
export function getAccessibilityScore(settings: AccessibilitySettings): number {
  let score = 0;
  const totalFeatures = Object.keys(settings).length;
  
  // Count enabled features
  Object.values(settings).forEach(value => {
    if (typeof value === 'boolean' && value) {
      score += 1;
    } else if (typeof value === 'number' && value !== DEFAULT_SETTINGS[Object.keys(settings).find(k => settings[k as keyof AccessibilitySettings] === value) as keyof AccessibilitySettings]) {
      score += 0.5;
    }
  });
  
  return Math.round((score / totalFeatures) * 100);
}

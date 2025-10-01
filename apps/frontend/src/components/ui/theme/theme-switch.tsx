/**
 * @deprecated Use UnifiedThemeToggle instead
 * This component will be removed in v2.0
 *
 * Migration guide:
 * ```typescript
 * // Old
 * import ThemeSwitch from '@/components/ui/theme/theme-switch';
 * <ThemeSwitch />
 *
 * // New
 * import { UnifiedThemeToggle } from '@/components/ui/theme';
 * <UnifiedThemeToggle variant="default" size="md" iconType="radix" />
 * ```
 */

"use client";

import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * @deprecated Use UnifiedThemeToggle instead
 */
const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Chỉ khi mounted thì mới hiển thị UI để tránh hiện tượng hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/70 backdrop-blur-sm border border-border text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      {theme === "dark" ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </motion.button>
  );
};

export default ThemeSwitch;


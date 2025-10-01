// Theme Components Barrel Export

// ✅ Primary theme toggle (recommended)
export { UnifiedThemeToggle } from './unified-theme-toggle';

// ⚠️ Legacy components (deprecated - use UnifiedThemeToggle instead)
// Note: ThemeToggle and ThemeSwitch are also exported from unified-theme-toggle for backward compatibility
export { default as LegacyThemeSwitch } from './theme-switch';
export { ThemeToggle as LegacyThemeToggle } from './theme-toggle';

// Theme forcers
export * from './theme-forcer';
export * from './hero-forcer';

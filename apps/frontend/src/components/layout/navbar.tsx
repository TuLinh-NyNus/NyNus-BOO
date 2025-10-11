"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, Settings, LogOut, MoreHorizontal, Eye } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

// Import UI components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Avatar components now handled by UserDisplay
import { UnifiedThemeToggle } from "@/components/ui/theme";
import { SearchDropdown } from "./search-dropdown";
import { AuthModal, useAuthModal } from "@/components/features/auth";
import { useAuth } from "@/contexts/auth-context-grpc";
import { UserDisplay } from "@/components/features/auth/UserDisplay";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationDropdown } from "@/components/features/notifications/NotificationDropdown";

// Navigation items
const navItems = [
  {
    title: "LÝ THUYẾT",
    href: "/lectures",
    isHighlight: false
  },
  {
    title: "KHÓA HỌC",
    href: "/courses",
    isHighlight: false
  },
  {
    title: "LUYỆN ĐỀ",
    href: "/practice",
    isHighlight: false
  },
  {
    title: "CÂU HỎI",
    href: "/questions",
    isHighlight: false
  },
  {
    title: "THẢO LUẬN",
    href: "/discussions",
    isHighlight: false
  },
  {
    title: "NHẮN TIN",
    href: "/messages",
    isHighlight: false
  },
  {
    title: "THƯ VIỆN",
    href: "/library",
    isHighlight: false
  }
];

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const authModal = useAuthModal();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Real authentication state from AuthContext
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { unreadCount } = useNotifications();

  // Responsive logic - hide items when screen gets smaller
  const [visibleItems, setVisibleItems] = useState(navItems);
  const [hiddenItems, setHiddenItems] = useState<typeof navItems>([]);

  // Client-side mounting check để tránh hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Enhanced scroll listener với smooth opacity transition
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Tính toán opacity dựa trên scroll position
      // 0px = completely transparent
      // 200px = fully opaque
      const maxScroll = 200;
      const opacity = Math.min(scrollY / maxScroll, 1);
      
      setScrollOpacity(opacity);
    };

    // Check initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  useEffect(() => {
    // Chỉ chạy sau khi component đã mounted trên client
    if (!isMounted || typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      const width = window.innerWidth;

      // Tablet and desktop responsive logic - start hiding items earlier to prevent wrapping
      if (width >= 768 && width < 1400) {
        // Hide items progressively: NHẮN TIN, THẢO LUẬN, LUYỆN ĐỀ, KHÓA HỌC, THƯ VIỆN, CÂU HỎI, LÝ THUYẾT
        const hideOrder = ["NHẮN TIN", "THẢO LUẬN", "LUYỆN ĐỀ", "KHÓA HỌC", "THƯ VIỆN", "CÂU HỎI", "LÝ THUYẾT"];

        // More aggressive hiding to prevent wrapping
        let itemsToHide = 0;
        if (width < 900) itemsToHide = 4; // Hide 4 items below 900px
        else if (width < 1000) itemsToHide = 3; // Hide 3 items below 1000px
        else if (width < 1100) itemsToHide = 2; // Hide 2 items below 1100px
        else if (width < 1200) itemsToHide = 1; // Hide 1 item below 1200px

        const visible = navItems.filter(item => !hideOrder.slice(0, itemsToHide).includes(item.title));
        const hidden = navItems.filter(item => hideOrder.slice(0, itemsToHide).includes(item.title));

        setVisibleItems(visible);
        setHiddenItems(hidden);
      } else if (width >= 1400) {
        // Show all items on large screens
        setVisibleItems(navItems);
        setHiddenItems([]);
      }
      // Mobile responsive stays the same (handled by existing mobile menu)
    };

    // Chạy resize check đầu tiên
    handleResize();

    // Thêm event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted]);

  // Close more menu when clicking outside
  useEffect(() => {
    // Chỉ chạy sau khi component đã mounted trên client
    if (!isMounted || typeof document === 'undefined') {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMounted]);

  const handleLogout = async () => {
    try {
      await logout();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Calculate dynamic background based on scroll position
  const navbarBackground = scrollOpacity === 0 
    ? 'transparent' 
    : `rgba(var(--background-rgb, 15, 20, 34), ${scrollOpacity * 0.95})`;
  
  const navbarBackdropBlur = scrollOpacity > 0.1 ? `blur(${scrollOpacity * 12}px)` : 'none';

  return (
    <>
      <header
        className="fixed top-0 z-50 w-full transition-all duration-500 ease-out"
        style={{ 
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: navbarBackground,
          backdropFilter: navbarBackdropBlur,
          WebkitBackdropFilter: navbarBackdropBlur,
          boxShadow: scrollOpacity > 0.5 
            ? `0 1px 3px rgba(0, 0, 0, ${scrollOpacity * 0.1})` 
            : 'none'
        }}
      >
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 min-w-0">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight transition-all duration-300 text-transparent bg-clip-text py-1 logo-gradient-text mr-8 lg:mr-12"
            style={{
              fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              borderRadius: "0.5rem",
              lineHeight: "1.3",
              paddingTop: "0.25rem",
              paddingBottom: "0.25rem"
            }}
          >
            NyNus
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden gap-4 md:flex items-center flex-shrink-0" suppressHydrationWarning={true}>
            {visibleItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                suppressHydrationWarning={true}
              >
                <Link
                  href={item.href}
                  className={`text-sm font-semibold tracking-wide transition-all duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-2 py-1 ${
                    pathname === item.href
                      ? "font-bold"
                      : item.isHighlight
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      : ""
                  } font-sans`}
                  style={{
                    color: item.isHighlight ? undefined : '#E8A0A4',
                    textShadow: item.isHighlight ? "0 0 20px rgba(168, 85, 247, 0.2)" : "none",
                    letterSpacing: "0.05em"
                  }}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.title}
                </Link>
              </motion.div>
            ))}

            {/* More menu for hidden items */}
            {hiddenItems.length > 0 && (
              <div className="relative" ref={moreMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 transition-all duration-300 hover:bg-muted"
                  style={{
                    color: '#E8A0A4'
                  }}
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>

                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-card backdrop-blur-md border border-border rounded-lg shadow-lg"
                    >
                      {hiddenItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                          style={{ color: '#E8A0A4' }}
                          onClick={() => setShowMoreMenu(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Theme Toggle */}
            <UnifiedThemeToggle
              variant="ghost"
              size="md"
            />

            {/* Enhanced Search Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 transition-all duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{
                  color: '#E8A0A4'
                }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Mở tìm kiếm"
              >
                <Search className="h-5 w-5" />
              </Button>

              <SearchDropdown
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
              />
            </div>

            {/* Notifications and Auth Section */}
            <div className="flex items-center gap-4">
              {/* Notification Dropdown - Only show when authenticated */}
              {isMounted && isAuthenticated && (
                <NotificationDropdown className="hidden md:flex" />
              )}

              {/* User Display */}
              {!isMounted ? (
                // Server-side fallback: Always show loading state
                <div className="h-11 w-11 rounded-full bg-muted animate-pulse" suppressHydrationWarning={true} />
              ) : isAuthenticated && user ? (
                // Client-side: Authenticated user dropdown with UserDisplay
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div suppressHydrationWarning={true}>
                      <UserDisplay
                        user={user}
                        variant="compact"
                        size="md"
                        showRole={false}
                        showLevel={false}
                        showAvatar={true}
                        showNotificationBadge={true}
                        notificationCount={unreadCount}
                        onClick={() => {}} // Handled by DropdownMenuTrigger
                        className="h-11 w-11 rounded-full hover:bg-accent/10 transition-colors duration-150"
                        ariaLabel={`User menu for ${user.firstName} ${user.lastName}`}
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Hồ sơ cá nhân
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/accessibility" className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        Accessibility
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isLoading ? (
                // Client-side: Loading state
                <div className="h-11 w-11 rounded-full bg-muted animate-pulse" suppressHydrationWarning={true} />
              ) : (
                // Client-side: Unauthenticated user button
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full transition-all duration-300 bg-muted hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{
                    color: '#E8A0A4'
                  }}
                  onClick={authModal.openLogin}
                  aria-label="Tài khoản người dùng"
                  suppressHydrationWarning={true}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden transition-all duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{
                color: '#E8A0A4'
              }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu điều hướng"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>

        <AuthModal
          isOpen={authModal.isOpen}
          onClose={authModal.close}
          initialMode={authModal.mode}
          onSuccess={() => {
            authModal.close();
            // Optionally redirect or show success message
          }}
        />

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-t transition-all duration-300 ${
                scrollOpacity > 0.5
                  ? 'border-border bg-card/95 backdrop-blur-md'
                  : 'border-white/20 bg-black/20 backdrop-blur-md'
              }`}
            >
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="font-medium transition-colors"
                      style={{ color: '#E8A0A4' }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                  {isMounted && (
                    <div className="flex flex-col gap-2 pt-4 border-t border-border">
                      {isAuthenticated && user ? (
                        // Mobile: Authenticated user display
                        <div className="space-y-3" suppressHydrationWarning={true}>
                          <UserDisplay
                            user={user}
                            variant="full"
                            size="lg"
                            showRole={true}
                            showLevel={true}
                            showAvatar={true}
                            showNotificationBadge={true}
                            notificationCount={unreadCount}
                            className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-150"
                            ariaLabel={`User profile for ${user.firstName} ${user.lastName}`}
                          />
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                window.location.href = '/profile';
                                setIsMenuOpen(false);
                              }}
                              className="justify-start hover:bg-muted"
                            >
                              <User className="mr-2 h-4 w-4" />
                              Hồ sơ cá nhân
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                window.location.href = '/settings';
                                setIsMenuOpen(false);
                              }}
                              className="justify-start hover:bg-muted"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Cài đặt
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                              }}
                              className="justify-start hover:bg-muted text-destructive hover:text-destructive"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Đăng xuất
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Mobile: Unauthenticated login button
                        <Button
                          variant="ghost"
                          onClick={() => {
                            authModal.openLogin();
                            setIsMenuOpen(false);
                          }}
                          className="justify-start hover:bg-muted"
                          style={{ color: '#E8A0A4' }}
                          suppressHydrationWarning={true}
                        >
                          Đăng nhập / Đăng ký
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;


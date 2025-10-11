"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User, Bell, Menu } from "lucide-react";

import { useAuth } from "@/contexts/auth-context-grpc";
import { UserRole } from "@/generated/common/common_pb";

// Type alias for UserRole enum
type UserRoleType = typeof UserRole[keyof typeof UserRole];
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProtectedRoute } from "@/components/features/auth";
import { cn } from "@/lib/utils";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  className?: string;
}

export function AuthenticatedLayout({
  children,
  showSidebar = false,
  sidebarContent,
  className,
}: AuthenticatedLayoutProps) {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className={cn("min-h-screen bg-background", className)}>
        <AuthenticatedHeader />
        
        <div className="flex">
          {/* Sidebar */}
          {showSidebar && (
            <>
              {/* Desktop Sidebar */}
              <aside className="hidden md:flex w-64 border-r bg-card">
                <div className="flex-1 p-4">
                  {sidebarContent}
                </div>
              </aside>
              
              {/* Mobile Sidebar */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden fixed top-4 left-4 z-50"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4">
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            </>
          )}
          
          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/**
 * Authenticated Header Component
 */
function AuthenticatedHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getRoleLabel = (role: UserRoleType): string => {
    switch (role) {
      case UserRole.USER_ROLE_ADMIN:
        return "Quản trị viên";
      case UserRole.USER_ROLE_TEACHER:
        return "Giáo viên";
      case UserRole.USER_ROLE_TUTOR:
        return "Gia sư";
      case UserRole.USER_ROLE_STUDENT:
        return "Học sinh";
      default:
        return "Người dùng";
    }
  };

  const getRoleBadgeVariant = (role: UserRoleType) => {
    switch (role) {
      case UserRole.USER_ROLE_ADMIN:
        return "destructive";
      case UserRole.USER_ROLE_TEACHER:
        return "default";
      case UserRole.USER_ROLE_TUTOR:
        return "secondary";
      case UserRole.USER_ROLE_STUDENT:
        return "outline";
      default:
        return "outline";
    }
  };

  if (!user) return null;

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">NyNus</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                        {getRoleLabel(user.role)}
                      </Badge>
                      {user.level && (
                        <Badge variant="outline" className="text-xs">
                          Cấp {user.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Sidebar Navigation Component
 */
interface SidebarNavProps {
  items: {
    title: string;
    href: string;
    icon?: React.ReactNode;
    badge?: string;
    active?: boolean;
  }[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const router = useRouter();

  return (
    <nav className="space-y-2">
      {items.map((item, index) => (
        <Button
          key={index}
          variant={item.active ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => router.push(item.href)}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.title}
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </Button>
      ))}
    </nav>
  );
}

/**
 * Quick Stats Component for Dashboard
 */
interface QuickStatsProps {
  stats: {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
  }[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-2xl font-bold">{stat.value}</p>
              {stat.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              )}
            </div>
            {stat.icon && (
              <div className="text-muted-foreground">
                {stat.icon}
              </div>
            )}
          </div>
          
          {stat.trend && stat.trendValue && (
            <div className="mt-2 flex items-center text-xs">
              <span
                className={cn(
                  "font-medium",
                  stat.trend === "up" && "text-green-600",
                  stat.trend === "down" && "text-red-600",
                  stat.trend === "neutral" && "text-muted-foreground"
                )}
              >
                {stat.trendValue}
              </span>
              <span className="text-muted-foreground ml-1">
                so với tháng trước
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

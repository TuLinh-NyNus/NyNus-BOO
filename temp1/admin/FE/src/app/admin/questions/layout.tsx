/**
 * Questions Management Layout
 * Layout cho question management pages trong admin panel
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Plus, List, Map, HelpCircle, FileQuestion, Settings } from "lucide-react";
import { toSecretPath } from "@/lib/admin-paths";

/**
 * Props for Questions Layout
 */
interface QuestionsLayoutProps {
  children: React.ReactNode;
}

/**
 * Questions Management Layout Component
 * Provides consistent layout cho tất cả question management pages
 */
export default function QuestionsLayout({ children }: QuestionsLayoutProps) {
  const pathname = usePathname();

  // Determine current page for breadcrumb và active states
  const getCurrentPage = () => {
    if (pathname.includes("/create")) return "create";
    if (pathname.includes("/edit")) return "edit";
    if (pathname.includes("/mapcode")) return "mapcode";
    return "list";
  };

  const currentPage = getCurrentPage();

  // Breadcrumb configuration
  const getBreadcrumbItems = () => {
    const items = [
      { label: "Dashboard", href: "/admin" },
      { label: "Câu hỏi", href: "/admin/questions" },
    ];

    switch (currentPage) {
      case "create":
        items.push({ label: "Tạo mới", href: "/admin/questions/create" });
        break;
      case "edit":
        items.push({ label: "Chỉnh sửa", href: pathname });
        break;
      case "mapcode":
        items.push({ label: "MapCode", href: "/admin/mapcode" });
        break;
      default:
        items.push({ label: "Danh sách", href: "/admin/questions" });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  // Quick action buttons configuration
  const quickActions = [
    {
      label: "Danh sách câu hỏi",
      href: "/admin/questions",
      icon: List,
      active: currentPage === "list",
      description: "Xem và quản lý tất cả câu hỏi",
    },
    {
      label: "Tạo câu hỏi mới",
      href: "/admin/questions/create",
      icon: Plus,
      active: currentPage === "create",
      description: "Tạo câu hỏi mới từ LaTeX",
    },
    {
      label: "Quản lý MapCode",
      href: "/admin/mapcode",
      icon: Map,
      active: currentPage === "mapcode",
      description: "Quản lý phân loại câu hỏi",
    },
  ];

  return (
    <div className="questions-layout space-y-6">
      {/* Header Section với Breadcrumb */}
      <div className="questions-header">
        {/* Simple Breadcrumb Navigation */}
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.href}>
                <li>
                  {index === breadcrumbItems.length - 1 ? (
                    <span className="font-medium text-foreground">{item.label}</span>
                  ) : (
                    <Link
                      href={toSecretPath(item.href)}
                      className="hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
                {index < breadcrumbItems.length - 1 && <li className="text-muted-foreground">/</li>}
              </React.Fragment>
            ))}
          </ol>
        </nav>

        {/* Page Title và Description */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileQuestion className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Quản lý Câu hỏi</h1>
            </div>
            <p className="text-muted-foreground">
              {currentPage === "list" && "Xem và quản lý tất cả câu hỏi trong hệ thống"}
              {currentPage === "create" && "Tạo câu hỏi mới từ nội dung LaTeX"}
              {currentPage === "edit" && "Chỉnh sửa thông tin câu hỏi"}
              {currentPage === "mapcode" && "Quản lý hệ thống phân loại MapCode"}
            </p>
          </div>

          {/* Quick Actions - chỉ hiển thị trên list page */}
          {currentPage === "list" && (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={toSecretPath("/admin/mapcode")}>
                  <Map className="h-4 w-4 mr-2" />
                  MapCode
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={toSecretPath("/admin/questions/create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo mới
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Navigation Cards - chỉ hiển thị khi cần */}
      {currentPage === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {quickActions.map((action) => (
            <Card
              key={action.href}
              className={`cursor-pointer transition-all hover:shadow-md ${
                action.active ? "ring-2 ring-primary" : ""
              }`}
            >
              <Link href={toSecretPath(action.href)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="questions-content">{children}</div>

      {/* Help Section - floating help button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="outline"
          size="sm"
          className="shadow-lg bg-background border-border hover:bg-accent"
          onClick={() => {
            // TODO: Implement help modal or documentation link
            console.log("Help clicked for questions management");
          }}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Trợ giúp
        </Button>
      </div>
    </div>
  );
}

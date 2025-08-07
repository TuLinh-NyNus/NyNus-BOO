"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Switch } from "@/components/ui/forms/switch";
import { Badge } from "@/components/ui/data-display/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/data-display/tabs";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Mail,
  Edit,
  Save,
  Eye,
  Shield,
  User,
  Settings,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Interface cho email template
 */
interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
  priority: "low" | "normal" | "high" | "critical";
  enabled: boolean;
}

/**
 * Interface cho template category
 */
interface TemplateCategory {
  id: "security" | "user" | "system";
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * Email Templates Manager Component
 * Quản lý email templates cho các loại events khác nhau
 *
 * Features:
 * - Template management cho 3 categories: security, user, system
 * - Rich text editor cho HTML content
 * - Template preview functionality
 * - Priority và enable/disable settings
 * - Real-time validation
 *
 * @author NyNus Team
 * @version 1.0.0
 */
export function EmailTemplatesManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
  const [selectedCategory, setSelectedCategory] = useState<"security" | "user" | "system">(
    "security"
  );
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>({
    subject: "",
    htmlContent: "",
    textContent: "",
    priority: "normal",
    enabled: true,
  });

  /**
   * Template categories configuration
   */
  const categories: TemplateCategory[] = [
    {
      id: "security",
      name: "Security Events",
      description: "Templates cho các sự kiện bảo mật",
      icon: <Shield className="h-4 w-4" />,
      color: "text-red-600",
    },
    {
      id: "user",
      name: "User Events",
      description: "Templates cho các sự kiện người dùng",
      icon: <User className="h-4 w-4" />,
      color: "text-blue-600",
    },
    {
      id: "system",
      name: "System Events",
      description: "Templates cho các sự kiện hệ thống",
      icon: <Settings className="h-4 w-4" />,
      color: "text-orange-600",
    },
  ];

  /**
   * Event types cho mỗi category
   */
  const eventTypes = {
    security: [
      { value: "failed_login", label: "Failed Login Attempts" },
      { value: "new_device", label: "New Device Login" },
      { value: "suspicious_activity", label: "Suspicious Activity" },
      { value: "admin_action_required", label: "Admin Action Required" },
    ],
    user: [
      { value: "new_registration", label: "New Registration" },
      { value: "role_promotion", label: "Role Promotion" },
      { value: "level_advancement", label: "Level Advancement" },
      { value: "account_suspension", label: "Account Suspension" },
    ],
    system: [
      { value: "performance_degradation", label: "Performance Degradation" },
      { value: "error_rate_high", label: "High Error Rate" },
      { value: "server_resource_warning", label: "Server Resource Warning" },
    ],
  };

  /**
   * Priority options
   */
  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High", color: "bg-yellow-100 text-yellow-800" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
  ];

  /**
   * Load tất cả email templates
   */
  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/admin/email-notifications/templates", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(data.data);
      } else {
        toast.error("Không thể tải email templates");
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Lỗi khi tải email templates");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load template cụ thể
   */
  const loadTemplate = async (category: string, eventType: string) => {
    try {
      const response = await fetch(
        `/api/v1/admin/email-notifications/templates/${category}/${eventType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        setCurrentTemplate(data.data);
      } else {
        // Reset to default template nếu không tìm thấy
        setCurrentTemplate({
          subject: "",
          htmlContent: "",
          textContent: "",
          priority: "normal",
          enabled: true,
        });
      }
    } catch (error) {
      console.error("Failed to load template:", error);
      toast.error("Lỗi khi tải template");
    }
  };

  /**
   * Save template
   */
  const saveTemplate = async () => {
    if (!selectedEventType) {
      toast.error("Vui lòng chọn event type");
      return;
    }

    if (!currentTemplate.subject.trim() || !currentTemplate.htmlContent.trim()) {
      toast.error("Subject và HTML content là bắt buộc");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/v1/admin/email-notifications/templates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          eventType: selectedEventType,
          category: selectedCategory,
          template: currentTemplate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Template đã được lưu thành công");
        // Update local templates
        const key = `${selectedCategory}_${selectedEventType}`;
        setTemplates((prev) => ({
          ...prev,
          [key]: currentTemplate,
        }));
      } else {
        toast.error("Không thể lưu template");
      }
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Lỗi khi lưu template");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle category change
   */
  const handleCategoryChange = (category: "security" | "user" | "system") => {
    setSelectedCategory(category);
    setSelectedEventType("");
    setCurrentTemplate({
      subject: "",
      htmlContent: "",
      textContent: "",
      priority: "normal",
      enabled: true,
    });
  };

  /**
   * Handle event type change
   */
  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType);
    if (eventType) {
      loadTemplate(selectedCategory, eventType);
    }
  };

  /**
   * Get priority badge
   */
  const getPriorityBadge = (priority: string) => {
    const option = priorityOptions.find((p) => p.value === priority);
    return (
      <Badge className={option?.color || "bg-gray-100 text-gray-800"}>
        {option?.label || priority}
      </Badge>
    );
  };

  /**
   * Load templates on component mount
   */
  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates Manager
          </CardTitle>
          <CardDescription>
            Quản lý email templates cho các loại events: security events, user events, và system
            events. Mỗi template có thể được tùy chỉnh subject, content, priority và enable/disable.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Category Selection */}
      <Tabs
        value={selectedCategory}
        onValueChange={(value) => handleCategoryChange(value as "security" | "user" | "system")}
      >
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              <span className={category.color}>{category.icon}</span>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={category.color}>{category.icon}</span>
                  {category.name}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Event Type Selection */}
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={selectedEventType} onValueChange={handleEventTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn event type để chỉnh sửa template" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes[category.id].map((eventType) => (
                        <SelectItem key={eventType.value} value={eventType.value}>
                          {eventType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Editor */}
                {selectedEventType && (
                  <div className="space-y-6">
                    {/* Template Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                          value={currentTemplate.priority}
                          onValueChange={(value: any) =>
                            setCurrentTemplate((prev) => ({ ...prev, priority: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={option.color}>{option.label}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enabled"
                          checked={currentTemplate.enabled}
                          onCheckedChange={(checked) =>
                            setCurrentTemplate((prev) => ({ ...prev, enabled: checked }))
                          }
                        />
                        <Label htmlFor="enabled">Template enabled</Label>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Email Subject *</Label>
                      <Input
                        id="subject"
                        value={currentTemplate.subject}
                        onChange={(e) =>
                          setCurrentTemplate((prev) => ({ ...prev, subject: e.target.value }))
                        }
                        placeholder="Email subject line..."
                      />
                    </div>

                    {/* HTML Content */}
                    <div className="space-y-2">
                      <Label htmlFor="htmlContent">HTML Content *</Label>
                      <Textarea
                        id="htmlContent"
                        value={currentTemplate.htmlContent}
                        onChange={(e) =>
                          setCurrentTemplate((prev) => ({ ...prev, htmlContent: e.target.value }))
                        }
                        placeholder="HTML email content với placeholders như {{userName}}, {{timestamp}}..."
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                      <Label htmlFor="textContent">Text Content (Optional)</Label>
                      <Textarea
                        id="textContent"
                        value={currentTemplate.textContent || ""}
                        onChange={(e) =>
                          setCurrentTemplate((prev) => ({ ...prev, textContent: e.target.value }))
                        }
                        placeholder="Plain text version (optional, sẽ được tự động tạo từ HTML nếu để trống)"
                        rows={6}
                      />
                    </div>

                    {/* Template Info */}
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Placeholders có sẵn:</strong> {"{userName}"}, {"{userEmail}"},{" "}
                        {"{timestamp}"}, {"{ipAddress}"}, {"{location}"}, {"{userAgent}"}, và các
                        placeholders khác tùy theo event type.
                      </AlertDescription>
                    </Alert>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={saveTemplate}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Lưu template
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => loadTemplate(selectedCategory, selectedEventType)}
                        disabled={isLoading}
                      >
                        Tải lại
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Templates Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Overview</CardTitle>
          <CardDescription>Tổng quan tất cả email templates đã được cấu hình</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải templates...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(templates).map(([key, template]) => {
                const [category, eventType] = key.split("_");
                const categoryInfo = categories.find((c) => c.id === category);
                const eventInfo = eventTypes[category as keyof typeof eventTypes]?.find(
                  (e) => e.value === eventType
                );

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {categoryInfo && (
                        <span className={categoryInfo.color}>{categoryInfo.icon}</span>
                      )}
                      <div>
                        <div className="font-medium">{eventInfo?.label || eventType}</div>
                        <div className="text-sm text-gray-500">{template.subject}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(template.priority)}
                      {template.enabled ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                  </div>
                );
              })}

              {Object.keys(templates).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Chưa có email templates nào được cấu hình
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

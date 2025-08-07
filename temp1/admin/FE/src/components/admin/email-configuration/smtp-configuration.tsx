"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Switch } from "@/components/ui/forms/switch";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Loader2, Mail, TestTube, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Schema validation cho SMTP configuration
 */
const smtpConfigSchema = z.object({
  host: z.string().min(1, "SMTP host là bắt buộc"),
  port: z.number().min(1).max(65535, "Port phải từ 1-65535"),
  secure: z.boolean(),
  auth: z.object({
    user: z.string().email("Email không hợp lệ"),
    pass: z.string().min(1, "Password là bắt buộc"),
  }),
  from: z.object({
    name: z.string().min(1, "Tên người gửi là bắt buộc"),
    address: z.string().email("Email người gửi không hợp lệ"),
  }),
});

type SMTPConfigFormData = z.infer<typeof smtpConfigSchema>;

/**
 * Interface cho SMTP configuration response
 */
interface SMTPConfigResponse {
  success: boolean;
  message: string;
  data?: SMTPConfigFormData;
}

/**
 * SMTP Configuration Component
 * Quản lý cấu hình SMTP server cho email notifications
 *
 * Features:
 * - SMTP server configuration form
 * - Connection testing
 * - Validation và error handling
 * - Real-time status updates
 *
 * @author NyNus Team
 * @version 1.0.0
 */
export function SMTPConfiguration() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "success" | "error">(
    "unknown"
  );
  const [statusMessage, setStatusMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SMTPConfigFormData>({
    resolver: zodResolver(smtpConfigSchema),
    defaultValues: {
      host: "",
      port: 587,
      secure: false,
      auth: {
        user: "",
        pass: "",
      },
      from: {
        name: "NyNus",
        address: "",
      },
    },
  });

  const watchedSecure = watch("secure");

  /**
   * Load SMTP configuration từ server
   */
  const loadSMTPConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/admin/email-notifications/smtp/config", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data: SMTPConfigResponse = await response.json();

      if (data.success && data.data) {
        // Set form values
        setValue("host", data.data.host);
        setValue("port", data.data.port);
        setValue("secure", data.data.secure);
        setValue("auth.user", data.data.auth.user);
        setValue("from.name", data.data.from.name);
        setValue("from.address", data.data.from.address);

        setConnectionStatus("success");
        setStatusMessage("SMTP configuration loaded successfully");
      } else {
        setConnectionStatus("unknown");
        setStatusMessage("No SMTP configuration found");
      }
    } catch (error) {
      console.error("Failed to load SMTP config:", error);
      setConnectionStatus("error");
      setStatusMessage("Failed to load SMTP configuration");
      toast.error("Không thể tải cấu hình SMTP");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save SMTP configuration
   */
  const onSubmit = async (data: SMTPConfigFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/admin/email-notifications/smtp/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(data),
      });

      const result: SMTPConfigResponse = await response.json();

      if (result.success) {
        setConnectionStatus("success");
        setStatusMessage(result.message);
        toast.success("Cấu hình SMTP đã được lưu thành công");
      } else {
        setConnectionStatus("error");
        setStatusMessage(result.message);
        toast.error("Không thể lưu cấu hình SMTP");
      }
    } catch (error) {
      console.error("Failed to save SMTP config:", error);
      setConnectionStatus("error");
      setStatusMessage("Failed to save SMTP configuration");
      toast.error("Lỗi khi lưu cấu hình SMTP");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Test SMTP connection
   */
  const testConnection = async () => {
    try {
      setIsTesting(true);
      const response = await fetch("/api/v1/admin/email-notifications/smtp/test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setConnectionStatus("success");
        setStatusMessage("SMTP connection successful");
        toast.success("Kết nối SMTP thành công");
      } else {
        setConnectionStatus("error");
        setStatusMessage(result.message);
        toast.error("Kết nối SMTP thất bại");
      }
    } catch (error) {
      console.error("SMTP connection test failed:", error);
      setConnectionStatus("error");
      setStatusMessage("Connection test failed");
      toast.error("Lỗi khi test kết nối SMTP");
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Auto-adjust port based on secure setting
   */
  useEffect(() => {
    if (watchedSecure) {
      setValue("port", 465); // SSL port
    } else {
      setValue("port", 587); // TLS port
    }
  }, [watchedSecure, setValue]);

  /**
   * Load configuration on component mount
   */
  useEffect(() => {
    loadSMTPConfig();
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Cấu hình SMTP Server
        </CardTitle>
        <CardDescription>
          Cấu hình SMTP server để gửi email notifications. Hệ thống sẽ sử dụng cấu hình này để gửi
          các thông báo bảo mật, user events và system alerts.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Connection Status */}
        {statusMessage && (
          <Alert
            className={
              connectionStatus === "success"
                ? "border-green-200 bg-green-50"
                : connectionStatus === "error"
                  ? "border-red-200 bg-red-50"
                  : ""
            }
          >
            <div className="flex items-center gap-2">
              {connectionStatus === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
              {connectionStatus === "error" && <XCircle className="h-4 w-4 text-red-600" />}
              <AlertDescription
                className={
                  connectionStatus === "success"
                    ? "text-green-800"
                    : connectionStatus === "error"
                      ? "text-red-800"
                      : ""
                }
              >
                {statusMessage}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* SMTP Server Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">SMTP Host *</Label>
              <Input
                id="host"
                placeholder="smtp.gmail.com"
                {...register("host")}
                className={errors.host ? "border-red-500" : ""}
              />
              {errors.host && <p className="text-sm text-red-600">{errors.host.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port *</Label>
              <Input
                id="port"
                type="number"
                placeholder="587"
                {...register("port", { valueAsNumber: true })}
                className={errors.port ? "border-red-500" : ""}
              />
              {errors.port && <p className="text-sm text-red-600">{errors.port.message}</p>}
            </div>
          </div>

          {/* Security Settings */}
          <div className="flex items-center space-x-2">
            <Switch
              id="secure"
              {...register("secure")}
              checked={watchedSecure}
              onCheckedChange={(checked) => setValue("secure", checked)}
            />
            <Label htmlFor="secure">Sử dụng SSL/TLS (Port 465 cho SSL, 587 cho TLS)</Label>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin xác thực</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auth.user">Email/Username *</Label>
                <Input
                  id="auth.user"
                  type="email"
                  placeholder="your-email@gmail.com"
                  {...register("auth.user")}
                  className={errors.auth?.user ? "border-red-500" : ""}
                />
                {errors.auth?.user && (
                  <p className="text-sm text-red-600">{errors.auth.user.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth.pass">Password *</Label>
                <Input
                  id="auth.pass"
                  type="password"
                  placeholder="App-specific password"
                  {...register("auth.pass")}
                  className={errors.auth?.pass ? "border-red-500" : ""}
                />
                {errors.auth?.pass && (
                  <p className="text-sm text-red-600">{errors.auth.pass.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sender Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Thông tin người gửi</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from.name">Tên người gửi *</Label>
                <Input
                  id="from.name"
                  placeholder="NyNus Learning Platform"
                  {...register("from.name")}
                  className={errors.from?.name ? "border-red-500" : ""}
                />
                {errors.from?.name && (
                  <p className="text-sm text-red-600">{errors.from.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="from.address">Email người gửi *</Label>
                <Input
                  id="from.address"
                  type="email"
                  placeholder="noreply@nynus.com"
                  {...register("from.address")}
                  className={errors.from?.address ? "border-red-500" : ""}
                />
                {errors.from?.address && (
                  <p className="text-sm text-red-600">{errors.from.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !isDirty}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu cấu hình
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={isTesting}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Test kết nối
            </Button>

            <Button type="button" variant="ghost" onClick={loadSMTPConfig} disabled={isLoading}>
              Tải lại
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

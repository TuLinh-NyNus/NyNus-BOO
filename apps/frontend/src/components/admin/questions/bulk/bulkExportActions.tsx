/**
 * Bulk Export Actions Component
 * Thao tác xuất dữ liệu hàng loạt
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Printer,
  ChevronDown,
} from "lucide-react";

/**
 * Props for BulkExportActions component
 */
interface BulkExportActionsProps {
  selectedCount: number;
  onExport: (format: string) => void;
  isExporting: boolean;
}

/**
 * Bulk Export Actions Component
 * Specialized component cho export operations
 */
export function BulkExportActions({
  selectedCount,
  onExport,
  isExporting,
}: BulkExportActionsProps) {
  /**
   * Export formats configuration
   */
  const exportFormats = [
    {
      key: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Xuất file PDF để in ấn',
    },
    {
      key: 'excel',
      label: 'Excel',
      icon: FileSpreadsheet,
      description: 'Xuất file Excel để chỉnh sửa',
    },
    {
      key: 'json',
      label: 'JSON',
      icon: FileJson,
      description: 'Xuất dữ liệu JSON',
    },
    {
      key: 'print',
      label: 'In trực tiếp',
      icon: Printer,
      description: 'In ngay lập tức',
    },
  ];

  if (selectedCount === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          Xuất dữ liệu
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium">
          Xuất {selectedCount} câu hỏi
        </div>
        <DropdownMenuSeparator />
        
        {exportFormats.map((format) => {
          const Icon = format.icon;
          return (
            <DropdownMenuItem
              key={format.key}
              onClick={() => onExport(format.key)}
              disabled={isExporting}
            >
              <Icon className="h-4 w-4 mr-2" />
              <div className="flex flex-col">
                <span className="font-medium">{format.label}</span>
                <span className="text-xs text-muted-foreground">
                  {format.description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

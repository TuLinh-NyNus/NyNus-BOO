/**
 * Filter Presets Component
 * Component quản lý filter presets (save/load/delete)
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Badge } from "@/components/ui/display/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/form/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/overlay/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { 
  Bookmark,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Star
} from "lucide-react";

// Import store
import { useQuestionFiltersStore, FilterPreset } from "@/lib/stores/question-filters";
import { useToast } from "@/components/ui/feedback/use-toast";
import { cn } from "@/lib/utils";

// ===== INTERFACES =====

interface FilterPresetsProps {
  className?: string;
}

// ===== COMPONENT =====

/**
 * Filter Presets Component
 * Quản lý saved filter combinations
 */
export function FilterPresets({
  className = ""
}: FilterPresetsProps) {
  const { toast } = useToast();
  
  // Store state và actions
  const {
    presets,
    activePresetId,
    loadPreset,
    savePreset,
    deletePreset,
    updatePreset
  } = useQuestionFiltersStore();

  // Local state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<FilterPreset | null>(null);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDescription, setNewPresetDescription] = useState("");

  /**
   * Handle preset selection
   */
  const handlePresetSelect = (presetId: string) => {
    loadPreset(presetId);
    toast({
      title: "Preset đã được áp dụng",
      description: `Đã tải preset "${presets.find(p => p.id === presetId)?.name}"`,
      variant: "success"
    });
  };

  /**
   * Handle save new preset
   */
  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên preset",
        variant: "destructive"
      });
      return;
    }

    savePreset(newPresetName.trim(), newPresetDescription.trim());
    setNewPresetName("");
    setNewPresetDescription("");
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Preset đã được lưu",
      description: `Đã lưu preset "${newPresetName}"`,
      variant: "success"
    });
  };

  /**
   * Handle edit preset
   */
  const handleEditPreset = (preset: FilterPreset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setNewPresetDescription(preset.description);
    setIsEditDialogOpen(true);
  };

  /**
   * Handle update preset
   */
  const handleUpdatePreset = () => {
    if (!editingPreset || !newPresetName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên preset",
        variant: "destructive"
      });
      return;
    }

    updatePreset(editingPreset.id, {
      name: newPresetName.trim(),
      description: newPresetDescription.trim()
    });
    
    setEditingPreset(null);
    setNewPresetName("");
    setNewPresetDescription("");
    setIsEditDialogOpen(false);
    
    toast({
      title: "Preset đã được cập nhật",
      description: `Đã cập nhật preset "${newPresetName}"`,
      variant: "success"
    });
  };

  /**
   * Handle delete preset
   */
  const handleDeletePreset = (preset: FilterPreset) => {
    if (preset.isDefault) {
      toast({
        title: "Không thể xóa",
        description: "Không thể xóa preset mặc định",
        variant: "destructive"
      });
      return;
    }

    deletePreset(preset.id);
    toast({
      title: "Preset đã được xóa",
      description: `Đã xóa preset "${preset.name}"`,
      variant: "success"
    });
  };

  /**
   * Get current preset
   */
  const currentPreset = presets.find(p => p.id === activePresetId);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preset Selector */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select value={activePresetId || ''} onValueChange={handlePresetSelect}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                <SelectValue placeholder="Chọn preset..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex items-center gap-2">
                    {preset.isDefault && <Star className="h-3 w-3 text-yellow-500" />}
                    <span>{preset.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save New Preset Button */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Lưu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lưu preset mới</DialogTitle>
              <DialogDescription>
                Lưu bộ lọc hiện tại thành preset để sử dụng lại sau
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="preset-name">Tên preset</Label>
                <Input
                  id="preset-name"
                  placeholder="Ví dụ: Toán lớp 10 trắc nghiệm"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="preset-description">Mô tả (tùy chọn)</Label>
                <Input
                  id="preset-description"
                  placeholder="Mô tả ngắn về preset này..."
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSavePreset}>
                Lưu preset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preset Actions */}
        {currentPreset && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditPreset(currentPreset)}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeletePreset(currentPreset)}
                disabled={currentPreset.isDefault}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa preset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Current Preset Info */}
      {currentPreset && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            {currentPreset.isDefault && <Star className="h-3 w-3 text-yellow-500" />}
            <span className="font-medium text-sm">{currentPreset.name}</span>
            <Badge variant="secondary" className="text-xs">
              Đang sử dụng
            </Badge>
          </div>
          {currentPreset.description && (
            <p className="text-xs text-muted-foreground">
              {currentPreset.description}
            </p>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Cập nhật: {new Date(currentPreset.updatedAt).toLocaleDateString('vi-VN')}
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.filter(p => p.isDefault).map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset.id)}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors",
              activePresetId === preset.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Edit Preset Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa preset</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin preset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-preset-name">Tên preset</Label>
              <Input
                id="edit-preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-preset-description">Mô tả</Label>
              <Input
                id="edit-preset-description"
                value={newPresetDescription}
                onChange={(e) => setNewPresetDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdatePreset}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FilterPresets;

/**
 * Sort Preset Selector Component
 * Quick preset selector cho common sorting patterns
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import {
  ArrowUpDown,
  Clock,
  TrendingUp,
  Star,
  BarChart3,
  BookOpen,
  Zap
} from "lucide-react";

// Import types và utilities
import {
  SortConfig,
  SORT_PRESETS,
  getSortSummary
} from "@/lib/utils/question-sorting";

// ===== TYPES =====

export interface SortPresetSelectorProps {
  currentConfig: SortConfig;
  onPresetSelect: (presetName: keyof typeof SORT_PRESETS) => void;
  disabled?: boolean;
  className?: string;
}

// ===== CONSTANTS =====

const PRESET_CONFIGS = {
  DEFAULT: {
    label: 'Mặc định',
    description: 'Sắp xếp theo mã câu hỏi (Khối → Môn → Chương → Cấp độ)',
    icon: ArrowUpDown,
    color: 'default' as const,
    recommended: false
  },
  NEWEST_FIRST: {
    label: 'Mới nhất',
    description: 'Hiển thị câu hỏi được tạo gần đây nhất trước',
    icon: Clock,
    color: 'blue' as const,
    recommended: true
  },
  MOST_USED: {
    label: 'Phổ biến',
    description: 'Sắp xếp theo lượt sử dụng từ cao đến thấp',
    icon: TrendingUp,
    color: 'green' as const,
    recommended: true
  },
  HIGHEST_RATED: {
    label: 'Chất lượng cao',
    description: 'Hiển thị câu hỏi có điểm đánh giá cao nhất trước',
    icon: Star,
    color: 'yellow' as const,
    recommended: false
  },
  BY_DIFFICULTY: {
    label: 'Theo độ khó',
    description: 'Sắp xếp từ dễ đến khó',
    icon: BarChart3,
    color: 'orange' as const,
    recommended: false
  },
  BY_SUBJECT: {
    label: 'Theo môn học',
    description: 'Nhóm theo môn học, sau đó theo khối và mã câu hỏi',
    icon: BookOpen,
    color: 'purple' as const,
    recommended: false
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Check if preset is currently active
 */
function isPresetActive(currentConfig: SortConfig, presetName: keyof typeof SORT_PRESETS): boolean {
  const presetColumns = SORT_PRESETS[presetName];
  const currentColumns = currentConfig.columns;
  
  if (presetColumns.length !== currentColumns.length) {
    return false;
  }
  
  // Sort both arrays by priority để compare
  const sortedPreset = [...presetColumns].sort((a, b) => a.priority - b.priority);
  const sortedCurrent = [...currentColumns].sort((a, b) => a.priority - b.priority);
  
  return sortedPreset.every((presetCol, index) => {
    const currentCol = sortedCurrent[index];
    return currentCol && 
           currentCol.key === presetCol.key && 
           currentCol.direction === presetCol.direction;
  });
}

/**
 * Get badge color based on preset color
 */
function getBadgeVariant(color: string) {
  switch (color) {
    case 'blue': return 'default';
    case 'green': return 'default';
    case 'yellow': return 'secondary';
    case 'orange': return 'secondary';
    case 'purple': return 'outline';
    default: return 'outline';
  }
}

// ===== MAIN COMPONENT =====

export function SortPresetSelector({
  currentConfig,
  onPresetSelect,
  disabled = false,
  className = ""
}: SortPresetSelectorProps) {

  // ===== RENDER HELPERS =====

  /**
   * Render preset button
   */
  const renderPresetButton = (presetName: keyof typeof SORT_PRESETS) => {
    const config = PRESET_CONFIGS[presetName];
    const isActive = isPresetActive(currentConfig, presetName);
    const Icon = config.icon;
    
    return (
      <Button
        key={presetName}
        variant={isActive ? "default" : "outline"}
        className={`h-auto p-4 flex flex-col items-start text-left space-y-2 ${
          isActive ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
        onClick={() => onPresetSelect(presetName)}
        disabled={disabled}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span className="font-medium">{config.label}</span>
          </div>
          <div className="flex items-center gap-1">
            {config.recommended && (
              <Badge variant={getBadgeVariant(config.color)} className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Đề xuất
              </Badge>
            )}
            {isActive && (
              <Badge variant="default" className="text-xs">
                Đang dùng
              </Badge>
            )}
            <Badge variant={getBadgeVariant(config.color)} className="text-xs opacity-75">
              {config.color}
            </Badge>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-left">
          {config.description}
        </p>
        
        {/* Preview sort summary */}
        <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded w-full">
          {getSortSummary({ columns: SORT_PRESETS[presetName] })}
        </div>
      </Button>
    );
  };

  /**
   * Render recommended presets
   */
  const renderRecommendedPresets = () => {
    const recommendedPresets = Object.entries(PRESET_CONFIGS)
      .filter(([presetKey, config]) => {
        // Log recommended presets for debugging
        if (process.env.NODE_ENV === 'development' && config.recommended) {
          console.log(`Recommended preset: ${presetKey} (${config.label})`);
        }
        return config.recommended;
      })
      .map(([key]) => key as keyof typeof SORT_PRESETS);

    if (recommendedPresets.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">Đề xuất</h4>
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Phổ biến
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendedPresets.map(renderPresetButton)}
        </div>
      </div>
    );
  };

  /**
   * Render all presets
   */
  const renderAllPresets = () => {
    const allPresets = Object.keys(PRESET_CONFIGS) as (keyof typeof SORT_PRESETS)[];
    const otherPresets = allPresets.filter(key => !PRESET_CONFIGS[key].recommended);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Tất cả kiểu sắp xếp</h4>
          <Badge variant="outline" className="text-xs">
            {otherPresets.length} khác
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allPresets.map(renderPresetButton)}
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <Card className={`sort-preset-selector ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Kiểu sắp xếp nhanh
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Chọn kiểu sắp xếp phù hợp với nhu cầu của bạn
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recommended presets */}
        {renderRecommendedPresets()}
        
        {/* All presets */}
        {renderAllPresets()}
        
        {/* Current config info */}
        {currentConfig.columns.length > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm">
              <span className="font-medium">Sắp xếp hiện tại: </span>
              <span className="text-muted-foreground">
                {getSortSummary(currentConfig)}
              </span>
            </div>
            
            {currentConfig.columns.length > 1 && (
              <div className="text-xs text-muted-foreground mt-1">
                Đang sử dụng {currentConfig.columns.length} tiêu chí sắp xếp
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

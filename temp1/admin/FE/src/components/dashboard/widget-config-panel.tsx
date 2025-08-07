"use client";

import React, { useState } from "react";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import {
  Settings,
  Plus,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Download,
  Upload,
  Trash2,
} from "lucide-react";
import {
  WidgetConfig,
  WidgetType,
  DashboardLayout,
  DEFAULT_WIDGET_CONFIGS,
} from "../../types/dashboard-customization";
import { useDashboardCustomization } from "../../stores/dashboard-customization.store";

/**
 * Widget Configuration Panel Component
 * Component panel cấu hình widgets
 */

interface WidgetConfigPanelProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function WidgetConfigPanel({ isOpen, onOpenChange, trigger }: WidgetConfigPanelProps) {
  const {
    currentLayout,
    preferences,
    addWidget,
    removeWidget,
    updateWidget,
    toggleWidgetVisibility,
    updatePreferences,
    resetToDefault,
    saveLayout,
  } = useDashboardCustomization();

  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [layoutName, setLayoutName] = useState("");

  // Handle add widget
  const handleAddWidget = (type: WidgetType) => {
    addWidget(type);
  };

  // Handle widget settings change
  const handleWidgetSettingsChange = (widgetId: string, key: string, value: any) => {
    updateWidget(widgetId, {
      settings: {
        ...selectedWidget?.settings,
        [key]: value,
      },
    });

    // Update selected widget for UI
    if (selectedWidget?.id === widgetId) {
      setSelectedWidget({
        ...selectedWidget,
        settings: {
          ...selectedWidget.settings,
          [key]: value,
        },
      });
    }
  };

  // Handle save layout
  const handleSaveLayout = () => {
    if (layoutName.trim()) {
      saveLayout(layoutName.trim());
      setLayoutName("");
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Widget Settings
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="w-[400px] sm:w-[540px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dashboard Configuration</DialogTitle>
          <DialogDescription>Customize your dashboard layout and widget settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Add Widget Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Widgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(DEFAULT_WIDGET_CONFIGS).map(([type, config]) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddWidget(type as WidgetType)}
                    className="justify-start"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    {config.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Widgets */}
          <Card>
            <CardHeader>
              <CardTitle>Current Widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentLayout?.widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`
                      flex items-center justify-between p-2 border rounded-lg cursor-pointer
                      ${selectedWidget?.id === widget.id ? "bg-muted" : "hover:bg-muted/50"}
                    `}
                    onClick={() => setSelectedWidget(widget)}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWidgetVisibility(widget.id);
                        }}
                        className="p-1 hover:bg-background rounded"
                      >
                        {widget.isVisible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </button>
                      <span className="text-sm font-medium">{widget.title}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWidget(widget.id);
                        if (selectedWidget?.id === widget.id) {
                          setSelectedWidget(null);
                        }
                      }}
                      className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widget Settings */}
          {selectedWidget && (
            <Card>
              <CardHeader>
                <CardTitle>Widget Settings: {selectedWidget.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auto Refresh */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh">Auto Refresh</Label>
                  <input
                    id="auto-refresh"
                    type="checkbox"
                    checked={selectedWidget.settings.autoRefresh || false}
                    onChange={(e) =>
                      handleWidgetSettingsChange(selectedWidget.id, "autoRefresh", e.target.checked)
                    }
                    className="rounded border border-input"
                  />
                </div>

                {/* Refresh Interval */}
                {selectedWidget.settings.autoRefresh && (
                  <div className="space-y-2">
                    <Label>Refresh Interval (seconds)</Label>
                    <input
                      type="range"
                      min={10}
                      max={300}
                      step={10}
                      value={selectedWidget.settings.refreshInterval || 30}
                      onChange={(e) =>
                        handleWidgetSettingsChange(
                          selectedWidget.id,
                          "refreshInterval",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      {selectedWidget.settings.refreshInterval || 30} seconds
                    </div>
                  </div>
                )}

                {/* Time Range */}
                {selectedWidget.settings.timeRange && (
                  <div className="space-y-2">
                    <Label>Time Range</Label>
                    <Select
                      value={selectedWidget.settings.timeRange}
                      onValueChange={(value) =>
                        handleWidgetSettingsChange(selectedWidget.id, "timeRange", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="90d">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Display Mode */}
                {selectedWidget.settings.displayMode && (
                  <div className="space-y-2">
                    <Label>Display Mode</Label>
                    <Select
                      value={selectedWidget.settings.displayMode}
                      onValueChange={(value) =>
                        handleWidgetSettingsChange(selectedWidget.id, "displayMode", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Chart Type */}
                {selectedWidget.settings.chartType && (
                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <Select
                      value={selectedWidget.settings.chartType}
                      onValueChange={(value) =>
                        handleWidgetSettingsChange(selectedWidget.id, "chartType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dashboard Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">Auto Save</Label>
                <input
                  id="auto-save"
                  type="checkbox"
                  checked={preferences.autoSave}
                  onChange={(e) => updatePreferences({ autoSave: e.target.checked })}
                  className="rounded border border-input"
                />
              </div>

              {/* Global Auto Refresh */}
              <div className="flex items-center justify-between">
                <Label htmlFor="global-auto-refresh">Global Auto Refresh</Label>
                <input
                  id="global-auto-refresh"
                  type="checkbox"
                  checked={preferences.autoRefresh}
                  onChange={(e) => updatePreferences({ autoRefresh: e.target.checked })}
                  className="rounded border border-input"
                />
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Animations</Label>
                <input
                  id="animations"
                  type="checkbox"
                  checked={preferences.animations}
                  onChange={(e) => updatePreferences({ animations: e.target.checked })}
                  className="rounded border border-input"
                />
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <input
                  id="compact-mode"
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={(e) => updatePreferences({ compactMode: e.target.checked })}
                  className="rounded border border-input"
                />
              </div>
            </CardContent>
          </Card>

          <div className="border-t my-4" />

          {/* Layout Actions */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Layout name..."
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button onClick={handleSaveLayout} disabled={!layoutName.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetToDefault} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

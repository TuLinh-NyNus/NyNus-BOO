/**
 * Range Slider Component
 * Dual-handle range slider cho filtering với min-max values
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/form/slider";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Button } from "@/components/ui/form/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ===== INTERFACES =====

export interface RangeValue {
  min?: number;
  max?: number;
}

interface RangeSliderProps {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showInputs?: boolean;
  formatValue?: (value: number) => string;
}

// ===== COMPONENT =====

/**
 * Range Slider Component
 * Dual-handle slider với input fields cho precise control
 */
export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  placeholder = "Chọn khoảng...",
  className = "",
  disabled = false,
  showInputs = true,
  formatValue = (val) => val.toString()
}: RangeSliderProps) {
  // Local state cho slider values
  const [sliderValues, setSliderValues] = useState<[number, number]>([
    value.min ?? min,
    value.max ?? max
  ]);
  
  // Local state cho input values (strings để handle empty state)
  const [minInput, setMinInput] = useState<string>(value.min?.toString() ?? '');
  const [maxInput, setMaxInput] = useState<string>(value.max?.toString() ?? '');
  
  // Sync với external value changes
  useEffect(() => {
    setSliderValues([value.min ?? min, value.max ?? max]);
    setMinInput(value.min?.toString() ?? '');
    setMaxInput(value.max?.toString() ?? '');
  }, [value.min, value.max, min, max]);
  
  /**
   * Handle slider value change
   */
  const handleSliderChange = (newValues: number[]) => {
    const [newMin, newMax] = newValues;
    setSliderValues([newMin, newMax]);
    
    // Update inputs
    setMinInput(newMin.toString());
    setMaxInput(newMax.toString());
    
    // Emit change
    onChange({
      min: newMin === min ? undefined : newMin,
      max: newMax === max ? undefined : newMax
    });
  };
  
  /**
   * Handle min input change
   */
  const handleMinInputChange = (inputValue: string) => {
    setMinInput(inputValue);
    
    if (inputValue === '') {
      // Empty input - set to undefined
      const newMax = sliderValues[1];
      setSliderValues([min, newMax]);
      onChange({
        min: undefined,
        max: newMax === max ? undefined : newMax
      });
      return;
    }
    
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= sliderValues[1]) {
      const newValues: [number, number] = [numValue, sliderValues[1]];
      setSliderValues(newValues);
      onChange({
        min: numValue === min ? undefined : numValue,
        max: sliderValues[1] === max ? undefined : sliderValues[1]
      });
    }
  };
  
  /**
   * Handle max input change
   */
  const handleMaxInputChange = (inputValue: string) => {
    setMaxInput(inputValue);
    
    if (inputValue === '') {
      // Empty input - set to undefined
      const newMin = sliderValues[0];
      setSliderValues([newMin, max]);
      onChange({
        min: newMin === min ? undefined : newMin,
        max: undefined
      });
      return;
    }
    
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue <= max && numValue >= sliderValues[0]) {
      const newValues: [number, number] = [sliderValues[0], numValue];
      setSliderValues(newValues);
      onChange({
        min: sliderValues[0] === min ? undefined : sliderValues[0],
        max: numValue === max ? undefined : numValue
      });
    }
  };
  
  /**
   * Clear range filter
   */
  const handleClear = () => {
    setSliderValues([min, max]);
    setMinInput('');
    setMaxInput('');
    onChange({ min: undefined, max: undefined });
  };
  
  /**
   * Check if range has custom values
   */
  const hasCustomValues = value.min !== undefined || value.max !== undefined;
  
  /**
   * Get display text for current range
   */
  const getDisplayText = () => {
    if (!hasCustomValues) {
      return placeholder;
    }
    
    const minText = value.min !== undefined ? formatValue(value.min) : formatValue(min);
    const maxText = value.max !== undefined ? formatValue(value.max) : formatValue(max);
    
    return `${minText} - ${maxText}`;
  };
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>
          {hasCustomValues && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      
      {/* Display current range */}
      <div className="text-sm text-muted-foreground">
        {getDisplayText()}
      </div>
      
      {/* Slider */}
      <div className="px-2">
        <Slider
          value={sliderValues}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-full"
        />
      </div>
      
      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-2">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
      
      {/* Input fields */}
      {showInputs && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="min-input" className="text-xs">Min</Label>
            <Input
              id="min-input"
              type="number"
              value={minInput}
              onChange={(e) => handleMinInputChange(e.target.value)}
              min={min}
              max={sliderValues[1]}
              step={step}
              placeholder={min.toString()}
              disabled={disabled}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="max-input" className="text-xs">Max</Label>
            <Input
              id="max-input"
              type="number"
              value={maxInput}
              onChange={(e) => handleMaxInputChange(e.target.value)}
              min={sliderValues[0]}
              max={max}
              step={step}
              placeholder={max.toString()}
              disabled={disabled}
              className="h-8"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ===== PRESET RANGE COMPONENTS =====

/**
 * Usage Count Range Slider
 */
export function UsageCountRangeSlider({
  value,
  onChange,
  className = "",
  disabled = false
}: {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <RangeSlider
      value={value}
      onChange={onChange}
      min={0}
      max={1000}
      step={1}
      label="Số lần sử dụng"
      placeholder="Chọn khoảng số lần sử dụng..."
      className={className}
      disabled={disabled}
      formatValue={(val) => val.toLocaleString()}
    />
  );
}

/**
 * Feedback Score Range Slider
 */
export function FeedbackRangeSlider({
  value,
  onChange,
  className = "",
  disabled = false
}: {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <RangeSlider
      value={value}
      onChange={onChange}
      min={0}
      max={10}
      step={0.1}
      label="Điểm feedback"
      placeholder="Chọn khoảng điểm feedback..."
      className={className}
      disabled={disabled}
      formatValue={(val) => val.toFixed(1)}
    />
  );
}

export default RangeSlider;

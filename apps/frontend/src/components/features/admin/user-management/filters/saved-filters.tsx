/**
 * Saved Filters Component
 * Component quản lý saved filters cho user management
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Badge } from "@/components/ui/display/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Edit, 
  Star, 
  StarOff,
  MoreVertical,
  ChevronDown
} from "lucide-react";

import { type UserFilterOptions } from "@/lib/mockdata/user-management";
import { toast } from "@/hooks/use-toast";

/**
 * Saved filter interface
 */
interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: UserFilterOptions;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  usageCount: number;
}

/**
 * Saved Filters Props
 */
interface SavedFiltersProps {
  currentFilters: UserFilterOptions;
  onApplyFilter: (filters: UserFilterOptions) => void;
  className?: string;
}

/**
 * Saved Filters Component
 */
export function SavedFilters({
  currentFilters,
  onApplyFilter,
  className = "",
}: SavedFiltersProps) {
  // State management
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");

  /**
   * Load saved filters from localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem('nynus-saved-user-filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  /**
   * Save filters to localStorage
   */
  const saveToStorage = (filters: SavedFilter[]) => {
    localStorage.setItem('nynus-saved-user-filters', JSON.stringify(filters));
    setSavedFilters(filters);
  };

  /**
   * Handle save current filters
   */
  const handleSaveCurrentFilters = () => {
    setEditingFilter(null);
    setFilterName("");
    setFilterDescription("");
    setIsDialogOpen(true);
  };

  /**
   * Handle edit filter
   */
  const handleEditFilter = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setFilterName(filter.name);
    setFilterDescription(filter.description || "");
    setIsDialogOpen(true);
  };

  /**
   * Handle save filter
   */
  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast({
        title: "Tên filter không được để trống",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();

    if (editingFilter) {
      // Update existing filter
      const updatedFilters = savedFilters.map(filter =>
        filter.id === editingFilter.id
          ? {
              ...filter,
              name: filterName.trim(),
              description: filterDescription.trim(),
              filters: currentFilters,
              updatedAt: now,
            }
          : filter
      );
      saveToStorage(updatedFilters);
      
      toast({
        title: "Đã cập nhật filter",
        description: `Filter "${filterName}" đã được cập nhật`,
      });
    } else {
      // Create new filter
      const newFilter: SavedFilter = {
        id: `filter-${Date.now()}`,
        name: filterName.trim(),
        description: filterDescription.trim(),
        filters: currentFilters,
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
        usageCount: 0,
      };

      saveToStorage([...savedFilters, newFilter]);
      
      toast({
        title: "Đã lưu filter",
        description: `Filter "${filterName}" đã được lưu`,
      });
    }

    setIsDialogOpen(false);
    setFilterName("");
    setFilterDescription("");
    setEditingFilter(null);
  };

  /**
   * Handle apply filter
   */
  const handleApplyFilter = (filter: SavedFilter) => {
    // Increment usage count
    const updatedFilters = savedFilters.map(f =>
      f.id === filter.id
        ? { ...f, usageCount: f.usageCount + 1 }
        : f
    );
    saveToStorage(updatedFilters);

    onApplyFilter(filter.filters);
    
    toast({
      title: "Đã áp dụng filter",
      description: `Filter "${filter.name}" đã được áp dụng`,
    });
  };

  /**
   * Handle toggle favorite
   */
  const handleToggleFavorite = (filterId: string) => {
    const updatedFilters = savedFilters.map(filter =>
      filter.id === filterId
        ? { ...filter, isFavorite: !filter.isFavorite }
        : filter
    );
    saveToStorage(updatedFilters);
  };

  /**
   * Handle delete filter
   */
  const handleDeleteFilter = (filterId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa filter này?")) {
      const updatedFilters = savedFilters.filter(filter => filter.id !== filterId);
      saveToStorage(updatedFilters);
      
      toast({
        title: "Đã xóa filter",
        description: "Filter đã được xóa khỏi danh sách",
      });
    }
  };

  /**
   * Get filter summary
   */
  const getFilterSummary = (filters: UserFilterOptions): string => {
    const parts = [];
    
    if (filters.roles?.length) {
      parts.push(`${filters.roles.length} roles`);
    }
    if (filters.statuses?.length) {
      parts.push(`${filters.statuses.length} statuses`);
    }
    if (filters.riskLevels?.length) {
      parts.push(`${filters.riskLevels.length} risk levels`);
    }
    if (filters.dateRange?.from || filters.dateRange?.to) {
      parts.push('date range');
    }
    if (filters.activityLevel !== 'ALL') {
      parts.push('activity filter');
    }
    if (filters.emailVerified !== undefined) {
      parts.push('email verification');
    }

    return parts.length > 0 ? parts.join(', ') : 'No filters';
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Sort filters: favorites first, then by usage count, then by date
  const sortedFilters = [...savedFilters].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    if (a.usageCount !== b.usageCount) {
      return b.usageCount - a.usageCount;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Save Current Filters Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSaveCurrentFilters}
      >
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>

      {/* Saved Filters Dropdown */}
      {savedFilters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-1" />
              Saved ({savedFilters.length})
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="max-h-64 overflow-y-auto">
              {sortedFilters.map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  className="flex items-start gap-2 p-3"
                  onClick={() => handleApplyFilter(filter)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{filter.name}</span>
                      {filter.isFavorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
                      {filter.usageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {filter.usageCount}
                        </Badge>
                      )}
                    </div>
                    
                    {filter.description && (
                      <div className="text-xs text-muted-foreground mb-1">
                        {filter.description}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {getFilterSummary(filter.filters)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      Updated: {formatDate(filter.updatedAt)}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditFilter(filter)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleToggleFavorite(filter.id)}
                      >
                        {filter.isFavorite ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Remove from Favorites
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Add to Favorites
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Save/Edit Filter Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFilter ? 'Edit Filter' : 'Save Current Filters'}
            </DialogTitle>
            <DialogDescription>
              {editingFilter 
                ? 'Update the filter name and description'
                : 'Save your current filter settings for future use'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="filter-name">Filter Name *</Label>
              <Input
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter filter name..."
              />
            </div>

            <div>
              <Label htmlFor="filter-description">Description (Optional)</Label>
              <Input
                id="filter-description"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
                placeholder="Enter filter description..."
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>Filter Summary:</strong> {getFilterSummary(currentFilters)}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFilter}>
              {editingFilter ? 'Update' : 'Save'} Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

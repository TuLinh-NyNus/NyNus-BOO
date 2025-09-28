'use client';

/**
 * MapCode Version Selector Component
 * Allows admin to select and switch between MapCode versions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { MapCodeClient, MapCodeVersionData, StorageInfoData } from '@/lib/grpc/mapcode-client';
import { toast } from 'sonner';

interface VersionSelectorProps {
  onVersionChange?: (version: MapCodeVersionData) => void;
  className?: string;
}

export function VersionSelector({ onVersionChange, className }: VersionSelectorProps) {
  const [versions, setVersions] = useState<MapCodeVersionData[]>([]);
  const [activeVersion, setActiveVersion] = useState<MapCodeVersionData | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [storageInfo, setStorageInfo] = useState<StorageInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load versions, active version, and storage info in parallel
      const [versionsResult, activeVersionResult, storageResult] = await Promise.allSettled([
        MapCodeClient.getVersions(1, 50), // Get first 50 versions
        MapCodeClient.getActiveVersion(),
        MapCodeClient.getStorageInfo(),
      ]);

      // Handle versions
      if (versionsResult.status === 'fulfilled') {
        setVersions(versionsResult.value.versions);
      } else {
        console.error('Failed to load versions:', versionsResult.reason);
        toast.error('Không thể tải danh sách versions');
      }

      // Handle active version
      if (activeVersionResult.status === 'fulfilled') {
        setActiveVersion(activeVersionResult.value);
        setSelectedVersionId(activeVersionResult.value.id);
        onVersionChange?.(activeVersionResult.value);
      } else {
        console.error('Failed to load active version:', activeVersionResult.reason);
        toast.error('Không thể tải active version');
      }

      // Handle storage info
      if (storageResult.status === 'fulfilled') {
        setStorageInfo(storageResult.value);
      } else {
        console.error('Failed to load storage info:', storageResult.reason);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [onVersionChange]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVersionSwitch = async () => {
    if (!selectedVersionId || selectedVersionId === activeVersion?.id) {
      return;
    }

    try {
      setSwitching(true);
      
      await MapCodeClient.setActiveVersion(selectedVersionId);
      
      // Reload data to get updated state
      await loadData();
      
      toast.success('Đã chuyển đổi version thành công');
    } catch (error) {
      console.error('Error switching version:', error);
      toast.error('Không thể chuyển đổi version');
      
      // Reset selection to current active version
      setSelectedVersionId(activeVersion?.id || '');
    } finally {
      setSwitching(false);
    }
  };

  const getStorageAlert = () => {
    if (!storageInfo) return null;

    if (storageInfo.isAtLimit) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Đã đạt giới hạn:</strong> {storageInfo.warningMessage}
          </AlertDescription>
        </Alert>
      );
    }

    if (storageInfo.isNearLimit) {
      return (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Sắp đạt giới hạn:</strong> {storageInfo.warningMessage}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Đang sử dụng {storageInfo.totalVersions}/{storageInfo.maxVersions} versions. 
          Còn lại {storageInfo.availableSlots} slots.
        </AlertDescription>
      </Alert>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>MapCode Version Selector</CardTitle>
          <CardDescription>Chọn version MapCode để sử dụng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>MapCode Version Selector</CardTitle>
        <CardDescription>
          Chọn version MapCode để sử dụng system-wide
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Info Alert */}
        {getStorageAlert()}

        {/* Active Version Display */}
        {activeVersion && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Active Version</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {activeVersion.version}
              </Badge>
            </div>
            <p className="text-sm text-green-700">{activeVersion.name}</p>
            <p className="text-xs text-green-600 mt-1">{activeVersion.description}</p>
          </div>
        )}

        {/* Version Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Chọn Version:</label>
          <div className="flex gap-2">
            <Select
              value={selectedVersionId}
              onValueChange={setSelectedVersionId}
              disabled={switching}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Chọn version..." />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    <div className="flex items-center gap-2">
                      <span>{version.version}</span>
                      {version.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                      <span className="text-muted-foreground">- {version.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleVersionSwitch}
              disabled={switching || selectedVersionId === activeVersion?.id || !selectedVersionId}
              className="min-w-[100px]"
            >
              {switching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang chuyển...
                </>
              ) : (
                'Chuyển đổi'
              )}
            </Button>
          </div>
        </div>

        {/* Version Details */}
        {selectedVersionId && selectedVersionId !== activeVersion?.id && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            {(() => {
              const selectedVersion = versions.find(v => v.id === selectedVersionId);
              if (!selectedVersion) return null;
              
              return (
                <div>
                  <p className="font-medium text-blue-800">{selectedVersion.name}</p>
                  <p className="text-sm text-blue-700">{selectedVersion.description}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Tạo bởi: {selectedVersion.createdBy} • {selectedVersion.createdAt.toLocaleDateString('vi-VN')}
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Storage Statistics */}
        {storageInfo && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{storageInfo.totalVersions}</div>
              <div className="text-xs text-muted-foreground">Total Versions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{storageInfo.availableSlots}</div>
              <div className="text-xs text-muted-foreground">Available Slots</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

/**
 * MapCode Version Management Component
 * Complete admin interface for managing MapCode versions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Loader2, 
  CheckCircle, 
  Trash2,
  Calendar,
  User,
  Download,
  // FileText,
  // Settings
} from 'lucide-react';
import { MapCodeClient, MapCodeVersionData } from '@/lib/grpc/mapcode-client';
import { toast } from 'sonner';

interface VersionManagementProps {
  className?: string;
}

export function VersionManagement({ className }: VersionManagementProps) {
  const [versions, setVersions] = useState<MapCodeVersionData[]>([]);
  const [activeVersion, setActiveVersion] = useState<MapCodeVersionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  
  // Create version form state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newVersion, setNewVersion] = useState({
    version: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      
      const [versionsResult, activeVersionResult] = await Promise.allSettled([
        MapCodeClient.getVersions(1, 50),
        MapCodeClient.getActiveVersion(),
      ]);

      if (versionsResult.status === 'fulfilled') {
        setVersions(versionsResult.value.versions);
      } else {
        console.error('Failed to load versions:', versionsResult.reason);
        toast.error('Không thể tải danh sách versions');
      }

      if (activeVersionResult.status === 'fulfilled') {
        setActiveVersion(activeVersionResult.value);
      } else {
        console.error('Failed to load active version:', activeVersionResult.reason);
      }

    } catch (error) {
      console.error('Error loading versions:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersion.version.trim() || !newVersion.name.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setCreating(true);
      
      await MapCodeClient.createVersion(
        newVersion.version.trim(),
        newVersion.name.trim(),
        newVersion.description.trim(),
        'ADMIN' // TODO: Get from current user context
      );

      toast.success('Tạo version mới thành công');
      setCreateDialogOpen(false);
      setNewVersion({ version: '', name: '', description: '' });
      
      // Reload versions
      await loadVersions();
      
    } catch (error) {
      console.error('Error creating version:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      toast.error(`Không thể tạo version: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    try {
      setDeleting(versionId);
      
      await MapCodeClient.deleteVersion(versionId);
      
      toast.success('Xóa version thành công');
      
      // Reload versions
      await loadVersions();
      
    } catch (error) {
      console.error('Error deleting version:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      toast.error(`Không thể xóa version: ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleExportVersion = async (versionId: string, format: 'markdown' | 'json' | 'csv') => {
    try {
      setExporting(versionId);
      
      // Call API to export
      const { content, filename } = await MapCodeClient.exportVersion(versionId, format);
      
      // Create blob and trigger download
      const blob = new Blob([content], { 
        type: format === 'json' ? 'application/json' : 
              format === 'csv' ? 'text/csv' : 
              'text/markdown'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Export thành công: ${filename}`);
      
    } catch (error) {
      console.error('Error exporting version:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      toast.error(`Không thể export: ${errorMessage}`);
    } finally {
      setExporting(null);
    }
  };

  const generateVersionId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `v${year}-${month}-${day}`;
  };

  const handleAutoFillVersion = () => {
    setNewVersion(prev => ({
      ...prev,
      version: generateVersionId()
    }));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Version Management</CardTitle>
          <CardDescription>Quản lý các versions của MapCode</CardDescription>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Version Management</CardTitle>
            <CardDescription>
              Quản lý các versions của MapCode configuration
            </CardDescription>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo Version Mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo MapCode Version Mới</DialogTitle>
                <DialogDescription>
                  Tạo một version mới cho MapCode configuration
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Version ID <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="v2025-09-22"
                      value={newVersion.version}
                      onChange={(e) => setNewVersion(prev => ({ ...prev, version: e.target.value }))}
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={handleAutoFillVersion}
                      type="button"
                    >
                      Auto
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tên hiển thị <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="MapCode Configuration v2025-09-22"
                    value={newVersion.name}
                    onChange={(e) => setNewVersion(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Textarea
                    placeholder="Mô tả về những thay đổi trong version này..."
                    value={newVersion.description}
                    onChange={(e) => setNewVersion(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateVersion}
                  disabled={creating || !newVersion.version.trim() || !newVersion.name.trim()}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo Version'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Active Version Info */}
        {activeVersion && (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Active Version</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {activeVersion.version}
                </Badge>
              </div>
              <p className="text-sm text-green-700 font-medium">{activeVersion.name}</p>
              <p className="text-xs text-green-600 mt-1">{activeVersion.description}</p>
            </div>
            <Separator className="mb-4" />
          </>
        )}

        {/* Versions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Chưa có version nào
                  </TableCell>
                </TableRow>
              ) : (
                versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell className="font-mono font-medium">
                      {version.version}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{version.name}</p>
                        {version.description && (
                          <p className="text-sm text-muted-foreground">
                            {version.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {version.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{version.createdBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {version.createdAt.toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Export Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={exporting === version.id}
                            >
                              {exporting === version.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-1" />
                                  Export
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExportVersion(version.id, 'markdown')}>
                              📝 Markdown (.md)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportVersion(version.id, 'json')}>
                              📦 JSON (.json)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportVersion(version.id, 'csv')}>
                              📊 CSV (.csv)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Delete Button */}
                        {!version.isActive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deleting === version.id}
                              >
                                {deleting === version.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa version</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa version &quot;{version.version}&quot;?
                                  Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVersion(version.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

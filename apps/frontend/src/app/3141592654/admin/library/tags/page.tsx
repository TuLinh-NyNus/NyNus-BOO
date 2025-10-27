'use client';

/**
 * Admin Library Tags Management Page
 * CRUD operations cho library tags
 */

import { useState } from 'react';
import { Plus, Edit, Trash2, Archive, Tag as TagIcon, TrendingUp, Search } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/feedback/use-toast';
import { cn } from '@/lib/utils';
import type { Tag } from '@/components/library/tag-cloud';

// Mock data
const MOCK_TAGS: Tag[] = [
  { id: '1', name: 'toán-học', count: 245, trending: true, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: '2', name: 'vật-lý', count: 189, trending: true, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { id: '3', name: 'hóa-học', count: 156, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: '4', name: 'sinh-học', count: 134 },
  { id: '5', name: 'văn-học', count: 198, trending: true },
  { id: '6', name: 'lịch-sử', count: 87 },
  { id: '7', name: 'địa-lý', count: 76 },
  { id: '8', name: 'tiếng-anh', count: 223, trending: true },
  { id: '9', name: 'đề-thi-thử', count: 312, trending: true },
  { id: '10', name: 'ôn-tập', count: 267 },
];

export default function AdminLibraryTagsPage() {
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    trending: false,
  });

  // Filter tags by search
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalTags = tags.length;
  const trendingTags = tags.filter(t => t.trending).length;
  const totalUsage = tags.reduce((sum, t) => sum + (t.count || 0), 0);
  const avgUsage = totalUsage / totalTags;

  // Handle create/edit dialog
  const openCreateDialog = () => {
    setEditingTag(null);
    setFormData({ name: '', color: '', trending: false });
    setDialogOpen(true);
  };

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || '',
      trending: tag.trending || false,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Tên tag không được để trống',
        variant: 'destructive',
      });
      return;
    }

    if (editingTag) {
      // Update existing tag
      setTags(prev => prev.map(t => 
        t.id === editingTag.id 
          ? { ...t, ...formData, name: formData.name.toLowerCase() }
          : t
      ));
      toast({
        title: 'Cập nhật thành công',
        description: `Tag "${formData.name}" đã được cập nhật`,
      });
    } else {
      // Create new tag
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        ...formData,
        name: formData.name.toLowerCase(),
        count: 0,
      };
      setTags(prev => [newTag, ...prev]);
      toast({
        title: 'Tạo thành công',
        description: `Tag "${formData.name}" đã được tạo`,
      });
    }

    setDialogOpen(false);
  };

  const handleDelete = (tag: Tag) => {
    if (confirm(`Bạn có chắc muốn xóa tag "${tag.name}"? Tag này đang được sử dụng ${tag.count || 0} lần.`)) {
      setTags(prev => prev.filter(t => t.id !== tag.id));
      toast({
        title: 'Xóa thành công',
        description: `Tag "${tag.name}" đã được xóa`,
      });
    }
  };

  const toggleTrending = (tag: Tag) => {
    setTags(prev => prev.map(t => 
      t.id === tag.id ? { ...t, trending: !t.trending } : t
    ));
    toast({
      title: tag.trending ? 'Đã bỏ trending' : 'Đã đánh dấu trending',
      description: `Tag "${tag.name}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Quản lý Tags
        </h1>
        <p className="mt-2 text-muted-foreground">
          Quản lý tags cho Library system - tạo, sửa, xóa và đánh dấu trending tags
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Tags
            </CardTitle>
            <TagIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTags}</div>
            <p className="text-xs text-muted-foreground mt-1">tags trong hệ thống</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trending Tags
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trendingTags}</div>
            <p className="text-xs text-muted-foreground mt-1">đang trending</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng Sử Dụng
            </CardTitle>
            <TagIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground mt-1">lượt tag items</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trung Bình
            </CardTitle>
            <TagIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUsage.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">items/tag</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions & Search */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Danh sách Tags</CardTitle>
              <CardDescription>Quản lý và chỉnh sửa tags trong thư viện</CardDescription>
            </div>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo Tag Mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tags..."
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Tên Tag</TableHead>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead className="text-center">Sử dụng</TableHead>
                  <TableHead className="text-center">Trending</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Không tìm thấy tags nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {tag.id.slice(0, 6)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1', tag.color)}>
                          #{tag.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tag.color ? (
                          <div className={cn('inline-flex h-6 w-6 rounded-full', tag.color)} />
                        ) : (
                          <span className="text-xs text-muted-foreground">Mặc định</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {tag.count || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTrending(tag)}
                          className={cn(
                            'h-7 gap-1',
                            tag.trending && 'text-orange-500 hover:text-orange-600'
                          )}
                        >
                          <TrendingUp className="h-4 w-4" />
                          {tag.trending && <span className="text-xs">ON</span>}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(tag)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tag)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Chỉnh sửa Tag' : 'Tạo Tag Mới'}
            </DialogTitle>
            <DialogDescription>
              {editingTag 
                ? 'Cập nhật thông tin tag. Tag name sẽ được chuyển về lowercase.'
                : 'Tạo tag mới cho library. Tag name sẽ được chuyển về lowercase.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tên Tag *</Label>
              <Input
                id="tag-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ví dụ: toán-học, đề-thi-thử"
              />
              <p className="text-xs text-muted-foreground">
                Preview: #{formData.name.toLowerCase() || 'tag-name'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-color">Custom Color Class (tùy chọn)</Label>
              <Input
                id="tag-color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="bg-blue-100 text-blue-700 dark:bg-blue-900/30"
              />
              <p className="text-xs text-muted-foreground">
                Tailwind CSS classes cho màu sắc. Để trống sẽ dùng màu mặc định.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="tag-trending"
                type="checkbox"
                checked={formData.trending}
                onChange={(e) => setFormData(prev => ({ ...prev, trending: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="tag-trending" className="text-sm font-normal cursor-pointer">
                Đánh dấu là Trending Tag
              </Label>
            </div>

            {formData.name && (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Preview:</p>
                <Badge className={cn('gap-1', formData.color)}>
                  {formData.trending && <TrendingUp className="h-3 w-3" />}
                  #{formData.name.toLowerCase()}
                </Badge>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingTag ? 'Cập nhật' : 'Tạo Tag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


/**
 * Admin Questions Saved Page
 * Trang câu hỏi đã lưu trong admin panel
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/feedback/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bookmark,
  Search,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";

// Import types
import { SavedQuestion } from "@/types/question";

// Import mock service
import { SavedQuestionsManager } from "@/lib/services/mock/questions";

// Import admin paths
import { ADMIN_PATHS } from "@/lib/admin-paths";

/**
 * Saved Page Component
 */
export default function SavedPage() {
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<SavedQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  /**
   * Load saved questions from localStorage
   */
  const loadSavedQuestions = () => {
    try {
      const saved = SavedQuestionsManager.getAll();
      setSavedQuestions(saved);
      setFilteredQuestions(saved);
    } catch (error) {
      console.error("Error loading saved questions:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi đã lưu",
        variant: "destructive"
      });
    }
  };

  /**
   * Handle search
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredQuestions(savedQuestions);
      return;
    }

    const filtered = savedQuestions.filter(item =>
      item.question.content.toLowerCase().includes(query.toLowerCase()) ||
      item.question.questionCodeId.toLowerCase().includes(query.toLowerCase()) ||
      item.question.tag.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      item.note?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredQuestions(filtered);
  };

  /**
   * Handle remove saved question
   */
  const handleRemove = (id: string) => {
    try {
      SavedQuestionsManager.remove(id);
      loadSavedQuestions();
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa câu hỏi khỏi danh sách đã lưu",
        variant: "success"
      });
    } catch (error) {
      console.error("Error removing saved question:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi",
        variant: "destructive"
      });
    }
  };

  /**
   * Handle clear all saved questions
   */
  const handleClearAll = () => {
    if (savedQuestions.length === 0) {
      toast({
        title: "Thông báo",
        description: "Không có câu hỏi nào để xóa",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa tất cả ${savedQuestions.length} câu hỏi đã lưu?`)) {
      try {
        SavedQuestionsManager.clear();
        loadSavedQuestions();
        setSelectedItems([]);
        toast({
          title: "Thành công",
          description: "Đã xóa tất cả câu hỏi đã lưu",
          variant: "success"
        });
      } catch (error) {
        console.error("Error clearing saved questions:", error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa câu hỏi",
          variant: "destructive"
        });
      }
    }
  };

  /**
   * Handle export saved questions
   */
  const handleExport = () => {
    if (savedQuestions.length === 0) {
      toast({
        title: "Thông báo",
        description: "Không có câu hỏi nào để xuất",
        variant: "destructive"
      });
      return;
    }

    try {
      SavedQuestionsManager.export();
      toast({
        title: "Thành công",
        description: "Đã xuất danh sách câu hỏi đã lưu",
        variant: "success"
      });
    } catch (error) {
      console.error("Error exporting saved questions:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất danh sách câu hỏi",
        variant: "destructive"
      });
    }
  };

  /**
   * Handle view question details
   */
  const handleViewQuestion = (questionId: string) => {
    router.push(ADMIN_PATHS.QUESTIONS_VIEW(questionId));
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    router.push(ADMIN_PATHS.QUESTIONS);
  };

  /**
   * Handle selection toggle
   */
  const handleToggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  /**
   * Handle select all toggle
   */
  const handleToggleSelectAll = () => {
    if (selectedItems.length === filteredQuestions.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredQuestions.map(item => item.id));
    }
  };

  /**
   * Handle bulk remove
   */
  const handleBulkRemove = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Thông báo",
        description: "Vui lòng chọn câu hỏi để xóa",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.length} câu hỏi đã chọn?`)) {
      try {
        selectedItems.forEach(id => SavedQuestionsManager.remove(id));
        loadSavedQuestions();
        setSelectedItems([]);
        toast({
          title: "Thành công",
          description: `Đã xóa ${selectedItems.length} câu hỏi`,
          variant: "success"
        });
      } catch (error) {
        console.error("Error bulk removing saved questions:", error);
        toast({
          title: "Lỗi",
          description: "Không thể xóa câu hỏi",
          variant: "destructive"
        });
      }
    }
  };

  // Load saved questions on mount
  useEffect(() => {
    loadSavedQuestions();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, savedQuestions]);

  return (
    <div className="saved-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Câu hỏi đã lưu</h1>
            <p className="text-muted-foreground">
              Quản lý danh sách câu hỏi đã lưu ({savedQuestions.length} câu hỏi)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={savedQuestions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Xuất file
          </Button>
          <Button variant="outline" onClick={loadSavedQuestions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm và thao tác
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo nội dung, mã câu hỏi, tags, ghi chú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Bulk Actions */}
          {filteredQuestions.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredQuestions.length && filteredQuestions.length > 0}
                  onChange={handleToggleSelectAll}
                  className="rounded"
                />
                <span className="text-sm">
                  {selectedItems.length > 0 ? `Đã chọn ${selectedItems.length}` : "Chọn tất cả"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkRemove}
                  disabled={selectedItems.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa đã chọn
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={savedQuestions.length === 0}
                >
                  <X className="h-4 w-4 mr-1" />
                  Xóa tất cả
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Danh sách câu hỏi đã lưu
              </CardTitle>
              <CardDescription>
                {filteredQuestions.length} câu hỏi được tìm thấy
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {savedQuestions.length === 0 ? "Chưa có câu hỏi đã lưu" : "Không tìm thấy câu hỏi"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {savedQuestions.length === 0
                  ? "Bạn chưa lưu câu hỏi nào. Hãy vào kho câu hỏi để thêm câu hỏi vào danh sách đã lưu."
                  : "Không có câu hỏi nào khớp với từ khóa tìm kiếm hiện tại."
                }
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  if (savedQuestions.length === 0) {
                    router.push(ADMIN_PATHS.QUESTIONS_DATABASE);
                  } else {
                    setSearchQuery("");
                  }
                }}
              >
                {savedQuestions.length === 0 ? "Đi đến kho câu hỏi" : "Xóa từ khóa tìm kiếm"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleToggleSelection(item.id)}
                      className="mt-1 rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium mb-2 line-clamp-2">
                        {item.question.content}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>ID: {item.question.questionCodeId}</span>
                        <span>•</span>
                        <span>Lưu: {new Date(item.savedAt).toLocaleDateString()}</span>
                        {item.note && (
                          <>
                            <span>•</span>
                            <span>Ghi chú: {item.note}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.question.type}</Badge>
                        <Badge variant="outline">{item.question.difficulty}</Badge>
                        {item.question.tag.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.question.tag.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.question.tag.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewQuestion(item.question.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemove(item.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

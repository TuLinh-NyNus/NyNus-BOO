'use client';

import React from 'react';

import { BookOpen, Download, Filter, Search, Plus, FileUp, Star, BookOpenCheck, Bookmark, Tag, Calendar } from 'lucide-react';

import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { mockBooks } from '@/lib/mockdata/books';
import { AdminBook } from '@/lib/mockdata/types';
import { useState, useMemo } from 'react';

// Danh sách các options cho bộ lọc - Categories for filtering books
const bookCategories = ['Tất cả', 'Sách giáo khoa', 'Sách bài tập', 'Sách tham khảo', 'Đề thi', 'Sách ngoại ngữ', 'Khác'];
const bookSubjects = ['Tất cả', 'Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý'];
const bookGrades = ['Tất cả', '10', '11', '12'];
const bookFormats = ['Tất cả', 'pdf', 'epub', 'doc', 'ppt'];
const bookStatuses = ['Tất cả', 'Hoạt động', 'Không hoạt động'];

export default function BooksPage() {
  // State management cho các bộ lọc - State for managing filters
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');
  const [selectedGrade, setSelectedGrade] = useState<string>('Tất cả');
  const [selectedFormat, setSelectedFormat] = useState<string>('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Filtered books based on current filters - Lọc sách theo các tiêu chí hiện tại
  const filteredBooks = useMemo(() => {
    let filtered = [...mockBooks];

    // Apply category filter - Áp dụng bộ lọc theo thể loại
    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Apply subject filter - Áp dụng bộ lọc theo môn học (dựa trên tags)
    if (selectedSubject !== 'Tất cả') {
      filtered = filtered.filter(book => 
        book.tags.some(tag => tag.toLowerCase().includes(selectedSubject.toLowerCase()))
      );
    }

    // Apply grade filter - Áp dụng bộ lọc theo khối lớp (dựa trên tags)
    if (selectedGrade !== 'Tất cả') {
      filtered = filtered.filter(book => 
        book.tags.some(tag => tag.includes(selectedGrade))
      );
    }

    // Apply format filter - Áp dụng bộ lọc theo định dạng file
    if (selectedFormat !== 'Tất cả') {
      filtered = filtered.filter(book => book.fileType === selectedFormat);
    }

    // Apply status filter - Áp dụng bộ lọc theo trạng thái hoạt động
    if (selectedStatus !== 'Tất cả') {
      const isActive = selectedStatus === 'Hoạt động';
      filtered = filtered.filter(book => book.isActive === isActive);
    }

    // Apply search query - Áp dụng tìm kiếm theo từ khóa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query) ||
        book.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting - Áp dụng sắp xếp
    switch (sortBy) {
      case 'downloads':
        filtered.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return filtered;
  }, [selectedCategory, selectedSubject, selectedGrade, selectedFormat, selectedStatus, searchQuery, sortBy]);

  // Helper function to format file size - Hàm helper để format kích thước file
  const formatFileSize = (sizeStr: string | undefined): string => {
    return sizeStr || 'N/A';
  };

  // Helper function to format date - Hàm helper để format ngày tháng
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Helper function to get status display - Hàm helper để hiển thị trạng thái
  const getStatusDisplay = (isActive: boolean): string => {
    return isActive ? 'Đã duyệt' : 'Chờ duyệt';
  };

  // Helper function to get status color classes - Hàm helper để lấy class màu cho trạng thái
  const getStatusColorClasses = (isActive: boolean): string => {
    return isActive 
      ? 'bg-green-100/50 dark:bg-green-500/20 text-green-600 dark:text-green-400'
      : 'bg-yellow-100/50 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-500 transition-colors duration-300" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors duration-300">Thư viện tài liệu</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Nhập từ file
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-300 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm tài liệu mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bộ lọc - Filter sidebar */}
        <Card className="md:col-span-3 p-4 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 transition-colors duration-300">
              <Filter className="h-5 w-5" />
              Bộ lọc
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Thể loại</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                >
                  {bookCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Môn học</label>
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                >
                  {bookSubjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Khối lớp</label>
                <select 
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                >
                  {bookGrades.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Định dạng</label>
                <select 
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                >
                  {bookFormats.map((format) => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Trạng thái</label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                >
                  {bookStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Sắp xếp theo</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-white transition-colors duration-300"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="downloads">Lượt tải nhiều nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="title">Tên tài liệu (A-Z)</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  setSelectedCategory('Tất cả');
                  setSelectedSubject('Tất cả');
                  setSelectedGrade('Tất cả');
                  setSelectedFormat('Tất cả');
                  setSelectedStatus('Tất cả');
                  setSearchQuery('');
                  setSortBy('newest');
                }}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 mt-4"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </Card>

        {/* Danh sách tài liệu - Books list */}
        <div className="md:col-span-9 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-slate-400 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-colors duration-300"
            />
          </div>

          {/* Results count - Số lượng kết quả */}
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Hiển thị {filteredBooks.length} tài liệu
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredBooks.map((book: AdminBook) => (
              <Card key={book.id} className="p-6 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700 transition-colors duration-300">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white transition-colors duration-300">{book.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Tác giả: {book.author}</p>
                      {book.publisher && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">NXB: {book.publisher}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200/50 dark:hover:bg-blue-500/30 transition-colors duration-300">
                        Sửa
                      </button>
                      <button className="p-2 bg-red-100/50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200/50 dark:hover:bg-red-500/30 transition-colors duration-300">
                        Xoá
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs rounded transition-colors duration-300">
                      {book.category}
                    </span>
                    {book.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100/50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded transition-colors duration-300">
                        {tag}
                      </span>
                    ))}
                    <span className={cn(
                      "px-2 py-1 text-xs rounded transition-colors duration-300",
                      getStatusColorClasses(book.isActive)
                    )}>
                      {getStatusDisplay(book.isActive)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.reviews} đánh giá</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.fileType.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{formatFileSize(book.fileSize)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.downloadCount} lượt tải</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400 transition-colors duration-300" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{book.publishedDate ? new Date(book.publishedDate).getFullYear() : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-300 dark:border-slate-700 transition-colors duration-300">
                    <span className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                      Cập nhật: {formatDate(book.updatedAt)}
                    </span>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-100/50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-200/50 dark:hover:bg-purple-500/30 transition-colors duration-300">
                        Xem chi tiết
                      </button>
                      <button className="px-4 py-2 bg-green-100/50 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded hover:bg-green-200/50 dark:hover:bg-green-500/30 transition-colors duration-300">
                        Tải xuống
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty state - Trạng thái không có dữ liệu */}
          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">Không tìm thấy tài liệu</h3>
              <p className="text-slate-500 dark:text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


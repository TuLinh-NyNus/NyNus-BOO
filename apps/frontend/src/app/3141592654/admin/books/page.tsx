'use client';

import { useMemo, useState } from 'react';

import {
  AlertTriangle,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  Calendar,
  Download,
  FileUp,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Star,
  Tag,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { mockBooks } from '@/lib/mockdata';
import type { AdminBook } from '@/lib/mockdata/types';
import { useAdminBooks } from '@/hooks/admin/use-admin-books';

const CATEGORY_OPTIONS = [
  { label: 'All categories', value: '' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Languages', value: 'Languages' },
  { label: 'Physics', value: 'Physics' },
  { label: 'Chemistry', value: 'Chemistry' },
  { label: 'Reference', value: 'Reference' },
];

const SUBJECT_OPTIONS = [
  { label: 'All subjects', value: '' },
  { label: 'Math', value: 'math' },
  { label: 'Physics', value: 'physics' },
  { label: 'Chemistry', value: 'chemistry' },
  { label: 'Biology', value: 'biology' },
  { label: 'English', value: 'english' },
  { label: 'History', value: 'history' },
];

const GRADE_OPTIONS = [
  { label: 'All grades', value: '' },
  { label: 'Grade 10', value: '10' },
  { label: 'Grade 11', value: '11' },
  { label: 'Grade 12', value: '12' },
];

const FORMAT_OPTIONS = [
  { label: 'All formats', value: '' },
  { label: 'PDF', value: 'pdf' },
  { label: 'EPUB', value: 'epub' },
  { label: 'DOC', value: 'doc' },
  { label: 'PPT', value: 'ppt' },
];

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Approved', value: 'active' },
  { label: 'Pending', value: 'inactive' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most downloaded', value: 'downloads' },
  { label: 'Highest rated', value: 'rating' },
  { label: 'Title (A-Z)', value: 'title' },
];

const SORT_MAPPING: Record<
  string,
  { sortBy?: 'created_at' | 'download_count' | 'rating' | 'title'; sortOrder?: 'asc' | 'desc' }
> = {
  newest: { sortBy: 'created_at', sortOrder: 'desc' },
  downloads: { sortBy: 'download_count', sortOrder: 'desc' },
  rating: { sortBy: 'rating', sortOrder: 'desc' },
  title: { sortBy: 'title', sortOrder: 'asc' },
};

const numberFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat('vi-VN');

const parseDate = (value: Date | string | undefined): Date => {
  if (value instanceof Date) {
    return value;
  }
  if (!value) {
    return new Date(0);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

const formatFileSize = (size?: string): string => {
  if (!size) {
    return 'N/A';
  }
  const numeric = Number(size);
  if (Number.isNaN(numeric) || numeric <= 0) {
    return size;
  }
  if (numeric < 1024) {
    return `${numeric} B`;
  }
  if (numeric < 1024 * 1024) {
    return `${(numeric / 1024).toFixed(1)} KB`;
  }
  return `${(numeric / (1024 * 1024)).toFixed(1)} MB`;
};

const getStatusLabel = (isActive: boolean): string => (isActive ? 'Approved' : 'Pending');
const statusClasses = (isActive: boolean): string =>
  isActive
    ? 'bg-green-100/60 text-green-700 dark:bg-green-500/20 dark:text-green-300'
    : 'bg-yellow-100/60 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300';

export default function BooksPage(): JSX.Element {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [format, setFormat] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('newest');

  const sortConfig = SORT_MAPPING[sortKey] ?? SORT_MAPPING.newest;
  const isActiveFilter = status === 'all' ? undefined : status === 'active';

  const { books, loading, error, isFallback, total, totalActive, refresh } = useAdminBooks({
    category: category || undefined,
    fileType: format || undefined,
    isActive: isActiveFilter,
    search: searchQuery.trim() || undefined,
    sortBy: sortConfig.sortBy,
    sortOrder: sortConfig.sortOrder,
    limit: 100,
  });

  const baseBooks = useMemo<AdminBook[]>(
    () => (isFallback ? mockBooks : books),
    [books, isFallback],
  );

  const filteredBooks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesTag = (tags: string[], keyword: string) =>
      tags.some((tag) => tag.toLowerCase().includes(keyword));

    let result = [...baseBooks];

    if (category) {
      result = result.filter(
        (book) => book.category && book.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (subject) {
      result = result.filter((book) => matchesTag(book.tags ?? [], subject.toLowerCase()));
    }

    if (grade) {
      result = result.filter((book) => matchesTag(book.tags ?? [], grade));
    }

    if (format) {
      result = result.filter(
        (book) => book.fileType && book.fileType.toLowerCase() === format.toLowerCase(),
      );
    }

    if (status === 'active') {
      result = result.filter((book) => book.isActive);
    } else if (status === 'inactive') {
      result = result.filter((book) => !book.isActive);
    }

    if (normalizedSearch) {
      result = result.filter((book) => {
        const titleMatch = book.title?.toLowerCase().includes(normalizedSearch);
        const authorMatch = book.author?.toLowerCase().includes(normalizedSearch);
        const descriptionMatch = book.description?.toLowerCase().includes(normalizedSearch);
        const tagMatch = matchesTag(book.tags ?? [], normalizedSearch);
        return titleMatch || authorMatch || descriptionMatch || tagMatch;
      });
    }

    switch (sortKey) {
      case 'downloads':
        result.sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        result.sort(
          (a, b) => parseDate(b.updatedAt).getTime() - parseDate(a.updatedAt).getTime(),
        );
        break;
    }

    return result;
  }, [baseBooks, category, subject, grade, format, status, searchQuery, sortKey]);

  const handleResetFilters = () => {
    setCategory('');
    setSubject('');
    setGrade('');
    setFormat('');
    setStatus('all');
    setSearchQuery('');
    setSortKey('newest');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Library Manager</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Review, approve, and organise digital materials for students.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={refresh} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
            <FileUp className="h-4 w-4" />
            Import File
          </Button>
          <Button className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600">
            <Plus className="h-4 w-4" />
            Add Material
          </Button>
        </div>
      </div>

      {isFallback && (
        <Card className="border-amber-200 bg-amber-50/80 p-4 dark:border-amber-400/40 dark:bg-amber-500/10">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-200">
                BookService is not available yet. Displaying demo data.
              </p>
              <p className="text-sm text-amber-700/80 dark:text-amber-200/80">
                Once the backend service & database migration are deployed, real data will appear
                automatically.
              </p>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50/80 p-4 dark:border-red-500/40 dark:bg-red-500/10">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-200">
                Unable to load books right now.
              </p>
              <p className="text-sm text-red-700/80 dark:text-red-200/80">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <Card className="space-y-4 border border-slate-200/60 bg-white/90 p-4 dark:border-slate-700/60 dark:bg-slate-900/50 md:col-span-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-500 dark:text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Filter</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Subject
              </label>
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {SUBJECT_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Grade
              </label>
              <select
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {GRADE_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Format
              </label>
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {FORMAT_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Status
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Sort by
              </label>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="w-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
            >
              Reset filters
            </Button>
          </div>
        </Card>

        <div className="space-y-4 md:col-span-9">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search materials by title, author, or keyword…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>
              Showing{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {numberFormatter.format(filteredBooks.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {numberFormatter.format(isFallback ? mockBooks.length : total)}
              </span>{' '}
              items
            </span>
            <span>
              Active materials:{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {numberFormatter.format(
                  isFallback ? mockBooks.filter((book) => book.isActive).length : totalActive,
                )}
              </span>
            </span>
          </div>

          {loading && (
            <Card className="border border-slate-200/60 bg-white/80 p-6 dark:border-slate-700/60 dark:bg-slate-900/50">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Loading books from the backend…
              </p>
            </Card>
          )}

          {!loading && filteredBooks.length === 0 && (
            <Card className="border border-slate-200/60 bg-white/80 p-12 text-center dark:border-slate-700/60 dark:bg-slate-900/50">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No materials match your filters
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try adjusting the filters or search keyword to find other resources.
              </p>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredBooks.map((book) => {
              const updatedAt = parseDate(book.updatedAt);
              const publishedYear = book.publishedDate
                ? parseDate(book.publishedDate).getFullYear()
                : null;

              return (
                <Card
                  key={book.id}
                  className="space-y-4 border border-slate-200/60 bg-white/90 p-6 dark:border-slate-700/60 dark:bg-slate-900/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {book.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Author: {book.author || 'Unknown'}
                      </p>
                      {book.publisher && (
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Publisher: {book.publisher}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400">
                        Archive
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {book.category && (
                      <span className="rounded bg-purple-100/70 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                        {book.category}
                      </span>
                    )}
                    {(book.tags ?? []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-blue-100/70 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className={cn('rounded px-2 py-1 text-xs font-medium', statusClasses(book.isActive))}>
                      {getStatusLabel(book.isActive)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>{numberFormatter.format(book.reviews ?? 0)} reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>{book.fileType.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>{formatFileSize(book.fileSize)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>{numberFormatter.format(book.downloadCount ?? 0)} downloads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-300" />
                      <span>{(book.rating ?? 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>{publishedYear ?? 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/70 pt-4 text-sm text-slate-600 dark:border-slate-700/70 dark:text-slate-300">
                    <span>Last updated: {dateFormatter.format(updatedAt)}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-300">
                        Preview
                      </Button>
                      <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-300">
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

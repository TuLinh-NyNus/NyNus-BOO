'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from "react";



import { CourseCard, CourseCardSkeleton } from "@/components/features/courses/cards";
import { HeroSection } from "@/components/features/courses/layout";
import { AdvancedSearchBar, SearchFilters as AdvancedSearchFilters, SortOption } from "@/components/features/courses/search";
import { SearchFilters as LegacySearchFilters } from "@/components/features/courses/search";
import { MathBackground } from "@/components/features/courses/ui";
import { Button } from "@/components/ui";
import { useFeaturedCourses } from "@/hooks/use-featured-courses";
import { useTutorials } from "@/hooks/use-tutorials";
import { getCoursesByCategory } from "@/lib/mock-data/courses";
import { MockTutorialFilterParams, MockCourse, MockTutorial } from "@/lib/mock-data/types";

// Helper function to map tutorials to courses by category
function getTutorialsForCourse(course: MockCourse, allTutorials: MockTutorial[]): MockTutorial[] {
  // Map course categories to tutorial categories
  const categoryMapping: Record<string, string[]> = {
    'Toán học': ['Toán 10', 'Toán 11', 'Toán 12']
  };

  const tutorialCategories = categoryMapping[course.category] || [];

  // Filter tutorials by course level/grade
  if (course.title.includes('lớp 12')) {
    return allTutorials.filter(t => t.category === 'Toán 12');
  } else if (course.title.includes('lớp 11')) {
    return allTutorials.filter(t => t.category === 'Toán 11');
  } else if (course.title.includes('lớp 10')) {
    return allTutorials.filter(t => t.category === 'Toán 10');
  }

  // Default: return tutorials matching course category
  return allTutorials.filter(t => tutorialCategories.includes(t.category));
}

export default function CoursesPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'name', direction: 'asc' });

  // Legacy search filters for compatibility with existing hooks
  const [searchFilters, setSearchFilters] = useState<LegacySearchFilters>({
    query: '',
    category: '',
    level: '',
    sortBy: 'number',
    sortOrder: 'asc'
  });

  // Fetch math courses (Toán học category)
  const mathCourses = getCoursesByCategory('Toán học');

  // Convert search filters to tutorial filter params
  const tutorialParams: MockTutorialFilterParams = {
    search: (searchFilters as any).query || '',
    category: (searchFilters as any).category || undefined,
    level: Array.isArray((searchFilters as any).level) ? (searchFilters as any).level[0] : (searchFilters as any).level || undefined,
    sortBy: (searchFilters as any).sortBy || 'number',
    sortOrder: (searchFilters as any).sortOrder || 'asc',
    limit: 50 // Get all tutorials for mapping
  };

  // Fetch all tutorials
  const { data: allTutorials, isLoading: isLoadingTutorials } = useTutorials(tutorialParams);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchFilters(prev => ({ ...prev, query }));
  };

  const handleFilterChange = (newFilters: AdvancedSearchFilters) => {
    setFilters(newFilters);
    // Convert new filters to legacy format
    setSearchFilters(prev => ({
      ...prev,
      category: newFilters.subject?.[0] || '',
      level: newFilters.level?.[0] || '',
    }));
  };

  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
    // Convert to legacy format
    const sortBy = sort.field === 'name' ? 'title' :
                   sort.field === 'date' ? 'createdAt' :
                   sort.field === 'popularity' ? 'views' :
                   sort.field === 'rating' ? 'rating' : 'number';

    setSearchFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: sort.direction
    }));
  };

  return (
    <div className="min-h-screen relative">
      {/* Mathematical Background for entire page */}
      <MathBackground />

      {/* Hero Section */}
      <div className="relative z-10">
        <HeroSection />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Background overlay for content area */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Advanced Search Bar */}
          <div className="mb-8 -mt-8">
            <AdvancedSearchBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              className="max-w-4xl mx-auto"
            />
          </div>

          {/* Course Cards Section */}
          <div className="space-y-12">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {(searchFilters as any).query ? (
                  <span>
                    Kết quả: <span className="text-purple-200">"{(searchFilters as any).query}"</span>
                  </span>
                ) : (
                  'Khóa học Toán học'
                )}
              </h2>
              <p className="text-purple-200 text-lg">
                Hệ thống khóa học toàn diện từ lớp 10 đến 12
              </p>
            </motion.div>

            {/* Course Cards */}
            <div className="space-y-8">
              {isLoadingTutorials ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <CourseCardSkeleton key={index} />
                ))
              ) : mathCourses.length > 0 && allTutorials ? (
                // Render course cards
                mathCourses.map((course, index) => {
                  const courseTutorials = getTutorialsForCourse(course, allTutorials);
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      lessons={courseTutorials}
                      index={index}
                    />
                  );
                })
              ) : (
                // No courses found
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="text-white/70 text-lg mb-4">
                    {(searchFilters as any).query
                      ? 'Không tìm thấy khóa học phù hợp'
                      : 'Không có khóa học nào'
                    }
                  </div>
                  {(searchFilters as any).query && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchFilters(prev => ({ ...prev, query: '' }))}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </div>




        </div>
      </div>
    </div>
  );
}

'use client';

import { motion } from "framer-motion";
import { useState, useMemo } from "react";

import { MathBackground } from "@/components/features/courses/ui";
import { AdvancedSearchBar, SearchFilters, SortOption } from "@/components/features/courses/search/advanced-search-bar";
import { CourseCard, CourseCardSkeleton } from "@/components/features/courses/cards";
import { HeroSection } from "@/components/features/courses/layout";
import { getCoursesByCategory } from "@/lib/mockdata";
import { MockTutorial, MockCourse } from "@/lib/mockdata/courses/courses-types";
import { useTutorials } from '@/hooks';
import { Button } from "@/components/ui/form/button";
import { ThemeForcer } from "@/components/ui/theme";

// Helper function to map tutorials to courses by category
function getTutorialsForCourse(course: MockCourse, allTutorials: MockTutorial[]): MockTutorial[] {
  // Filter tutorials by course level/grade
  if (course.title.includes('lớp 12')) {
    return allTutorials.filter(t => t.category === 'Toán 12');
  } else if (course.title.includes('lớp 11')) {
    return allTutorials.filter(t => t.category === 'Toán 11');
  } else if (course.title.includes('lớp 10')) {
    return allTutorials.filter(t => t.category === 'Toán 10');
  }

  // Default: return first 9 tutorials
  return allTutorials.slice(0, 9);
}

/**
 * Courses Page - Trang danh sách khóa học hoàn chỉnh
 * Sử dụng tất cả layout components và tích hợp mockdata
 */
export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch math courses (Toán học category)
  const mathCourses = getCoursesByCategory('Toán học');

  // Memoize params để tránh tạo object mới mỗi render
  const tutorialsParams = useMemo(() => ({
    limit: 50 // Get all tutorials
  }), []);

  // Fetch all tutorials for mapping to courses
  const { data: allTutorials, isLoading: isLoadingTutorials } = useTutorials(tutorialsParams);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: SearchFilters) => {
    console.log('Filters changed:', filters);
  };

  const handleSortChange = (sort: SortOption) => {
    console.log('Sort changed:', sort);
  };

  return (
    <ThemeForcer forceTheme="dark" disableToggle>
      <div className="min-h-screen relative">
        {/* Mathematical Background for entire page */}
        <MathBackground />

      {/* Hero Section */}
      <div className="relative z-10">
        <HeroSection />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
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
                {searchQuery ? (
                  <span>
                    Kết quả: <span className="text-purple-200">&quot;{searchQuery}&quot;</span>
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
                    {searchQuery
                      ? 'Không tìm thấy khóa học phù hợp'
                      : 'Không có khóa học nào'
                    }
                  </div>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
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

      {/* Features Section Removed - Component not available */}
      </div>
    </ThemeForcer>
  );
}

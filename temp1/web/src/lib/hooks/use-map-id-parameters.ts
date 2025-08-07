import { useState, useEffect, useCallback } from 'react';

import logger from '../utils/logger';

/**
 * Interface cho một tham số MapID
 */
export interface MapIDParameter {
  value: string;
  label: string;
}

/**
 * Hook để lấy các tham số MapID từ API
 */
export function useMapIDParameters():  {
  grades: MapIDParameter[];
  difficulties: MapIDParameter[];
  getSubjects: (grade: string) => Promise<MapIDParameter[]>;
  getChapters: (grade: string, subject: string) => Promise<MapIDParameter[]>;
  getLessons: (grade: string, subject: string, chapter: string) => Promise<MapIDParameter[]>;
  getForms: (grade: string, subject: string, chapter: string, lesson: string) => Promise<MapIDParameter[]>;
  loading: boolean;
  error: string | null;
} {
  const [grades, setGrades] = useState<MapIDParameter[]>([]);
  const [difficulties, setDifficulties] = useState<MapIDParameter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách lớp và mức độ
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const parametersResponse = await fetch('/api/map-id/parameters');
        if (!parametersResponse.ok) {
          throw new Error(`Error: ${parametersResponse.status}`);
        }

        const parametersData = await parametersResponse.json();
        if (parametersData.success) {
          setGrades(parametersData.grades || []);
          setDifficulties(parametersData.difficulties || []);
        } else {
          throw new Error(parametersData.error || 'Không thể lấy tham số MapID');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        logger.error('Error fetching MapID parameters:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchParameters();
  }, []);

  /**
   * Lấy danh sách môn học theo lớp
   */
  const getSubjects = useCallback(async (grade: string): Promise<MapIDParameter[]> => {
    if (!grade) {
      return [{ value: 'all', label: 'Tất cả' }];
    }

    try {
      const subjectsResponse = await fetch(`/api/map-id/parameters?grade=${grade}`);
      if (!subjectsResponse.ok) {
        throw new Error(`Error: ${subjectsResponse.status}`);
      }

      const subjectsData = await subjectsResponse.json();
      if (subjectsData.success) {
        return subjectsData.subjects || [];
      } else {
        throw new Error(subjectsData.error || 'Không thể lấy danh sách môn học');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      logger.error('Error fetching subjects:', errorMessage);
      return [{ value: 'all', label: 'Tất cả' }];
    }
  }, []);

  /**
   * Lấy danh sách chương theo lớp và môn học
   */
  const getChapters = useCallback(async (grade: string, subject: string): Promise<MapIDParameter[]> => {
    if (!grade || !subject) {
      return [{ value: 'all', label: 'Tất cả' }];
    }

    try {
      const chaptersResponse = await fetch(`/api/map-id/parameters?grade=${grade}&subject=${subject}`);
      if (!chaptersResponse.ok) {
        throw new Error(`Error: ${chaptersResponse.status}`);
      }

      const chaptersData = await chaptersResponse.json();
      if (chaptersData.success) {
        return chaptersData.chapters || [];
      } else {
        throw new Error(chaptersData.error || 'Không thể lấy danh sách chương');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      logger.error('Error fetching chapters:', errorMessage);
      return [{ value: 'all', label: 'Tất cả' }];
    }
  }, []);

  /**
   * Lấy danh sách bài theo lớp, môn học và chương
   */
  const getLessons = useCallback(async (grade: string, subject: string, chapter: string): Promise<MapIDParameter[]> => {
    if (!grade || !subject || !chapter) {
      return [{ value: 'all', label: 'Tất cả' }];
    }

    try {
      const lessonsResponse = await fetch(`/api/map-id/parameters?grade=${grade}&subject=${subject}&chapter=${chapter}`);
      if (!lessonsResponse.ok) {
        throw new Error(`Error: ${lessonsResponse.status}`);
      }

      const lessonsData = await lessonsResponse.json();
      if (lessonsData.success) {
        return lessonsData.lessons || [];
      } else {
        throw new Error(lessonsData.error || 'Không thể lấy danh sách bài');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      logger.error('Error fetching lessons:', errorMessage);
      return [{ value: 'all', label: 'Tất cả' }];
    }
  }, []);

  /**
   * Lấy danh sách dạng theo lớp, môn học, chương và bài
   */
  const getForms = useCallback(async (grade: string, subject: string, chapter: string, lesson: string): Promise<MapIDParameter[]> => {
    if (!grade || !subject || !chapter || !lesson) {
      return [{ value: 'all', label: 'Tất cả' }];
    }

    try {
      const formsResponse = await fetch(`/api/map-id/parameters?grade=${grade}&subject=${subject}&chapter=${chapter}&lesson=${lesson}`);
      if (!formsResponse.ok) {
        throw new Error(`Error: ${formsResponse.status}`);
      }

      const formsData = await formsResponse.json();
      if (formsData.success) {
        return formsData.forms || [];
      } else {
        throw new Error(formsData.error || 'Không thể lấy danh sách dạng');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      logger.error('Error fetching forms:', errorMessage);
      return [{ value: 'all', label: 'Tất cả' }];
    }
  }, []);

  return {
    grades,
    difficulties,
    getSubjects,
    getChapters,
    getLessons,
    getForms,
    loading,
    error
  };
}

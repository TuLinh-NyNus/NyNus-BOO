'use client';

import { useState, useEffect } from 'react';

import { MapIDResult } from '@/lib/types/latex-parser';
import logger from '@/lib/utils/logger';

/**
 * Hook để giải mã QuestionID
 * @param QuestionID QuestionID cần giải mã
 * @returns Kết quả giải mã, trạng thái loading và lỗi (nếu có)
 */
export function useMapID(QuestionID: string | null):  {
  result: MapIDResult | null;
  loading: boolean;
  error: string | null;
} {
  const [result, setResult] = useState<MapIDResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!QuestionID) {
      setResult(null);
      return;
    }

    const fetchMapID = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/map-id/decode?mapID=${encodeURIComponent(QuestionID)}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result) {
          setResult(data.result);
        } else {
          throw new Error(data.error || 'Không thể giải mã MapID');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        logger.error('Error decoding MapID:', errorMessage);
        setError(errorMessage);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMapID();
  }, [QuestionID]);

  return { result, loading, error };
}

/**
 * Hook để tìm kiếm MapID
 * @param criteria Tiêu chí tìm kiếm
 * @returns Kết quả tìm kiếm, trạng thái loading và lỗi (nếu có)
 */
export function useMapIDSearch(criteria: {
  grade?: string;
  subject?: string;
  chapter?: string;
  difficulty?: string;
  lesson?: string;
  form?: string;
}):  {
  results: { mapID: string; description: string }[];
  loading: boolean;
  error: string | null;
} {
  const [results, setResults] = useState<{ mapID: string; description: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!criteria || Object.keys(criteria).length === 0) {
      setResults([]);
      return;
    }

    const searchMapID = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        Object.entries(criteria).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value);
          }
        });

        const response = await fetch(`/api/map-id/search?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setResults(data.results || []);
        } else {
          throw new Error(data.error || 'Không thể tìm kiếm MapID');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        logger.error('Error searching MapID:', errorMessage);
        setError(errorMessage);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchMapID();
  }, [criteria]);

  return { results, loading, error };
}

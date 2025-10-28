/**
 * Library Search Service
 * Handles search suggestions and autocomplete
 */

import { LibraryServiceClient } from '@/generated/v1/LibraryServiceClientPb';
import {
  SearchSuggestionsRequest,
} from '@/generated/v1/library_pb';

const client = new LibraryServiceClient(
  process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080',
  null,
  null
);

export interface SearchSuggestionData {
  text: string;
  type: 'title' | 'subject' | 'tag' | 'trending';
  count: number;
  isTrending: boolean;
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 10
): Promise<SearchSuggestionData[]> {
  const request = new SearchSuggestionsRequest();
  request.setQuery(query);
  request.setLimit(limit);

  const response = await client.getSearchSuggestions(request, {});
  
  return response.getSuggestionsList().map(suggestion => ({
    text: suggestion.getText(),
    type: suggestion.getType() as 'title' | 'subject' | 'tag' | 'trending',
    count: suggestion.getCount(),
    isTrending: suggestion.getIsTrending(),
  }));
}

/**
 * Get trending suggestions (empty query)
 */
export async function getTrendingSuggestions(limit: number = 10): Promise<SearchSuggestionData[]> {
  return getSearchSuggestions('', limit);
}

/**
 * Format suggestions for autocomplete
 */
export function formatSuggestionsForAutocomplete(
  suggestions: SearchSuggestionData[]
): Array<{
  label: string;
  value: string;
  type: string;
  badge?: string;
}> {
  return suggestions.map(suggestion => ({
    label: suggestion.text,
    value: suggestion.text,
    type: suggestion.type,
    badge: suggestion.isTrending ? 'Trending' : undefined,
  }));
}


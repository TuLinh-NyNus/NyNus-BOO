/**
 * Library Analytics Service
 * Handles all analytics-related API operations
 */

import { LibraryServiceClient } from '@/generated/proto/v1/library_grpc_web_pb';
import {
  GetAnalyticsRequest,
  GetTopItemsRequest,
  AnalyticsResponse,
  TopItemsResponse,
} from '@/generated/proto/v1/library_pb';

const client = new LibraryServiceClient(
  process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080',
  null,
  null
);

export interface AnalyticsSummary {
  totalDownloads: number;
  totalViews: number;
  averageRating: number;
  activeUsers: number;
  trendingGrowth: number;
  totalItems: number;
  totalExams: number;
  totalBooks: number;
  totalVideos: number;
}

export interface TopItemData {
  itemId: string;
  title: string;
  type: string;
  downloadCount: number;
  rating: number;
  reviewCount: number;
  rank: number;
}

export interface ContentDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  topDownloaded: TopItemData[];
  topRated: TopItemData[];
  recentlyAdded: TopItemData[];
  distribution: ContentDistribution[];
}

/**
 * Get comprehensive analytics data
 */
export async function getAnalytics(): Promise<AnalyticsData> {
  const request = new GetAnalyticsRequest();
  const response = await client.getAnalytics(request, {});

  const summary = response.getSummary();
  if (!summary) {
    throw new Error('No summary data returned');
  }

  return {
    summary: {
      totalDownloads: summary.getTotalDownloads(),
      totalViews: summary.getTotalViews(),
      averageRating: summary.getAverageRating(),
      activeUsers: summary.getActiveUsers(),
      trendingGrowth: summary.getTrendingGrowth(),
      totalItems: summary.getTotalItems(),
      totalExams: summary.getTotalExams(),
      totalBooks: summary.getTotalBooks(),
      totalVideos: summary.getTotalVideos(),
    },
    topDownloaded: response.getTopDownloadedList().map(item => ({
      itemId: item.getItemId(),
      title: item.getTitle(),
      type: item.getType(),
      downloadCount: item.getDownloadCount(),
      rating: item.getRating(),
      reviewCount: item.getReviewCount(),
      rank: item.getRank(),
    })),
    topRated: response.getTopRatedList().map(item => ({
      itemId: item.getItemId(),
      title: item.getTitle(),
      type: item.getType(),
      downloadCount: item.getDownloadCount(),
      rating: item.getRating(),
      reviewCount: item.getReviewCount(),
      rank: item.getRank(),
    })),
    recentlyAdded: response.getRecentlyAddedList().map(item => ({
      itemId: item.getItemId(),
      title: item.getTitle(),
      type: item.getType(),
      downloadCount: item.getDownloadCount(),
      rating: item.getRating(),
      reviewCount: item.getReviewCount(),
      rank: item.getRank(),
    })),
    distribution: response.getDistributionList().map(dist => ({
      type: dist.getType(),
      count: dist.getCount(),
      percentage: dist.getPercentage(),
    })),
  };
}

/**
 * Get top downloaded items
 */
export async function getTopDownloaded(limit: number = 10): Promise<TopItemData[]> {
  const request = new GetTopItemsRequest();
  request.setLimit(limit);

  const response = await client.getTopDownloaded(request, {});
  
  return response.getItemsList().map(item => ({
    itemId: item.getItemId(),
    title: item.getTitle(),
    type: item.getType(),
    downloadCount: item.getDownloadCount(),
    rating: item.getRating(),
    reviewCount: item.getReviewCount(),
    rank: item.getRank(),
  }));
}

/**
 * Get top rated items
 */
export async function getTopRated(limit: number = 10): Promise<TopItemData[]> {
  const request = new GetTopItemsRequest();
  request.setLimit(limit);

  const response = await client.getTopRated(request, {});
  
  return response.getItemsList().map(item => ({
    itemId: item.getItemId(),
    title: item.getTitle(),
    type: item.getType(),
    downloadCount: item.getDownloadCount(),
    rating: item.getRating(),
    reviewCount: item.getReviewCount(),
    rank: item.getRank(),
  }));
}

/**
 * Get analytics summary only
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const data = await getAnalytics();
  return data.summary;
}

/**
 * Get content distribution only
 */
export async function getContentDistribution(): Promise<ContentDistribution[]> {
  const data = await getAnalytics();
  return data.distribution;
}


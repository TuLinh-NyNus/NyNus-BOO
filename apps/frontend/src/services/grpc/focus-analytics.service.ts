/**
 * Focus Analytics gRPC Service
 * Handles analytics data retrieval from backend
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { FocusRoomServiceClient } from '@/generated/v1/Focus_roomServiceClientPb';
import {
  GetDailyStatsRequest,
  GetWeeklyStatsRequest,
  GetMonthlyStatsRequest,
  GetContributionGraphRequest,
  DailyStats as PbDailyStats,
  WeeklyStats as PbWeeklyStats,
  MonthlyStats as PbMonthlyStats,
  ContributionDay as PbContributionDay,
  SubjectTime as PbSubjectTime,
} from '@/generated/v1/focus_room_pb';
import { getAuthMetadata } from './client';
import { createGrpcClient } from './client-factory';

// TypeScript interfaces for frontend
export interface DailyStats {
  date: string;
  totalFocusTimeSeconds: number;
  totalBreakTimeSeconds: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  mostProductiveHour?: number;
  subjectsStudied: Record<string, number>;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalFocusTimeSeconds: number;
  averageDailyTime: number;
  streak: number;
  improvement: number;
  mostProductiveDay?: string;
  dailyBreakdown: DailyStats[];
}

export interface SubjectTime {
  subject: string;
  timeSeconds: number;
  percentage: number;
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalFocusTimeSeconds: number;
  totalDaysActive: number;
  averageDailyTime: number;
  longestStreak: number;
  topSubjects: SubjectTime[];
  weeklyBreakdown: WeeklyStats[];
}

export interface ContributionDay {
  date: string;
  focusTimeSeconds: number;
  level: number; // 0-4 intensity
  sessionsCount: number;
}

// ===== gRPC CLIENT INITIALIZATION =====
const getClient = createGrpcClient(FocusRoomServiceClient, 'FocusAnalyticsService');

// ===== MAPPERS =====

function mapDailyStatsFromPb(pb: PbDailyStats): DailyStats {
  const subjectsMap = pb.getSubjectsStudiedMap();
  const subjectsStudied: Record<string, number> = {};
  subjectsMap.forEach((value: number, key: string) => {
    subjectsStudied[key] = value;
  });

  return {
    date: pb.getDate(),
    totalFocusTimeSeconds: pb.getTotalFocusTimeSeconds(),
    totalBreakTimeSeconds: pb.getTotalBreakTimeSeconds(),
    sessionsCompleted: pb.getSessionsCompleted(),
    tasksCompleted: pb.getTasksCompleted(),
    mostProductiveHour: pb.getMostProductiveHour() || undefined,
    subjectsStudied,
  };
}

function mapWeeklyStatsFromPb(pb: PbWeeklyStats): WeeklyStats {
  const dailyBreakdown = pb.getDailyBreakdownList().map((daily: PbDailyStats) => mapDailyStatsFromPb(daily));

  return {
    weekStart: pb.getWeekStart(),
    weekEnd: pb.getWeekEnd(),
    totalFocusTimeSeconds: pb.getTotalFocusTimeSeconds(),
    averageDailyTime: pb.getAverageDailyTime(),
    streak: pb.getStreak(),
    improvement: pb.getImprovement(),
    mostProductiveDay: pb.getMostProductiveDay() || undefined,
    dailyBreakdown,
  };
}

function mapMonthlyStatsFromPb(pb: PbMonthlyStats): MonthlyStats {
  const topSubjects = pb.getTopSubjectsList().map((subject: PbSubjectTime) => ({
    subject: subject.getSubject(),
    timeSeconds: subject.getTimeSeconds(),
    percentage: subject.getPercentage(),
  }));

  const weeklyBreakdown = pb.getWeeklyBreakdownList().map((weekly: PbWeeklyStats) => mapWeeklyStatsFromPb(weekly));

  return {
    month: pb.getMonth(),
    year: pb.getYear(),
    totalFocusTimeSeconds: pb.getTotalFocusTimeSeconds(),
    totalDaysActive: pb.getTotalDaysActive(),
    averageDailyTime: pb.getAverageDailyTime(),
    longestStreak: pb.getLongestStreak(),
    topSubjects,
    weeklyBreakdown,
  };
}

function mapContributionDayFromPb(pb: PbContributionDay): ContributionDay {
  return {
    date: pb.getDate(),
    focusTimeSeconds: pb.getFocusTimeSeconds(),
    level: pb.getLevel(),
    sessionsCount: pb.getSessionsCount(),
  };
}

// ===== SERVICE METHODS =====

/**
 * Get daily statistics for a specific date
 */
export async function getDailyStats(date?: string): Promise<DailyStats> {
  const client = getClient();
  const request = new GetDailyStatsRequest();
  if (date) {
    request.setDate(date);
  }

  return new Promise((resolve, reject) => {
    client.getDailyStats(request, getAuthMetadata(), (err: any, response: any) => {
      if (err) {
        console.error('Failed to get daily stats:', err);
        reject(err);
        return;
      }

      const stats = response.getStats();
      if (!stats) {
        reject(new Error('No stats returned'));
        return;
      }

      resolve(mapDailyStatsFromPb(stats));
    });
  });
}

/**
 * Get weekly statistics
 */
export async function getWeeklyStats(weekStart?: string): Promise<WeeklyStats> {
  const client = getClient();
  const request = new GetWeeklyStatsRequest();
  if (weekStart) {
    request.setWeekStart(weekStart);
  }

  return new Promise((resolve, reject) => {
    client.getWeeklyStats(request, getAuthMetadata(), (err: any, response: any) => {
      if (err) {
        console.error('Failed to get weekly stats:', err);
        reject(err);
        return;
      }

      const stats = response.getStats();
      if (!stats) {
        reject(new Error('No stats returned'));
        return;
      }

      resolve(mapWeeklyStatsFromPb(stats));
    });
  });
}

/**
 * Get monthly statistics
 */
export async function getMonthlyStats(year?: number, month?: number): Promise<MonthlyStats> {
  const client = getClient();
  const request = new GetMonthlyStatsRequest();
  if (year) request.setYear(year);
  if (month) request.setMonth(month);

  return new Promise((resolve, reject) => {
    client.getMonthlyStats(request, getAuthMetadata(), (err: any, response: any) => {
      if (err) {
        console.error('Failed to get monthly stats:', err);
        reject(err);
        return;
      }

      const stats = response.getStats();
      if (!stats) {
        reject(new Error('No stats returned'));
        return;
      }

      resolve(mapMonthlyStatsFromPb(stats));
    });
  });
}

/**
 * Get contribution graph data (365 days)
 */
export async function getContributionGraph(days: number = 365): Promise<ContributionDay[]> {
  const client = getClient();
  const request = new GetContributionGraphRequest();
  request.setDays(days);

  return new Promise((resolve, reject) => {
    client.getContributionGraph(request, getAuthMetadata(), (err: any, response: any) => {
      if (err) {
        console.error('Failed to get contribution graph:', err);
        reject(err);
        return;
      }

      const contributions = response.getContributionsList().map((day: PbContributionDay) => mapContributionDayFromPb(day));
      resolve(contributions);
    });
  });
}

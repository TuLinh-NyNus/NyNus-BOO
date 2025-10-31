/**
 * Focus Room Service Client (gRPC-Web)
 * =====================================
 * gRPC client implementation for FocusRoomService
 * Handles room management, sessions, and basic analytics
 *
 * @author NyNus Development Team
 * @version 1.0.0 - MVP Implementation
 * @created 2025-10-31
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// gRPC-Web imports
import { FocusRoomServiceClient } from '@/generated/v1/Focus_roomServiceClientPb';
import {
  Room as PbRoom,
  FocusSession as PbFocusSession,
  CreateRoomRequest,
  GetRoomRequest,
  ListRoomsRequest,
  JoinRoomRequest,
  LeaveRoomRequest,
  StartSessionRequest,
  EndSessionRequest,
  GetActiveSessionRequest,
  GetStreakRequest,
  StreakInfo as PbStreakInfo,
  SessionStats as PbSessionStats,
} from '@/generated/v1/focus_room_pb';
import { RpcError } from 'grpc-web';

// Frontend types
export interface FocusRoom {
  id: string;
  name: string;
  description: string;
  ownerUserId: string; // Changed from number to string
  roomType: 'public' | 'private' | 'class';
  maxParticipants: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FocusSession {
  id: string;
  userId: string; // Changed from number to string
  roomId: string;
  durationType: 'focus' | 'short_break' | 'long_break';
  taskDescription: string;
  startedAt: Date;
  endedAt?: Date;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: Date;
  totalStudyDays: number;
}

export interface SessionStats {
  sessionId: string;
  totalDuration: number; // seconds
  tasksCompleted: number;
  streakUpdated: boolean;
}

export interface RoomFilters {
  roomType?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// gRPC client utilities
import { getAuthMetadata } from './client';
import { createGrpcClient } from './client-factory';

// ===== gRPC CLIENT INITIALIZATION =====

const getFocusRoomServiceClient = createGrpcClient(FocusRoomServiceClient, 'FocusRoomService');

// ===== MAPPERS =====

/**
 * Map protobuf Room to frontend FocusRoom
 */
function mapRoomFromPb(pbRoom: PbRoom): FocusRoom {
  const roomType = pbRoom.getRoomType();
  let mappedRoomType: 'public' | 'private' | 'class' = 'public';
  if (roomType === 1) mappedRoomType = 'public';
  else if (roomType === 2) mappedRoomType = 'private';
  else if (roomType === 3) mappedRoomType = 'class';

  return {
    id: pbRoom.getId(),
    name: pbRoom.getName(),
    description: pbRoom.getDescription(),
    ownerUserId: pbRoom.getOwnerUserId(),
    roomType: mappedRoomType,
    maxParticipants: pbRoom.getMaxParticipants(),
    isActive: pbRoom.getIsActive(),
    createdAt: pbRoom.getCreatedAt() ? new Date(pbRoom.getCreatedAt()!.getSeconds() * 1000) : new Date(),
    updatedAt: pbRoom.getUpdatedAt() ? new Date(pbRoom.getUpdatedAt()!.getSeconds() * 1000) : new Date(),
  };
}

/**
 * Map protobuf FocusSession to frontend FocusSession
 */
function mapSessionFromPb(pbSession: PbFocusSession): FocusSession {
  const sessionType = pbSession.getSessionType();
  let mappedType: 'focus' | 'short_break' | 'long_break' = 'focus';
  // SESSION_TYPE_FOCUS = 1, SESSION_TYPE_SHORT_BREAK = 2, SESSION_TYPE_LONG_BREAK = 3
  if (sessionType === 1) mappedType = 'focus';
  else if (sessionType === 2) mappedType = 'short_break';
  else if (sessionType === 3) mappedType = 'long_break';

  return {
    id: pbSession.getId(),
    userId: pbSession.getUserId(),
    roomId: pbSession.getRoomId(),
    durationType: mappedType,
    taskDescription: pbSession.getTaskDescription(),
    startedAt: pbSession.getStartedAt() ? new Date(pbSession.getStartedAt()!.getSeconds() * 1000) : new Date(),
    endedAt: pbSession.getEndedAt() ? new Date(pbSession.getEndedAt()!.getSeconds() * 1000) : undefined,
  };
}

/**
 * Map protobuf StreakInfo to frontend StreakInfo
 */
function mapStreakFromPb(pbStreak: PbStreakInfo): StreakInfo {
  const lastStudyDateTs = pbStreak.getLastStudyDate();
  return {
    currentStreak: pbStreak.getCurrentStreak(),
    longestStreak: pbStreak.getLongestStreak(),
    lastStudyDate: lastStudyDateTs ? new Date((lastStudyDateTs as any).getSeconds() * 1000) : undefined,
    totalStudyDays: pbStreak.getTotalStudyDays(),
  };
}

// ===== SERVICE METHODS =====

/**
 * Create a new focus room
 */
export async function createRoom(data: {
  name: string;
  description: string;
  roomType: string;
  maxParticipants: number;
}): Promise<FocusRoom> {
  const client = getFocusRoomServiceClient();
  const request = new CreateRoomRequest();
  request.setName(data.name);
  request.setDescription(data.description);
  // Map roomType string to enum number
  const roomTypeEnum = data.roomType === 'public' ? 1 : data.roomType === 'private' ? 2 : 3;
  request.setRoomType(roomTypeEnum);
  request.setMaxParticipants(data.maxParticipants);

  return new Promise((resolve, reject) => {
    client.createRoom(request, getAuthMetadata(), (err: RpcError | null, response: PbRoom | null) => {
      if (err) {
        console.error('Failed to create room:', err);
        reject(err);
      } else if (response) {
        resolve(mapRoomFromPb(response));
      } else {
        reject(new Error('No response from server'));
      }
    });
  });
}

/**
 * Get room by ID
 */
export async function getRoom(roomId: string): Promise<FocusRoom> {
  const client = getFocusRoomServiceClient();
  const request = new GetRoomRequest();
  request.setRoomId(roomId);

  return new Promise((resolve, reject) => {
    client.getRoom(request, getAuthMetadata(), (err: RpcError | null, response: PbRoom | null) => {
      if (err) {
        console.error('Failed to get room:', err);
        reject(err);
      } else if (response) {
        resolve(mapRoomFromPb(response));
      } else {
        reject(new Error('No response from server'));
      }
    });
  });
}

/**
 * List available rooms with filters
 */
export async function listRooms(filters?: RoomFilters): Promise<{ rooms: FocusRoom[]; total: number }> {
  const client = getFocusRoomServiceClient();
  const request = new ListRoomsRequest();
  
  if (filters?.roomType) {
    const roomTypeEnum = filters.roomType === 'public' ? 1 : filters.roomType === 'private' ? 2 : 3;
    request.setRoomType(roomTypeEnum);
  }
  // Note: search field not in proto, skip for now
  request.setPage(filters?.page || 1);
  request.setPageSize(filters?.pageSize || 20);

  return new Promise((resolve, reject) => {
    client.listRooms(request, getAuthMetadata(), (err: RpcError | null, response: any) => {
      if (err) {
        console.error('Failed to list rooms:', err);
        reject(err);
      } else if (response) {
        const rooms = response.getRoomsList().map(mapRoomFromPb);
        resolve({
          rooms,
          total: response.getTotal(),
        });
      } else {
        reject(new Error('No response from server'));
      }
    });
  });
}

/**
 * Join a room
 */
export async function joinRoom(roomId: string): Promise<void> {
  const client = getFocusRoomServiceClient();
  const request = new JoinRoomRequest();
  request.setRoomId(roomId);

  return new Promise((resolve, reject) => {
    client.joinRoom(request, getAuthMetadata(), (err: RpcError | null, response: any) => {
      if (err) {
        console.error('Failed to join room:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Leave a room
 */
export async function leaveRoom(roomId: string): Promise<void> {
  const client = getFocusRoomServiceClient();
  const request = new LeaveRoomRequest();
  request.setRoomId(roomId);

  return new Promise((resolve, reject) => {
    client.leaveRoom(request, getAuthMetadata(), (err: RpcError | null) => {
      if (err) {
        console.error('Failed to leave room:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Start a focus session
 */
export async function startSession(data: {
  roomId?: string;
  durationType: 'focus' | 'short_break' | 'long_break';
  taskDescription?: string;
}): Promise<FocusSession> {
  const client = getFocusRoomServiceClient();
  const request = new StartSessionRequest();
  
  if (data.roomId) {
    request.setRoomId(data.roomId);
  }
  // Map string to SessionType enum number
  const sessionTypeEnum = data.durationType === 'focus' ? 1 : data.durationType === 'short_break' ? 2 : 3;
  request.setSessionType(sessionTypeEnum);
  if (data.taskDescription) {
    request.setTaskDescription(data.taskDescription);
  }

  return new Promise((resolve, reject) => {
    client.startFocusSession(request, getAuthMetadata(), (err: RpcError | null, response: PbFocusSession | null) => {
      if (err) {
        console.error('Failed to start session:', err);
        reject(err);
      } else if (response) {
        resolve(mapSessionFromPb(response));
      } else {
        reject(new Error('No response from server'));
      }
    });
  });
}

/**
 * End a focus session
 */
export async function endSession(sessionId: string): Promise<SessionStats> {
  const client = getFocusRoomServiceClient();
  const request = new EndSessionRequest();
  request.setSessionId(sessionId);

  return new Promise((resolve, reject) => {
    client.endFocusSession(request, getAuthMetadata(), (err: RpcError | null, response: PbSessionStats | null) => {
      if (err) {
        console.error('Failed to end session:', err);
        reject(err);
      } else if (response) {
        resolve({
          sessionId: sessionId,
          totalDuration: response.getDurationSeconds(),
          tasksCompleted: response.getTotalSessionsToday(),
          streakUpdated: response.getStreakContinued(),
        });
      } else {
        reject(new Error('No response from server'));
      }
    });
  });
}

/**
 * Get active session for current user
 */
export async function getActiveSession(): Promise<FocusSession | null> {
  const client = getFocusRoomServiceClient();
  const request = new GetActiveSessionRequest();

  return new Promise((resolve, reject) => {
    client.getActiveSession(request, getAuthMetadata(), (err: RpcError | null, response: PbFocusSession | null) => {
      if (err) {
        // No active session is not an error
        if (err.code === 5) { // NOT_FOUND
          resolve(null);
        } else {
          console.error('Failed to get active session:', err);
          reject(err);
        }
      } else if (response) {
        resolve(mapSessionFromPb(response));
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Get user's current streak
 */
export async function getStreak(): Promise<StreakInfo> {
  const client = getFocusRoomServiceClient();
  const request = new GetStreakRequest();

  return new Promise((resolve, reject) => {
    client.getStreak(request, getAuthMetadata(), (err: RpcError | null, response: PbStreakInfo | null) => {
      if (err) {
        console.error('Failed to get streak:', err);
        reject(err);
      } else if (response) {
        resolve(mapStreakFromPb(response));
      } else {
        reject(new Error('No response from server'));
      }
    });
  });
}

// Export service object for consistency
export const FocusRoomService = {
  createRoom,
  getRoom,
  listRooms,
  joinRoom,
  leaveRoom,
  startSession,
  endSession,
  getActiveSession,
  getStreak,
};

export default FocusRoomService;


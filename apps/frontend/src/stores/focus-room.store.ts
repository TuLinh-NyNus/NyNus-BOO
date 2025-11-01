/**
 * Focus Room Store - Zustand State Management
 * Manages current room state, participants, messages, WebSocket connection
 */

import { create } from 'zustand';

export interface FocusRoomParticipant {
  user_id: string;
  status: 'online' | 'focusing' | 'away';
  current_task?: string;
}

export interface FocusRoomMessage {
  user_id: string;
  username?: string;
  message: string;
  timestamp: number;
}

interface FocusRoomState {
  // State
  currentRoomId: string | null;
  participants: FocusRoomParticipant[];
  messages: FocusRoomMessage[];
  wsConnected: boolean;

  // Actions
  setCurrentRoom: (roomId: string) => void;
  clearCurrentRoom: () => void;
  setParticipants: (participants: FocusRoomParticipant[]) => void;
  addMessage: (message: FocusRoomMessage) => void;
  clearMessages: () => void;
  setWsConnected: (connected: boolean) => void;
  updateParticipantStatus: (userId: string, status: 'online' | 'focusing' | 'away') => void;
}

export const useFocusRoomStore = create<FocusRoomState>((set) => ({
  // Initial State
  currentRoomId: null,
  participants: [],
  messages: [],
  wsConnected: false,

  // Actions
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),
  
  clearCurrentRoom: () => set({
    currentRoomId: null,
    participants: [],
    messages: [],
  }),

  setParticipants: (participants) => set({ participants }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  clearMessages: () => set({ messages: [] }),

  setWsConnected: (connected) => set({ wsConnected: connected }),

  updateParticipantStatus: (userId, status) => set((state) => ({
    participants: state.participants.map(p =>
      p.user_id === userId ? { ...p, status } : p
    ),
  })),
}));


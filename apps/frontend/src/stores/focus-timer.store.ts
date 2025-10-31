/**
 * Focus Timer Store (Zustand)
 * Global state management cho Pomodoro Timer
 * Persist settings vào localStorage
 * 
 * @author NyNus Development Team
 * @created 2025-01-30
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimerMode, TimerState, TimerActions, TimerSettings, TimerDurations } from "@/types/focus-timer";

// Default durations (seconds)
const DEFAULT_DURATIONS: TimerDurations = {
  focus: 25 * 60,        // 25 phút
  shortBreak: 5 * 60,    // 5 phút
  longBreak: 15 * 60,    // 15 phút
};

const DEFAULT_SETTINGS: TimerSettings = {
  autoStartBreak: false,
  enableNotifications: true,
  enableSound: true,
  soundVolume: 70,
};

interface TimerStore extends TimerState, TimerActions {
  // Settings
  settings: TimerSettings;
  updateSettings: (settings: Partial<TimerSettings>) => void;
}

export const useFocusTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // === Initial State ===
      currentTime: DEFAULT_DURATIONS.focus,
      mode: "focus",
      isRunning: false,
      isPaused: false,
      sessionId: null,
      currentTask: "",
      durations: DEFAULT_DURATIONS,
      settings: DEFAULT_SETTINGS,

      // === Actions ===
      
      /**
       * Bắt đầu timer với session ID
       */
      start: (sessionId: string) => {
        set({
          isRunning: true,
          isPaused: false,
          sessionId,
        });
      },

      /**
       * Pause timer (không stop session)
       */
      pause: () => {
        set({ isPaused: true, isRunning: false });
      },

      /**
       * Resume timer từ pause
       */
      resume: () => {
        set({ isPaused: false, isRunning: true });
      },

      /**
       * Stop timer hoàn toàn (clear session)
       */
      stop: () => {
        set({
          isRunning: false,
          isPaused: false,
          sessionId: null,
        });
      },

      /**
       * Reset về thời gian mặc định của mode hiện tại
       */
      reset: () => {
        const { mode, durations } = get();
        set({
          currentTime: durations[mode],
          isRunning: false,
          isPaused: false,
          sessionId: null,
        });
      },

      /**
       * Chuyển mode (focus/shortBreak/longBreak)
       */
      switchMode: (mode: TimerMode) => {
        const { durations } = get();
        set({
          mode,
          currentTime: durations[mode],
          isRunning: false,
          isPaused: false,
          sessionId: null,
        });
      },

      /**
       * Giảm 1 giây (gọi mỗi giây khi timer chạy)
       */
      tick: () => {
        const { currentTime, isRunning } = get();
        if (isRunning && currentTime > 0) {
          set({ currentTime: currentTime - 1 });
        }
      },

      /**
       * Set task description
       */
      setTask: (task: string) => {
        set({ currentTask: task });
      },

      /**
       * Set custom durations
       */
      setDurations: (newDurations: Partial<TimerDurations>) => {
        const { durations, mode } = get();
        const updated = { ...durations, ...newDurations };
        set({
          durations: updated,
          currentTime: updated[mode], // Update current time nếu đang ở mode đó
        });
      },

      /**
       * Update settings
       */
      updateSettings: (newSettings: Partial<TimerSettings>) => {
        const { settings } = get();
        set({ settings: { ...settings, ...newSettings } });
      },
    }),
    {
      name: "focus-timer-storage", // localStorage key
      partialize: (state) => ({
        // Chỉ persist settings và durations
        durations: state.durations,
        settings: state.settings,
      }),
    }
  )
);


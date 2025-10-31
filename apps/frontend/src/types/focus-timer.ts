/**
 * Focus Timer Types
 * Type definitions cho Focus Room Timer system
 * 
 * @author NyNus Development Team
 * @created 2025-01-30
 */

export type TimerMode = "focus" | "shortBreak" | "longBreak";

export interface TimerDurations {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

export interface TimerState {
  // Thời gian hiện tại (seconds)
  currentTime: number;
  
  // Chế độ timer
  mode: TimerMode;
  
  // Trạng thái chạy
  isRunning: boolean;
  
  // Trạng thái pause
  isPaused: boolean;
  
  // Session ID hiện tại (nếu có)
  sessionId: string | null;
  
  // Task đang làm
  currentTask: string;
  
  // Cấu hình thời gian
  durations: TimerDurations;
}

export interface TimerActions {
  // Bắt đầu timer
  start: (sessionId: string) => void;
  
  // Pause timer
  pause: () => void;
  
  // Resume timer
  resume: () => void;
  
  // Stop timer hoàn toàn
  stop: () => void;
  
  // Reset về thời gian mặc định
  reset: () => void;
  
  // Chuyển mode (focus/short/long)
  switchMode: (mode: TimerMode) => void;
  
  // Giảm thời gian (tick)
  tick: () => void;
  
  // Set task
  setTask: (task: string) => void;
  
  // Set custom durations
  setDurations: (durations: Partial<TimerDurations>) => void;
}

export interface TimerSettings {
  // Tự động chuyển sang break
  autoStartBreak: boolean;
  
  // Bật notification
  enableNotifications: boolean;
  
  // Bật sound
  enableSound: boolean;
  
  // Volume (0-100)
  soundVolume: number;
}


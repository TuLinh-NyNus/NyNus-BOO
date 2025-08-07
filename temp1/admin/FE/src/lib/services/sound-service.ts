/**
 * Sound Service for NyNus Admin Real-time Alerts
 * Service quản lý sound notifications cho admin dashboard
 *
 * Features:
 * - Play sound alerts cho security events
 * - Volume control và mute functionality
 * - Sound preloading cho better performance
 * - Browser compatibility checks
 *
 * @author NyNus Team
 * @version 1.0.0
 */

import { SOUND_CONFIG } from "../websocket/websocket-constants";

/**
 * Sound types cho different notification categories
 */
export type SoundType = "security-alert" | "notification" | "error" | "success";

/**
 * Sound configuration interface
 */
interface SoundSettings {
  enabled: boolean;
  volume: number;
  securityAlertsEnabled: boolean;
  generalNotificationsEnabled: boolean;
}

/**
 * Audio instance interface
 */
interface AudioInstance {
  audio: HTMLAudioElement;
  loaded: boolean;
  error?: string;
}

/**
 * Sound Service Class
 * Quản lý tất cả sound notifications trong admin dashboard
 */
class SoundService {
  private audioInstances: Map<SoundType, AudioInstance> = new Map();
  private settings: SoundSettings;
  private isSupported: boolean = false;

  constructor() {
    // Initialize settings từ localStorage hoặc defaults
    this.settings = this.loadSettings();

    // Check browser support cho audio
    this.isSupported = this.checkAudioSupport();

    if (this.isSupported && this.settings.enabled && process.env.NODE_ENV !== "development") {
      this.preloadSounds();
    }
  }

  /**
   * Check if browser supports audio playback
   */
  private checkAudioSupport(): boolean {
    try {
      return typeof Audio !== "undefined" && !!Audio;
    } catch (error) {
      console.warn("Audio not supported in this browser:", error);
      return false;
    }
  }

  /**
   * Load settings từ localStorage
   */
  private loadSettings(): SoundSettings {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      return {
        enabled: SOUND_CONFIG.ENABLED,
        volume: SOUND_CONFIG.VOLUME,
        securityAlertsEnabled: true,
        generalNotificationsEnabled: true,
      };
    }

    try {
      const saved = localStorage.getItem("nynus-admin-sound-settings");
      if (saved) {
        return { ...SOUND_CONFIG, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn("Failed to load sound settings:", error);
    }

    return {
      enabled: SOUND_CONFIG.ENABLED,
      volume: SOUND_CONFIG.VOLUME,
      securityAlertsEnabled: true,
      generalNotificationsEnabled: true,
    };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem("nynus-admin-sound-settings", JSON.stringify(this.settings));
    } catch (error) {
      console.warn("Failed to save sound settings:", error);
    }
  }

  /**
   * Preload all sound files
   */
  private preloadSounds(): void {
    const soundMappings: Record<SoundType, string> = {
      "security-alert": SOUND_CONFIG.SOUNDS.SECURITY_ALERT,
      notification: SOUND_CONFIG.SOUNDS.NOTIFICATION,
      error: SOUND_CONFIG.SOUNDS.ERROR,
      success: SOUND_CONFIG.SOUNDS.SUCCESS,
    };

    Object.entries(soundMappings).forEach(([type, url]) => {
      this.preloadSound(type as SoundType, url);
    });
  }

  /**
   * Preload individual sound file
   */
  private preloadSound(type: SoundType, url: string): void {
    try {
      const audio = new Audio();

      // Set audio properties
      audio.volume = this.settings.volume;
      audio.preload = "auto";

      // Set MIME type for better browser compatibility
      audio.setAttribute("type", "audio/mpeg");

      const instance: AudioInstance = {
        audio,
        loaded: false,
      };

      // Handle load success
      audio.addEventListener(
        "canplaythrough",
        () => {
          instance.loaded = true;
          if (process.env.NODE_ENV === "development") {
            console.log(`✅ Sound preloaded: ${type}`);
          }
        },
        { once: true }
      );

      // Handle load error with better error handling
      audio.addEventListener(
        "error",
        (e) => {
          instance.error = `Failed to load sound: ${url}`;

          // Only log in development to reduce console noise
          if (process.env.NODE_ENV === "development") {
            console.warn(`❌ Sound preload failed: ${type}`, {
              error: e,
              url,
              audioError: audio.error,
            });
          }

          // Mark as failed but don't throw
          instance.loaded = false;
        },
        { once: true }
      );

      // Set source after event listeners to ensure they're attached
      audio.src = url;

      this.audioInstances.set(type, instance);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Failed to preload sound ${type}:`, error);
      }
    }
  }

  /**
   * Play sound notification
   */
  public async playSound(type: SoundType): Promise<void> {
    if (!this.isSupported || !this.settings.enabled) {
      return;
    }

    // Check specific category settings
    if (type === "security-alert" && !this.settings.securityAlertsEnabled) {
      return;
    }

    if (type !== "security-alert" && !this.settings.generalNotificationsEnabled) {
      return;
    }

    const instance = this.audioInstances.get(type);
    if (!instance) {
      console.warn(`Sound not found: ${type}`);
      return;
    }

    if (instance.error) {
      console.warn(`Sound has error: ${instance.error}`);
      return;
    }

    try {
      // Reset audio to beginning
      instance.audio.currentTime = 0;
      instance.audio.volume = this.settings.volume;

      // Play sound
      await instance.audio.play();
      console.log(`🔊 Sound played: ${type}`);
    } catch (error) {
      console.warn(`Failed to play sound ${type}:`, error);
    }
  }

  /**
   * Play security alert sound
   */
  public async playSecurityAlert(): Promise<void> {
    return this.playSound("security-alert");
  }

  /**
   * Play general notification sound
   */
  public async playNotification(): Promise<void> {
    return this.playSound("notification");
  }

  /**
   * Play error sound
   */
  public async playError(): Promise<void> {
    return this.playSound("error");
  }

  /**
   * Play success sound
   */
  public async playSuccess(): Promise<void> {
    return this.playSound("success");
  }

  /**
   * Update sound settings
   */
  public updateSettings(newSettings: Partial<SoundSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // Update volume cho all audio instances
    if (newSettings.volume !== undefined) {
      this.audioInstances.forEach((instance) => {
        instance.audio.volume = this.settings.volume;
      });
    }

    // Reload sounds if enabled status changed
    if (newSettings.enabled !== undefined) {
      if (newSettings.enabled && this.isSupported && process.env.NODE_ENV !== "development") {
        this.preloadSounds();
      }
    }
  }

  /**
   * Get current settings
   */
  public getSettings(): SoundSettings {
    return { ...this.settings };
  }

  /**
   * Enable/disable all sounds
   */
  public setEnabled(enabled: boolean): void {
    this.updateSettings({ enabled });
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.updateSettings({ volume: clampedVolume });
  }

  /**
   * Enable/disable security alerts
   */
  public setSecurityAlertsEnabled(enabled: boolean): void {
    this.updateSettings({ securityAlertsEnabled: enabled });
  }

  /**
   * Enable/disable general notifications
   */
  public setGeneralNotificationsEnabled(enabled: boolean): void {
    this.updateSettings({ generalNotificationsEnabled: enabled });
  }

  /**
   * Test sound playback
   */
  public async testSound(type: SoundType = "notification"): Promise<boolean> {
    try {
      await this.playSound(type);
      return true;
    } catch (error) {
      console.error("Sound test failed:", error);
      return false;
    }
  }

  /**
   * Get audio support status
   */
  public isAudioSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get sound loading status
   */
  public getSoundStatus(): Record<SoundType, { loaded: boolean; error?: string }> {
    const status: Record<SoundType, { loaded: boolean; error?: string }> = {} as any;

    this.audioInstances.forEach((instance, type) => {
      status[type] = {
        loaded: instance.loaded,
        error: instance.error,
      };
    });

    return status;
  }
}

// Create singleton instance
export const soundService = new SoundService();

// Export types
export type { SoundSettings };

/**
 * SoundManager - Singleton Audio Manager cho Focus Room
 * 
 * Features:
 * - Load and cache Audio elements
 * - Play/pause/stop multiple sounds simultaneously
 * - Individual volume control per sound
 * - Global volume control
 * - Fade in/out transitions
 * - Seamless looping
 * - Error handling
 * 
 * Usage:
 * ```ts
 * const manager = SoundManager.getInstance();
 * await manager.loadSound('rain', '/sounds/ambient/rain.mp3');
 * manager.play('rain', 0.7);
 * manager.setVolume('rain', 0.5);
 * manager.stop('rain');
 * ```
 */

export interface Sound {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  category: 'nature' | 'noise' | 'ambient' | 'study';
  audioUrl: string;
  duration: number;
  defaultVolume: number;
  loop: boolean;
  description: string;
  tags: string[];
}

export interface SoundPreset {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  sounds: Array<{
    id: string;
    volume: number;
  }>;
}

export interface SoundsConfig {
  version: string;
  sounds: Sound[];
  presets: SoundPreset[];
  notification: {
    id: string;
    name: string;
    nameVi: string;
    audioUrl: string;
    volume: number;
    loop: false;
    description: string;
  };
}

interface AudioElement {
  audio: HTMLAudioElement;
  volume: number;
  isPlaying: boolean;
  fadeInterval?: NodeJS.Timeout;
}

export class SoundManager {
  private static instance: SoundManager;
  private audioElements: Map<string, AudioElement> = new Map();
  private globalVolume: number = 1.0;
  private sounds: Map<string, Sound> = new Map();
  private config: SoundsConfig | null = null;

  private constructor() {
    // Private constructor for Singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Load sounds configuration từ sounds.json
   */
  public async loadConfig(): Promise<SoundsConfig> {
    try {
      const response = await fetch('/sounds/sounds.json');
      if (!response.ok) {
        throw new Error(`Failed to load sounds config: ${response.statusText}`);
      }
      const config: SoundsConfig = await response.json();
      this.config = config;
      
      // Cache sound definitions
      config.sounds.forEach(sound => {
        this.sounds.set(sound.id, sound);
      });

      return config;
    } catch (error) {
      console.error('[SoundManager] Failed to load config:', error);
      throw error;
    }
  }

  /**
   * Get all available sounds
   */
  public getSounds(): Sound[] {
    return Array.from(this.sounds.values());
  }

  /**
   * Get sound by ID
   */
  public getSound(soundId: string): Sound | undefined {
    return this.sounds.get(soundId);
  }

  /**
   * Get all presets
   */
  public getPresets(): SoundPreset[] {
    return this.config?.presets || [];
  }

  /**
   * Load sound file (lazy loading)
   */
  public async loadSound(soundId: string, url?: string): Promise<void> {
    // Nếu đã load rồi thì skip
    if (this.audioElements.has(soundId)) {
      return;
    }

    const sound = this.sounds.get(soundId);
    const audioUrl = url || sound?.audioUrl;

    if (!audioUrl) {
      throw new Error(`Sound URL not found for: ${soundId}`);
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = audioUrl;
      audio.loop = sound?.loop ?? true;
      audio.preload = 'auto';

      // Event listeners
      audio.addEventListener('canplaythrough', () => {
        this.audioElements.set(soundId, {
          audio,
          volume: sound?.defaultVolume ?? 0.5,
          isPlaying: false,
        });
        resolve();
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.error(`[SoundManager] Failed to load sound: ${soundId}`, e);
        reject(new Error(`Failed to load sound: ${soundId}`));
      }, { once: true });

      // Start loading
      audio.load();
    });
  }

  /**
   * Play sound
   */
  public async play(soundId: string, volume?: number): Promise<void> {
    try {
      // Load sound nếu chưa có
      if (!this.audioElements.has(soundId)) {
        await this.loadSound(soundId);
      }

      const element = this.audioElements.get(soundId);
      if (!element) {
        throw new Error(`Sound element not found: ${soundId}`);
      }

      // Set volume
      if (volume !== undefined) {
        element.volume = volume;
      }
      
      // Apply global volume
      element.audio.volume = element.volume * this.globalVolume;

      // Play from start
      element.audio.currentTime = 0;
      await element.audio.play();
      element.isPlaying = true;

      // Fade in (300ms)
      this.fadeIn(soundId, 300);

    } catch (error) {
      console.error(`[SoundManager] Failed to play sound: ${soundId}`, error);
      throw error;
    }
  }

  /**
   * Pause sound
   */
  public pause(soundId: string): void {
    const element = this.audioElements.get(soundId);
    if (element && element.isPlaying) {
      element.audio.pause();
      element.isPlaying = false;
    }
  }

  /**
   * Stop sound với fade out
   */
  public stop(soundId: string, fadeDuration: number = 500): void {
    const element = this.audioElements.get(soundId);
    if (element && element.isPlaying) {
      this.fadeOut(soundId, fadeDuration, () => {
        element.audio.pause();
        element.audio.currentTime = 0;
        element.isPlaying = false;
      });
    }
  }

  /**
   * Stop all sounds
   */
  public stopAll(fadeDuration: number = 500): void {
    this.audioElements.forEach((_, soundId) => {
      this.stop(soundId, fadeDuration);
    });
  }

  /**
   * Set volume cho một sound cụ thể (0-1)
   */
  public setVolume(soundId: string, volume: number): void {
    const element = this.audioElements.get(soundId);
    if (element) {
      // Clamp volume between 0 and 1
      element.volume = Math.max(0, Math.min(1, volume));
      
      // Apply global volume
      element.audio.volume = element.volume * this.globalVolume;
    }
  }

  /**
   * Set global volume (0-1)
   */
  public setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    
    // Update all playing sounds
    this.audioElements.forEach(element => {
      element.audio.volume = element.volume * this.globalVolume;
    });
  }

  /**
   * Get global volume
   */
  public getGlobalVolume(): number {
    return this.globalVolume;
  }

  /**
   * Check if sound is playing
   */
  public isPlaying(soundId: string): boolean {
    const element = this.audioElements.get(soundId);
    return element?.isPlaying ?? false;
  }

  /**
   * Get current volume của sound
   */
  public getVolume(soundId: string): number {
    const element = this.audioElements.get(soundId);
    return element?.volume ?? 0;
  }

  /**
   * Fade in effect
   */
  private fadeIn(soundId: string, duration: number): void {
    const element = this.audioElements.get(soundId);
    if (!element) return;

    // Clear existing fade interval
    if (element.fadeInterval) {
      clearInterval(element.fadeInterval);
    }

    const targetVolume = element.volume * this.globalVolume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeIncrement = targetVolume / steps;
    
    let currentVolume = 0;
    element.audio.volume = 0;

    element.fadeInterval = setInterval(() => {
      currentVolume += volumeIncrement;
      
      if (currentVolume >= targetVolume) {
        element.audio.volume = targetVolume;
        if (element.fadeInterval) {
          clearInterval(element.fadeInterval);
        }
      } else {
        element.audio.volume = currentVolume;
      }
    }, stepDuration);
  }

  /**
   * Fade out effect
   */
  private fadeOut(soundId: string, duration: number, callback?: () => void): void {
    const element = this.audioElements.get(soundId);
    if (!element) return;

    // Clear existing fade interval
    if (element.fadeInterval) {
      clearInterval(element.fadeInterval);
    }

    const startVolume = element.audio.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeDecrement = startVolume / steps;
    
    let currentVolume = startVolume;

    element.fadeInterval = setInterval(() => {
      currentVolume -= volumeDecrement;
      
      if (currentVolume <= 0) {
        element.audio.volume = 0;
        if (element.fadeInterval) {
          clearInterval(element.fadeInterval);
        }
        if (callback) {
          callback();
        }
      } else {
        element.audio.volume = currentVolume;
      }
    }, stepDuration);
  }

  /**
   * Play notification sound (không loop)
   */
  public async playNotification(): Promise<void> {
    const notificationConfig = this.config?.notification;
    if (!notificationConfig) {
      console.warn('[SoundManager] Notification config not found');
      return;
    }

    const audio = new Audio(notificationConfig.audioUrl);
    audio.volume = notificationConfig.volume * this.globalVolume;
    audio.loop = false;

    try {
      await audio.play();
    } catch (error) {
      console.error('[SoundManager] Failed to play notification:', error);
    }
  }

  /**
   * Load preset
   */
  public async loadPreset(presetId: string): Promise<void> {
    const preset = this.config?.presets.find(p => p.id === presetId);
    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`);
    }

    // Stop all current sounds
    this.stopAll(300);

    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 400));

    // Load and play preset sounds
    for (const sound of preset.sounds) {
      await this.play(sound.id, sound.volume);
    }
  }

  /**
   * Cleanup all audio elements
   */
  public cleanup(): void {
    this.stopAll(0);
    this.audioElements.forEach(element => {
      if (element.fadeInterval) {
        clearInterval(element.fadeInterval);
      }
      element.audio.pause();
      element.audio.src = '';
    });
    this.audioElements.clear();
  }

  /**
   * Get active sounds (currently playing)
   */
  public getActiveSounds(): string[] {
    const active: string[] = [];
    this.audioElements.forEach((element, soundId) => {
      if (element.isPlaying) {
        active.push(soundId);
      }
    });
    return active;
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();


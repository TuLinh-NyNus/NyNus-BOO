/**
 * Sound Mixer Store - Zustand State Management
 * 
 * Manages:
 * - Active sounds và volumes
 * - Global volume & mute state
 * - Preset management
 * - LocalStorage persistence
 * 
 * Integration với SoundManager singleton
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundManager, type Sound, type SoundPreset } from '@/lib/audio/SoundManager';

export interface ActiveSound {
  id: string;
  volume: number; // 0-1
  isPlaying: boolean;
}

interface SoundMixerState {
  // State
  activeSounds: Map<string, ActiveSound>;
  globalVolume: number; // 0-1
  isMuted: boolean;
  isLoading: boolean;
  availableSounds: Sound[];
  presets: SoundPreset[];
  currentPreset: string | null;

  // Actions
  initialize: () => Promise<void>;
  playSound: (soundId: string, volume?: number) => Promise<void>;
  stopSound: (soundId: string) => void;
  pauseSound: (soundId: string) => void;
  resumeSound: (soundId: string) => Promise<void>;
  setVolume: (soundId: string, volume: number) => void;
  setGlobalVolume: (volume: number) => void;
  muteAll: () => void;
  unmuteAll: () => void;
  toggleMute: () => void;
  stopAll: () => void;
  loadPreset: (presetId: string) => Promise<void>;
  saveCustomPreset: (name: string) => void;
  isPlaying: (soundId: string) => boolean;
  cleanup: () => void;
}

export const useSoundMixerStore = create<SoundMixerState>()(
  persist(
    (set, get) => ({
      // Initial State
      activeSounds: new Map(),
      globalVolume: 0.7,
      isMuted: false,
      isLoading: false,
      availableSounds: [],
      presets: [],
      currentPreset: null,

      // Initialize: Load config and sounds
      initialize: async () => {
        set({ isLoading: true });
        try {
          const config = await soundManager.loadConfig();
          set({
            availableSounds: config.sounds,
            presets: config.presets,
            isLoading: false,
          });

          // Restore global volume from storage
          const { globalVolume } = get();
          soundManager.setGlobalVolume(globalVolume);
        } catch (error) {
          console.error('[SoundMixerStore] Failed to initialize:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Play sound
      playSound: async (soundId: string, volume?: number) => {
        const { activeSounds } = get();
        
        try {
          // Determine volume
          const finalVolume = volume !== undefined ? volume : 
            (activeSounds.get(soundId)?.volume ?? 
              get().availableSounds.find(s => s.id === soundId)?.defaultVolume ?? 0.5);

          // Play via SoundManager
          await soundManager.play(soundId, finalVolume);

          // Update state
          const newActiveSounds = new Map(activeSounds);
          newActiveSounds.set(soundId, {
            id: soundId,
            volume: finalVolume,
            isPlaying: true,
          });

          set({ 
            activeSounds: newActiveSounds,
            currentPreset: null, // Clear preset when manually playing
          });
        } catch (error) {
          console.error(`[SoundMixerStore] Failed to play sound: ${soundId}`, error);
        }
      },

      // Stop sound with fade out
      stopSound: (soundId: string) => {
        const { activeSounds } = get();
        
        soundManager.stop(soundId);

        // Update state
        const newActiveSounds = new Map(activeSounds);
        newActiveSounds.delete(soundId);
        set({ activeSounds: newActiveSounds });
      },

      // Pause sound (without fade)
      pauseSound: (soundId: string) => {
        const { activeSounds } = get();
        
        soundManager.pause(soundId);

        // Update state
        const newActiveSounds = new Map(activeSounds);
        const sound = newActiveSounds.get(soundId);
        if (sound) {
          sound.isPlaying = false;
          set({ activeSounds: newActiveSounds });
        }
      },

      // Resume sound
      resumeSound: async (soundId: string) => {
        await get().playSound(soundId);
      },

      // Set volume for specific sound
      setVolume: (soundId: string, volume: number) => {
        const { activeSounds } = get();
        
        // Clamp volume
        const clampedVolume = Math.max(0, Math.min(1, volume));
        
        soundManager.setVolume(soundId, clampedVolume);

        // Update state
        const newActiveSounds = new Map(activeSounds);
        const sound = newActiveSounds.get(soundId);
        if (sound) {
          sound.volume = clampedVolume;
          set({ activeSounds: newActiveSounds });
        }
      },

      // Set global volume
      setGlobalVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        soundManager.setGlobalVolume(clampedVolume);
        set({ globalVolume: clampedVolume });
      },

      // Mute all sounds
      muteAll: () => {
        soundManager.setGlobalVolume(0);
        set({ isMuted: true });
      },

      // Unmute all sounds
      unmuteAll: () => {
        const { globalVolume } = get();
        soundManager.setGlobalVolume(globalVolume);
        set({ isMuted: false });
      },

      // Toggle mute
      toggleMute: () => {
        const { isMuted } = get();
        if (isMuted) {
          get().unmuteAll();
        } else {
          get().muteAll();
        }
      },

      // Stop all sounds
      stopAll: () => {
        soundManager.stopAll();
        set({ activeSounds: new Map(), currentPreset: null });
      },

      // Load preset
      loadPreset: async (presetId: string) => {
        set({ isLoading: true });
        
        try {
          // Stop all current sounds
          get().stopAll();

          // Wait a bit for cleanup
          await new Promise(resolve => setTimeout(resolve, 400));

          // Load preset via SoundManager
          await soundManager.loadPreset(presetId);

          // Update state with preset sounds
          const preset = get().presets.find(p => p.id === presetId);
          if (preset) {
            const newActiveSounds = new Map<string, ActiveSound>();
            preset.sounds.forEach(sound => {
              newActiveSounds.set(sound.id, {
                id: sound.id,
                volume: sound.volume,
                isPlaying: true,
              });
            });

            set({
              activeSounds: newActiveSounds,
              currentPreset: presetId,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error(`[SoundMixerStore] Failed to load preset: ${presetId}`, error);
          set({ isLoading: false });
        }
      },

      // Save custom preset
      saveCustomPreset: (name: string) => {
        const { activeSounds, presets } = get();
        
        // Create preset from current active sounds
        const customPreset: SoundPreset = {
          id: `custom-${Date.now()}`,
          name: name,
          nameVi: name,
          description: 'Custom mix',
          sounds: Array.from(activeSounds.values()).map(sound => ({
            id: sound.id,
            volume: sound.volume,
          })),
        };

        // Add to presets
        const newPresets = [...presets, customPreset];
        set({ presets: newPresets });

        // TODO: Save to backend API (future enhancement)
      },

      // Check if sound is playing
      isPlaying: (soundId: string) => {
        return get().activeSounds.get(soundId)?.isPlaying ?? false;
      },

      // Cleanup
      cleanup: () => {
        soundManager.cleanup();
        set({ 
          activeSounds: new Map(),
          currentPreset: null,
        });
      },
    }),
    {
      name: 'sound-mixer-storage',
      // Custom storage để handle Map
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const parsed = JSON.parse(str);
          
          // Convert activeSounds từ array về Map
          if (parsed.state && parsed.state.activeSounds) {
            parsed.state.activeSounds = new Map(parsed.state.activeSounds);
          }
          
          return parsed;
        },
        setItem: (name, value) => {
          // Convert activeSounds từ Map sang array
          const toStore = {
            ...value,
            state: {
              ...value.state,
              activeSounds: Array.from(value.state.activeSounds.entries()),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      // Only persist these fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      partialize: (state) =>
        ({
          globalVolume: state.globalVolume,
          isMuted: state.isMuted,
          currentPreset: state.currentPreset,
          activeSounds: state.activeSounds,
        } as any),
    }
  )
);

// Export helper hooks
export const useActiveSounds = () => useSoundMixerStore((state) => state.activeSounds);
export const useGlobalVolume = () => useSoundMixerStore((state) => state.globalVolume);
export const useIsMuted = () => useSoundMixerStore((state) => state.isMuted);
export const useAvailableSounds = () => useSoundMixerStore((state) => state.availableSounds);
export const usePresets = () => useSoundMixerStore((state) => state.presets);
export const useCurrentPreset = () => useSoundMixerStore((state) => state.currentPreset);


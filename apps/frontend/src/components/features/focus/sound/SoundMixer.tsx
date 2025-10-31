"use client";

/**
 * SoundMixer Component - Ambient Sound Mixer cho Focus Room
 * 
 * Features:
 * - Grid display 15 ambient sounds
 * - Individual volume control per sound
 * - Global volume & mute
 * - Preset management
 * - Collapsible panel
 * - Responsive design
 */

import { useEffect, useState } from "react";
import { Volume2, VolumeX, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/form/slider";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSoundMixerStore } from "@/stores/sound-mixer.store";
import type { Sound } from "@/lib/audio/SoundManager";

export function SoundMixer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const {
    activeSounds,
    globalVolume,
    isMuted,
    isLoading,
    availableSounds,
    presets,
    currentPreset,
    initialize,
    playSound,
    stopSound,
    setVolume,
    setGlobalVolume,
    toggleMute,
    stopAll,
    loadPreset,
    isPlaying,
  } = useSoundMixerStore();

  // Initialize on mount
  useEffect(() => {
    if (!initialized) {
      initialize().then(() => setInitialized(true)).catch(console.error);
    }
  }, [initialized, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't cleanup sounds on component unmount
      // User might want sounds to continue playing
    };
  }, []);

  const handleToggleSound = async (sound: Sound) => {
    const playing = isPlaying(sound.id);
    if (playing) {
      stopSound(sound.id);
    } else {
      await playSound(sound.id);
    }
  };

  const handleVolumeChange = (soundId: string, value: number[]) => {
    setVolume(soundId, value[0] / 100);
  };

  const handleGlobalVolumeChange = (value: number[]) => {
    setGlobalVolume(value[0] / 100);
  };

  const handlePresetChange = async (presetId: string) => {
    if (presetId === "none") {
      stopAll();
    } else {
      await loadPreset(presetId);
    }
  };

  if (!initialized || isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Đang tải âm thanh...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Volume2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Âm Thanh Môi Trường</h3>
            <p className="text-xs text-muted-foreground">
              {Array.from(activeSounds.values()).filter(s => s.isPlaying).length} đang phát
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          {/* Expand/Collapse button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Thu gọn" : "Mở rộng"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4 border-t p-4">
          {/* Global Controls */}
          <div className="space-y-3">
            {/* Preset Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preset</label>
              <Select
                value={currentPreset || "none"}
                onValueChange={handlePresetChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Không preset --</SelectItem>
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.nameVi || preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Global Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Âm lượng chung</label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(globalVolume * 100)}%
                </span>
              </div>
              <Slider
                value={[globalVolume * 100]}
                onValueChange={handleGlobalVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Stop All button */}
            {Array.from(activeSounds.values()).some(s => s.isPlaying) && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopAll}
                className="w-full"
              >
                Dừng tất cả
              </Button>
            )}
          </div>

          {/* Sounds Grid */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Âm thanh ({availableSounds.length})</label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {availableSounds.map((sound) => {
                const playing = isPlaying(sound.id);
                const activeSound = activeSounds.get(sound.id);
                const volume = activeSound?.volume ?? sound.defaultVolume;

                return (
                  <div
                    key={sound.id}
                    className={`group relative rounded-lg border p-3 transition-colors ${
                      playing
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {/* Sound info */}
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 text-2xl">{sound.emoji}</div>
                        <h4 className="text-sm font-medium leading-tight">
                          {sound.name}
                        </h4>
                      </div>
                      
                      {/* Play/Pause button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleSound(sound)}
                      >
                        {playing ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Volume slider - only show when playing */}
                    {playing && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Âm lượng
                          </span>
                          <span className="text-xs font-medium">
                            {Math.round(volume * 100)}%
                          </span>
                        </div>
                        <Slider
                          value={[volume * 100]}
                          onValueChange={(value: number[]) => handleVolumeChange(sound.id, value)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help text */}
          <p className="text-center text-xs text-muted-foreground">
            💡 Bạn có thể phát nhiều âm thanh cùng lúc để tạo không gian học tập riêng
          </p>
        </div>
      )}
    </Card>
  );
}


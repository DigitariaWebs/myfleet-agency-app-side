import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import {
  Maximize,
  Pause,
  Play,
  RefreshCw,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAYER_HEIGHT = SCREEN_WIDTH * 0.65;

interface VideoPlayerProps {
  source: ReturnType<typeof require>;
  posterSource?: ReturnType<typeof require>;
}

/**
 * Video player for vehicle interior walkthroughs.
 *
 * Install expo-video to enable real playback:
 *   npx expo install expo-video
 *
 * Until then, renders a styled placeholder with simulated controls.
 */
export function VideoPlayer({ source: _source, posterSource: _poster }: VideoPlayerProps) {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const togglePlay = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        // Simulate progress
        progressInterval.current = setInterval(() => {
          setProgress((p) => {
            if (p >= 1) {
              if (progressInterval.current) clearInterval(progressInterval.current);
              setIsPlaying(false);
              return 0;
            }
            return p + 0.005;
          });
        }, 100);
      } else {
        if (progressInterval.current) clearInterval(progressInterval.current);
      }
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted((m) => !m);
  }, []);

  const toggleControls = useCallback(() => {
    setShowControls((s) => !s);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  if (hasError) {
    return (
      <View
        style={{
          width: '100%',
          height: PLAYER_HEIGHT,
          backgroundColor: theme.surfaceTertiary,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RefreshCw size={32} color={theme.textTertiary} />
        <Text variant="titleMedium" color={theme.textTertiary} className="mt-3">
          Video unavailable
        </Text>
        <Pressable
          onPress={handleRetry}
          className="mt-3 px-5 py-2 rounded-full"
          style={{ backgroundColor: theme.accentSoft }}
        >
          <Text variant="titleSmall" color={theme.accent}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable onPress={toggleControls}>
      <View
        style={{
          width: '100%',
          height: PLAYER_HEIGHT,
          backgroundColor: '#1A1A2E',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Video area — replace with expo-video VideoView once installed */}
        <View className="flex-1 items-center justify-center">
          <Pressable onPress={togglePlay}>
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.accent }}
            >
              {isPlaying ? (
                <Pause size={28} color="#FFFFFF" />
              ) : (
                <Play size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
              )}
            </View>
          </Pressable>
          <Text variant="bodySmall" color="rgba(255,255,255,0.6)" className="mt-3">
            Interior Walkthrough
          </Text>
        </View>

        {/* Controls overlay */}
        {showControls && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="absolute bottom-0 left-0 right-0 px-4 pb-4"
          >
            {/* Progress bar */}
            <View
              style={{
                height: 3,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 1.5,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  height: 3,
                  width: `${progress * 100}%`,
                  backgroundColor: theme.accent,
                  borderRadius: 1.5,
                }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              {/* Play/Pause */}
              <Pressable
                onPress={togglePlay}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                {isPlaying ? (
                  <Pause size={18} color="#FFFFFF" />
                ) : (
                  <Play size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
                )}
              </Pressable>

              <View className="flex-row gap-2">
                {/* Mute toggle */}
                <Pressable
                  onPress={toggleMute}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                >
                  {isMuted ? (
                    <VolumeX size={18} color="#FFFFFF" />
                  ) : (
                    <Volume2 size={18} color="#FFFFFF" />
                  )}
                </Pressable>

                {/* Fullscreen */}
                <Pressable
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                >
                  <Maximize size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
}

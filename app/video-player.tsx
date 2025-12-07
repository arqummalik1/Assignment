import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium Control Button Component
const PremiumControlButton = ({ 
  onPress, 
  icon, 
  label, 
  variant = 'primary',
  size = 'medium' 
}: { 
  onPress: () => void; 
  icon: 'gobackward.10' | 'goforward.10' | 'pause.fill' | 'play.fill' | 'speaker.wave.2.fill' | 'speaker.slash.fill' | 'arrow.up.left.and.arrow.down.right' | 'arrow.down.right.and.arrow.up.left' | 'xmark'; 
  label?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const variantStyles = {
    primary: {
      backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
      iconColor: isDark ? '#FFFFFF' : '#000000',
      borderColor: isDark ? '#38383A' : '#E5E5EA',
    },
    secondary: {
      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
      iconColor: isDark ? '#FFFFFF' : '#007AFF',
      borderColor: isDark ? '#48484A' : '#C7C7CC',
    },
    accent: {
      backgroundColor: '#007AFF',
      iconColor: '#FFFFFF',
      borderColor: '#0051D5',
    },
  };

  const sizeStyles = {
    small: { width: 44, height: 44, iconSize: 18 },
    medium: { width: 56, height: 56, iconSize: 24 },
    large: { width: 72, height: 72, iconSize: 32 },
  };

  const style = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.premiumButton,
        {
          width: sizeStyle.width,
          height: sizeStyle.height,
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <IconSymbol name={icon as any} size={sizeStyle.iconSize} color={style.iconColor} />
      {label && (
        <ThemedText style={[styles.buttonLabel, { color: style.iconColor }]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
};

export default function VideoPlayerScreen() {
  const videoRef = useRef<Video>(null);
  const router = useRouter();
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // HLS video URL
  const videoUri = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  // Handle playback status update
  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
  };

  // Play function
  const handlePlay = async () => {
    try {
      await videoRef.current?.playAsync();
    } catch (error) {
      console.error('Error playing video:', error);
    }
  };

  // Pause function
  const handlePause = async () => {
    try {
      await videoRef.current?.pauseAsync();
    } catch (error) {
      console.error('Error pausing video:', error);
    }
  };

  // Seek function
  const handleSeek = async (seconds: number) => {
    try {
      if (status && 'positionMillis' in status) {
        const newPosition = status.positionMillis + seconds * 1000;
        await videoRef.current?.setPositionAsync(newPosition);
      }
    } catch (error) {
      console.error('Error seeking video:', error);
    }
  };

  // Toggle mute
  const handleToggleMute = async () => {
    try {
      await videoRef.current?.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  // Toggle fullscreen
  const handleToggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await videoRef.current?.presentFullscreenPlayer();
      } else {
        await videoRef.current?.dismissFullscreenPlayer();
      }
      setIsFullscreen(!isFullscreen);
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Get current position for display
  const getCurrentTime = () => {
    if (status && 'positionMillis' in status) {
      const seconds = Math.floor(status.positionMillis / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return '0:00';
  };

  // Get duration for display
  const getDuration = () => {
    if (status && 'durationMillis' in status && status.durationMillis) {
      const seconds = Math.floor(status.durationMillis / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return '0:00';
  };

  // Get progress percentage
  const getProgress = () => {
    if (status && 'positionMillis' in status && 'durationMillis' in status && status.durationMillis) {
      return (status.positionMillis / status.durationMillis) * 100;
    }
    return 0;
  };

  // Check if video is playing
  const isPlaying = status && 'isPlaying' in status && status.isPlaying;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Video Player</ThemedText>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}
        >
          <IconSymbol name="xmark" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: videoUri }}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />
        
        {/* Progress Bar Overlay */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#38383A' : '#E5E5EA' }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${getProgress()}%`, backgroundColor: '#007AFF' }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Time Display */}
      <View style={styles.timeContainer}>
        <ThemedText style={[styles.timeText, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
          {getCurrentTime()}
        </ThemedText>
        <ThemedText style={[styles.timeText, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
          {getDuration()}
        </ThemedText>
      </View>

      {/* Premium Controls */}
      <View style={styles.controlsContainer}>
        {/* Primary Controls Row */}
        <View style={styles.primaryControlsRow}>
          <PremiumControlButton
            onPress={() => handleSeek(-10)}
            icon="gobackward.10"
            variant="secondary"
            size="medium"
          />
          
          <PremiumControlButton
            onPress={isPlaying ? handlePause : handlePlay}
            icon={isPlaying ? "pause.fill" : "play.fill"}
            variant="accent"
            size="large"
          />
          
          <PremiumControlButton
            onPress={() => handleSeek(10)}
            icon="goforward.10"
            variant="secondary"
            size="medium"
          />
        </View>

        {/* Secondary Controls Row */}
        <View style={styles.secondaryControlsRow}>
          <View style={styles.controlGroup}>
            <PremiumControlButton
              onPress={handleToggleMute}
              icon={isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill"}
              variant="secondary"
              size="small"
            />
            <ThemedText style={[styles.controlLabel, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
              {isMuted ? 'Muted' : 'Sound'}
            </ThemedText>
          </View>

          <View style={styles.controlGroup}>
            <PremiumControlButton
              onPress={handleToggleFullscreen}
              icon={isFullscreen ? "arrow.down.right.and.arrow.up.left" : "arrow.up.left.and.arrow.down.right"}
              variant="secondary"
              size="small"
            />
            <ThemedText style={[styles.controlLabel, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  videoContainer: {
    width: SCREEN_WIDTH - 40,
    height: (SCREEN_WIDTH - 40) * 9 / 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  video: {
    width: '100%',
    height: '100%',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    paddingHorizontal: 0,
  },
  progressBarTrack: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  primaryControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  secondaryControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  controlGroup: {
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumButton: {
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
});

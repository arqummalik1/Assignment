import React from 'react';
import { StyleSheet, View, Button, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function VideoPlayerTabScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <IconSymbol
          size={80}
          name="play.circle.fill"
          style={styles.icon}
        />
        <ThemedText type="title" style={styles.title}>Video Player</ThemedText>
        <ThemedText style={styles.description}>
          Watch HLS video streams with full playback controls including play, pause, seek, mute, and fullscreen.
        </ThemedText>
        <View style={styles.buttonContainer}>
          <Button
            title="Open Video Player"
            onPress={() => router.push('/video-player')}
            color={Platform.OS === 'ios' ? '#007AFF' : '#6200EE'}
          />
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
});

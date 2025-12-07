import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Request notification permissions on mount
  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // Set up notification response handler (for bonus: open video player when notification tapped)
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.openVideoPlayer) {
        router.push('/video-player');
      }
    });

    return () => subscription.remove();
  }, []);

  // Function to register for push notifications
  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please enable notifications in your device settings.');
      return;
    }
  }

  // Function to schedule a notification with delay
  async function scheduleNotification(title: string, body: string, delaySeconds: number, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        seconds: delaySeconds,
      } as Notifications.TimeIntervalTriggerInput,
    });
  }

  // Handle first notification button
  const handleFirstNotification = () => {
    const delay = Math.floor(Math.random() * 4) + 2; // Random delay between 2-5 seconds (2, 3, 4, or 5)
    scheduleNotification(
      'Welcome Notification!',
      'This is the first notification triggered from the WebView page. It was scheduled with a delay.',
      delay
    );
    Alert.alert('Notification Scheduled', `First notification will appear in ${delay} seconds.`);
  };

  // Handle second notification button
  const handleSecondNotification = () => {
    const delay = Math.floor(Math.random() * 4) + 2; // Random delay between 2-5 seconds (2, 3, 4, or 5)
    scheduleNotification(
      'Action Completed!',
      'This is the second notification. Your action has been processed successfully.',
      delay,
      { openVideoPlayer: true } // Bonus: Add data to open video player when tapped
    );
    Alert.alert('Notification Scheduled', `Second notification will appear in ${delay} seconds.`);
  };

  // Handle WebView load end (Bonus: Send notification when WebView finishes loading)
  const handleLoadEnd = () => {
    setIsLoading(false);
    scheduleNotification(
      'WebView Loaded!',
      'The website has finished loading successfully.',
      2
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>WebView + Notifications</ThemedText>
      
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://expo.dev' }}
          style={styles.webview}
          onLoadEnd={handleLoadEnd}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Trigger Notification 1"
            onPress={handleFirstNotification}
            color={Platform.OS === 'ios' ? '#007AFF' : '#6200EE'}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Trigger Notification 2"
            onPress={handleSecondNotification}
            color={Platform.OS === 'ios' ? '#007AFF' : '#6200EE'}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Go to Video Player"
            onPress={() => router.push('/video-player')}
            color={Platform.OS === 'ios' ? '#34C759' : '#4CAF50'}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  webViewContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  webview: {
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  buttonWrapper: {
    marginBottom: 10,
  },
});

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Liquid Glass Button Component
const LiquidGlassButton = ({ 
  onPress, 
  title, 
  variant = 'primary',
  icon 
}: { 
  onPress: () => void; 
  title: string;
  variant?: 'primary' | 'secondary' | 'accent';
  icon?: string;
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const variantStyles = {
    primary: {
      blurIntensity: 80,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)',
      textColor: isDark ? '#FFFFFF' : '#000000',
      gradient: isDark 
        ? ['rgba(0, 122, 255, 0.3)', 'rgba(0, 122, 255, 0.1)'] as const
        : ['rgba(0, 122, 255, 0.4)', 'rgba(0, 122, 255, 0.2)'] as const,
    },
    secondary: {
      blurIntensity: 80,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)',
      textColor: isDark ? '#FFFFFF' : '#007AFF',
      gradient: isDark 
        ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const
        : ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'] as const,
    },
    accent: {
      blurIntensity: 90,
      backgroundColor: isDark ? 'rgba(52, 199, 89, 0.3)' : 'rgba(52, 199, 89, 0.6)',
      borderColor: isDark ? 'rgba(52, 199, 89, 0.4)' : 'rgba(52, 199, 89, 0.8)',
      textColor: '#FFFFFF',
      gradient: ['rgba(52, 199, 89, 0.5)', 'rgba(52, 199, 89, 0.3)'] as const,
    },
  };

  const style = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.liquidButton,
        {
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <BlurView
        intensity={style.blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={style.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientOverlay, { borderColor: style.borderColor }]}
        >
          <ThemedText style={[styles.buttonText, { color: style.textColor }]}>
            {title}
          </ThemedText>
        </LinearGradient>
      </BlurView>
    </Pressable>
  );
};

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { colorScheme, toggleTheme } = useTheme();
  const isDark = colorScheme === 'dark';

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
      {/* Glass Header */}
      <BlurView
        intensity={100}
        tint={isDark ? 'dark' : 'light'}
        style={styles.headerBlur}
      >
        <LinearGradient
          colors={isDark 
            ? (['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)'] as const)
            : (['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'] as const)}
          style={styles.headerGradient}
        >
          <ThemedText type="title" style={styles.title}>WebView + Notifications</ThemedText>
          <TouchableOpacity 
            onPress={toggleTheme}
            style={styles.themeToggleButton}
          >
            <BlurView
              intensity={80}
              tint={isDark ? 'dark' : 'light'}
              style={styles.themeToggleBlur}
            >
              <LinearGradient
                colors={isDark 
                  ? (['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] as const)
                  : (['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)'] as const)}
                style={styles.themeToggleGradient}
              >
                <IconSymbol 
                  name={isDark ? "sun.max.fill" : "moon.fill"} 
                  size={20} 
                  color={isDark ? '#FFD60A' : '#007AFF'} 
                />
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </LinearGradient>
      </BlurView>
      
      {/* Glass WebView Container */}
      <View style={styles.webViewWrapper}>
        <BlurView
          intensity={60}
          tint={isDark ? 'dark' : 'light'}
          style={styles.webViewBlur}
        >
          <View style={[styles.webViewContainer, { 
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)',
          }]}>
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
        </BlurView>
      </View>

      {/* Liquid Glass Buttons */}
      <View style={styles.buttonContainer}>
        <LiquidGlassButton
          title="Trigger Notification 1"
          onPress={handleFirstNotification}
          variant="primary"
        />
        <LiquidGlassButton
          title="Trigger Notification 2"
          onPress={handleSecondNotification}
          variant="secondary"
        />
        <LiquidGlassButton
          title="Go to Video Player"
          onPress={() => router.push('/video-player')}
          variant="accent"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerBlur: {
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  themeToggleBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  themeToggleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  webViewWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  webViewBlur: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  webViewContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    padding: 20,
    gap: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  liquidButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientOverlay: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

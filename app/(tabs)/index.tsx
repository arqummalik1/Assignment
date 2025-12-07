/**
 * WebView Screen with Notifications
 * 
 * Main screen that displays a WebView and provides buttons to trigger
 * local notifications with delays. Also includes navigation to video player.
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Premium glassmorphism button component
 * 
 * Features a sophisticated glass-like appearance with:
 * - Multi-layer blur effects for depth
 * - Refined gradients with subtle color transitions
 * - Optional icons for better visual hierarchy
 * - Smooth press animations
 * - Theme-aware styling
 */
const LiquidGlassButton = ({ 
  onPress, 
  title, 
  variant = 'primary',
  icon,
}: { 
  onPress: () => void; 
  title: string;
  variant?: 'primary' | 'secondary' | 'accent';
  icon?: IconSymbolName;
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  // Enhanced glassmorphism styles with more sophisticated gradients and effects
  // Each variant has unique colors, blur intensity, and border styling
  const variantStyles = {
    primary: {
      blurIntensity: 100,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.9)',
      textColor: isDark ? '#FFFFFF' : '#000000',
      iconColor: isDark ? '#64B5F6' : '#1976D2',
      // More sophisticated gradient with multiple color stops for depth
      gradient: isDark 
        ? ['rgba(0, 122, 255, 0.35)', 'rgba(0, 122, 255, 0.15)', 'rgba(0, 122, 255, 0.05)'] as const
        : ['rgba(0, 122, 255, 0.5)', 'rgba(0, 122, 255, 0.3)', 'rgba(0, 122, 255, 0.15)'] as const,
      shadowColor: isDark ? 'rgba(0, 122, 255, 0.3)' : 'rgba(0, 122, 255, 0.2)',
    },
    secondary: {
      blurIntensity: 100,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.85)',
      textColor: isDark ? '#FFFFFF' : '#007AFF',
      iconColor: isDark ? '#90CAF9' : '#1976D2',
      // Subtle white gradient for secondary actions
      gradient: isDark 
        ? ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] as const
        : ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)'] as const,
      shadowColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    accent: {
      blurIntensity: 110,
      borderColor: isDark ? 'rgba(52, 199, 89, 0.5)' : 'rgba(52, 199, 89, 0.9)',
      textColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      // Vibrant green gradient for accent actions
      gradient: ['rgba(52, 199, 89, 0.6)', 'rgba(52, 199, 89, 0.4)', 'rgba(52, 199, 89, 0.25)'] as const,
      shadowColor: 'rgba(52, 199, 89, 0.4)',
    },
  };

  const style = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.liquidButton,
        {
          // Smooth press animation with scale and opacity
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          // Enhanced shadow that responds to press
          shadowOpacity: pressed ? 0.1 : 0.2,
        },
      ]}
    >
      {/* Outer blur layer for depth */}
      <BlurView
        intensity={style.blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        {/* Inner gradient layer for glass effect */}
        <LinearGradient
          colors={style.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientOverlay, 
            { 
              borderColor: style.borderColor,
              // Subtle inner shadow for depth
              shadowColor: style.shadowColor,
            }
          ]}
        >
          {/* Icon and text container - properly aligned */}
          <View style={styles.buttonContent}>
            {icon && (
              <IconSymbol 
                name={icon} 
                size={20} 
                color={style.iconColor}
              />
            )}
            <ThemedText style={[styles.buttonText, { color: style.textColor }]}>
              {title}
            </ThemedText>
          </View>
        </LinearGradient>
      </BlurView>
    </Pressable>
  );
};

export default function WebViewScreen() {
  // Reference to the WebView component for programmatic control
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  
  // Track loading state - starts as true since WebView begins loading immediately
  const [isLoading, setIsLoading] = useState(true);
  const { colorScheme, toggleTheme } = useTheme();
  const isDark = colorScheme === 'dark';

  // Set up notification listeners and permissions when component mounts
  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // Listen for when user taps on a notification
    // If notification has openVideoPlayer flag, navigate to video player
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.openVideoPlayer) {
        router.push('/video-player');
      }
    });

    // Clean up subscription when component unmounts
    return () => subscription.remove();
  }, [router]);

  // Request notification permissions and set up Android notification channel
  async function registerForPushNotificationsAsync() {
    try {
      // Android requires a notification channel to be created before sending notifications
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
        });
      }

      // Request permission from user to send notifications
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notification Permission Needed', 
          'Please enable notifications in your device settings to receive alerts.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error registering for notifications:', error);
      return false;
    }
  }

  // Helper function to schedule a local notification with a delay
  // Returns true if notification was scheduled successfully
  async function scheduleNotification(
    title: string, 
    body: string, 
    delaySeconds: number, 
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Ensure delay is at least 1 second to avoid immediate notifications
      if (delaySeconds <= 0) {
        delaySeconds = 1;
      }
      
      // Check if we have notification permissions before scheduling
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }
      
      // Schedule the notification with all required properties
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: delaySeconds,
        } as Notifications.TimeIntervalTriggerInput,
      });
      
     // console.log(`Notification scheduled with ID: ${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification. Please try again.');
      return false;
    }
  }

  // Handle first notification button press - random delay between 2-5 seconds
  const handleFirstNotification = async () => {
    const delay = Math.floor(Math.random() * 4) + 2;
    const success = await scheduleNotification(
      'Welcome Notification!',
      'This is the first notification triggered from the WebView page. It was scheduled with a delay.',
      delay
    );
    
    // Provide user feedback
    if (success) {
      Alert.alert(
        'Notification Scheduled!', 
        `Your notification will appear in ${delay} seconds.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Handle second notification button press - fixed 5 second delay with navigation data
  const handleSecondNotification = async () => {
    const delay = 5;
    
    // Include openVideoPlayer flag so tapping notification opens video player
    const success = await scheduleNotification(
      'Action Completed!',
      'This is the second notification. Your action has been processed successfully. Tap to open Video Player!',
      delay,
      { openVideoPlayer: true }
    );
    
    // Provide user feedback
    if (success) {
      Alert.alert(
        'Notification Scheduled!', 
        `Second notification will appear in ${delay} seconds. Tap it to open the Video Player!`,
        [{ text: 'Got it!' }]
      );
    }
  };

  // Called when WebView finishes loading - hide loader and send notification
  const handleLoadEnd = async () => {
    setIsLoading(false);
    await scheduleNotification(
      'WebView Loaded!',
      'The website has finished loading successfully.',
      2
    );
  };

  // Called when WebView starts loading - show loader
  const handleLoadStart = () => {
    setIsLoading(true);
  };

  // Called when WebView encounters an error - hide loader even on error
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setIsLoading(false); // Hide loader even if there's an error
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header section with title and theme toggle button */}
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
          <ThemedText type="title" style={styles.title}>WebView</ThemedText>
          {/* Theme toggle button - switches between light and dark mode */}
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
              onLoadStart={handleLoadStart}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
            />
            
            {/* Loading overlay - shows spinner while WebView is loading */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <BlurView
                  intensity={80}
                  tint={isDark ? 'dark' : 'light'}
                  style={styles.loadingBlur}
                >
                  <LinearGradient
                    colors={isDark 
                      ? (['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)'] as const)
                      : (['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] as const)}
                    style={styles.loadingGradient}
                  >
                    <ActivityIndicator 
                      size="large" 
                      color={isDark ? '#007AFF' : '#007AFF'} 
                    />
                    <ThemedText style={[styles.loadingText, { 
                      color: isDark ? '#FFFFFF' : '#000000' 
                    }]}>
                      Loading...
                    </ThemedText>
                  </LinearGradient>
                </BlurView>
              </View>
            )}
          </View>
        </BlurView>
      </View>

      {/* Action buttons container with glassmorphism design */}
      <View style={styles.buttonContainer}>
        <LiquidGlassButton
          title="Trigger Notification 1"
          onPress={handleFirstNotification}
          variant="primary"
          icon="bell.fill"
        />
        <LiquidGlassButton
          title="Trigger Notification 2"
          onPress={handleSecondNotification}
          variant="secondary"
          icon="bell.badge.fill"
        />
        <LiquidGlassButton
          title="Video Player"
          onPress={() => router.push('/video-player')}
          variant="accent"
          icon="play.circle.fill"
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden',
  },
  loadingBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  buttonContainer: {
    padding: 20,
    gap: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  liquidButton: {
    borderRadius: 24,
    overflow: 'hidden',
    // Enhanced shadow for depth and glass effect
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
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    // Additional border for glass effect
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradientOverlay: {
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    // Inner shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12, // Consistent spacing between icon and text
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    // Subtle text shadow for better readability on glass
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

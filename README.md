# Assignment

Expo React Native app demonstrating WebView integration, local notifications, and HLS video playback.

## 🎯 Features

### 1. WebView Page
- Embeds a website inside the app using `react-native-webview`
- Two buttons that trigger different local notifications with random delays (2-5 seconds)
- Navigation to Video Player page

### 2. Notifications
- Two distinct notification messages
- Notifications trigger with a delay of 2-5 seconds
- Automatic notification when WebView finishes loading
- Notification tap opens Video Player (bonus feature)

### 3. Video Player Page
- Plays HLS video stream using Expo's video player
- Test URL: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`
- Premium controls: Play, Pause, Fullscreen, Seek, Mute
- Real-time progress bar and time display

### 4. Navigation
- Tab-based navigation between pages
- Stack navigation for Video Player with back button

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npx expo start
   ```

3. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## 📱 Testing

### WebView Page
1. WebView loads expo.dev automatically
2. Tap "Trigger Notification 1" - notification appears after 2-5 seconds
3. Tap "Trigger Notification 2" - notification appears after 2-5 seconds (tap it to open Video Player)
4. Wait for WebView to finish loading - automatic notification appears
5. Tap "Go to Video Player" to navigate to video page

### Video Player Page
1. Video starts loading automatically
2. Use premium controls to play, pause, seek, mute, and enter fullscreen
3. Tap back button to return to WebView

## 🛠 Technical Stack

- **Expo SDK**: ~54.0.27
- **React Native**: 0.81.5
- **expo-notifications**: Local notifications
- **expo-av**: Video playback
- **react-native-webview**: WebView component
- **expo-router**: File-based routing

## ✅ Requirements Checklist

- ✅ WebView embedded with website
- ✅ Two buttons triggering different notifications
- ✅ At least two distinct notification messages
- ✅ Notifications with 2-5 second delays
- ✅ Video Player page with HLS playback
- ✅ Play, pause, and fullscreen controls
- ✅ Navigation between pages
- ✅ Works in Expo Go
- ✅ Clean code structure with comments
- ✅ Premium UI design

## 📝 Notes

- Notifications require user permission on first launch
- Video playback may take a few seconds to buffer
- Fullscreen mode works best on physical devices
- All features tested and working in Expo Go

## 🔧 Troubleshooting

- **Notifications not showing**: Ensure permissions are granted in device settings
- **Video not playing**: Check internet connection (HLS stream requires network)
- **WebView not loading**: Verify internet connection and URL accessibility

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ using Expo and React Native

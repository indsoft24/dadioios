# iOS Build Verification Checklist

This document verifies all iOS build requirements and dependencies for the Dadio app.

## ✅ Core Configuration Files

### 1. Podfile
- ✅ **Status**: Configured
- ✅ Modular headers enabled (`use_modular_headers!`)
- ✅ Deployment target: 13.4 (React Native 0.73.3 requirement)
- ✅ Warning suppression for third-party pods
- ✅ Post-install script for deployment target fixes

### 2. Info.plist
- ✅ **Status**: Updated
- ✅ Location permissions configured
- ✅ Camera permissions configured
- ✅ Microphone permissions configured
- ✅ Photo library permissions configured
- ✅ App Transport Security configured
- ✅ Removed deprecated armv7 requirement

### 3. AppDelegate Files
- ✅ **Status**: Correct
- ✅ AppDelegate.h properly configured
- ✅ AppDelegate.mm uses RCTAppDelegate
- ✅ Bundle URL configuration for Debug/Release

### 4. Package.json Scripts
- ✅ **Status**: Updated
- ✅ `ios` - Run on default simulator
- ✅ `ios:simulator` - Run on iPhone 16 simulator
- ✅ `ios:device` - Run on physical device
- ✅ `ios:build` - Build with xcodebuild
- ✅ `ios:pod-install` - Install CocoaPods dependencies
- ✅ `clean:ios` - Clean iOS build artifacts

## 📦 Dependencies Verification

### React Native Core
- ✅ React Native: 0.73.3
- ✅ React: 18.2.0
- ✅ Minimum iOS: 13.4

### Firebase Dependencies
- ✅ @react-native-firebase/app: ^18.9.0
- ✅ @react-native-firebase/crashlytics: ^18.9.0
- ✅ @react-native-firebase/messaging: ^18.9.0
- **Note**: Requires GoogleService-Info.plist in ios directory

### Navigation
- ✅ @react-navigation/native: ^6.1.9
- ✅ @react-navigation/native-stack: ^6.9.17
- ✅ react-native-screens: ^3.29.0
- ✅ react-native-safe-area-context: ^4.8.2
- ✅ react-native-gesture-handler: ^2.14.0

### UI Components
- ✅ react-native-vector-icons: ^10.0.3
- ✅ react-native-linear-gradient: ^2.8.3
- ✅ react-native-image-crop-picker: ^0.40.2
- ✅ react-native-render-html: ^6.3.4
- ✅ react-native-webview: ^13.7.0

### Audio/Video
- ✅ react-native-audio-record: ^0.2.2
- ✅ react-native-sound: ^0.11.2
- ✅ react-native-incall-manager: ^4.1.0
- ✅ enx-rtc-react-native: ^2.3.34
- ✅ react-native-callkeep: ^4.3.12

### Notifications
- ✅ @notifee/react-native: ^7.8.2
- ✅ react-native-full-screen-notification-incoming-call: ^0.1.12

### Permissions
- ✅ react-native-permissions: ^4.1.5
- ✅ @react-native-community/geolocation: ^3.1.0

### Storage
- ✅ @react-native-community/async-storage: ^1.12.1

### Payments
- ✅ react-native-razorpay: ^2.3.0
- ✅ payu-core-pg-react: ^1.2.7
- ✅ payu-non-seam-less-react: ^3.1.2

### Social Login
- ✅ react-native-google-signin: ^2.1.1
- ✅ react-native-fbsdk-next: ^12.1.3

### Analytics
- ✅ react-native-appsflyer: ^6.17.1

## 🔧 Build Tools Configuration

### Babel
- ✅ babel.config.js configured
- ✅ React Native preset enabled
- ✅ react-native-dotenv plugin enabled

### Metro
- ✅ metro.config.js configured
- ✅ Default React Native config merged

## 📱 iOS Specific Requirements

### Permissions Required
1. **Location** (NSLocationWhenInUseUsageDescription) ✅
2. **Camera** (NSCameraUsageDescription) ✅
3. **Microphone** (NSMicrophoneUsageDescription) ✅
4. **Photo Library** (NSPhotoLibraryUsageDescription) ✅

### Build Settings
- ✅ Deployment Target: iOS 13.4
- ✅ Architecture: arm64 (armv7 removed)
- ✅ Bundle Identifier: org.reactjs.native.example.Dadio

### Required Files
- ✅ Podfile
- ✅ Info.plist
- ✅ AppDelegate.h
- ✅ AppDelegate.mm
- ✅ main.m
- ✅ LaunchScreen.storyboard
- ⚠️ GoogleService-Info.plist (verify if Firebase is used)

## 🚀 Build Commands

### Development Build
```bash
npm run ios
# or
npm run ios:simulator
```

### Production Build
```bash
cd ios
xcodebuild -workspace Dadio.xcworkspace \
  -scheme Dadio \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  clean build
```

### Install Pods
```bash
npm run ios:pod-install
# or
cd ios && pod install --repo-update
```

## ⚠️ Potential Issues & Solutions

### 1. Pod Installation Errors
**Solution**: Run `pod deintegrate && pod install`

### 2. Modular Headers Errors
**Solution**: Already fixed with `use_modular_headers!` in Podfile

### 3. Deployment Target Warnings
**Solution**: Already fixed in post_install hook (sets to 13.4)

### 4. Missing Permissions
**Solution**: All required permissions added to Info.plist

### 5. Build Errors with Swift Pods
**Solution**: Modular headers enabled, warnings suppressed

## 📋 Pre-Build Checklist

Before building iOS, ensure:
- [ ] Node.js >= 18 installed
- [ ] CocoaPods installed (`sudo gem install cocoapods`)
- [ ] Xcode installed (latest version recommended)
- [ ] iOS Simulator available
- [ ] Dependencies installed (`npm install`)
- [ ] Pods installed (`npm run ios:pod-install`)
- [ ] GoogleService-Info.plist exists (if using Firebase)
- [ ] Code signing configured (for device builds)

## 🎯 Next Steps

1. Run `npm run ios:pod-install` to update pods
2. Verify all dependencies install correctly
3. Test build with `npm run ios:build`
4. Configure code signing for release builds
5. Test on physical device

---
**Last Updated**: After verification of all iOS build requirements
**React Native Version**: 0.73.3
**Minimum iOS Version**: 13.4


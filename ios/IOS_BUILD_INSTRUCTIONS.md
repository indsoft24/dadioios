# Build Instructions for Dadio iOS App

This document contains instructions for building release IPA files for the Dadio iOS application.

## 📋 Prerequisites

- **macOS** (required - iOS builds cannot be done on Windows/Linux)
- **Xcode** (latest version recommended, minimum 14.0)
- **CocoaPods** (`sudo gem install cocoapods`)
- **Node.js** (>=18 as specified in package.json)
- **npm** or **yarn**

## 🚀 Step-by-Step Build Process

### Step 1: Install Node Dependencies

From the project root directory:

```bash
npm cache clean --force
npm install --legacy-peer-deps
npm config set legacy-peer-deps true
npm install
```

### Step 2: Install CocoaPods Dependencies

Navigate to the iOS directory and install pods:

```bash
cd ios
pod install
```

**Note:** If you encounter issues, try:
```bash
pod deintegrate
pod install
```

### Step 3: Open Xcode Workspace

**Important:** Always open the `.xcworkspace` file, NOT the `.xcodeproj` file:

```bash
open Dadio.xcworkspace
```

Or from Finder:
- Navigate to `ios/` folder
- Double-click `Dadio.xcworkspace` (NOT `Dadio.xcodeproj`)

### Step 4: Configure Signing & Capabilities

In Xcode:

1. Select the **Dadio** project in the navigator
2. Select the **Dadio** target
3. Go to **Signing & Capabilities** tab
4. Select your **Team** (Apple Developer account)
5. Ensure **Automatically manage signing** is checked
6. Xcode will automatically generate a provisioning profile

**For Release Builds:**
- You need an Apple Developer account ($99/year)
- Configure your signing certificate and provisioning profile
- Update the Bundle Identifier if needed

### Step 5: Build Options

#### Option A: Build for Simulator (Development)

From terminal:
```bash
npm start
# In another terminal
npm run ios
```

Or in Xcode:
1. Select a simulator from the device dropdown
2. Click the **Play** button or press `Cmd + R`

#### Option B: Build for Device (Development)

1. Connect your iOS device via USB
2. Trust the computer on your device
3. In Xcode, select your device from the device dropdown
4. Click **Play** button
5. On your device: Settings > General > VPN & Device Management > Trust Developer

#### Option C: Build Release Archive (for App Store or Ad-Hoc)

1. In Xcode, select **Any iOS Device** or a connected device (NOT simulator)
2. Go to **Product** > **Archive**
3. Wait for the archive to build
4. The Organizer window will open
5. Select your archive and click **Distribute App**
6. Choose distribution method:
   - **App Store Connect** - For App Store submission
   - **Ad Hoc** - For testing on registered devices
   - **Enterprise** - For enterprise distribution
   - **Development** - For development devices

## 📦 Build Outputs

### Development Build
- Location: Automatically installed on simulator/device
- No IPA file generated

### Archive Build
- Location: `~/Library/Developer/Xcode/Archives/[Date]/`
- Can be exported as IPA file

### Export IPA Location
- Will be saved to location you specify during export
- Typically: `~/Desktop/` or chosen export path

## 🔧 Build Configuration

### Scheme Configuration

1. In Xcode: **Product** > **Scheme** > **Edit Scheme**
2. Set **Build Configuration**:
   - **Debug** - For development
   - **Release** - For App Store/Ad-Hoc

### Info.plist Settings

Key settings in `Info.plist`:
- **Bundle Identifier**: Set in Xcode project settings
- **Version**: Set in Xcode project settings
- **Build Number**: Set in Xcode project settings

## 🐛 Troubleshooting

### Pod Install Issues

```bash
# Clean CocoaPods cache
pod cache clean --all

# Remove Pods and reinstall
cd ios
rm -rf Pods Podfile.lock
pod install
```

### Xcode Build Errors

1. **"No such module" errors:**
   ```bash
   cd ios
   pod install
   ```

2. **Signing Errors:**
   - Ensure you have a valid Apple Developer account
   - Check that your team is selected in Signing & Capabilities
   - Verify Bundle Identifier is unique

3. **Metro Bundler Connection:**
   - Ensure Metro is running: `npm start`
   - Check firewall settings
   - Verify correct IP in `Config.js` if using physical device

4. **Node Version:**
   - Ensure Node.js >= 18: `node --version`
   - Use nvm if needed: `nvm use 18`

### Clean Build

If encountering persistent issues:

```bash
# Clean React Native
cd ..
npm start -- --reset-cache

# Clean Xcode
cd ios
rm -rf build DerivedData
pod deintegrate
pod install

# In Xcode: Product > Clean Build Folder (Cmd + Shift + K)
```

## 🚨 Important Notes

### Windows Users
- **iOS builds cannot be performed on Windows**
- Options:
  1. Use a Mac (MacBook, iMac, Mac Mini, etc.)
  2. Use a Mac cloud service (MacStadium, AWS EC2 Mac instances)
  3. Use a Mac virtual machine (requires macOS license)
  4. Use CI/CD service like GitHub Actions, Bitrise, or Codemagic

### Bundle Identifier
- Must be unique across all iOS apps
- Format: `com.yourcompany.appname`
- Cannot be changed after App Store submission

### App Store Requirements
- Must follow App Store Review Guidelines
- Requires valid Apple Developer Program membership
- App must be code-signed
- Info.plist must have all required permissions descriptions

## 📱 Testing on Device

### Ad-Hoc Distribution

1. Add device UDID to Apple Developer Portal
2. Create Ad-Hoc provisioning profile
3. Archive and export as Ad-Hoc
4. Install via:
   - Xcode > Window > Devices and Simulators
   - TestFlight (beta testing)
   - Apple Configurator
   - Over-the-air distribution

### TestFlight Beta Testing

1. Upload build to App Store Connect
2. Add testers in TestFlight section
3. Testers receive email invitation
4. Install TestFlight app and accept invitation

## ⚡ Performance Tips

### Faster Builds

1. **Use Release Configuration for final builds**
2. **Disable Flipper in Release:**
   - Set `NO_FLIPPER=1` environment variable
   - Or configure in `react-native.config.js`

3. **Optimize Pod Installation:**
   ```bash
   # Use CDN for faster pod downloads
   pod install --repo-update
   ```

## 📊 Build Times

Typical build times:
- **First build**: 5-10 minutes (pods + compilation)
- **Incremental build**: 1-3 minutes
- **Archive build**: 3-5 minutes
- **Export IPA**: 1-2 minutes

## 🔐 Code Signing

### Development
- Automatic signing works for development
- Free Apple ID sufficient for device testing (limited)

### Production
- Requires paid Apple Developer Program ($99/year)
- Need distribution certificate
- Need App Store or Ad-Hoc provisioning profile

## 📞 Support

For issues:
- React Native iOS Documentation: https://reactnative.dev/docs/running-on-device
- Xcode Documentation: https://developer.apple.com/documentation/xcode
- Apple Developer Support: https://developer.apple.com/support

---

**Last Updated:** 2024  
**Platform:** iOS  
**React Native Version:** 0.73.3

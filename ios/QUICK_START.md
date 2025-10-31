# iOS Build Quick Start Guide

## ⚠️ Important: macOS Required

iOS builds **cannot** be done on Windows. You need:
- A Mac computer (MacBook, iMac, Mac Mini, etc.)
- OR a Mac cloud service
- OR CI/CD service (GitHub Actions, Bitrise, Codemagic)

## 🚀 Quick Build Steps (On Mac)

### 1. Install Dependencies

```bash
# From project root
npm install --legacy-peer-deps
cd ios
pod install
cd ..
```

### 2. Open in Xcode

```bash
cd ios
open Dadio.xcworkspace
```

**⚠️ Always open `.xcworkspace`, NOT `.xcodeproj`**

### 3. Configure Signing

In Xcode:
1. Select **Dadio** project → **Dadio** target
2. **Signing & Capabilities** tab
3. Select your **Team**
4. Enable **Automatically manage signing**

### 4. Build & Run

**Option A: Command Line (Recommended)**
```bash
npm start          # Terminal 1: Start Metro
npm run ios        # Terminal 2: Build and run
```

**Option B: Xcode GUI**
1. Select a simulator or connected device
2. Click **Play** button (▶️) or press `Cmd + R`

## 📦 Build Types

### Development Build (Debug)
```bash
npm run ios
```

### Release Build
```bash
# In Xcode: Product > Archive
# Or use the build script:
./ios/build.sh release
```

### Archive for Distribution
```bash
# In Xcode:
# 1. Product > Archive
# 2. Distribute App
# 3. Choose distribution method (App Store, Ad Hoc, etc.)
```

## 🔧 Troubleshooting

### "No Pods found"
```bash
cd ios
pod install
```

### "Unable to find a development team"
- Open Xcode
- Go to Signing & Capabilities
- Select your Apple Developer team

### "Metro bundler not found"
```bash
npm start
# Then in another terminal:
npm run ios
```

### Build Script Usage
```bash
# Make script executable
chmod +x ios/build.sh

# Build for simulator (debug)
./ios/build.sh debug

# Build release
./ios/build.sh release

# Create archive
./ios/build.sh archive
```

## 📚 Full Documentation

See [IOS_BUILD_INSTRUCTIONS.md](./IOS_BUILD_INSTRUCTIONS.md) for detailed instructions.

---

**Last Updated:** 2024

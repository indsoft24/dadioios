#!/bin/bash

# iOS Build Script for Dadio
# Usage: ./build.sh [debug|release|archive]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BUILD_TYPE=${1:-debug}
PROJECT_NAME="Dadio"
SCHEME="Dadio"
WORKSPACE="ios/Dadio.xcworkspace"

echo -e "${GREEN}🚀 Starting iOS build for ${PROJECT_NAME}...${NC}"

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ Error: iOS builds can only be performed on macOS${NC}"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Error: Node.js version must be >= 18 (current: $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}"

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo -e "${YELLOW}⚠ CocoaPods not found. Installing...${NC}"
    sudo gem install cocoapods
fi

echo -e "${GREEN}✓ CocoaPods version: $(pod --version)${NC}"

# Navigate to project root
cd "$(dirname "$0")/.."

# Install node modules if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing node modules...${NC}"
    npm cache clean --force
    npm install --legacy-peer-deps
    npm config set legacy-peer-deps true
fi

# Install CocoaPods dependencies
echo -e "${YELLOW}📦 Installing CocoaPods dependencies...${NC}"
cd ios
if [ ! -d "Pods" ]; then
    pod install
else
    pod install --repo-update
fi
cd ..

# Check if workspace exists
if [ ! -f "$WORKSPACE" ]; then
    echo -e "${RED}❌ Error: Workspace file not found at ${WORKSPACE}${NC}"
    echo -e "${YELLOW}💡 Run 'pod install' in the ios directory first${NC}"
    exit 1
fi

# Build based on type
case $BUILD_TYPE in
    debug)
        echo -e "${GREEN}🔨 Building Debug configuration...${NC}"
        echo -e "${YELLOW}💡 Starting Metro bundler in background...${NC}"
        # Start Metro in background
        npm start &
        METRO_PID=$!
        sleep 5
        
        # Build and run on simulator
        echo -e "${GREEN}📱 Building for iOS Simulator...${NC}"
        npx react-native run-ios
        
        # Kill Metro when done (optional)
        # kill $METRO_PID 2>/dev/null || true
        ;;
        
    release)
        echo -e "${GREEN}🔨 Building Release configuration...${NC}"
        xcodebuild \
            -workspace "$WORKSPACE" \
            -scheme "$SCHEME" \
            -configuration Release \
            -destination 'generic/platform=iOS' \
            clean build
        
        echo -e "${GREEN}✓ Release build completed!${NC}"
        echo -e "${YELLOW}📦 Build output: ios/build/Build/Products/Release-iphoneos/${PROJECT_NAME}.app${NC}"
        ;;
        
    archive)
        echo -e "${GREEN}📦 Creating Archive...${NC}"
        
        # Check if signing is configured
        echo -e "${YELLOW}⚠ Make sure you've configured code signing in Xcode:${NC}"
        echo -e "${YELLOW}   1. Open ${WORKSPACE} in Xcode${NC}"
        echo -e "${YELLOW}   2. Select Dadio target${NC}"
        echo -e "${YELLOW}   3. Go to Signing & Capabilities${NC}"
        echo -e "${YELLOW}   4. Select your Team${NC}"
        echo ""
        read -p "Press Enter to continue after configuring signing..."
        
        ARCHIVE_PATH="${HOME}/Library/Developer/Xcode/Archives/$(date +%Y-%m-%d)/${PROJECT_NAME}-$(date +%Y-%m-%d-%H%M).xcarchive"
        
        xcodebuild \
            -workspace "$WORKSPACE" \
            -scheme "$SCHEME" \
            -configuration Release \
            -destination 'generic/platform=iOS' \
            -archivePath "$ARCHIVE_PATH" \
            clean archive
        
        echo -e "${GREEN}✓ Archive created successfully!${NC}"
        echo -e "${GREEN}📦 Archive location: ${ARCHIVE_PATH}${NC}"
        echo -e "${YELLOW}💡 Open Xcode Organizer to export the archive:${NC}"
        echo -e "${YELLOW}   Product > Archive (or Window > Organizer)${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Error: Unknown build type '${BUILD_TYPE}'${NC}"
        echo -e "${YELLOW}Usage: ./build.sh [debug|release|archive]${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ Build process completed!${NC}"

# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated builds and CI/CD.

## iOS Build Workflow

**File:** `.github/workflows/ios-build.yml`

### Overview
Automated iOS build workflow that builds the Dadio iOS app on macOS runners using GitHub Actions.

### Features
- ✅ Automatic builds on push to `main`, `develop`, or `dev` branches
- ✅ Builds on pull requests to `main` or `develop`
- ✅ Manual triggering via `workflow_dispatch`
- ✅ Uses latest macOS runner with Xcode
- ✅ Installs dependencies (Node.js, CocoaPods)
- ✅ Applies Podfile fixes for architecture issues
- ✅ Builds for iOS Simulator (iPhone 16)
- ✅ Optional Release archive build
- ✅ Uploads build artifacts

### Triggers

#### Automatic Triggers
- Push to branches: `main`, `develop`, `dev`
- Pull requests to: `main`, `develop`

#### Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select **Build iOS App** workflow
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

### Build Steps

1. **Checkout code** - Gets the latest code from repository
2. **Setup Node.js** - Installs Node.js 18 with npm caching
3. **Install npm dependencies** - Installs all npm packages with `--legacy-peer-deps`
4. **Install CocoaPods** - Installs CocoaPods gem
5. **Install iOS dependencies** - Runs `pod install` with fixes applied
6. **List available simulators** - Shows available iOS simulators for debugging
7. **Build iOS App** - Builds for iPhone 16 simulator (Debug configuration)
8. **Archive iOS** (Optional) - Creates Release archive (only on manual trigger)
9. **Upload artifacts** - Uploads build outputs for download

### Configuration

**Platform:** macOS Latest (`macos-latest`)
**Node Version:** 18
**iOS Simulator:** iPhone 16
**Workspace:** `ios/Dadio.xcworkspace`
**Scheme:** `Dadio`
**Build Configuration:** Debug (Simulator), Release (Archive)

### Build Artifacts

Artifacts are automatically uploaded and available for:
- **7 days** after build completion
- Download from **Actions** tab → **Workflow run** → **Artifacts**

### Troubleshooting

#### Build Fails with Architecture Error
- The Podfile includes automatic fixes for RNEnxRtc architecture issues
- Ensure `pod install` runs successfully
- Check that the post_install hook applies fixes

#### Simulator Not Found
- The workflow lists available simulators for debugging
- iPhone 16 should be available on macOS runners
- If not available, update the destination in the workflow

#### Pod Install Fails
- Ensure all required files are in the repository
- Check that Podfile syntax is correct
- Verify Node.js and CocoaPods versions are compatible

### Manual Build Commands

To reproduce the build locally:

```bash
# Install dependencies
npm install --legacy-peer-deps
cd ios
pod install --repo-update

# Build for simulator
xcodebuild -workspace Dadio.xcworkspace \
  -scheme Dadio \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -derivedDataPath ./build \
  CODE_SIGNING_ALLOWED=NO \
  clean build
```

### Notes

- **Code Signing:** Disabled (`CODE_SIGNING_ALLOWED=NO`) for simulator builds
- **Archive Builds:** Only run on manual trigger (`workflow_dispatch`)
- **Release Archive:** Requires code signing configuration for production use
- **Artifacts:** Build outputs are available for download for 7 days

---

**Last Updated:** After iOS build configuration updates
**Status:** ✅ Ready for use


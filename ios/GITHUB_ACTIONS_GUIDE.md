# 🚀 Build iOS with GitHub Actions (From Windows)

## ⚠️ Important: GitHub Codespaces vs GitHub Actions

**GitHub Codespaces:** ❌ **Cannot build iOS** - Runs on Linux VMs
**GitHub Actions:** ✅ **Can build iOS** - Runs on macOS runners (FREE!)

## ✅ What You Need

1. **GitHub account** (FREE)
2. **Your code pushed to GitHub**
3. **That's it!** No Mac needed!

---

## 🎯 Quick Start (3 Steps)

### Step 1: Push Your Code to GitHub

If you haven't already:

```bash
git init
git add .
git commit -m "Add iOS build workflow"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Go to GitHub Actions

1. Open your repository on GitHub
2. Click the **Actions** tab (top menu)
3. You'll see **"Build iOS App"** workflow
4. Click on it

### Step 3: Run the Build

1. Click **"Run workflow"** button (right side)
2. Select branch: **main** (or your branch)
3. Click **"Run workflow"** (green button)
4. Wait ~10-15 minutes

### Step 4: Download Build

1. Click on the running build (or wait for it to complete)
2. Scroll down to **"Artifacts"** section
3. Click **"ios-build-XXX"** to download
4. Extract and find your `.app` or `.xcarchive` file

---

## 📋 How It Works

GitHub Actions:
- ✅ Uses **macOS runners** (real Macs in the cloud)
- ✅ FREE for public repos (unlimited)
- ✅ FREE for private repos: **2000 minutes/month**
- ✅ Automatic builds on every push (optional)
- ✅ Downloadable build artifacts

---

## 🔧 Workflow Configuration

The workflow file is already created: `.github/workflows/ios-build.yml`

### What it does:

1. **Checks out your code**
2. **Installs Node.js** (version 18)
3. **Installs npm packages** (with --legacy-peer-deps)
4. **Installs CocoaPods**
5. **Runs pod install**
6. **Builds iOS app** (Debug for simulator)
7. **Creates archive** (Release, if manually triggered)
8. **Uploads artifacts** (downloadable for 7 days)

### Build Types:

**Automatic (on push):**
- Builds Debug configuration
- For iOS Simulator
- No code signing needed

**Manual (workflow_dispatch):**
- Builds Release configuration
- Creates archive (.xcarchive)
- May need code signing for device install

---

## 📱 Getting IPA File

### Option 1: Build Archive (Current Setup)

The workflow creates an `.xcarchive` file. To convert to IPA:

1. Download the archive artifact
2. Extract it
3. Use Xcode (on Mac) to export IPA:
   - Open Xcode → Window → Organizer
   - Import the archive
   - Click "Distribute App"
   - Choose distribution method

### Option 2: Modify Workflow for Direct IPA

For direct IPA generation, you need:
- Code signing certificates (upload as secrets)
- Export options plist
- Modified workflow (more complex)

**For testing:** The `.xcarchive` works fine!

---

## 🔐 Code Signing (For Device Installation)

To install on real devices or distribute:

### Method 1: Automatic Signing (Recommended)

1. **Get Apple Developer account** ($99/year) or free Apple ID
2. **Add secrets to GitHub:**
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `APPLE_ID` - Your Apple ID email
     - `APPLE_APP_SPECIFIC_PASSWORD` - Generate from appleid.apple.com
     - `CERTIFICATE_BASE64` - Base64 encoded .p12 certificate
     - `PROVISIONING_PROFILE_BASE64` - Base64 encoded .mobileprovision

3. **Update workflow** to use these secrets

### Method 2: Manual (For Testing)

1. Build in Debug mode (automatic)
2. Install on simulator (Xcode on Mac)
3. Or use free Apple ID for device testing (limited)

---

## 🎛️ Workflow Customization

### Change Build Configuration

Edit `.github/workflows/ios-build.yml`:

```yaml
- name: Build iOS App
  run: |
    xcodebuild -workspace Dadio.xcworkspace \
      -scheme Dadio \
      -configuration Release \  # Change Debug to Release
      ...
```

### Build for Specific Simulator

```yaml
-destination 'platform=iOS Simulator,name=iPhone 14 Pro'
```

### Disable Automatic Builds

Remove or comment out the `push:` trigger:

```yaml
on:
  # push:  # Disabled
  workflow_dispatch: # Manual only
```

---

## 📊 Build Status

Monitor builds:
- **Yellow dot** = Running
- **Green check** = Success
- **Red X** = Failed
- **Gray** = Cancelled

Click on any build to see detailed logs.

---

## 🐛 Troubleshooting

### Build Fails: "pod install error"
**Solution:** Check Podfile and iOS dependencies

### Build Fails: "Code signing required"
**Solution:** 
- For simulator: Add `CODE_SIGNING_ALLOWED=NO` (already in workflow)
- For device: Configure code signing secrets

### Build Fails: "Module not found"
**Solution:** Ensure all dependencies are in package.json

### Build Takes Too Long
**Solution:** 
- Enable caching (already enabled for npm)
- Reduce build frequency

### Artifact Download Failed
**Solution:** 
- Artifacts expire after 7 days
- Re-run workflow to generate new artifacts

---

## 💰 Free Tier Limits

**Public Repositories:**
- ✅ Unlimited builds
- ✅ Unlimited minutes

**Private Repositories:**
- ✅ 2,000 minutes/month FREE
- ✅ ~33 hours of build time
- ✅ Usually enough for 20-30 iOS builds/month

**Typical Build Time:**
- First build: ~12-15 minutes
- Cached build: ~8-10 minutes

---

## 🎯 Best Practices

1. **Use workflow_dispatch** for important builds
2. **Monitor build minutes** for private repos
3. **Download artifacts promptly** (expire in 7 days)
4. **Keep workflow file in repo** (version controlled)
5. **Test locally** before pushing (saves build minutes)

---

## 📚 Additional Resources

- GitHub Actions Docs: https://docs.github.com/en/actions
- Xcode Build Settings: https://developer.apple.com/documentation/xcode
- React Native iOS: https://reactnative.dev/docs/running-on-device

---

## ✅ Summary

**From Windows:**
1. ✅ Push code to GitHub
2. ✅ Go to Actions tab
3. ✅ Click "Run workflow"
4. ✅ Download build artifacts
5. ✅ Done!

**No Mac needed!** 🎉

---

**Workflow File:** `.github/workflows/ios-build.yml`  
**Last Updated:** 2024

# Build Guide for USOD Security

This guide explains how to build the USOD Security app for Google Play Store submission.

---

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Expo account (free at expo.dev)

---

## Option 1: EAS Build (Recommended)

EAS Build is Expo's cloud build service. It handles signing and produces optimized builds.

### Step 1: Install and Login

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login
```

### Step 2: Configure Project (Already Done ✅)

The `eas.json` file is already configured with these profiles:
- `development` - For testing with development client
- `preview` - Builds APK for internal testing
- `production` - Builds AAB for Play Store

### Step 3: Build for Play Store

```bash
cd mobile

# Build AAB (Android App Bundle) for Play Store
eas build --platform android --profile production
```

This will:
1. Upload your code to Expo servers
2. Build in the cloud
3. Generate a signed AAB file
4. Provide a download link

### Step 4: Download the AAB

After the build completes (usually 10-20 minutes):
1. You'll receive an email with the download link
2. Or access it from: https://expo.dev/accounts/[your-username]/projects/usod-security/builds

---

## Option 2: Local Build

Build locally without EAS (requires Android Studio).

### Step 1: Generate Native Project

```bash
cd mobile

# Generate Android native project
npx expo prebuild --platform android
```

### Step 2: Generate Signing Key

```bash
# Navigate to android folder
cd android

# Generate a keystore (save the password!)
keytool -genkey -v -keystore usod-release-key.keystore -alias usod-key -keyalg RSA -keysize 2048 -validity 10000
```

### Step 3: Configure Signing

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('usod-release-key.keystore')
            storePassword 'your-store-password'
            keyAlias 'usod-key'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

### Step 4: Build AAB

```bash
# From android folder
./gradlew bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Build for Testing (APK)

To create an APK for testing before Play Store submission:

### Using EAS
```bash
eas build --platform android --profile preview
```

### Using Local Build
```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

---

## Important Notes

### Keystore Safety ⚠️
- **NEVER** lose your keystore file or passwords
- Store backups securely
- You cannot update the app without the same keystore

### Version Management
Before each update, increment in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",           // User-facing version
    "android": {
      "versionCode": 2            // Must increment for each upload
    }
  }
}
```

### Testing Before Release
1. Build with `preview` profile first
2. Install APK on real device
3. Test all features
4. Verify login works with backend
5. Check for crashes

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
npx expo prebuild --clean
```

### EAS Build Errors

```bash
# Check build status
eas build:list

# View build logs
eas build:view
```

### Signing Issues

- Ensure keystore path is correct
- Verify passwords match
- Check that alias matches

---

## Summary

| Method | Pros | Cons |
|--------|------|------|
| EAS Build | Easy, handled by Expo | Requires Expo account |
| Local Build | Full control | Requires Android Studio |

**Recommended**: Use EAS Build for simplicity and reliability.

---

## Quick Commands Reference

```bash
# EAS Production Build (AAB for Play Store)
eas build --platform android --profile production

# EAS Preview Build (APK for testing)
eas build --platform android --profile preview

# Local Build (requires prebuild first)
npx expo prebuild --platform android
cd android && ./gradlew bundleRelease
```

# Play Store Publishing Checklist

## ✅ Pre-requisites

- [ ] Google Play Developer Account ($25 one-time fee)
      → https://play.google.com/console/signup
- [ ] Signed release build (AAB file)
- [ ] Privacy Policy hosted on a public URL
- [ ] All required graphics prepared

---

## 📱 App Configuration (Already Done ✅)

- [x] Package name: `com.usod.security`
- [x] Version code: `1`
- [x] Version name: `1.0.0`
- [x] App name: `USOD Security`
- [x] EAS build configuration: `eas.json`

---

## 🏗️ Build the App

### Option 1: EAS Build (Recommended)
```bash
cd mobile

# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build AAB for Play Store
eas build --platform android --profile production
```

### Option 2: Local Build
```bash
cd mobile

# Generate native Android project
npx expo prebuild --platform android

# Build release AAB
cd android
./gradlew bundleRelease
```

The AAB file will be at: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📤 Upload to Play Console

### 1. Create App
- [ ] Go to Google Play Console
- [ ] Click "Create app"
- [ ] Enter app name: `USOD Security`
- [ ] Select default language: English
- [ ] Select app type: App
- [ ] Select Free or Paid
- [ ] Accept declarations

### 2. Store Listing
- [ ] **Short description** (80 chars max)
      Copy from: `store_listing/short_description.txt`
- [ ] **Full description** (4000 chars max)
      Copy from: `store_listing/app_description.md`
- [ ] **App icon** (512x512 PNG, 32-bit with alpha)
      Use: `assets/icon.png`
- [ ] **Feature graphic** (1024x500 PNG or JPEG)
      Create based on: `graphics/feature_graphic.md`
- [ ] **Phone screenshots** (minimum 2, max 8)
      Follow: `graphics/screenshots/SCREENSHOT_GUIDE.md`

### 3. App Content
- [ ] **Privacy Policy URL**
      Host the content from: `privacy_policy/privacy_policy.md`
- [ ] **App access** - Select if login is required
- [ ] **Ads** - Select "No ads"
- [ ] **Content rating** - Complete questionnaire
- [ ] **Target audience** - Select 18+
- [ ] **Data safety** - Complete using: `privacy_policy/data_safety.md`

### 4. App Release
- [ ] Create a new release
- [ ] Upload AAB file
- [ ] Add release notes from: `store_listing/release_notes.md`
- [ ] Review and start rollout

---

## 🔒 Required Declarations

### Content Rating
- IARC content rating questionnaire required
- Suggested category: **Tools** or **Business**
- Violence: None
- Sexual content: None
- Controlled substances: None

### Data Safety
Required information (see `privacy_policy/data_safety.md`):
- App collects user credentials (email, password)
- Data encrypted in transit
- Data deletion available on request
- App collects device identifiers for security

---

## 📊 Review Timeline

- **Initial review**: 3-7 days for first app
- **Updates**: Usually 1-3 days
- **Policy violations**: May delay review

---

## ⚠️ Common Rejection Reasons

1. **Missing privacy policy** - Must be hosted and accessible
2. **Incomplete store listing** - All fields required
3. **Low quality screenshots** - Must show actual app
4. **Broken functionality** - Login must work
5. **Missing permissions justification** - Explain why needed

---

## 📞 Support

- Play Console Help: https://support.google.com/googleplay/android-developer
- Expo EAS Build: https://docs.expo.dev/build/introduction/

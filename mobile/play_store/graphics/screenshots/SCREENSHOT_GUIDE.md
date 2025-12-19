# Screenshot Guide for Play Store

## Requirements

| Type | Minimum | Maximum | Recommended Size |
|------|---------|---------|------------------|
| Phone | 2 | 8 | 1080 x 1920 px (9:16) |
| 7" Tablet | 0 | 8 | 1200 x 1920 px |
| 10" Tablet | 0 | 8 | 1920 x 1200 px |

## Recommended Screenshots (in order)

### 1. Dashboard Overview
**What to capture:**
- Full dashboard with all stats visible
- Security Score card showing percentage
- Active Threats count
- Protected Users count
- Recent threats section

**Best time to capture:**
- When backend is running with sample data
- With at least some resolved/escalated threats

---

### 2. Threat Analysis
**What to capture:**
- Threat list showing multiple entries
- Mix of severity levels (Critical, High, Medium, Low)
- Status badges visible
- Time stamps visible

---

### 3. Security Logs
**What to capture:**
- Log entries with different event types
- Filtering options visible (optional)
- Pagination controls visible

---

### 4. AI Insights
**What to capture:**
- AI recommendations panel
- Threat analysis results
- Confidence scores if visible

---

### 5. Network Monitoring
**What to capture:**
- Network status indicators
- Monitoring controls
- Connection status

---

### 6. Security Lab
**What to capture:**
- Attack type buttons
- Security test results
- Educational interface elements

---

## How to Capture Screenshots

### Method 1: Using Expo (Development)

```bash
# Start the app
cd mobile
npx expo start

# Use your phone's screenshot feature while running the app
# Android: Power + Volume Down
# iOS: Power + Volume Up
```

### Method 2: Using Android Emulator

```bash
# Start emulator
npx expo start --android

# In emulator: Click camera icon in sidebar
# Or press Ctrl+S to save screenshot
```

### Method 3: Using ADB

```bash
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshot.png
```

---

## Screenshot Enhancement Tips

### Adding Device Frames (Optional but Recommended)
Use these free tools:
- **screenshots.pro** - Online tool
- **Device Art Generator** - Google's official tool
- **Figma/Canva** - With device mockup templates

### Adding Text Overlays
Add brief text explaining each screen:
- "Monitor your security score in real-time"
- "Track and respond to threats instantly"
- "AI-powered security insights"

### Color Overlay (Optional)
Match your brand colors:
- Background: `#111827`
- Accent: `#10B981` (Emerald)

---

## Checklist Before Upload

- [ ] Screenshots are sharp and clear
- [ ] No personal/sensitive data visible
- [ ] All UI elements fully loaded
- [ ] Consistent orientation (portrait recommended)
- [ ] No status bar clutter (full battery, good time)
- [ ] Representative of actual app experience

---

## File Naming Convention

```
01_dashboard.png
02_threats.png
03_logs.png
04_ai_insights.png
05_network.png
06_security_lab.png
```

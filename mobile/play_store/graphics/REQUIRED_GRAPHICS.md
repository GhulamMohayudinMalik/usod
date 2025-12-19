# Required Graphics for Play Store

## 1. App Icon (Already configured ✅)

| Specification | Requirement |
|---------------|-------------|
| Size | 512 x 512 px |
| Format | 32-bit PNG (with alpha) |
| File | `../assets/icon.png` |
| Status | ✅ Already exists |

---

## 2. Feature Graphic (Required)

| Specification | Requirement |
|---------------|-------------|
| Size | 1024 x 500 px |
| Format | JPEG or 24-bit PNG (no alpha) |
| Purpose | Displayed at top of Play Store page |

### Design Recommendations:
- Use dark background (#111827) to match app theme
- Include app name "USOD Security" prominently
- Add tagline: "Unified Security Operations Dashboard"
- Include 2-3 key feature icons (shield, analytics, AI)
- Use brand colors: Emerald (#10B981), Cyan (#06B6D4)
- Avoid text smaller than 16pt
- Keep important content in center (edges may be cropped)

### Sample Layout:
```
┌────────────────────────────────────────────────────┐
│                                                    │
│     🛡️  USOD Security                             │
│                                                    │
│     Unified Security Operations Dashboard          │
│                                                    │
│     [Shield Icon] [Chart Icon] [AI Brain Icon]    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 3. Screenshots (Required - Minimum 2)

| Specification | Requirement |
|---------------|-------------|
| Phone Size | 16:9 or 9:16 aspect ratio (1080x1920 recommended) |
| Tablet Size | 16:9 aspect ratio (optional) |
| Minimum | 2 screenshots |
| Maximum | 8 screenshots |
| Format | JPEG or 24-bit PNG |

### Recommended Screenshots:

1. **Dashboard Overview** - Shows security stats, score, active threats
2. **Threat Analysis** - Shows threat list with severity levels
3. **Security Logs** - Shows log entries with filtering
4. **AI Insights** - Shows AI-powered recommendations
5. **Network Monitoring** - Shows network status (if active)
6. **User Management** - Shows user list (admin feature)

See `screenshots/SCREENSHOT_GUIDE.md` for detailed instructions.

---

## 4. Adaptive Icon Components (For Android 8.0+)

| Component | Size | File |
|-----------|------|------|
| Foreground | 108 x 108 dp (432 x 432 px) | `../assets/adaptive-icon.png` ✅ |
| Background | Solid color | #111827 ✅ |

---

## 5. Optional Graphics

### Promo Video
- YouTube URL supported
- Landscape format (16:9)
- Shows app in action
- Max 30 seconds recommended

### TV Banner (for Android TV)
- 1280 x 720 px
- Only if targeting TV

---

## Creating Feature Graphic

You can use these tools:
1. **Canva** - Free online tool with templates
2. **Figma** - Free design tool
3. **Adobe XD** - Professional design tool
4. **GIMP** - Free image editor

### Color Palette:
- Background: `#111827` (Dark)
- Primary: `#10B981` (Emerald)
- Secondary: `#06B6D4` (Cyan)
- Text: `#FFFFFF` (White)
- Accent: `#F59E0B` (Amber for warnings)

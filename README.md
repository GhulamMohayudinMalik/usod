# USOD - Unified Security Operations Dashboard

A modern security operations dashboard for monitoring security events, login attempts, and system activities in real-time. Available as web application, desktop application, and mobile application.

## Current Versions

### 🌐 **Web Application - V3.1**
**Enhanced Security & Stability**

Complete security implementation across all endpoints with comprehensive attack detection and prevention. Latest update includes critical bug fixes and enhanced error handling for improved reliability.

### 🖥️ **Desktop Application - V1.0**
**Electron Desktop App**

Native desktop application built with Electron, featuring the same security-focused design and functionality as the web app. Includes login authentication, dashboard overview, and threat monitoring with a professional dark theme optimized for desktop use.

### 📱 **Mobile Application - V1.0**
**React Native Mobile App**

Cross-platform mobile application built with React Native and Expo, providing full access to all security management features on mobile devices. Features comprehensive security monitoring, threat analysis, user management, and interactive security testing with a mobile-optimized interface.

## Recent Updates (V3.1)

### 🔧 **Critical Bug Fixes**
- **Fixed CSRF Token Validation**: Resolved crash when accessing backup endpoints due to undefined request body
- **Enhanced Error Handling**: Improved backup page error messages and debugging capabilities
- **Development Experience**: Better security detection for localhost development while maintaining production security

### 🛡️ **Security Improvements**
- **Production Security Maintained**: All security features remain fully active in production environments
- **Development Convenience**: Suspicious activity detection relaxed only for localhost in development mode
- **Better Error Messages**: Clear feedback for authentication, permission, and network issues

### 📊 **Backup System Enhancements**
- **Improved Error Handling**: Better user feedback for backup operations
- **Enhanced Debugging**: Console logging for troubleshooting API issues
- **Token Validation**: Proper handling of expired or missing authentication tokens

## Features

- 🔐 **User Authentication** - JWT-based login system with role-based access and session management
- 📊 **Real-time Dashboard** - Live security metrics and statistics
- 🚨 **Threat Monitoring** - Security event detection and analysis
- 📝 **Comprehensive Logging** - 18 different types of security events with detailed tracking
- 🔍 **Analytics** - Security insights and trend analysis
- 🤖 **AI Insights** - Intelligent security recommendations
- 👥 **User Management** - Create, delete, and manage user roles with full audit trails
- 💾 **Backup Management** - Create, restore, and manage system backups
- ⚙️ **Settings Management** - User profile and system configuration with change tracking
- 🔒 **Session Management** - Advanced session tracking with automatic expiration and refresh
- 🚫 **Account Security** - Account locking, unlock functionality, and failed login tracking
- 🛡️ **Comprehensive Security** - SQL injection, XSS, CSRF, and brute force protection across ALL endpoints
- 🧪 **Security Testing Lab** - Interactive security testing environment for real-time attack simulation
- 📱 **Mobile Support** - Full-featured mobile application with all security management capabilities

## 🖥️ Desktop Application (Electron)

The USOD desktop application provides a native desktop experience with the same security-focused functionality as the web application.

### Desktop App Features

**🔐 Authentication System:**
- Secure login with JWT-based authentication
- Demo credentials pre-configured for testing
- Session management with automatic logout

**📊 Dashboard Overview:**
- Real-time security metrics display
- Interactive stat cards with trend indicators
- Professional dark theme with emerald/cyan accents
- Smooth animations and transitions

**🚨 Threat Monitoring:**
- Security event cards with severity levels (High, Medium, Low, Critical)
- Real-time threat information with timestamps
- Interactive threat action buttons
- Color-coded threat indicators

**🤖 AI Analysis:**
- Text analysis for potential security threats
- Interactive textarea for threat input
- Analysis simulation with loading states
- Results notification system

**🎨 User Interface:**
- Dark professional theme matching web app
- Glass-morphism design with backdrop blur
- Responsive layout optimized for desktop
- Toast notifications for user feedback

### Desktop App Setup

#### Prerequisites
- **Node.js** (v18 or higher)
- **Git**

#### Installation & Setup

```bash
# Navigate to electron directory
cd electron

# Install dependencies
npm install

# Start the desktop application
npm start
```

#### Demo Credentials

The desktop app includes the same demo credentials as the web application:

**Admin Accounts:**
- `GhulamMohayudin/gm1234`
- `Ali/ali123`

**User Accounts:**
- `Zuhaib/zuhaib123`
- `GhulamMohayudin/user123`
- `AliSami/user123`
- `ZuhaibIqbal/user123`

**Default Account:**
- `admin/password123`

#### Desktop App Structure

```
electron/
├── main.js              # Main Electron process
├── login.html           # Login page with authentication
├── dashboard.html       # Main dashboard with stats and threats
├── package.json         # Dependencies and scripts
└── README.md           # Desktop app documentation
```

#### Development Commands

```bash
# Start desktop app
npm start

# Start with development tools
npm run dev
```

## 📱 Mobile Application (React Native)

The USOD mobile application provides a comprehensive security management experience on mobile devices, built with React Native and Expo for cross-platform compatibility.

### Mobile App Features

**🔐 Authentication System:**
- Secure login with JWT-based authentication
- Demo credentials pre-configured for testing
- Session management with automatic logout
- Mobile-optimized login interface

**📊 Dashboard Overview:**
- Real-time security metrics display
- Interactive stat cards with trend indicators
- Professional dark theme with emerald/cyan accents
- Mobile-optimized layout and navigation

**🚨 Comprehensive Security Management:**
- **Threat Analysis**: Interactive text analysis for potential security threats
- **Security Lab**: Interactive attack testing with 12 different attack types
- **Logs Analysis**: Real-time security logs with filtering and pagination
- **Analytics Dashboard**: Security insights with charts and metrics
- **User Management**: Create, delete, and manage user roles
- **Backup Management**: Create, restore, and schedule backups
- **Settings Configuration**: Comprehensive settings management

**🛡️ Interactive Security Lab:**
- **Attack Testing**: Test 12 different attack types (SQL injection, XSS, brute force, etc.)
- **Real-time Detection**: See security events as they're detected
- **Educational Interface**: Learn about different attack vectors
- **Live Logs**: View security logs in real-time during testing
- **Attack Simulation**: Safe testing environment for security features

**📱 Mobile-Optimized Interface:**
- **Responsive Design**: Optimized for various screen sizes
- **Touch-Friendly**: Large buttons and touch-optimized controls
- **Sidebar Navigation**: Easy access to all features
- **Pull-to-Refresh**: Intuitive data refresh functionality
- **Dark Theme**: Professional dark theme with proper contrast

### Mobile App Setup

#### Prerequisites
- **Node.js** (v18 or higher)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go App** (for testing on physical devices)
- **Git**

#### Installation & Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start the mobile application
npx expo start
```

#### Development Commands

```bash
# Start Expo development server
npx expo start

# Start with tunnel (for testing on physical devices)
npx expo start --tunnel

# Start with specific platform
npx expo start --android
npx expo start --ios

# Build for production
npx expo build:android
npx expo build:ios
```

#### Demo Credentials

The mobile app uses the same demo credentials as the web and desktop applications:

**Admin Accounts:**
- `GhulamMohayudin/gm1234`
- `Ali/ali123`

**User Accounts:**
- `Zuhaib/zuhaib123`
- `GhulamMohayudin/user123`
- `AliSami/user123`
- `ZuhaibIqbal/user123`

**Default Account:**
- `admin/password123`

#### Mobile App Structure

```
mobile/
├── App.js                    # Main application entry point
├── screens/                  # All application screens
│   ├── LoginScreen.js        # Authentication screen
│   ├── DashboardScreen.js    # Main dashboard with security stats
│   ├── ThreatsScreen.js      # Threat analysis and testing
│   ├── LogsScreen.js         # Security logs analysis
│   ├── AnalyticsScreen.js    # Analytics dashboard
│   ├── AIInsightsScreen.js   # AI-powered insights
│   ├── UsersScreen.js        # User management
│   ├── SecurityScreen.js     # Security management
│   ├── SecurityLabScreen.js  # Interactive security testing
│   ├── BackupScreen.js       # Backup management
│   ├── ChangePasswordScreen.js # Password change form
│   └── SettingsScreen.js     # Settings configuration
├── components/               # Reusable components
│   ├── Header.js            # Application header
│   └── Sidebar.js           # Navigation sidebar
├── package.json             # Dependencies and scripts
└── README.md               # Mobile app documentation
```

#### Mobile App Screens

**🔐 Login Screen:**
- Secure authentication interface
- Demo credentials display
- Loading states and error handling
- Mobile-optimized form inputs

**📊 Dashboard Screen:**
- Real-time security statistics
- Recent threats display
- AI analysis interface
- Interactive refresh functionality

**🚨 Threat Analysis Screen:**
- Text input for threat analysis
- AI-powered threat detection
- Analysis history with pagination
- Real-time results display

**📝 Logs Analysis Screen:**
- Comprehensive security logs
- Advanced filtering options
- Paginated data display
- Export capabilities

**📈 Analytics Screen:**
- Security metrics and trends
- Interactive charts and graphs
- Event breakdown by type and severity
- Performance indicators

**🤖 AI Insights Screen:**
- Intelligent security recommendations
- Threat analysis results
- Automated insights generation
- Interactive recommendations

**👥 User Management Screen:**
- User creation and deletion
- Role management
- Activity tracking
- Permission management

**🛡️ Security Management Screen:**
- IP blocking and management
- Security statistics
- Threat monitoring
- Security status indicators

**🧪 Security Lab Screen:**
- Interactive attack testing
- 12 different attack types
- Real-time security detection
- Educational interface

**💾 Backup Management Screen:**
- Backup creation and restoration
- Backup scheduling
- Storage management
- Backup history

**🔐 Change Password Screen:**
- Secure password change
- Password strength validation
- Security requirements
- Additional security options

**⚙️ Settings Screen:**
- Comprehensive configuration
- Security settings
- Notification preferences
- App information

#### Testing on Devices

**Using Expo Go (Recommended for Development):**
1. Install Expo Go app on your mobile device
2. Run `npx expo start` in the mobile directory
3. Scan the QR code with Expo Go app
4. The app will load on your device

**Using Physical Device:**
1. Connect your device via USB
2. Enable USB debugging (Android) or developer mode (iOS)
3. Run `npx expo start --android` or `npx expo start --ios`
4. The app will install and run on your device

**Using Simulator/Emulator:**
1. Install Android Studio (Android) or Xcode (iOS)
2. Set up simulator/emulator
3. Run `npx expo start --android` or `npx expo start --ios`
4. The app will open in the simulator

#### Mobile App Features

**🎯 Key Capabilities:**
- **Full Feature Parity**: All web app features available on mobile
- **Offline Support**: Basic functionality works without internet
- **Real-time Updates**: Live data synchronization
- **Push Notifications**: Security alerts and updates
- **Biometric Authentication**: Fingerprint/Face ID support (future)
- **Dark Mode**: Professional dark theme
- **Responsive Design**: Works on phones and tablets

**🛡️ Security Features:**
- **Interactive Security Lab**: Test 12 different attack types
- **Real-time Threat Detection**: Immediate security alerts
- **Comprehensive Logging**: All security events tracked
- **User Management**: Full user administration capabilities
- **Backup Management**: Complete backup and restore functionality
- **Settings Management**: Granular security and privacy controls

**📱 Mobile-Specific Features:**
- **Touch-Optimized**: Large buttons and touch-friendly interface
- **Swipe Navigation**: Intuitive gesture-based navigation
- **Pull-to-Refresh**: Easy data refresh functionality
- **Responsive Layout**: Adapts to different screen sizes
- **Mobile Notifications**: Native mobile notifications
- **Offline Mode**: Basic functionality without internet connection

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Server-Sent Events** for real-time updates

### Frontend
- **Next.js 15** with React 19
- **Tailwind CSS** for styling
- **Responsive design** with dark theme

### Desktop Application
- **Electron** for native desktop functionality
- **HTML/CSS/JavaScript** for UI components
- **Node.js** integration for backend communication
- **Glass-morphism design** with dark theme

### Mobile Application
- **React Native** with Expo for cross-platform development
- **React Navigation** for navigation management
- **React Native Safe Area Context** for device compatibility
- **StyleSheet** for mobile-optimized styling
- **Expo CLI** for development and deployment
- **Cross-platform compatibility** (iOS and Android)

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd usod-testing
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
```

**Configure `.env` file:**
```env
MONGODB_URI=mongodb://localhost:27017/usod
JWT_SECRET=your-super-secret-jwt-key-here
INGEST_API_KEY=your-api-key-for-log-ingestion
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install
```

### 4. Database Setup

```bash
# From backend directory
npm run seed
```

This creates initial user accounts:
- **Admin accounts:** `GhulamMohayudin/gm123`, `Ali/ali123`
- **User accounts:** `Zuhaib/zuhaib123`, `GhulamMohayudin/user123`, `AliSami/user123`, `ZuhaibIqbal/user123`

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Web Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### 7. Desktop Application (Optional)

```bash
# Navigate to electron directory
cd electron

# Install dependencies
npm install

# Start the desktop application
npm start
```

**Desktop App Features:**
- Native desktop experience
- Same authentication and dashboard as web app
- Professional dark theme with emerald/cyan accents
- Demo credentials pre-configured

### 8. Mobile Application (Optional)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start the mobile application
npx expo start
```

**Mobile App Features:**
- Cross-platform mobile experience (iOS and Android)
- Full feature parity with web and desktop apps
- Interactive security lab with 12 attack types
- Mobile-optimized interface with touch controls
- Demo credentials pre-configured

## API Documentation

### Authentication Endpoints

#### Register User
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"username":"newuser","email":"user@example.com","password":"password123","role":"user"}'

# cURL
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"newuser\",\"email\":\"user@example.com\",\"password\":\"password123\",\"role\":\"user\"}"
```

#### Login User
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"GhulamMohayudin","password":"gm123"}'

# cURL
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"GhulamMohayudin\",\"password\":\"gm123\"}"
```

### Log Ingestion Endpoints

#### Ingest Login Log
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/ingest/login" -Method POST -ContentType "application/json" -Headers @{"x-api-key"="your-api-key-for-log-ingestion"} -Body '{"userId":"USER_ID_HERE","status":"success","ipAddress":"192.168.1.100","userAgent":"Mozilla/5.0...","details":{"location":{"country":"USA","city":"New York"}}}'

# cURL
curl -X POST http://localhost:5000/api/ingest/login -H "Content-Type: application/json" -H "x-api-key: your-api-key-for-log-ingestion" -d "{\"userId\":\"USER_ID_HERE\",\"status\":\"success\",\"ipAddress\":\"192.168.1.100\",\"userAgent\":\"Mozilla/5.0...\",\"details\":{\"location\":{\"country\":\"USA\",\"city\":\"New York\"}}}"
```

#### Ingest Generic Log
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/ingest/log" -Method POST -ContentType "application/json" -Headers @{"x-api-key"="your-api-key-for-log-ingestion"} -Body '{"userId":"USER_ID_HERE","action":"security_event","status":"detected","ipAddress":"192.168.1.100","details":{"eventType":"malware","severity":"high","description":"Suspicious file detected"}}'

# cURL
curl -X POST http://localhost:5000/api/ingest/log -H "Content-Type: application/json" -H "x-api-key: your-api-key-for-log-ingestion" -d "{\"userId\":\"USER_ID_HERE\",\"action\":\"security_event\",\"status\":\"detected\",\"ipAddress\":\"192.168.1.100\",\"details\":{\"eventType\":\"malware\",\"severity\":\"high\",\"description\":\"Suspicious file detected\"}}"
```

## 🛡️ Comprehensive Security Implementation

USOD V3.0 features **enterprise-grade security** with protection across ALL application endpoints. Every POST, PUT, and DELETE request is automatically scanned for malicious activity.

### Security Features

#### 🔒 **Attack Detection & Prevention**
- **SQL Injection Protection** - Detects and blocks malicious SQL patterns
- **XSS Prevention** - Prevents cross-site scripting attacks
- **CSRF Protection** - Validates request origins and tokens
- **Brute Force Detection** - Tracks and blocks repeated failed attempts
- **Suspicious Activity Monitoring** - Flags unusual patterns and behaviors
- **Information Disclosure Detection** - Prevents sensitive data exposure attempts
- **LDAP Injection Protection** - Blocks LDAP injection attacks
- **NoSQL Injection Protection** - Prevents NoSQL injection attempts
- **Command Injection Protection** - Blocks system command injection
- **Path Traversal Protection** - Prevents directory traversal attacks
- **SSRF Protection** - Blocks server-side request forgery attempts
- **XXE Protection** - Prevents XML external entity attacks

#### 🚫 **IP Management**
- **Automatic IP Blocking** - Blocks IPs after multiple failed attempts
- **Manual IP Management** - Admin can manually block/unblock IPs
- **IP Whitelisting** - Support for trusted IP addresses
- **Suspicious IP Tracking** - Monitors and flags suspicious IP addresses

#### 🧪 **Security Testing Lab**
- **Interactive Testing Environment** - Test security features in real-time
- **Attack Simulation** - Manually trigger various attack types
- **Real-time Logging** - See security events as they happen
- **Educational Interface** - Learn about different attack vectors

#### 📊 **Security Monitoring**
- **Real-time Threat Detection** - Immediate alerts for security events
- **Security Statistics** - Track blocked IPs, detected attacks, and threat levels
- **Comprehensive Logging** - All security events logged with detailed information

#### 🔧 **Security Management Tools**
- **IP Unblock Script** - Reset security state when needed for testing
- **Security State Reset** - Clear blocked IPs and suspicious activity tracking
- **Manual Security Override** - Admin tools for security management

#### 🎯 **Attack Detection Patterns**
The system detects and blocks the following attack patterns:

**SQL Injection Patterns:**
- `UNION SELECT`, `DROP TABLE`, `INSERT INTO`, `UPDATE SET`, `DELETE FROM`
- `OR 1=1`, `' OR '1'='1`, `--`, `/* */`, `xp_cmdshell`, `sp_executesql`

**XSS Patterns:**
- `<script>`, `javascript:`, `onload=`, `<iframe>`, `<object>`, `<embed>`
- `expression()`, `url()`, `@import`

**LDAP Injection Patterns:**
- `*)`, `(`, `)`, `&`, `|`, `!`, `cn=`, `ou=`, `dc=`, `objectClass=`

**Command Injection Patterns:**
- `;`, `|`, `&`, `$`, `>`, `<`, `\`, `'`, `"`, `\n`, `\r`

**Path Traversal Patterns:**
- `../`, `..\\`, `%2e%2e%2f`, `%2e%2e%5c`

**Information Disclosure Patterns:**
- `version`, `build`, `release`, `debug`, `test`, `staging`, `dev`, `localhost`
- `127.0.0.1`, `internal`, `private`, `secret`, `password`, `key`, `token`

**SSRF Patterns:**
- `http://`, `https://`, `ftp://`, `file://`, `gopher://`, `ldap://`

**XXE Patterns:**
- `<!DOCTYPE`, `<!ENTITY`, `SYSTEM`, `PUBLIC`, `%`, `&`

#### ⚙️ **Security Configuration**
The security system uses the following thresholds and settings:

**Brute Force Protection:**
- **Threshold**: 5 failed attempts within 15 minutes
- **Action**: IP blocked for 1 hour
- **Window**: 15-minute sliding window

**Suspicious Activity:**
- **Threshold**: 3 failed attempts within 5 minutes
- **Action**: IP added to suspicious list
- **Window**: 5-minute sliding window
- **Development Mode**: Suspicious activity detection disabled for localhost (127.0.0.1) when `NODE_ENV=development`
- **Production Mode**: Full suspicious activity detection active for all IPs

**IP Blocking:**
- **Duration**: 1 hour (60 minutes)
- **Max Attempts**: 20 attempts per IP before permanent blocking
- **Auto-cleanup**: Every 5 minutes

**Account Locking:**
- **Max Failed Attempts**: 5 attempts per account
- **Lockout Duration**: 30 minutes
- **Auto-unlock**: After lockout period expires

**Environment-Based Security:**
- **Development**: Relaxed security for localhost testing
- **Production**: Full security enforcement for all connections
- **CSRF Protection**: Enhanced validation to prevent crashes

### Protected Endpoints

**ALL** the following endpoints are now protected with security middleware:

- ✅ **Authentication Routes** (`/api/auth/*`)
- ✅ **User Management** (`/api/users/*`)
- ✅ **Backup Operations** (`/api/backup/*`)
- ✅ **Log Management** (`/api/logs/*`)
- ✅ **Data Ingestion** (`/api/ingest/*`)

## Comprehensive Logging System

The USOD system implements a comprehensive logging system that captures **30 different types of events** (18 application events + 12 security events) with detailed information for each event type.

### Security Event Types

The system logs **12 different types of security events** with detailed information:

#### Attack Detection Events
1. **SQL Injection Attempt** - `sql_injection_attempt`
2. **XSS Attack Attempt** - `xss_attempt`
3. **LDAP Injection Attempt** - `ldap_injection_attempt`
4. **NoSQL Injection Attempt** - `nosql_injection_attempt`
5. **Command Injection Attempt** - `command_injection_attempt`
6. **Path Traversal Attempt** - `path_traversal_attempt`
7. **SSRF Attempt** - `ssrf_attempt`
8. **XXE Attempt** - `xxe_attempt`
9. **Information Disclosure Attempt** - `information_disclosure_attempt`
10. **Suspicious Activity** - `suspicious_activity`
11. **CSRF Attempt** - `csrf_attempt`
12. **Brute Force Attack** - `brute_force_detected`

### Log Types Overview

#### Authentication & Session Management
| Log Type | Description | Status Values | Use Cases |
|----------|-------------|---------------|-----------|
| **login** | User authentication events | `success`, `failure` | Track login attempts, failed logins, brute force detection |
| **logout** | User session termination | `success` | Monitor user logout activities, session management |
| **session_created** | New session establishment | `success` | Track when user sessions are established |
| **session_expired** | Session timeout events | `success` | Monitor session timeout events |
| **token_refresh** | JWT/token refresh activities | `success`, `failure` | Track token refresh activities |
| **account_locked** | Account lockout events | `detected` | Log when accounts are locked due to failed attempts |
| **account_unlocked** | Account unlock events | `success` | Track account unlock events |

#### User & Profile Management
| Log Type | Description | Status Values | Use Cases |
|----------|-------------|---------------|-----------|
| **password_change** | Password modification events | `success`, `failure` | Track password changes, security policy compliance |
| **profile_update** | User profile modifications | `success`, `failure` | Monitor profile changes, data integrity |
| **user_created** | New user creation | `success`, `failure` | Log new user creation events |
| **user_deleted** | User deletion events | `success`, `failure` | Track user deletion activities |
| **role_changed** | Role/permission changes | `success`, `failure` | Monitor role and permission changes |

#### System & Security Events
| Log Type | Description | Status Values | Use Cases |
|----------|-------------|---------------|-----------|
| **access_denied** | Authorization failures | `failure` | Track permission violations, unauthorized access attempts |
| **system_error** | Application/system errors | `failure` | Monitor system health, error tracking |
| **security_event** | Security incidents | `detected` | Track security threats, malware, intrusions |
| **settings_changed** | Settings modifications | `success`, `failure` | Track system/user settings changes |
| **backup_created** | Backup operations | `success`, `failure` | Log backup creation activities |
| **backup_restored** | Restore operations | `success`, `failure` | Track backup restore activities |

### Log Data Structure

Each log entry contains the following information:

```json
{
  "userId": "ObjectId",           // User who performed the action
  "action": "string",             // One of the 7 log types
  "status": "string",             // success, failure, or detected
  "ipAddress": "string",          // Real IP address (handles IPv6 localhost)
  "userAgent": "string",          // Browser/client information
  "details": {                    // Action-specific details
    "timestamp": "Date",
    "browser": "string",          // Detected browser (Chrome, Firefox, etc.)
    "os": "string",               // Detected OS (Windows 10, macOS, etc.)
    "username": "string",         // Username for reference
    // ... additional fields based on action type
  },
  "timestamp": "Date"             // When the event occurred
}
```

### Detailed Log Type Specifications

#### 1. Login Logs (`login`)
**Triggers**: User login attempts (successful and failed)
**Details Include**:
- `reason`: `successful_login`, `user_not_found`, `invalid_password`, `account_inactive`
- `loginMethod`: `password`, `sso`, `2fa`
- `attemptedUsername`: Username used in login attempt
- `browser`: Detected browser (Chrome, Firefox, Safari, Edge, Opera)
- `os`: Detected operating system

**Example**:
```json
{
  "action": "login",
  "status": "failure",
  "details": {
    "reason": "invalid_password",
    "attemptedUsername": "admin",
    "browser": "Chrome",
    "os": "Windows 10"
  }
}
```

#### 2. Logout Logs (`logout`)
**Triggers**: User logout events
**Details Include**:
- `reason`: `user_logout`, `session_timeout`, `admin_action`
- `logoutMethod`: `manual`, `automatic`
- `browser`: Detected browser
- `os`: Detected operating system

#### 3. Password Change Logs (`password_change`)
**Triggers**: Password modification attempts
**Details Include**:
- `reason`: `user_initiated`, `admin_reset`, `expired`, `compromised`
- `passwordStrength`: `weak`, `medium`, `strong`
- `changedBy`: Username who changed the password
- `passwordLength`: Length of new password

#### 4. Profile Update Logs (`profile_update`)
**Triggers**: User profile modifications
**Details Include**:
- `reason`: `user_initiated`, `admin_action`
- `fieldsChanged`: Array of changed fields (`email`, `username`, etc.)
- `updatedBy`: Username who made the changes
- `targetUserId`: ID of user whose profile was updated

#### 5. Access Denied Logs (`access_denied`)
**Triggers**: Authorization failures
**Details Include**:
- `resource`: Resource that was accessed (`/api/users`, `/admin`, etc.)
- `requiredRole`: Role needed to access resource
- `userRole`: Actual role of the user
- `reason`: `insufficient_permissions`, `resource_not_found`, `account_locked`

#### 6. System Error Logs (`system_error`)
**Triggers**: Application or system errors
**Details Include**:
- `errorCode`: Specific error code (`USER_CREATION_ERROR`, `DATABASE_CONNECTION_ERROR`)
- `component`: System component (`user_management`, `authentication`, `database`)
- `severity`: `low`, `medium`, `high`, `critical`
- `errorMessage`: Detailed error description

#### 7. Security Event Logs (`security_event`)
**Triggers**: Security incidents and threats
**Details Include**:
- `eventType`: `malware`, `intrusion`, `data_leak`, `unauthorized_access`, `suspicious_activity`, `phishing`
- `severity`: `low`, `medium`, `high`, `critical`
- `source`: Source IP or system
- `target`: Target system or resource
- `description`: Detailed event description
- `resolved`: Boolean indicating if event was resolved

### Authentication & Session Management Endpoints

#### Login User
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"GhulamMohayudin","password":"gm123"}'

# cURL
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username":"GhulamMohayudin","password":"gm123"}'
```

#### Logout User
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/logout" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}

# cURL
curl -X POST http://localhost:5000/api/auth/logout -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Refresh Token
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/refresh" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}

# cURL
curl -X POST http://localhost:5000/api/auth/refresh -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Check Session Status
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/session-status" -Method GET -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}

# cURL
curl -X GET http://localhost:5000/api/auth/session-status -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Unlock Account (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/unlock-account" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"userId":"USER_ID","unlockedBy":"admin"}'

# cURL
curl -X POST http://localhost:5000/api/auth/unlock-account -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"userId":"USER_ID","unlockedBy":"admin"}'
```

### User Management Endpoints

#### Create User (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/create" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"username":"newuser","email":"user@example.com","password":"password123","role":"user"}'

# cURL
curl -X POST http://localhost:5000/api/users/create -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"username":"newuser","email":"user@example.com","password":"password123","role":"user"}'
```

#### Delete User (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/users/USER_ID" -Method DELETE -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"reason":"manual_deletion"}'

# cURL
curl -X DELETE http://localhost:5000/api/users/users/USER_ID -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"reason":"manual_deletion"}'
```

#### Change User Role (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/users/USER_ID/role" -Method PUT -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"newRole":"admin","reason":"promotion"}'

# cURL
curl -X PUT http://localhost:5000/api/users/users/USER_ID/role -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"newRole":"admin","reason":"promotion"}'
```

#### Change Password
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/change-password" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"currentPassword":"oldpass","newPassword":"newpass123"}'

# cURL
curl -X POST http://localhost:5000/api/users/change-password -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"currentPassword":"oldpass","newPassword":"newpass123"}'
```

#### Update Profile
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/profile" -Method PUT -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"email":"newemail@example.com","username":"newusername"}'

# cURL
curl -X PUT http://localhost:5000/api/users/profile -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"email":"newemail@example.com","username":"newusername"}'
```

#### Update Settings
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/settings" -Method PUT -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"settingType":"security","settingName":"session_timeout","newValue":"12","changeScope":"user"}'

# cURL
curl -X PUT http://localhost:5000/api/users/settings -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"settingType":"security","settingName":"session_timeout","newValue":"12","changeScope":"user"}'
```

#### Get All Users (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/users" -Method GET -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}

# cURL
curl -X GET http://localhost:5000/api/users/users -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Backup Management Endpoints

#### Create Security Logs Backup (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/backup/security-logs" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"reason":"manual"}'

# cURL
curl -X POST http://localhost:5000/api/backup/security-logs -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"reason":"manual"}'
```

#### Create Users Backup (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/backup/users" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"reason":"manual"}'

# cURL
curl -X POST http://localhost:5000/api/backup/users -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"reason":"manual"}'
```

#### Create Full System Backup (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/backup/full" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"reason":"manual"}'

# cURL
curl -X POST http://localhost:5000/api/backup/full -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"reason":"manual"}'
```

#### List Available Backups (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/backup/list" -Method GET -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}

# cURL
curl -X GET http://localhost:5000/api/backup/list -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Restore Backup (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/backup/restore/BACKUP_NAME" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"reason":"manual_restore","restoreScope":"full"}'

# cURL
curl -X POST http://localhost:5000/api/backup/restore/BACKUP_NAME -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"reason":"manual_restore","restoreScope":"full"}'
```

#### Get Backup Statistics (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/backup/stats" -Method GET -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}

# cURL
curl -X GET http://localhost:5000/api/backup/stats -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Cleanup Old Backups (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/backup/cleanup" -Method POST -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}

# cURL
curl -X POST http://localhost:5000/api/backup/cleanup -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Pages

#### Dashboard (`/dashboard`)
- Real-time security metrics and statistics
- Live threat monitoring and alerts
- System health indicators
- Quick access to all features

#### User Management (`/dashboard/users`)
- **Create Users**: Add new users with role assignment (admin only)
- **Delete Users**: Remove users with reason tracking (admin only)
- **Role Management**: Change user roles with audit logging (admin only)
- **User List**: View all users with their roles and status

#### Security Testing Lab (`/dashboard/security-lab`)
- **Interactive Attack Testing**: Manually trigger various attack types
- **Real-time Detection**: See security events as they're detected
- **Attack Types**: SQL injection, XSS, brute force, suspicious activity, CSRF
- **Educational Interface**: Learn about different attack vectors
- **Live Logs**: View security logs in real-time during testing
- **Attack Simulation**: Test 12 different attack types safely
- **Response Analysis**: See exactly how the system responds to each attack
- **Learning Mode**: Educational tool for understanding security threats

#### Backup Management (`/dashboard/backup`)
- **Create Backups**: Full system, security logs, or users-only backups (admin only)
- **Restore Backups**: Restore from any available backup with scope selection (admin only)
- **Backup Statistics**: View backup counts, sizes, and retention information
- **Cleanup Management**: Remove old backups automatically (admin only)
- **Backup History**: Complete list of all available backups with metadata

#### Settings (`/dashboard/settings`)
- **Profile Management**: Update username, email, and personal information
- **Security Settings**: Configure session timeout, login attempts, password expiry
- **Notification Preferences**: Manage alert settings for different event types
- **System Information**: View application version, environment, and user statistics
- **Settings Logging**: All changes are automatically logged for audit purposes

#### Change Password (`/dashboard/change-password`)
- Secure password change with current password verification
- Password strength indicator (Weak/Fair/Good/Strong)
- Password confirmation matching
- Security tips and best practices

#### Logs Analysis (`/dashboard/logs`)
- Real-time log streaming with live updates
- Filter by log type, status, and date range
- Detailed log information with full context
- Export capabilities for audit and analysis

#### Analytics (`/dashboard/analytics`)
- Security insights and trend analysis
- Visual charts and graphs for data interpretation
- Historical data analysis and reporting

#### AI Insights (`/dashboard/ai-insights`)
- Intelligent security recommendations
- Automated threat detection and analysis
- Predictive security insights

### Log Monitoring

All logs are automatically captured and can be viewed in the **Logs Analysis** page (`/dashboard/logs`) with:
- Real-time log streaming
- Filtering by log type, status, and date range
- Detailed log information display
- Export capabilities

### Data Retrieval Endpoints

#### Get Dashboard Statistics
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/data/dashboard-stats" -Method GET

# cURL
curl -X GET http://localhost:5000/api/data/dashboard-stats
```

#### Get Login Attempts
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/data/login-attempts?count=10" -Method GET

# cURL
curl -X GET "http://localhost:5000/api/data/login-attempts?count=10"
```

#### Get Security Events
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/data/security-events?count=10" -Method GET

# cURL
curl -X GET "http://localhost:5000/api/data/security-events?count=10"
```

## Available Log Types

The system supports the following **18 log types**:

### Authentication & Session Management
1. **login** - User login attempts
2. **logout** - User logout events
3. **session_created** - New session establishment
4. **session_expired** - Session timeout events
5. **token_refresh** - JWT/token refresh activities
6. **account_locked** - Account lockout events
7. **account_unlocked** - Account unlock events

### User & Profile Management
8. **password_change** - Password change attempts
9. **profile_update** - User profile modifications
10. **user_created** - New user creation events
11. **user_deleted** - User deletion events
12. **role_changed** - Role and permission changes

### System & Security Events
13. **access_denied** - Unauthorized access attempts
14. **system_error** - System-level errors
15. **security_event** - Security threats and incidents
16. **settings_changed** - Settings modifications
17. **backup_created** - Backup creation activities
18. **backup_restored** - Backup restore activities

## Project Structure

```
usod-testing/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication & API key middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Database seeding & security scripts
│   │   ├── services/        # Business logic services
│   │   └── server.js        # Main server file
│   ├── backups/             # System backup files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── dashboard/   # Dashboard pages
│   │   │   └── login/       # Authentication pages
│   │   ├── components/      # React components
│   │   └── services/        # API service functions
│   └── package.json
├── electron/                # Desktop application
│   ├── main.js              # Main Electron process
│   ├── login.html           # Login page
│   ├── dashboard.html       # Dashboard page
│   └── package.json         # Desktop app dependencies
├── mobile/                  # Mobile application
│   ├── App.js               # Main React Native app entry
│   ├── screens/             # All application screens
│   │   ├── LoginScreen.js   # Authentication screen
│   │   ├── DashboardScreen.js # Main dashboard
│   │   ├── ThreatsScreen.js # Threat analysis
│   │   ├── LogsScreen.js    # Security logs
│   │   ├── AnalyticsScreen.js # Analytics dashboard
│   │   ├── AIInsightsScreen.js # AI insights
│   │   ├── UsersScreen.js   # User management
│   │   ├── SecurityScreen.js # Security management
│   │   ├── SecurityLabScreen.js # Interactive security lab
│   │   ├── BackupScreen.js  # Backup management
│   │   ├── ChangePasswordScreen.js # Password change
│   │   └── SettingsScreen.js # Settings configuration
│   ├── components/          # Reusable components
│   │   ├── Header.js        # Application header
│   │   └── Sidebar.js       # Navigation sidebar
│   └── package.json         # Mobile app dependencies
└── README.md
```

### Key Files and Their Purposes

#### Backend Security Files
- `src/services/securityDetectionService.js` - Main security detection logic
- `src/middleware/auth.js` - JWT authentication middleware
- `src/middleware/apiKeyAuth.js` - API key authentication
- `src/scripts/fullSecurityReset.js` - Security state reset script

#### Frontend Dashboard Pages
- `src/app/dashboard/security-lab/page.js` - Security testing interface
- `src/app/dashboard/logs/page.js` - Real-time log monitoring
- `src/app/dashboard/users/page.js` - User management interface
- `src/app/dashboard/backup/page.js` - Backup management interface

#### Desktop Application Files
- `electron/main.js` - Main Electron process with window management
- `electron/login.html` - Desktop login page with authentication
- `electron/dashboard.html` - Desktop dashboard with stats and threats
- `electron/package.json` - Desktop app dependencies and scripts

#### Configuration Files
- `backend/.env` - Backend environment variables
- `frontend/next.config.mjs` - Next.js configuration
- `backend/package.json` - Backend dependencies
- `frontend/package.json` - Frontend dependencies

## Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-restart on file changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Development server with hot reload
```

### Desktop Application Development
```bash
cd electron
npm start    # Start desktop application
npm run dev  # Start with development tools (DevTools)
```

### Database Seeding
```bash
cd backend
npm run seed  # Reset and seed database with initial users
```

### Available Scripts

#### Backend Scripts (`backend/src/scripts/`)

**1. Database Seeding (`seedUsers.js`)**
```bash
npm run seed
```
- Creates initial user accounts for testing
- Admin accounts: `GhulamMohayudin/gm123`, `Ali/ali123`
- User accounts: `Zuhaib/zuhaib123`, `AliSami/user123`, `ZuhaibIqbal/user123`

**2. Security Reset (`fullSecurityReset.js`)**
```bash
node src/scripts/fullSecurityReset.js
```
- Unblocks all IP addresses
- Clears suspicious IPs list
- Resets IP attempts tracking
- Unlocks all locked accounts
- Resets failed login attempts
- **Use after security testing**

**3. Log Generation (`generate.js`)**
```bash
node src/scripts/generate.js
```
- Generates sample security logs for testing
- Creates realistic log data for demonstrations
- Useful for populating the dashboard with test data

#### Frontend Scripts (`frontend/`)

**Development Server**
```bash
npm run dev  # Start Next.js development server
```

**Production Build**
```bash
npm run build  # Build for production
npm start      # Start production server
```

### Security Management

#### Unblock IP Address (For Testing)
If you get locked out due to security testing or false positives, use the security reset script:

```bash
# From backend directory
cd backend
node src/scripts/fullSecurityReset.js
```

This script will:
- Unblock your IP address (127.0.0.1)
- Clear the suspicious IPs list
- Reset IP attempts tracking (brute force protection)
- Unlock any locked user accounts
- Reset failed login attempts for all users
- Allow you to log in normally again

**Note**: This script is intended for development and testing purposes. In production, use proper admin tools for security management.

### Security Testing Workflow

#### Testing Attack Detection
The security system blocks malicious attempts and locks out the IP address. Here's how to test it:

**Step 1: Test SQL Injection Attack**
```bash
# This will trigger SQL injection detection and block your IP
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"'' OR 1=1 --"}'

# Expected Response: {"message":"Invalid request: Malicious input detected","code":"SQL_INJECTION_DETECTED"}
```

**Step 2: Verify IP is Blocked**
```bash
# This should fail because your IP is now blocked
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"GhulamMohayudin","password":"gm123"}'

# Expected Response: {"message":"Access denied: IP address is blocked","code":"IP_BLOCKED"}
```

**Step 3: Unblock Your IP**
```bash
# Run the security reset script to unblock your IP
cd backend
node src/scripts/fullSecurityReset.js

# Expected Output: Security state reset successfully
```

**Step 4: Verify Normal Login Works**
```bash
# This should now work normally
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"GhulamMohayudin","password":"gm123"}'

# Expected Response: Login successful with JWT token
```

#### Testing XSS Attacks
```bash
# Test XSS detection
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"<script>alert(1)</script>","password":"test"}'

# Expected Response: {"message":"Invalid request: Malicious input detected","code":"XSS_DETECTED"}
```

#### Testing Other Attack Types
```bash
# Test LDAP Injection
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin)(&(password=*))","password":"test"}'

# Test Command Injection
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin; ls -la","password":"test"}'

# Test Path Traversal
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"../../../etc/passwd","password":"test"}'
```

#### When to Use the Unblock Script
Run the unblock script (`node src/scripts/fullSecurityReset.js`) when:
- You get "IP address is blocked" errors
- You've been testing security features
- You need to reset the security state for demonstrations
- You're locked out due to false positives during development

#### Security Testing Best Practices
1. **Always test in a development environment**
2. **Use the unblock script after testing attacks**
3. **Test both attack detection AND normal functionality**
4. **Verify the system works end-to-end**
5. **Document any issues for production deployment**

## Environment Variables

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `INGEST_API_KEY` - API key for log ingestion endpoints
- `FRONTEND_URL` - Frontend URL for CORS configuration
- `PORT` - Backend server port (default: 5000)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check your MongoDB Atlas connection string
   - Verify the `MONGODB_URI` in your `.env` file

2. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Kill existing processes using the port: `netstat -ano | findstr :5000`

3. **API Key Authentication Failed**
   - Ensure the `x-api-key` header matches the `INGEST_API_KEY` in your `.env` file

4. **Frontend Not Loading**
   - Check if the backend is running on the correct port
   - Verify the `FRONTEND_URL` in your backend `.env` file

5. **Login Blocked Due to Security Testing**
   - If you get "Invalid request: Malicious input detected" or similar errors
   - Run the security reset script: `cd backend && node src/scripts/fullSecurityReset.js`
   - This happens when security patterns are detected in your input during testing

6. **IP Address Blocked**
   - If your IP is blocked due to multiple failed attempts
   - Use the security reset script to reset security state
   - Check the security logs in the dashboard for details

7. **Backup Page "Failed to fetch backups" Error**
   - Check if you're logged in (token exists in localStorage)
   - Verify backend server is running on port 5000
   - Check browser console for detailed error messages
   - Ensure you're using an admin account (backup management is admin-only)
   - If token is expired, log out and log back in

### Health Check
```bash
# Check if backend is running
curl http://localhost:5000/health
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🚨 DEPLOYMENT READINESS CHECKLIST

**⚠️ NOT READY FOR PRODUCTION DEPLOYMENT - The following items must be completed:**

### Critical Missing Items:
- [ ] **Environment Files**: Create `.env` files for both frontend and backend
- [ ] **Hardcoded URLs**: Replace all `localhost:5000` references with environment variables
- [ ] **Production Configuration**: Add Docker files and production build scripts
- [ ] **Database Setup**: Configure production MongoDB connection
- [ ] **CORS Configuration**: Update for production domains
- [ ] **Security Secrets**: Change default JWT secrets and API keys
- [ ] **SSL/HTTPS**: Configure secure connections
- [ ] **Monitoring**: Set up production logging and alerting

### Files to Create/Update:
- [ ] `backend/.env.example` and `backend/.env`
- [ ] `frontend/.env.local.example` and `frontend/.env.local`
- [ ] `Dockerfile` for backend and frontend
- [ ] `docker-compose.yml` for local development
- [ ] Update all hardcoded URLs in frontend components
- [ ] Add production build scripts to package.json

**Note**: This checklist can be removed once all items are completed.

## License

This project is licensed under the ISC License.

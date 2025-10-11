# USOD - Unified Security Operations Dashboard

A modern security operations dashboard for monitoring security events, login attempts, and system activities in real-time.

## Current Version

V3.0 - **Fully Secured Application**

Complete security implementation across all endpoints with comprehensive attack detection and prevention.

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

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

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

#### 🚫 **IP Management**
- **Automatic IP Blocking** - Blocks IPs after multiple failed attempts
- **Manual IP Management** - Admin can manually block/unblock IPs
- **IP Whitelisting** - Support for trusted IP addresses

#### 🧪 **Security Testing Lab**
- **Interactive Testing Environment** - Test security features in real-time
- **Attack Simulation** - Manually trigger various attack types
- **Real-time Logging** - See security events as they happen
- **Educational Interface** - Learn about different attack vectors

#### 📊 **Security Monitoring**
- **Real-time Threat Detection** - Immediate alerts for security events
- **Security Statistics** - Track blocked IPs, detected attacks, and threat levels
- **Comprehensive Logging** - All security events logged with detailed information

### Protected Endpoints

**ALL** the following endpoints are now protected with security middleware:

- ✅ **Authentication Routes** (`/api/auth/*`)
- ✅ **User Management** (`/api/users/*`)
- ✅ **Backup Operations** (`/api/backup/*`)
- ✅ **Log Management** (`/api/logs/*`)
- ✅ **Data Ingestion** (`/api/ingest/*`)

## Comprehensive Logging System

The USOD system implements a comprehensive logging system that captures **18 different types of security events** with detailed information for each event type.

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
│   │   ├── scripts/         # Database seeding scripts
│   │   ├── services/        # Business logic services
│   │   └── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   └── services/        # API service functions
│   └── package.json
└── README.md
```

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

### Database Seeding
```bash
cd backend
npm run seed  # Reset and seed database with initial users
```

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

## License

This project is licensed under the ISC License.

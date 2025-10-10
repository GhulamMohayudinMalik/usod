# USOD - Unified Security Operations Dashboard

A modern security operations dashboard for monitoring security events, login attempts, and system activities in real-time.

## Current Version

V2.0 

Complete the intital 7 logs ingestion

## Features

- 🔐 **User Authentication** - JWT-based login system with role-based access
- 📊 **Real-time Dashboard** - Live security metrics and statistics
- 🚨 **Threat Monitoring** - Security event detection and analysis
- 📝 **Log Management** - Comprehensive logging system for various security events
- 🔍 **Analytics** - Security insights and trend analysis
- 🤖 **AI Insights** - Intelligent security recommendations
- ⚙️ **Settings** - User profile and system configuration

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

## Comprehensive Logging System

The USOD system implements a comprehensive logging system that captures **7 different types of security events** with detailed information for each event type.

### Log Types Overview

| Log Type | Description | Status Values | Use Cases |
|----------|-------------|---------------|-----------|
| **login** | User authentication events | `success`, `failure` | Track login attempts, failed logins, brute force detection |
| **logout** | User session termination | `success` | Monitor user logout activities, session management |
| **password_change** | Password modification events | `success`, `failure` | Track password changes, security policy compliance |
| **profile_update** | User profile modifications | `success`, `failure` | Monitor profile changes, data integrity |
| **access_denied** | Authorization failures | `failure` | Track permission violations, unauthorized access attempts |
| **system_error** | Application/system errors | `failure` | Monitor system health, error tracking |
| **security_event** | Security incidents | `detected` | Track security threats, malware, intrusions |

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

### User Management Endpoints

#### Create User
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/create" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"} -Body '{"username":"newuser","email":"user@example.com","password":"password123","role":"user"}'

# cURL
curl -X POST http://localhost:5000/api/users/create -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"username":"newuser","email":"user@example.com","password":"password123","role":"user"}'
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

#### Get All Users (Admin Only)
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/users" -Method GET -Headers @{"Authorization"="Bearer YOUR_JWT_TOKEN"}

# cURL
curl -X GET http://localhost:5000/api/users/users -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Pages

#### User Management (`/dashboard/users`)
- Create new users (admin only)
- View all users with roles and status
- Real-time user creation with validation
- Role-based access control

#### Change Password (`/dashboard/change-password`)
- Secure password change with current password verification
- Password strength indicator (Weak/Fair/Good/Strong)
- Password confirmation matching
- Security tips and best practices

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

The system supports the following log types:

1. **login** - User login attempts
2. **logout** - User logout events
3. **password_change** - Password change attempts
4. **profile_update** - User profile modifications
5. **access_denied** - Unauthorized access attempts
6. **system_error** - System-level errors
7. **security_event** - Security threats and incidents

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

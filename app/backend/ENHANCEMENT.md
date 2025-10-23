# 🖥️ Backend - Enhancement & Refactoring Guide

**Directory:** `/backend`  
**Purpose:** Node.js/Express API server - Core business logic & data orchestration  
**Status:** 🟢 Fully Functional - Ready for optimization  
**Last Updated:** October 23, 2025

---

## 📋 TABLE OF CONTENTS

1. [Current Architecture](#current-architecture)
2. [Directory Structure](#directory-structure)
3. [Data Flow](#data-flow)
4. [Current Issues](#current-issues)
5. [Enhancement Roadmap](#enhancement-roadmap)
6. [How to Refactor](#how-to-refactor)
7. [Testing Guide](#testing-guide)
8. [Integration Points](#integration-points)

---

## 🏗️ CURRENT ARCHITECTURE

### Tech Stack
- **Runtime:** Node.js v22+
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Module System:** ES6 Modules (import/export)
- **Port:** 5000 (default)

### Architecture Pattern

```
┌────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Port 5000)                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    MIDDLEWARE LAYER                       │ │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌───────────┐ │ │
│  │  │  CORS   │──│  JSON   │──│   Auth   │──│  API Key  │ │ │
│  │  │ Handler │  │ Parser  │  │   JWT    │  │   Check   │ │ │
│  │  └─────────┘  └─────────┘  └──────────┘  └───────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                      ROUTE LAYER                          │ │
│  │                                                            │ │
│  │  /api/auth          │  Authentication & Security          │ │
│  │  /api/blockchain    │  Blockchain Threat Logging          │ │
│  │  /api/network       │  AI Network Monitoring              │ │
│  │  /api/data          │  Dashboard Data & Analytics         │ │
│  │  /api/logs          │  Security Log Management            │ │
│  │  /api/ingest        │  Multi-Platform Data Ingestion      │ │
│  │  /api/backup        │  Database Backup & Restore          │ │
│  │  /api/users         │  User Management                    │ │
│  │  /api/stream        │  Real-time SSE Streaming            │ │
│  │  /                  │  API Documentation Homepage         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    SERVICE LAYER                          │ │
│  │                                                            │ │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐  │ │
│  │  │ Logging Service  │  │ Blockchain Service           │  │ │
│  │  │ (Security Events)│  │ (Mock/Fabric Integration)    │  │ │
│  │  └──────────────────┘  └──────────────────────────────┘  │ │
│  │                                                            │ │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐  │ │
│  │  │ Network AI Svc   │  │ Backup Service               │  │ │
│  │  │ (Python API)     │  │ (JSON exports)               │  │ │
│  │  └──────────────────┘  └──────────────────────────────┘  │ │
│  │                                                            │ │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐  │ │
│  │  │ Event Bus        │  │ Session Service              │  │ │
│  │  │ (Event Emitter)  │  │ (Cleanup)                    │  │ │
│  │  └──────────────────┘  └──────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            │                                   │
│                            ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                     DATA LAYER                            │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │  MongoDB     │  │  File System │  │  External APIs │  │ │
│  │  │  (Mongoose)  │  │  (Backups)   │  │  (Python AI)   │  │ │
│  │  │              │  │              │  │                │  │ │
│  │  │ - Users      │  │ - Uploads    │  │ - Blockchain   │  │ │
│  │  │ - Logs       │  │ - Backups    │  │ - AI Service   │  │ │
│  │  │ - Sessions   │  │              │  │                │  │ │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### External Integrations

```
┌─────────────┐      HTTP/REST      ┌──────────────┐
│  Frontend   │◄───────────────────►│   Backend    │
│ (Port 3000) │     JWT Auth        │  (Port 5000) │
└─────────────┘                     └──────┬───────┘
                                           │
                                           │
      ┌────────────────────────────────────┼────────────────────┐
      │                                    │                    │
      ▼                                    ▼                    ▼
┌─────────────┐                  ┌──────────────┐    ┌──────────────┐
│   MongoDB   │                  │  AI Service  │    │  Blockchain  │
│ (Port 27017)│                  │ (Port 8000)  │    │   (Mock)     │
└─────────────┘                  └──────────────┘    └──────────────┘
```

---

## 📁 DIRECTORY STRUCTURE

```
backend/
├── src/
│   ├── server.js                  # ⭐ Main Express app entry point
│   │
│   ├── config/
│   │   └── database.js            # MongoDB connection config
│   │
│   ├── models/                    # 📊 Mongoose data models
│   │   ├── User.js                # User accounts
│   │   └── securityLog.js         # Security event logs
│   │
│   ├── controllers/               # 🎮 Request handlers
│   │   └── logController.js       # Log CRUD operations
│   │
│   ├── middleware/                # 🛡️ Request interceptors
│   │   ├── auth.js                # JWT authentication
│   │   └── apiKeyAuth.js          # API key validation
│   │
│   ├── routes/                    # 🛣️ API endpoint definitions
│   │   ├── apiDocsRoutes.js       # API documentation (HTML)
│   │   ├── authRoutes.js          # Login, register, session
│   │   ├── backupRoutes.js        # Database backup/restore
│   │   ├── blockchainRoutes.js    # Blockchain threat logging
│   │   ├── dataRoutes.js          # Dashboard statistics
│   │   ├── ingestRoutes.js        # Desktop/mobile log ingestion
│   │   ├── logRoutes.js           # Security log management
│   │   ├── networkRoutes.js       # AI network monitoring
│   │   ├── streamRoutes.js        # SSE real-time streaming
│   │   └── userManagementRoutes.js # User CRUD
│   │
│   ├── services/                  # 🔧 Business logic layer
│   │   ├── blockchainService.js   # Real Hyperledger Fabric SDK
│   │   ├── mockBlockchainService.js # Mock blockchain (demo)
│   │   ├── loggingService.js      # Security event logging
│   │   ├── networkAIService.js    # Python AI service client
│   │   ├── backupService.js       # Backup operations
│   │   ├── sessionService.js      # Session cleanup
│   │   ├── eventBus.js            # Event emitter for SSE
│   │   └── securityDetectionService.js # Security checks
│   │
│   └── scripts/                   # 🔨 Utility scripts
│       ├── seedUsers.js           # Create initial users
│       └── fullSecurityReset.js   # Reset security data
│
├── uploads/                       # 📤 Uploaded PCAP files
├── backups/                       # 💾 Database backups
├── package.json                   # Dependencies
├── .env                           # Environment variables
├── API_DOCUMENTATION_SUMMARY.md   # API reference
├── BLOCKCHAIN_INTEGRATION_GUIDE.md # Blockchain setup
└── ENHANCEMENT.md                 # This file
```

---

## 🔄 DATA FLOW

### 1. Authentication Flow

```
User Login Request
        │
        ▼
POST /api/auth/login
  { username, password }
        │
        ▼
┌──────────────────────┐
│  Auth Route Handler  │
│  (authRoutes.js)     │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  Find User in DB     │
│  (User.findOne)      │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  Compare Password    │
│  (bcrypt.compare)    │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  Generate JWT Token  │
│  (jwt.sign)          │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  Log Security Event  │
│  (loggingService)    │
└──────────────────────┘
        │
        ├─ Save to MongoDB
        └─ Log to Blockchain
        │
        ▼
Return { token, user }
```

### 2. Network Monitoring Flow

```
Start Monitoring Request
        │
        ▼
POST /api/network/start-monitoring
  { interface, duration }
        │
        ▼
┌──────────────────────────────┐
│  Authenticate Request        │
│  (JWT middleware)            │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  Call Python AI Service      │
│  POST http://localhost:8000/ │
│       start-capture          │
└──────────────────────────────┘
        │
        ▼
Python AI Service
  ├─ Start packet capture
  ├─ Analyze with ML models
  └─ Detect threats
        │
        ▼
┌──────────────────────────────┐
│  Webhook Callback            │
│  POST /api/network/webhook   │
│  { threat_id, type, ...}     │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  Save Threat to MongoDB      │
│  (SecurityLog.create)        │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  Log to Blockchain           │
│  (mockBlockchainService)     │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  Emit SSE Event              │
│  (eventBus.emit)             │
└──────────────────────────────┘
        │
        ▼
Frontend receives real-time update
```

### 3. Blockchain Logging Flow

```
Security Event Occurs
        │
        ▼
loggingService.logSecurityEvent()
        │
        ├─ Create log data
        ├─ Save to MongoDB
        └─ Call blockchain service
        │
        ▼
mockBlockchainService.createThreatLog()
        │
        ├─ Generate unique log ID
        ├─ Calculate SHA256 hash
        ├─ Store in ledger (Map)
        └─ Add to transaction log
        │
        ▼
Return { transactionId, blockHash }
```

---

## 🚨 CURRENT ISSUES

### Critical Issues

1. **⚠️ Mock Blockchain in Production**
   - **Problem:** Using in-memory mock instead of Hyperledger Fabric
   - **Impact:** Data lost on server restart, not truly immutable
   - **Priority:** P1 - High
   - **Fix:** Complete Hyperledger Fabric integration (95% done, 5% remaining)

2. **🔒 Weak Session Management**
   - **Problem:** JWT tokens don't expire, no refresh token mechanism
   - **Impact:** Security risk, old tokens remain valid indefinitely
   - **Priority:** P1 - High
   - **Fix:** Implement token expiration and refresh logic

3. **🐛 No Rate Limiting**
   - **Problem:** API endpoints unprotected from abuse
   - **Impact:** Vulnerable to brute force and DDoS
   - **Priority:** P1 - High
   - **Fix:** Add express-rate-limit middleware

### Performance Issues

4. **⏱️ Synchronous Blockchain Logging**
   - **Problem:** Main thread blocks waiting for blockchain
   - **Impact:** Slower response times (100-200ms penalty)
   - **Priority:** P2 - Medium
   - **Fix:** Use async/await properly, consider message queue

5. **💾 Large Response Payloads**
   - **Problem:** Returning entire log arrays without pagination
   - **Impact:** Slow frontend rendering, network overhead
   - **Priority:** P2 - Medium
   - **Fix:** Implement cursor-based pagination

6. **🔍 N+1 Query Problem**
   - **Problem:** Multiple database queries in loops
   - **Impact:** Slow dashboard statistics calculation
   - **Priority:** P2 - Medium
   - **Fix:** Use MongoDB aggregation pipeline

### Code Quality Issues

7. **📝 Inconsistent Error Handling**
   - **Problem:** Mix of try-catch, callbacks, and no handling
   - **Impact:** Uncaught errors crash server
   - **Priority:** P2 - Medium
   - **Fix:** Standardize error middleware

8. **🔧 Tight Coupling**
   - **Problem:** Services directly importing other services
   - **Impact:** Difficult to test, circular dependencies
   - **Priority:** P3 - Low
   - **Fix:** Implement dependency injection

9. **📊 No Request Validation**
   - **Problem:** Missing input validation on many endpoints
   - **Impact:** Invalid data reaches database
   - **Priority:** P2 - Medium
   - **Fix:** Add Joi or express-validator

---

## 🚀 ENHANCEMENT ROADMAP

### Phase 1: Security & Stability (3-5 days)

- [ ] **Implement Rate Limiting**
  ```javascript
  import rateLimit from 'express-rate-limit';
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  });
  
  app.use('/api/', limiter);
  
  // Stricter for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts'
  });
  
  app.use('/api/auth/login', authLimiter);
  ```

- [ ] **Add JWT Expiration**
  ```javascript
  // Generate token with expiration
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }  // Token expires in 1 hour
  );
  
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }  // Refresh token lasts 7 days
  );
  ```

- [ ] **Input Validation Middleware**
  ```javascript
  import Joi from 'joi';
  
  const validateLogin = (req, res, next) => {
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(6).required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
  
  router.post('/login', validateLogin, loginHandler);
  ```

- [ ] **Global Error Handler**
  ```javascript
  // Custom error class
  class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    if (process.env.NODE_ENV === 'development') {
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    } else {
      // Production: don't leak error details
      if (err.isOperational) {
        res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
      } else {
        console.error('ERROR:', err);
        res.status(500).json({
          status: 'error',
          message: 'Something went wrong'
        });
      }
    }
  });
  ```

### Phase 2: Performance Optimization (3-5 days)

- [ ] **Implement Pagination**
  ```javascript
  // Cursor-based pagination
  router.get('/logs', async (req, res) => {
    const { cursor, limit = 20 } = req.query;
    
    const query = cursor ? { _id: { $lt: cursor } } : {};
    
    const logs = await SecurityLog.find(query)
      .sort({ _id: -1 })
      .limit(parseInt(limit) + 1);
    
    const hasMore = logs.length > limit;
    const results = hasMore ? logs.slice(0, -1) : logs;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;
    
    res.json({
      data: results,
      pagination: {
        hasMore,
        nextCursor
      }
    });
  });
  ```

- [ ] **Database Indexing**
  ```javascript
  // In securityLog.js model
  securityLogSchema.index({ userId: 1, timestamp: -1 });
  securityLogSchema.index({ severity: 1, status: 1 });
  securityLogSchema.index({ timestamp: -1 });
  securityLogSchema.index({ 'details.ipAddress': 1 });
  ```

- [ ] **Response Caching**
  ```javascript
  import NodeCache from 'node-cache';
  const cache = new NodeCache({ stdTTL: 300 }); // 5 min TTL
  
  const cacheMiddleware = (duration) => {
    return (req, res, next) => {
      const key = req.originalUrl;
      const cachedResponse = cache.get(key);
      
      if (cachedResponse) {
        return res.json(cachedResponse);
      }
      
      res.originalJson = res.json;
      res.json = (body) => {
        cache.set(key, body, duration);
        res.originalJson(body);
      };
      next();
    };
  };
  
  router.get('/dashboard-stats', cacheMiddleware(60), getStats);
  ```

- [ ] **Async Blockchain Logging**
  ```javascript
  import { Queue } from 'bull';
  
  const blockchainQueue = new Queue('blockchain', {
    redis: { host: 'localhost', port: 6379 }
  });
  
  // Add to queue instead of blocking
  export async function logToBlockchain(logData) {
    await blockchainQueue.add('log-threat', logData);
  }
  
  // Process queue in background
  blockchainQueue.process('log-threat', async (job) => {
    const { logId, logType, details } = job.data;
    await mockBlockchainService.createThreatLog(logId, logType, details);
  });
  ```

### Phase 3: Code Quality (5-7 days)

- [ ] **Dependency Injection**
  ```javascript
  // services/ServiceContainer.js
  class ServiceContainer {
    constructor() {
      this.services = new Map();
    }
    
    register(name, factory) {
      this.services.set(name, { factory, instance: null });
    }
    
    get(name) {
      const service = this.services.get(name);
      if (!service) throw new Error(`Service ${name} not found`);
      
      if (!service.instance) {
        service.instance = service.factory(this);
      }
      return service.instance;
    }
  }
  
  // Usage
  const container = new ServiceContainer();
  
  container.register('blockchain', (c) => 
    new BlockchainService(c.get('config'))
  );
  container.register('logging', (c) => 
    new LoggingService(c.get('blockchain'), c.get('database'))
  );
  
  export default container;
  ```

- [ ] **Repository Pattern**
  ```javascript
  // repositories/UserRepository.js
  class UserRepository {
    constructor(model) {
      this.model = model;
    }
    
    async findById(id) {
      return await this.model.findById(id);
    }
    
    async findByUsername(username) {
      return await this.model.findOne({ username });
    }
    
    async create(userData) {
      return await this.model.create(userData);
    }
    
    async update(id, updates) {
      return await this.model.findByIdAndUpdate(id, updates, { new: true });
    }
  }
  
  export default UserRepository;
  ```

- [ ] **Unit Tests**
  ```javascript
  // tests/services/loggingService.test.js
  import { jest } from '@jest/globals';
  import LoggingService from '../../src/services/loggingService.js';
  
  describe('LoggingService', () => {
    let loggingService;
    let mockBlockchainService;
    let mockSecurityLog;
    
    beforeEach(() => {
      mockBlockchainService = {
        createThreatLog: jest.fn().mockResolvedValue({ success: true })
      };
      mockSecurityLog = {
        create: jest.fn()
      };
      loggingService = new LoggingService(
        mockBlockchainService,
        mockSecurityLog
      );
    });
    
    test('should log security event to both DB and blockchain', async () => {
      const event = {
        userId: 'user123',
        action: 'login',
        status: 'success'
      };
      
      await loggingService.logSecurityEvent(event);
      
      expect(mockSecurityLog.create).toHaveBeenCalled();
      expect(mockBlockchainService.createThreatLog).toHaveBeenCalled();
    });
  });
  ```

### Phase 4: Advanced Features (1-2 weeks)

- [ ] **WebSocket Support**
  - Replace SSE with WebSocket for bidirectional communication
  - Real-time collaborative threat investigation

- [ ] **GraphQL API**
  - Add GraphQL alongside REST
  - Allow clients to query exactly what they need

- [ ] **Microservices Split**
  - Separate auth, logging, and AI services
  - Use message queue (RabbitMQ/Kafka) for communication

- [ ] **API Versioning**
  - Support multiple API versions simultaneously
  - Gradual migration path

---

## 🔧 HOW TO REFACTOR

### 1. Extract Business Logic from Routes

**❌ BEFORE:**
```javascript
// routes/authRoutes.js
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Business logic in route handler (BAD)
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  
  res.json({ token, user });
});
```

**✅ AFTER:**
```javascript
// services/AuthService.js
class AuthService {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }
  
  async login(username, password) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new AuthError('Invalid credentials');
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AuthError('Invalid credentials');
    }
    
    const token = this.tokenService.generateToken(user);
    return { token, user };
  }
}

// routes/authRoutes.js
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
```

### 2. Consistent Async Error Handling

**Use a wrapper:**
```javascript
// utils/asyncHandler.js
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
router.get('/logs', asyncHandler(async (req, res) => {
  const logs = await SecurityLog.find();
  res.json(logs);
}));
```

### 3. Environment Configuration

```javascript
// config/env.js
import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  AI_SERVICE_URL: Joi.string().default('http://localhost:8000'),
  BLOCKCHAIN_TYPE: Joi.string().valid('mock', 'fabric').default('mock')
}).unknown();

const { error, value: config } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default config;
```

### 4. Structured Logging

```javascript
// utils/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'usod-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;

// Usage
import logger from './utils/logger.js';

logger.info('User logged in', { userId: user._id, ip: req.ip });
logger.error('Database connection failed', { error: err.message });
```

---

## 🧪 TESTING GUIDE

### Unit Testing

```javascript
// tests/services/blockchainService.test.js
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import MockBlockchainService from '../../src/services/mockBlockchainService.js';

describe('MockBlockchainService', () => {
  let service;
  
  beforeEach(() => {
    service = new MockBlockchainService();
  });
  
  describe('createThreatLog', () => {
    it('should create a threat log with hash', async () => {
      const result = await service.createThreatLog(
        'TEST_001',
        'network_threat',
        { type: 'dos' },
        new Date().toISOString(),
        'AI_DETECTOR',
        0.95,
        'active'
      );
      
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.blockHash).toMatch(/^[a-f0-9]{64}$/);
    });
    
    it('should increment transaction count', async () => {
      const before = service.stats.totalTransactions;
      
      await service.createThreatLog('TEST_002', 'security_event', {}, ...);
      
      expect(service.stats.totalTransactions).toBe(before + 1);
    });
  });
});
```

### Integration Testing

```javascript
// tests/integration/auth.test.js
import request from 'supertest';
import app from '../../src/server.js';
import mongoose from 'mongoose';
import { User } from '../../src/models/User.js';

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    await User.deleteMany({});
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
      
      const user = await User.findOne({ username: 'testuser' });
      expect(user).toBeDefined();
    });
    
    it('should reject duplicate username', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed'
      });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'other@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
    });
  });
});
```

---

## 🔗 INTEGRATION POINTS

### 1. Frontend (Next.js)
- **Base URL:** `http://localhost:3000`
- **Communication:** HTTP REST with JWT
- **CORS:** Enabled for localhost:3000

### 2. Python AI Service
- **Base URL:** `http://localhost:8000`
- **Endpoints Used:** `/start-capture`, `/stop-capture`, `/analyze-pcap`
- **Webhook:** Backend receives threats at `/api/network/webhook`

### 3. MongoDB
- **Connection:** `mongodb://localhost:27017/usod`
- **Collections:** users, securitylogs, sessions

### 4. Mock Blockchain
- **Type:** In-memory (currently)
- **Future:** Hyperledger Fabric
- **Interface:** Same API for both implementations

---

## 📝 QUICK START CHECKLIST

- [ ] Install dependencies: `npm install`
- [ ] Set up `.env` file with required variables
- [ ] Start MongoDB: `net start MongoDB`
- [ ] Run server: `npm start` or `npm run dev`
- [ ] Test health: `curl http://localhost:5000/health`
- [ ] View API docs: `http://localhost:5000/`

---

**Last Updated:** October 23, 2025  
**Status:** Production-ready with enhancement opportunities  
**Next Review:** After Phase 1 security improvements


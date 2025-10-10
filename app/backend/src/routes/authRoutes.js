import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { SecurityLog } from '../models/securityLog.js';
import { eventBus } from '../services/eventBus.js';

const router = express.Router();

// Helper function to get real IP address
function getRealIP(req) {
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip ||
           '0.0.0.0';
  
  // Handle IPv6 localhost (::1) and convert to IPv4 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }
  
  // Handle comma-separated IPs (from proxies)
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  
  return ip;
}

// Helper function to detect browser from user agent
function detectBrowser(userAgent) {
  if (!userAgent) return 'unknown';
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari';
  } else if (userAgent.includes('Edg')) {
    return 'Edge';
  } else if (userAgent.includes('Opera')) {
    return 'Opera';
  } else {
    return 'Other';
  }
}

// Helper function to detect OS from user agent
function detectOS(userAgent) {
  if (!userAgent) return 'unknown';
  
  if (userAgent.includes('Windows NT 10.0')) return 'Windows 10';
  if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS X')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Other';
}

// Helper function to log login attempt
async function logLoginAttempt(userId, status, req, details = {}) {
  try {
    const userAgent = req.get('user-agent') || 'unknown';
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);
    
    // For failed logins with non-existent users, we need to create a temporary user or handle differently
    let actualUserId = userId;
    if (!userId && status === 'failure') {
      // Create a temporary user entry for failed login attempts with non-existent users
      try {
        const tempUser = await User.findOne({ username: details.attemptedUsername });
        if (!tempUser) {
          // Create a temporary user for tracking failed attempts
          const tempUser = new User({
            username: details.attemptedUsername || 'unknown_user',
            email: 'temp@temp.com',
            password: 'temp',
            role: 'user',
            isActive: false
          });
          await tempUser.save();
          actualUserId = tempUser._id;
        } else {
          actualUserId = tempUser._id;
        }
      } catch (error) {
        console.error('Error creating temp user for failed login:', error);
        // If we can't create a temp user, skip logging this attempt
        return;
      }
    }
    
    const logEntry = await SecurityLog.create({
      userId: actualUserId,
      action: 'login',
      status,
      ipAddress: getRealIP(req),
      userAgent,
      details: {
        ...details,
        timestamp: new Date(),
        browser,
        os,
        username: details.attemptedUsername || 'unknown'
      },
      timestamp: new Date()
    });
    
    eventBus.emit('log.created', logEntry);
    return logEntry;
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

// Helper function to log logout event
async function logLogoutEvent(userId, req, details = {}) {
  try {
    const userAgent = req.get('user-agent') || 'unknown';
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);
    
    // Get username for the logout log
    let username = 'unknown';
    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user) {
          username = user.username;
        }
      } catch (error) {
        console.error('Error fetching user for logout log:', error);
      }
    }
    
    const logEntry = await SecurityLog.create({
      userId,
      action: 'logout',
      status: 'success',
      ipAddress: getRealIP(req),
      userAgent,
      details: {
        ...details,
        timestamp: new Date(),
        browser,
        os,
        username
      },
      timestamp: new Date()
    });
    
    eventBus.emit('log.created', logEntry);
    return logEntry;
  } catch (error) {
    console.error('Failed to log logout event:', error);
  }
}

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      // Log failed login attempt for non-existent user
      await logLoginAttempt(null, 'failure', req, {
        reason: 'user_not_found',
        attemptedUsername: username
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Log failed login attempt for wrong password
      await logLoginAttempt(user._id, 'failure', req, {
        reason: 'invalid_password',
        attemptedUsername: username
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      // Log failed login attempt for inactive account
      await logLoginAttempt(user._id, 'failure', req, {
        reason: 'account_inactive',
        attemptedUsername: username
      });
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log successful login
    await logLoginAttempt(user._id, 'success', req, {
      reason: 'successful_login',
      loginMethod: 'password',
      attemptedUsername: username
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        
        // Log logout event
        await logLogoutEvent(decoded.userId, req, {
          reason: 'user_logout',
          logoutMethod: 'manual'
        });
      } catch (jwtError) {
        // Token is invalid, but we still want to respond successfully
        console.log('Invalid token during logout:', jwtError.message);
      }
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Register endpoint (for initial setup)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password required' });
    }

    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

export default router;

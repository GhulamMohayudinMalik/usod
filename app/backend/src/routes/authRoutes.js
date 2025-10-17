import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { SecurityLog } from '../models/securityLog.js';
import { eventBus } from '../services/eventBus.js';
import { 
  createSession, 
  refreshToken, 
  expireSession, 
  validateSession,
  handleFailedLogin,
  resetFailedLogins,
  unlockAccount,
  isAccountLocked
} from '../services/sessionService.js';
import { logSecurityEvent } from '../services/loggingService.js';
import { 
  performSecurityCheck, 
  trackFailedLogin, 
  isIPBlocked, 
  getRealIP as getSecurityIP,
  blockIP, 
  unblockIP, 
  getBlockedIPs, 
  getSecurityStats 
} from '../services/securityDetectionService.js';

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


// Helper function to log login attempt
async function logLoginAttempt(userId, status, req, details = {}) {
  try {
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
    
    // Use the centralized logging service
    return await logSecurityEvent(actualUserId, 'login', status, req, {
      ...details,
      attemptedUsername: details.attemptedUsername || 'unknown'
    });
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

// Helper function to log logout event
async function logLogoutEvent(userId, req, details = {}) {
  try {
    // Use the centralized logging service
    return await logSecurityEvent(userId, 'logout', 'success', req, details);
  } catch (error) {
    console.error('Failed to log logout event:', error);
  }
}

// Login endpoint
router.post('/login', performSecurityCheck, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Check if IP is blocked
    const ip = getSecurityIP(req);
    if (isIPBlocked(ip)) {
      return res.status(403).json({ 
        message: 'Access denied: IP address is blocked',
        code: 'IP_BLOCKED'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      // Track failed login for security detection
      trackFailedLogin(ip, username, req);
      
      // Log failed login attempt for non-existent user
      await logLoginAttempt(null, 'failure', req, {
        reason: 'user_not_found',
        attemptedUsername: username
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    const isLocked = await isAccountLocked(user._id);
    if (isLocked) {
      await logLoginAttempt(user._id, 'failure', req, {
        reason: 'account_locked',
        attemptedUsername: username
      });
      return res.status(423).json({ 
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Track failed login for security detection
      trackFailedLogin(ip, username, req);
      
      // Handle failed login attempt
      const lockResult = await handleFailedLogin(user._id, req);
      
      // Log failed login attempt for wrong password
      await logLoginAttempt(user._id, 'failure', req, {
        reason: 'invalid_password',
        attemptedUsername: username,
        attemptsRemaining: lockResult.attemptsRemaining
      });

      if (lockResult.shouldLock) {
        return res.status(423).json({ 
          message: 'Account has been locked due to multiple failed login attempts. Please try again later.' 
        });
      }

      return res.status(401).json({ 
        message: `Invalid credentials. ${lockResult.attemptsRemaining} attempts remaining.` 
      });
    }

    if (!user.isActive) {
      // Log failed login attempt for inactive account
      await logLoginAttempt(user._id, 'failure', req, {
        reason: 'account_inactive',
        attemptedUsername: username
      });
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Reset failed login attempts on successful login
    await resetFailedLogins(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create new session
    const sessionData = await createSession(user._id, req, 'password');

    // Log successful login
    await logLoginAttempt(user._id, 'success', req, {
      reason: 'successful_login',
      loginMethod: 'password',
      attemptedUsername: username,
      sessionId: sessionData.sessionId
    });

    res.json({
      message: 'Login successful',
      token: sessionData.token,
      sessionId: sessionData.sessionId,
      expiresAt: sessionData.expiresAt,
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
        
        // Expire the session
        await expireSession(decoded.userId, decoded.sessionId, req, 'manual_logout');
        
        // Log logout event
        await logLogoutEvent(decoded.userId, req, {
          reason: 'user_logout',
          logoutMethod: 'manual',
          sessionId: decoded.sessionId
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
router.post('/register', performSecurityCheck, async (req, res) => {
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

// Token refresh endpoint
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Validate session
    const isValidSession = await validateSession(decoded.userId, decoded.sessionId);
    if (!isValidSession) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Refresh the token
    const newSessionData = await refreshToken(decoded.userId, token, req);

    res.json({
      message: 'Token refreshed successfully',
      token: newSessionData.token,
      sessionId: newSessionData.sessionId,
      expiresAt: newSessionData.expiresAt
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Token refresh failed' });
  }
});

// Account unlock endpoint (admin only)
router.post('/unlock-account', async (req, res) => {
  try {
    const { userId, unlockedBy } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isLocked) {
      return res.status(400).json({ message: 'Account is not locked' });
    }

    await unlockAccount(userId, unlockedBy || 'admin', req);

    res.json({
      message: 'Account unlocked successfully',
      userId: user._id,
      username: user.username
    });
  } catch (error) {
    console.error('Account unlock error:', error);
    res.status(500).json({ message: 'Account unlock failed' });
  }
});

// Check session status endpoint
router.get('/session-status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Validate session
    const isValidSession = await validateSession(decoded.userId, decoded.sessionId);
    
    if (!isValidSession) {
      return res.status(401).json({ 
        message: 'Invalid or expired session',
        valid: false 
      });
    }

    // Get user info
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Session is valid',
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      session: {
        sessionId: user.currentSessionId,
        expiresAt: user.sessionExpiresAt,
        lastTokenRefresh: user.lastTokenRefresh
      }
    });
  } catch (error) {
    console.error('Session status check error:', error);
    res.status(401).json({ message: 'Session status check failed' });
  }
});

// Security management endpoints

// Get security statistics
router.get('/security/stats', async (req, res) => {
  try {
    const stats = getSecurityStats();
    res.json({
      message: 'Security statistics retrieved',
      stats
    });
  } catch (error) {
    console.error('Security stats error:', error);
    res.status(500).json({ message: 'Failed to get security statistics' });
  }
});

// Get blocked IPs
router.get('/security/blocked-ips', async (req, res) => {
  try {
    const blockedIPs = getBlockedIPs();
    res.json({
      message: 'Blocked IPs retrieved',
      blockedIPs
    });
  } catch (error) {
    console.error('Blocked IPs error:', error);
    res.status(500).json({ message: 'Failed to get blocked IPs' });
  }
});

// Block an IP address (admin only)
router.post('/security/block-ip', async (req, res) => {
  try {
    const { ip, reason = 'manual_block' } = req.body;
    
    if (!ip) {
      return res.status(400).json({ message: 'IP address required' });
    }

    blockIP(ip, reason);
    
    res.json({
      message: 'IP address blocked successfully',
      ip,
      reason
    });
  } catch (error) {
    console.error('Block IP error:', error);
    res.status(500).json({ message: 'Failed to block IP address' });
  }
});

// Unblock an IP address (admin only)
router.post('/security/unblock-ip', async (req, res) => {
  try {
    const { ip, reason = 'manual_unblock' } = req.body;
    
    if (!ip) {
      return res.status(400).json({ message: 'IP address required' });
    }

    unblockIP(ip, reason);
    
    res.json({
      message: 'IP address unblocked successfully',
      ip,
      reason
    });
  } catch (error) {
    console.error('Unblock IP error:', error);
    res.status(500).json({ message: 'Failed to unblock IP address' });
  }
});

export default router;

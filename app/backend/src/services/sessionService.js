import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { logActions } from './loggingService.js';
import { eventBus } from './eventBus.js';

// Session configuration
const SESSION_CONFIG = {
  TOKEN_EXPIRY: '24h',
  REFRESH_THRESHOLD: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  SESSION_CLEANUP_INTERVAL: 60 * 60 * 1000 // 1 hour
};

// Generate a unique session ID
function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate token age in milliseconds
function getTokenAge(token) {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      return (decoded.exp - now) * 1000; // Convert to milliseconds
    }
  } catch (error) {
    console.error('Error calculating token age:', error);
  }
  return 0;
}

// Check if token needs refresh
function shouldRefreshToken(token) {
  const tokenAge = getTokenAge(token);
  return tokenAge < SESSION_CONFIG.REFRESH_THRESHOLD;
}

// Create a new session for a user
export async function createSession(userId, req, loginMethod = 'password') {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate session ID and token
    const sessionId = generateSessionId();
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role,
        sessionId: sessionId
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: SESSION_CONFIG.TOKEN_EXPIRY }
    );

    // Update user session info
    user.currentSessionId = sessionId;
    user.sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    user.lastTokenRefresh = new Date();
    await user.save();

    // Log session creation
    await logActions.sessionCreated(userId, 'success', req, {
      sessionId,
      sessionDuration: SESSION_CONFIG.TOKEN_EXPIRY,
      loginMethod,
      userAgent: req.get('user-agent') || 'unknown'
    });

    // Emit session created event
    eventBus.emit('session.created', {
      userId,
      sessionId,
      loginMethod,
      timestamp: new Date()
    });

    return {
      token,
      sessionId,
      expiresAt: user.sessionExpiresAt
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Refresh a user's token
export async function refreshToken(userId, currentToken, req) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has an active session
    if (!user.currentSessionId || !user.sessionExpiresAt || user.sessionExpiresAt < new Date()) {
      throw new Error('No active session found');
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role,
        sessionId: user.currentSessionId
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: SESSION_CONFIG.TOKEN_EXPIRY }
    );

    // Update user session info
    user.sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    user.lastTokenRefresh = new Date();
    await user.save();

    const tokenAge = getTokenAge(currentToken);

    // Log token refresh
    await logActions.tokenRefresh(userId, 'success', req, {
      sessionId: user.currentSessionId,
      refreshReason: 'automatic',
      tokenAge: `${Math.floor(tokenAge / 1000)}s`,
      userAgent: req.get('user-agent') || 'unknown'
    });

    // Emit token refresh event
    eventBus.emit('token.refreshed', {
      userId,
      sessionId: user.currentSessionId,
      timestamp: new Date()
    });

    return {
      token: newToken,
      sessionId: user.currentSessionId,
      expiresAt: user.sessionExpiresAt
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// Expire a user's session
export async function expireSession(userId, sessionId, req, reason = 'timeout') {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Clear session info
    user.currentSessionId = null;
    user.sessionExpiresAt = null;
    await user.save();

    // Calculate session duration
    const sessionDuration = user.lastTokenRefresh ? 
      Date.now() - user.lastTokenRefresh.getTime() : 'unknown';

    // Log session expiration
    await logActions.sessionExpired(userId, 'success', req, {
      sessionId: sessionId || user.currentSessionId,
      sessionDuration: sessionDuration !== 'unknown' ? 
        `${Math.floor(sessionDuration / 1000)}s` : 'unknown',
      expirationReason: reason,
      userAgent: req.get('user-agent') || 'unknown'
    });

    // Emit session expired event
    eventBus.emit('session.expired', {
      userId,
      sessionId: sessionId || user.currentSessionId,
      reason,
      timestamp: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error expiring session:', error);
    throw error;
  }
}

// Check if a session is valid
export async function validateSession(userId, sessionId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    // Check if session exists and is not expired
    if (!user.currentSessionId || 
        user.currentSessionId !== sessionId || 
        !user.sessionExpiresAt || 
        user.sessionExpiresAt < new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

// Clean up expired sessions (run periodically)
export async function cleanupExpiredSessions() {
  try {
    const now = new Date();
    const expiredUsers = await User.find({
      sessionExpiresAt: { $lt: now },
      currentSessionId: { $ne: null }
    });

    for (const user of expiredUsers) {
      await expireSession(user._id, user.currentSessionId, null, 'cleanup');
    }

    console.log(`Cleaned up ${expiredUsers.length} expired sessions`);
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}

// Start periodic session cleanup
export function startSessionCleanup() {
  setInterval(cleanupExpiredSessions, SESSION_CONFIG.SESSION_CLEANUP_INTERVAL);
  console.log('Session cleanup started');
}

// Handle failed login attempts and account locking
export async function handleFailedLogin(userId, req) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { shouldLock: false, attemptsRemaining: 0 };
    }

    // Increment failed attempts
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    
    // Check if account should be locked
    if (user.failedLoginAttempts >= SESSION_CONFIG.MAX_FAILED_ATTEMPTS) {
      user.isLocked = true;
      user.lockoutUntil = new Date(Date.now() + SESSION_CONFIG.LOCKOUT_DURATION);
      
      // Log account lock
      await logActions.accountLocked(userId, 'detected', req, {
        lockReason: 'failed_attempts',
        failedAttempts: user.failedLoginAttempts,
        lockoutDuration: `${SESSION_CONFIG.LOCKOUT_DURATION / 60000}m`,
        lockedBy: 'system'
      });

      // Emit account locked event
      eventBus.emit('account.locked', {
        userId,
        reason: 'failed_attempts',
        attempts: user.failedLoginAttempts,
        timestamp: new Date()
      });
    }

    await user.save();

    return {
      shouldLock: user.isLocked,
      attemptsRemaining: Math.max(0, SESSION_CONFIG.MAX_FAILED_ATTEMPTS - user.failedLoginAttempts)
    };
  } catch (error) {
    console.error('Error handling failed login:', error);
    throw error;
  }
}

// Reset failed login attempts on successful login
export async function resetFailedLogins(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return;
    }

    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockoutUntil = null;
    await user.save();
  } catch (error) {
    console.error('Error resetting failed logins:', error);
  }
}

// Manually unlock an account
export async function unlockAccount(userId, unlockedBy, req) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isLocked = false;
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    // Log account unlock
    await logActions.accountUnlocked(userId, 'success', req, {
      unlockReason: 'manual',
      unlockedBy: unlockedBy || 'admin',
      lockoutDuration: user.lockoutUntil ? 
        `${Math.floor((Date.now() - user.lockoutUntil.getTime()) / 60000)}m` : 'unknown'
    });

    // Emit account unlocked event
    eventBus.emit('account.unlocked', {
      userId,
      unlockedBy: unlockedBy || 'admin',
      timestamp: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error unlocking account:', error);
    throw error;
  }
}

// Check if account is locked
export async function isAccountLocked(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    // Check if lockout has expired
    if (user.isLocked && user.lockoutUntil && user.lockoutUntil < new Date()) {
      user.isLocked = false;
      user.lockoutUntil = null;
      await user.save();
      return false;
    }

    return user.isLocked;
  } catch (error) {
    console.error('Error checking account lock status:', error);
    return false;
  }
}

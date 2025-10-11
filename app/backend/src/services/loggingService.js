import { SecurityLog } from '../models/securityLog.js';
import { User } from '../models/User.js';
import { eventBus } from './eventBus.js';

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

// Generic logging function
export async function logSecurityEvent(userId, action, status, req, details = {}) {
  try {
    const userAgent = req.get('user-agent') || 'unknown';
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);
    
    // Get username for the log
    let username = 'unknown';
    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user) {
          username = user.username;
        }
      } catch (error) {
        console.error('Error fetching user for log:', error);
      }
    }
    
    const logData = {
      action,
      status,
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
    };
    
    // Only add userId if it's not null
    if (userId) {
      logData.userId = userId;
    }
    
    const logEntry = await SecurityLog.create(logData);
    
    eventBus.emit('log.created', logEntry);
    return logEntry;
  } catch (error) {
    console.error('Failed to log security event:', error);
    throw error;
  }
}

// Specific logging functions for each action type
export const logActions = {
  // Login/Logout (already implemented in authRoutes.js)
  
  // Password change
  async passwordChange(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'password_change', status, req, {
      ...details,
      reason: details.reason || 'user_initiated'
    });
  },
  
  // Profile update
  async profileUpdate(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'profile_update', status, req, {
      ...details,
      fieldsChanged: details.fieldsChanged || []
    });
  },
  
  // Access denied
  async accessDenied(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'access_denied', status, req, {
      ...details,
      resource: details.resource || 'unknown',
      requiredRole: details.requiredRole || 'unknown',
      userRole: details.userRole || 'unknown'
    });
  },
  
  // System error
  async systemError(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'system_error', status, req, {
      ...details,
      errorCode: details.errorCode || 'UNKNOWN_ERROR',
      component: details.component || 'unknown',
      severity: details.severity || 'medium'
    });
  },
  
  // Security event
  async securityEvent(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'security_event', status, req, {
      ...details,
      eventType: details.eventType || 'unknown',
      severity: details.severity || 'medium',
      source: details.source || 'unknown',
      target: details.target || 'unknown'
    });
  },

  // Session management
  async sessionCreated(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'session_created', status, req, {
      ...details,
      sessionId: details.sessionId || 'unknown',
      sessionDuration: details.sessionDuration || '24h',
      loginMethod: details.loginMethod || 'password'
    });
  },

  async sessionExpired(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'session_expired', status, req, {
      ...details,
      sessionId: details.sessionId || 'unknown',
      sessionDuration: details.sessionDuration || 'unknown',
      expirationReason: details.expirationReason || 'timeout'
    });
  },

  async tokenRefresh(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'token_refresh', status, req, {
      ...details,
      sessionId: details.sessionId || 'unknown',
      refreshReason: details.refreshReason || 'automatic',
      tokenAge: details.tokenAge || 'unknown'
    });
  },

  // Account management
  async accountLocked(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'account_locked', status, req, {
      ...details,
      lockReason: details.lockReason || 'failed_attempts',
      failedAttempts: details.failedAttempts || 0,
      lockoutDuration: details.lockoutDuration || '15m',
      lockedBy: details.lockedBy || 'system'
    });
  },

  async accountUnlocked(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'account_unlocked', status, req, {
      ...details,
      unlockReason: details.unlockReason || 'manual',
      unlockedBy: details.unlockedBy || 'system',
      lockoutDuration: details.lockoutDuration || 'unknown'
    });
  },

  // Administrative actions
  async userCreated(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'user_created', status, req, {
      ...details,
      targetUserId: details.targetUserId || 'unknown',
      targetUsername: details.targetUsername || 'unknown',
      targetEmail: details.targetEmail || 'unknown',
      targetRole: details.targetRole || 'unknown',
      createdBy: details.createdBy || 'system'
    });
  },

  async userDeleted(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'user_deleted', status, req, {
      ...details,
      targetUserId: details.targetUserId || 'unknown',
      targetUsername: details.targetUsername || 'unknown',
      targetEmail: details.targetEmail || 'unknown',
      deletedBy: details.deletedBy || 'system',
      deletionReason: details.deletionReason || 'manual'
    });
  },

  async roleChanged(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'role_changed', status, req, {
      ...details,
      targetUserId: details.targetUserId || 'unknown',
      targetUsername: details.targetUsername || 'unknown',
      oldRole: details.oldRole || 'unknown',
      newRole: details.newRole || 'unknown',
      changedBy: details.changedBy || 'system',
      changeReason: details.changeReason || 'manual'
    });
  },

  async settingsChanged(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'settings_changed', status, req, {
      ...details,
      settingType: details.settingType || 'unknown',
      settingName: details.settingName || 'unknown',
      oldValue: details.oldValue || 'unknown',
      newValue: details.newValue || 'unknown',
      changedBy: details.changedBy || 'system',
      changeScope: details.changeScope || 'user' // 'user', 'system', 'global'
    });
  },

  async backupCreated(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'backup_created', status, req, {
      ...details,
      backupType: details.backupType || 'unknown',
      backupName: details.backupName || 'unknown',
      backupSize: details.backupSize || 'unknown',
      backupLocation: details.backupLocation || 'unknown',
      createdBy: details.createdBy || 'system',
      backupReason: details.backupReason || 'scheduled'
    });
  },

  async backupRestored(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'backup_restored', status, req, {
      ...details,
      backupType: details.backupType || 'unknown',
      backupName: details.backupName || 'unknown',
      backupDate: details.backupDate || 'unknown',
      restoredBy: details.restoredBy || 'system',
      restoreReason: details.restoreReason || 'manual',
      restoreScope: details.restoreScope || 'full' // 'full', 'partial', 'specific'
    });
  }
};

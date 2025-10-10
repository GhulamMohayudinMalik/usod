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
    
    const logEntry = await SecurityLog.create({
      userId,
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
    });
    
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
  }
};

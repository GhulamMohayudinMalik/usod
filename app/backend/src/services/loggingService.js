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
  if (!userAgent) return 'Unknown';
  
  // Check for mobile browsers first
  if (userAgent.includes('Mobile Safari') && userAgent.includes('iPhone')) {
    return 'Safari';
  }
  if (userAgent.includes('Mobile Safari') && userAgent.includes('iPad')) {
    return 'Safari';
  }
  if (userAgent.includes('Chrome') && userAgent.includes('Mobile')) {
    return 'Chrome';
  }
  if (userAgent.includes('Firefox') && userAgent.includes('Mobile')) {
    return 'Firefox';
  }
  if (userAgent.includes('SamsungBrowser')) {
    return 'Samsung Internet';
  }
  if (userAgent.includes('UCBrowser')) {
    return 'UC Browser';
  }
  if (userAgent.includes('Opera Mini')) {
    return 'Opera Mini';
  }
  if (userAgent.includes('Opera Mobile')) {
    return 'Opera';
  }
  
  // Desktop browsers
  if (userAgent.includes('Edg/')) {
    return 'Microsoft Edge';
  }
  // Chrome detection - check for Chrome in user agent but not Edge or other Chrome-based browsers
  if (userAgent.includes('Chrome') && 
      !userAgent.includes('Edg') && 
      !userAgent.includes('Chromium') && 
      !userAgent.includes('OPR') && 
      !userAgent.includes('Opera')) {
    return 'Google Chrome';
  }
  if (userAgent.includes('Chromium')) {
    return 'Chromium';
  }
  if (userAgent.includes('Firefox')) {
    return 'Mozilla Firefox';
  }
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari';
  }
  if (userAgent.includes('Opera') || userAgent.includes('OPR/')) {
    return 'Opera';
  }
  if (userAgent.includes('Trident/') || userAgent.includes('MSIE')) {
    return 'Internet Explorer';
  }
  if (userAgent.includes('Brave')) {
    return 'Brave';
  }
  if (userAgent.includes('Vivaldi')) {
    return 'Vivaldi';
  }
  if (userAgent.includes('YandexBrowser')) {
    return 'Yandex Browser';
  }
  
  // Check for bot/crawler
  if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
    return 'Bot/Crawler';
  }
  
  return 'Unknown';
}

// Helper function to detect OS from user agent
function detectOS(userAgent) {
  if (!userAgent) return 'Unknown';
  
  // Mobile platforms first (more specific)
  if (userAgent.includes('iPhone OS') || userAgent.includes('iOS')) {
    return 'iOS';
  }
  if (userAgent.includes('Android')) {
    return 'Android';
  }
  if (userAgent.includes('Windows Phone')) {
    return 'Windows Phone';
  }
  if (userAgent.includes('BlackBerry')) {
    return 'BlackBerry';
  }
  
  // Desktop platforms
  if (userAgent.includes('Windows NT 10.0')) {
    return 'Windows 10';
  }
  if (userAgent.includes('Windows NT 6.3')) {
    return 'Windows 8.1';
  }
  if (userAgent.includes('Windows NT 6.1')) {
    return 'Windows 7';
  }
  if (userAgent.includes('Windows NT 6.0')) {
    return 'Windows Vista';
  }
  if (userAgent.includes('Windows NT 5.1')) {
    return 'Windows XP';
  }
  if (userAgent.includes('Windows')) {
    return 'Windows';
  }
  
  // macOS versions
  if (userAgent.includes('Mac OS X 10_15')) {
    return 'macOS Catalina';
  }
  if (userAgent.includes('Mac OS X 10_14')) {
    return 'macOS Mojave';
  }
  if (userAgent.includes('Mac OS X 10_13')) {
    return 'macOS High Sierra';
  }
  if (userAgent.includes('Mac OS X 10_12')) {
    return 'macOS Sierra';
  }
  if (userAgent.includes('Mac OS X 10_11')) {
    return 'macOS El Capitan';
  }
  if (userAgent.includes('Mac OS X 10_10')) {
    return 'macOS Yosemite';
  }
  if (userAgent.includes('Mac OS X')) {
    return 'macOS';
  }
  
  // Linux distributions
  if (userAgent.includes('Ubuntu')) {
    return 'Ubuntu Linux';
  }
  if (userAgent.includes('Debian')) {
    return 'Debian Linux';
  }
  if (userAgent.includes('CentOS')) {
    return 'CentOS Linux';
  }
  if (userAgent.includes('Red Hat')) {
    return 'Red Hat Linux';
  }
  if (userAgent.includes('Fedora')) {
    return 'Fedora Linux';
  }
  if (userAgent.includes('SUSE')) {
    return 'SUSE Linux';
  }
  if (userAgent.includes('Linux')) {
    return 'Linux';
  }
  
  // Other platforms
  if (userAgent.includes('FreeBSD')) {
    return 'FreeBSD';
  }
  if (userAgent.includes('OpenBSD')) {
    return 'OpenBSD';
  }
  if (userAgent.includes('NetBSD')) {
    return 'NetBSD';
  }
  if (userAgent.includes('Solaris')) {
    return 'Solaris';
  }
  if (userAgent.includes('AIX')) {
    return 'AIX';
  }
  if (userAgent.includes('HP-UX')) {
    return 'HP-UX';
  }
  
  return 'Unknown';
}

// Helper function to detect platform type (web/mobile/desktop app)
function detectPlatform(userAgent, req) {
  if (!userAgent) return 'Unknown';
  
  // Check for mobile app indicators first
  if (userAgent.includes('React Native') || 
      userAgent.includes('Expo') ||
      userAgent.includes('Mobile App') ||
      req.headers['x-platform'] === 'mobile') {
    return 'Mobile';
  }
  
  // Check for desktop app indicators
  if (userAgent.includes('Electron') ||
      userAgent.includes('Desktop App') ||
      req.headers['x-platform'] === 'desktop') {
    return 'Desktop';
  }
  
  // Check for web app indicators (default for web browsers)
  if (userAgent.includes('Mozilla') || 
      userAgent.includes('Chrome') || 
      userAgent.includes('Safari') || 
      userAgent.includes('Firefox') ||
      userAgent.includes('Edge') ||
      req.headers['x-platform'] === 'web') {
    return 'Web';
  }
  
  // Default to web for unknown cases (most likely web browsers)
  return 'Web';
}

// Generic logging function
export async function logSecurityEvent(userId, action, status, req, details = {}) {
  try {
    const userAgent = req.get('user-agent') || 'unknown';
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);
    const platform = detectPlatform(userAgent, req);
    
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
        platform,
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
  },

  // Network AI Service Logging Actions
  async networkMonitoringStarted(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'network_monitoring_started', status, req, {
      ...details,
      interface: details.interface || 'unknown',
      duration: details.duration || 'unknown',
      monitoringId: details.monitoringId || 'unknown',
      startedBy: details.startedBy || 'system'
    });
  },

  async networkMonitoringStopped(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'network_monitoring_stopped', status, req, {
      ...details,
      monitoringId: details.monitoringId || 'unknown',
      stoppedBy: details.stoppedBy || 'system',
      duration: details.duration || 'unknown'
    });
  },

  async networkThreatDetected(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'network_threat_detected', status, req, {
      ...details,
      threatType: details.threatType || 'unknown',
      threatLevel: details.threatLevel || 'unknown',
      sourceIP: details.sourceIP || 'unknown',
      targetIP: details.targetIP || 'unknown',
      protocol: details.protocol || 'unknown',
      port: details.port || 'unknown',
      description: details.description || 'unknown',
      confidence: details.confidence || 'unknown',
      modelUsed: details.modelUsed || 'unknown'
    });
  },

  async pcapFileAnalyzed(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'pcap_file_analyzed', status, req, {
      ...details,
      filePath: details.filePath || 'unknown',
      fileName: details.fileName || 'unknown',
      fileSize: details.fileSize || 'unknown',
      analysisId: details.analysisId || 'unknown',
      threatsFound: details.threatsFound || 0,
      analyzedBy: details.analyzedBy || 'system'
    });
  },

  // Network Threat Detection Logging
  async networkThreat(threatData, req, additionalDetails = {}) {
    const userId = req.user?.id || 'system';
    const status = 'detected';
    
    // Extract threat information
    const {
      threat_id,
      threat_type,
      severity,
      source_ip,
      destination_ip,
      confidence,
      timestamp,
      details: threatDetails
    } = threatData;

    // Map threat types to SecurityLog actions
    const threatActionMap = {
      'port_scan': 'network_port_scan',
      'ddos': 'network_dos',
      'intrusion': 'network_intrusion',
      'malware': 'network_malware',
      'anomaly': 'network_anomaly'
    };

    const action = threatActionMap[threat_type] || 'network_threat_detected';

    return await logSecurityEvent(userId, action, status, req, {
      ...additionalDetails,
      threatId: threat_id,
      threatType: threat_type,
      severity: severity,
      sourceIP: source_ip,
      destinationIP: destination_ip,
      confidence: confidence,
      threatTimestamp: timestamp,
      threatDetails: threatDetails,
      detectedBy: 'ai_ml_models',
      modelUsed: additionalDetails.modelUsed || 'unknown'
    });
  }
};

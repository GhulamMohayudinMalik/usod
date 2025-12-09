import { SecurityLog } from '../models/securityLog.js';
import { User } from '../models/User.js';
import { eventBus } from './eventBus.js';
import blockchainService from './blockchainService.js';

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
    return 'mobile';
  }
  
  // Check for desktop app indicators
  if (userAgent.includes('Electron') ||
      userAgent.includes('Desktop App') ||
      req.headers['x-platform'] === 'desktop') {
    return 'desktop';
  }
  
  // Check for web app indicators (default for web browsers)
  if (userAgent.includes('Mozilla') || 
      userAgent.includes('Chrome') || 
      userAgent.includes('Safari') || 
      userAgent.includes('Firefox') ||
      userAgent.includes('Edge') ||
      req.headers['x-platform'] === 'web') {
    return 'web';
  }
  
  // Default to web for unknown cases (most likely web browsers)
  return 'web';
}

// Categorize log type for blockchain storage
function categorizeLogType(action) {
  const categories = {
    // Authentication
    'login': 'authentication',
    'logout': 'authentication',
    'session_created': 'authentication',
    'session_expired': 'authentication',
    'invalid_token': 'authentication',
    'token_refresh': 'authentication',
    
    // User Management
    'user_created': 'user_management',
    'user_deleted': 'user_management',
    'user_updated': 'user_management',
    'role_changed': 'user_management',
    'password_changed': 'user_management',
    'profile_updated': 'user_management',
    
    // Security Actions
    'ip_blocked': 'security_action',
    'ip_unblocked': 'security_action',
    'account_locked': 'security_action',
    'account_unlocked': 'security_action',
    
    // Network Threats
    'network_threat_detected': 'network_threat',
    'network_port_scan': 'network_threat',
    'network_dos': 'network_threat',
    'network_intrusion': 'network_threat',
    'network_malware': 'network_threat',
    'network_anomaly': 'network_threat',
    
    // Data Operations
    'backup_created': 'data_operation',
    'backup_restored': 'data_operation',
    'backup_deleted': 'data_operation',
    'data_exported': 'data_operation',
    'data_imported': 'data_operation',
    
    // PCAP Analysis
    'pcap_uploaded': 'pcap_analysis',
    'pcap_analyzed': 'pcap_analysis',
    
    // Monitoring
    'monitoring_started': 'monitoring',
    'monitoring_stopped': 'monitoring',
  };
  
  return categories[action] || 'other';
}

// Determine severity based on action and status
// Exported for use in verification
export function determineSeverity(action, status) {
  // Failed authentication/security = high severity
  if (status === 'failed') {
    if (action.includes('login') || action.includes('session') || action.includes('token')) {
      return 'high';
    }
    return 'medium';
  }
  
  // Network threats = critical/high
  if (action.includes('network_')) {
    if (action.includes('dos') || action.includes('intrusion') || action.includes('malware')) {
      return 'critical';
    }
    return 'high';
  }
  
  // Security actions = medium
  if (action.includes('ip_blocked') || action.includes('account_locked')) {
    return 'medium';
  }
  
  // User management = low (normal operations)
  if (action.includes('user_') || action.includes('role_') || action.includes('password_') || action.includes('profile_')) {
    return 'low';
  }
  
  // Data operations = low
  if (action.includes('backup_') || action.includes('data_')) {
    return 'low';
  }
  
  // Default for successful operations
  return 'low';
}

// Generic logging function
export async function logSecurityEvent(userId, action, status, req, details = {}) {
  try {
    const userAgent = req.get('user-agent') || 'unknown';
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);
    const platform = detectPlatform(userAgent, req);
    
    // Get username for the log
    let username = 'system'; // Default for automated/webhook calls
    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user) {
          username = user.username;
        }
      } catch (error) {
        console.error('Error fetching user for log:', error);
        username = 'unknown';
      }
    }
    
    const logData = {
      action,
      status,
      platform, // Set the main platform field
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
    
    // Log to blockchain for immutable audit trail - ALL LOGS (non-blocking)
    // Use setImmediate to make this async and non-blocking
    setImmediate(async () => {
      try {
        // Determine log category and severity based on action
        const logCategory = categorizeLogType(action);
        const logSeverity = determineSeverity(action, status);
        
        const threatDetails = {
          type: action || 'security_event',
          category: logCategory, // NEW: authentication, network, user_management, etc.
          severity: logSeverity,
          sourceIP: logData.ipAddress || 'unknown',
          destinationIP: 'system',
          description: `${action}: ${status}`,
          username: logData.details.username || 'unknown',
          platform: logData.details.platform || 'unknown',
          browser: logData.details.browser || 'unknown',
          os: logData.details.os || 'unknown',
          details: logData.details
        };
        
        await blockchainService.logThreat({
          _id: logEntry._id,
          action,
          logType: logCategory, // Pass category as logType
          severity: logSeverity,
          details: threatDetails,
          timestamp: logEntry.timestamp
        });
        
        console.log(`✓ Blockchain: ${logCategory} log ${logEntry._id.toString().substring(0, 8)}...`);
      } catch (blockchainError) {
        console.error(`✗ Blockchain failed for ${action}: ${blockchainError.message}`);
        // Continue even if blockchain logging fails
      }
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
    const userId = req.user?.id || null; // null instead of 'system' for webhook calls
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

    // Create log with threat's original timestamp
    const log = await logSecurityEvent(userId, action, status, req, {
      ...additionalDetails,
      threatData: threatData, // Store complete threat data for retrieval
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

    // Override the log timestamp with the threat's timestamp for accurate timeline
    if (log && timestamp) {
      log.timestamp = new Date(timestamp);
      await log.save();
    }

    return log;
  },

  // IP Blocking/Security Actions
  async ipBlocked(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'ip_blocked', status, req, {
      ...details,
      ip: details.ip || 'unknown',
      reason: details.reason || 'manual_block',
      threatId: details.threatId || null,
      severity: details.severity || null,
      threatType: details.threatType || null,
      blockedBy: details.blockedBy || 'system',
      action: 'blocked'
    });
  },

  async ipUnblocked(userId, status, req, details = {}) {
    return await logSecurityEvent(userId, 'ip_unblocked', status, req, {
      ...details,
      ip: details.ip || 'unknown',
      reason: details.reason || 'manual_unblock',
      unblockedBy: details.unblockedBy || 'system',
      action: 'unblocked'
    });
  }
};
